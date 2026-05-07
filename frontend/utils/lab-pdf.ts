import type { LabRequest } from "@/types/LabTypes";

const COLOR_PROPERTIES = new Set([
  "background-color",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "color",
  "outline-color",
]);
const STYLE_PROPERTIES = [
  "align-items",
  "background-color",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "bottom",
  "box-sizing",
  "color",
  "column-gap",
  "display",
  "flex-basis",
  "flex-direction",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "justify-content",
  "left",
  "letter-spacing",
  "line-height",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "object-fit",
  "opacity",
  "outline-color",
  "outline-style",
  "outline-width",
  "overflow",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "place-items",
  "position",
  "right",
  "row-gap",
  "text-align",
  "text-decoration",
  "text-transform",
  "top",
  "transform",
  "vertical-align",
  "white-space",
  "width",
  "word-break",
  "overflow-wrap",
] as const;
const PDF_ENDPOINT = "/api/lab/results/pdf";

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();

export const getLabResultPdfFileName = (
  request: Pick<LabRequest, "id" | "patientName" | "testType">
) =>
  `${sanitizeFilePart(request.id)}-${sanitizeFilePart(request.patientName)}-${sanitizeFilePart(
    request.testType
  )}.pdf`;

const getPrintableSource = (element: HTMLElement) =>
  element.querySelector<HTMLElement>("[data-lab-result-document]") ?? element;

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const finalize = () => {
            image.removeEventListener("load", finalize);
            image.removeEventListener("error", finalize);
            resolve();
          };

          image.addEventListener("load", finalize);
          image.addEventListener("error", finalize);
        })
    )
  );
};

const waitForDocumentAssets = async (element: HTMLElement) => {
  if ("fonts" in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  }

  await waitForImages(element);
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
};

let cachedColorCanvasContext: CanvasRenderingContext2D | null | undefined;

const getColorCanvasContext = () => {
  if (cachedColorCanvasContext !== undefined) {
    return cachedColorCanvasContext;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  cachedColorCanvasContext = canvas.getContext("2d");

  return cachedColorCanvasContext;
};

const normalizeCssColor = (value: string) => {
  const trimmedValue = value.trim();
  const colorCanvasContext = getColorCanvasContext();

  if (!trimmedValue || trimmedValue === "transparent" || !colorCanvasContext) {
    return trimmedValue;
  }

  try {
    colorCanvasContext.clearRect(0, 0, 1, 1);
    colorCanvasContext.fillStyle = "#000000";
    colorCanvasContext.fillStyle = trimmedValue;
    colorCanvasContext.fillRect(0, 0, 1, 1);

    const [red, green, blue, alpha] = colorCanvasContext.getImageData(0, 0, 1, 1).data;

    if (alpha === 0) {
      return "transparent";
    }

    return alpha === 255
      ? `rgb(${red}, ${green}, ${blue})`
      : `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;
  } catch {
    return trimmedValue;
  }
};

const inlineComputedStyles = (source: HTMLElement, clone: HTMLElement) => {
  const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];

  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];

    if (!cloneElement) {
      return;
    }

    const computedStyle = window.getComputedStyle(sourceElement);

    STYLE_PROPERTIES.forEach((property) => {
      const rawValue = computedStyle.getPropertyValue(property);

      if (!rawValue) {
        return;
      }

      const normalizedValue = COLOR_PROPERTIES.has(property)
        ? normalizeCssColor(rawValue)
        : rawValue;

      cloneElement.style.setProperty(property, normalizedValue);
    });

    cloneElement.removeAttribute("class");

    if (sourceElement instanceof HTMLImageElement && cloneElement instanceof HTMLImageElement) {
      cloneElement.src = sourceElement.currentSrc || sourceElement.src;
      cloneElement.removeAttribute("srcset");
    }
  });
};

const createPdfRenderSnapshot = async (element: HTMLElement) => {
  const source = getPrintableSource(element);
  const host = document.createElement("div");
  const clone = source.cloneNode(true) as HTMLElement;

  host.setAttribute("data-lab-pdf-host", "true");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = `${Math.max(source.scrollWidth, source.offsetWidth, 760)}px`;
  host.style.padding = "0";
  host.style.margin = "0";
  host.style.background = "#ffffff";
  host.style.pointerEvents = "none";
  host.style.opacity = "1";
  host.style.zIndex = "-1";

  clone.style.margin = "0 auto";
  clone.style.boxShadow = "none";
  clone.style.maxWidth = "8in";
  clone.style.width = "100%";
  inlineComputedStyles(source, clone);

  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await waitForDocumentAssets(clone);
    return clone.outerHTML;
  } finally {
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
};

const getPdfRouteErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (payload?.message?.trim()) {
      return payload.message;
    }
  }

  const text = await response.text();
  return text.trim() || "Unable to create the laboratory PDF.";
};

const createDownloadLink = ({
  blob,
  fileName,
}: {
  blob: Blob;
  fileName: string;
}) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};

export const buildLabResultPdf = async ({
  element,
  fileName,
}: {
  element: HTMLElement;
  fileName: string;
}) => {
  const html = await createPdfRenderSnapshot(element);
  const response = await fetch(PDF_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      html,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getPdfRouteErrorMessage(response));
  }

  return response.blob();
};

export const downloadLabResultPdf = async ({
  element,
  fileName,
}: {
  element: HTMLElement;
  fileName: string;
}) => {
  const pdfBlob = await buildLabResultPdf({ element, fileName });
  createDownloadLink({
    blob: pdfBlob,
    fileName,
  });
};
