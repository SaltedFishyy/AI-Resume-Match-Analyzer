"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import {
  extractPdfText,
  getReadablePdfError,
  type LoadingTaskLike,
  type PdfDocumentLike,
  validatePdfFile,
} from "@/lib/pdf-text-extraction";

type PdfResumeUploadProps = {
  onTextExtracted: (text: string) => void;
  resetSignal: number;
};

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

    let currentLoadingTask: LoadingTaskLike | null = null;
    let currentPdfDocument: PdfDocumentLike | null = null;

    try {
      const extractedText = await extractPdfText(file, () => isCurrentParse(parseId), ({ loadingTask, pdfDocument }) => {
        currentLoadingTask = loadingTask;
        currentPdfDocument = pdfDocument;
        loadingTaskRef.current = loadingTask;
        pdfDocumentRef.current = pdfDocument;
      });
      if (!extractedText) return;

      if (isCurrentParse(parseId)) {
        onTextExtracted(extractedText);
        setPdfError("");
      }
    } catch (error) {
      if (isCurrentParse(parseId)) {
        setPdfError(getReadablePdfError(error));
      }
    } finally {
      releasePdfResources(currentPdfDocument, currentLoadingTask);

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
