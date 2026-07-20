"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_EXTRACTED_TEXT_LENGTH = 50;

type PdfResumeUploadProps = {
  onTextExtracted: (text: string) => void;
  resetSignal: number;
};

type PdfDocumentLike = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getTextContent: () => Promise<{ items: unknown[] }>;
  }>;
  cleanup?: () => Promise<unknown>;
};

type LoadingTaskLike = {
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

function validatePdfFile(file: File) {
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

function getReadableError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const name = error instanceof Error ? error.name.toLowerCase() : "";

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

export function PdfResumeUpload({ onTextExtracted, resetSignal }: PdfResumeUploadProps) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const activeParseId = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loadingTaskRef = useRef<LoadingTaskLike | null>(null);
  const pdfDocumentRef = useRef<PdfDocumentLike | null>(null);

  function isCurrentParse(parseId: number) {
    return activeParseId.current === parseId;
  }

  function releasePdfResources(pdfDocument = pdfDocumentRef.current, loadingTask = loadingTaskRef.current) {
    if (pdfDocumentRef.current === pdfDocument) {
      pdfDocumentRef.current = null;
    }

    if (loadingTaskRef.current === loadingTask) {
      loadingTaskRef.current = null;
    }

    void pdfDocument?.cleanup?.().catch(() => undefined);
    void loadingTask?.destroy().catch(() => undefined);
  }

  useEffect(() => {
    activeParseId.current += 1;
    releasePdfResources();
    setSelectedFileName("");
    setPdfError("");
    setIsParsingPdf(false);

    if (inputRef.current) inputRef.current.value = "";
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      activeParseId.current += 1;
      releasePdfResources();
    };
  }, []);

  async function handlePdfUpload(file: File) {
    const parseId = activeParseId.current + 1;
    activeParseId.current = parseId;
    releasePdfResources();

    const validationError = validatePdfFile(file);
    if (validationError) {
      setSelectedFileName("");
      setPdfError(validationError);
      setIsParsingPdf(false);
      return;
    }

    setSelectedFileName(file.name);
    setPdfError("");
    setIsParsingPdf(true);

    let loadingTask: LoadingTaskLike | null = null;
    let pdfDocument: PdfDocumentLike | null = null;

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

      if (!isCurrentParse(parseId)) return;

      const fileBuffer = await file.arrayBuffer();

      if (!isCurrentParse(parseId)) return;

      loadingTask = pdfjs.getDocument({ data: fileBuffer }) as unknown as LoadingTaskLike;
      loadingTaskRef.current = loadingTask;

      pdfDocument = await loadingTask.promise;
      pdfDocumentRef.current = pdfDocument;

      const pageTexts: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        if (!isCurrentParse(parseId)) return;

        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = extractTextItems(textContent.items);

        if (pageText) pageTexts.push(pageText);
      }

      const extractedText = pageTexts.join("\n\n").trim();

      if (extractedText.length < MIN_EXTRACTED_TEXT_LENGTH) {
        throw new Error("No readable text was found.");
      }

      if (isCurrentParse(parseId)) {
        onTextExtracted(extractedText);
        setPdfError("");
      }
    } catch (error) {
      if (isCurrentParse(parseId)) {
        const message =
          error instanceof Error && error.message === "No readable text was found."
            ? "No readable text was found. This may be a scanned PDF. Please paste the resume text manually."
            : getReadableError(error);

        setPdfError(message);
      }
    } finally {
      releasePdfResources(pdfDocument, loadingTask);

      if (isCurrentParse(parseId)) {
        setIsParsingPdf(false);
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    void handlePdfUpload(file);
    event.target.value = "";
  }

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <label className="focus-within:ring-blue-100 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 focus-within:outline-none focus-within:ring-4">
        {isParsingPdf ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <FileUp className="h-4 w-4 text-blue-600" />}
        {isParsingPdf ? "Extracting..." : selectedFileName ? "Change PDF" : "Upload PDF"}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          disabled={isParsingPdf}
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {selectedFileName && (
        <p className="max-w-48 truncate text-center text-[11px] font-medium text-slate-500" title={selectedFileName}>
          {selectedFileName}
        </p>
      )}

      {pdfError && (
        <p role="alert" className="max-w-64 text-center text-[11px] font-medium leading-4 text-red-600">
          {pdfError}
        </p>
      )}
    </div>
  );
}
