export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
export const MIN_EXTRACTED_TEXT_LENGTH = 100;
export const NOT_ENOUGH_TEXT_ERROR = "Not enough resume text was found.";

export type PdfDocumentLike = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getTextContent: () => Promise<{ items: unknown[] }>;
  }>;
  cleanup?: () => Promise<unknown>;
};

export type LoadingTaskLike = {
  promise: Promise<PdfDocumentLike>;
  destroy: () => Promise<void>;
};

type TextContentItem = {
  str?: string;
  hasEOL?: boolean;
};

function isTextContentItem(item: unknown): item is TextContentItem {
  return typeof item === "object" && item !== null && "str" in item;
}

export function validatePdfFile(file: File) {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  const mimeType = file.type.trim().toLowerCase();

  if (!hasPdfExtension || (mimeType && mimeType !== "application/pdf")) {
    return "Please upload a PDF file.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return "PDF file must be 5MB or smaller.";
  }

  return "";
}

export function getReadablePdfError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const name = error instanceof Error ? error.name.toLowerCase() : "";

  if (error instanceof Error && error.message === NOT_ENOUGH_TEXT_ERROR) {
    return "We couldn't extract enough resume text from this PDF. Please try another file or paste your resume manually.";
  }

  if (error instanceof Error && error.message === "No readable text was found.") {
    return "No readable text was found. This may be a scanned PDF. Please paste the resume text manually.";
  }

  if (name.includes("password") || message.includes("password") || message.includes("encrypted")) {
    return "This PDF appears to be encrypted or password protected. Please paste the resume text manually.";
  }

  return "We could not extract text from this PDF. Please paste the resume text manually.";
}

function extractTextItems(items: unknown[]) {
  const parts: string[] = [];

  for (const item of items) {
    if (!isTextContentItem(item) || typeof item.str !== "string") continue;

    const text = item.str.trim();
    if (text) parts.push(text);
    if (item.hasEOL) parts.push("\n");
  }

  return parts
    .join(" ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function extractPdfText(
  file: File,
  isCurrent: () => boolean,
  onResourcesReady?: (resources: { loadingTask: LoadingTaskLike; pdfDocument: PdfDocumentLike | null }) => void,
) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

  if (!isCurrent()) return "";

  const fileBuffer = await file.arrayBuffer();
  if (!isCurrent()) return "";

  const loadingTask = pdfjs.getDocument({ data: fileBuffer }) as unknown as LoadingTaskLike;
  let pdfDocument: PdfDocumentLike | null = null;
  onResourcesReady?.({ loadingTask, pdfDocument });

  try {
    pdfDocument = await loadingTask.promise;
    onResourcesReady?.({ loadingTask, pdfDocument });
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      if (!isCurrent()) return "";

      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = extractTextItems(textContent.items);

      if (pageText) pageTexts.push(pageText);
    }

    const extractedText = pageTexts.join("\n\n").trim();
    if (extractedText.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new Error(NOT_ENOUGH_TEXT_ERROR);
    }

    return extractedText;
  } finally {
    void pdfDocument?.cleanup?.().catch(() => undefined);
    void loadingTask.destroy().catch(() => undefined);
  }
}
