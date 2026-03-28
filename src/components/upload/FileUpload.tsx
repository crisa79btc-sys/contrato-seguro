'use client';

import { useState, useRef, useCallback } from 'react';

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
};

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FileUpload({ onFileSelected, isUploading = false, error }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Formato não suportado. Envie um arquivo PDF.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Arquivo muito grande. O limite é ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        setSelectedFile(null);
        return;
      }
      setValidationError(null);
      setSelectedFile(file);
      onFileSelected(file);
    },
    [validateFile, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center
          transition-all duration-200
          ${dragOver ? 'border-brand-500 bg-brand-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
          ${displayError ? 'border-red-300 bg-red-50/50' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label="Selecionar arquivo PDF para análise"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            <p className="text-sm font-medium text-brand-700">Enviando contrato...</p>
          </div>
        ) : selectedFile && !displayError ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                <span className="text-brand-600 font-semibold">Selecione um arquivo</span>
                <span className="hidden sm:inline"> ou arraste aqui</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF - até {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-3 text-center text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
