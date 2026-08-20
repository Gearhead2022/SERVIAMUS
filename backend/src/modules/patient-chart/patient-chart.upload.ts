import express from "express";

// This must run before the application's JSON parser. It keeps the uploaded
// document as a Buffer even if a browser/proxy changes the content-type header.
export const patientChartUploadBodyParser = express.raw({
  type: () => true,
  limit: "10mb",
});
