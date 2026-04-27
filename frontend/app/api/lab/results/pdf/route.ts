import { access } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const envExecutableCandidates = [
  process.env.LAB_PDF_BROWSER_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_EXECUTABLE_PATH,
].filter(Boolean) as string[];

const platformExecutableCandidates =
  process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
        "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      ]
    : process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
      : [
          "/usr/bin/google-chrome-stable",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
          "/usr/bin/microsoft-edge",
        ];

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim() || "laboratory-result.pdf";

const createPdfDocument = (content: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page {
        margin: 8mm;
        size: A4 portrait;
      }

      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        font-family: Arial, Helvetica, sans-serif;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;

const resolveBrowserExecutablePath = async () => {
  for (const candidate of [...envExecutableCandidates, ...platformExecutableCandidates]) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep checking the remaining browser candidates.
    }
  }

  throw new Error(
    "No supported browser executable was found for PDF generation. Set LAB_PDF_BROWSER_PATH or install Chrome/Edge on this machine."
  );
};

export async function POST(request: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const payload = (await request.json()) as {
      fileName?: string;
      html?: string;
    };
    const html = payload.html?.trim();

    if (!html) {
      return Response.json(
        {
          message: "The printable laboratory document HTML is missing.",
        },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
      args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox"],
      executablePath: await resolveBrowserExecutablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({
      deviceScaleFactor: 1,
      height: 1810,
      width: 1280,
    });
    await page.setContent(createPdfDocument(html), {
      waitUntil: "networkidle0",
    });
    await page.emulateMediaType("screen");
    await page.evaluate(async () => {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      await Promise.all(
        Array.from(document.images).map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }

              const finalize = () => resolve();
              image.addEventListener("load", finalize, { once: true });
              image.addEventListener("error", finalize, { once: true });
            })
        )
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        bottom: "8mm",
        left: "8mm",
        right: "8mm",
        top: "8mm",
      },
      preferCSSPageSize: true,
      printBackground: true,
    });

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "content-disposition": `attachment; filename="${sanitizeFileName(
          payload.fileName ?? "laboratory-result.pdf"
        )}"`,
        "content-type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Laboratory PDF generation failed.", error);

    return Response.json(
      {
        message:
          error instanceof Error && error.message.trim()
            ? error.message
            : "Unable to generate the laboratory PDF.",
      },
      { status: 500 }
    );
  } finally {
    await browser?.close();
  }
}
