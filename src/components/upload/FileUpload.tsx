'use client';

import { useState, useRef, useCallback } from 'react';

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
};

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function FileUpload({ onFileSelected, isUploading = false, error }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato não suportado. Envie PDF, JPG, PNG ou WebP.';
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
          relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 sm:p-12 text-center
          transition-all duration-200 min-h-[180px] flex items-center justify-center
          ${dragOver ? 'border-brand-400 bg-brand-500/10 scale-[1.02]' : 'border-white/15 bg-white/5 hover:border-brand-400/60 hover:bg-brand-500/10 active:scale-[0.99]'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
          ${displayError ? 'border-red-400/50 bg-red-500/10' : ''}
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
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-brand-400" />
            <p className="text-sm font-medium text-slate-300">Enviando contrato...</p>
          </div>
        ) : selectedFile && !displayError ? (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30">
              <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)} · pronto para enviar</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-violet-500/20 ring-1 ring-brand-400/30">
              <svg className="h-8 w-8 text-brand-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                <span className="text-brand-300">Toque para selecionar</span>
                <span className="hidden sm:inline text-slate-300"> ou arraste seu contrato aqui</span>
              </p>
              <p className="mt-1.5 text-xs text-slate-500">PDF, JPG, PNG ou WebP · até {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-3 text-center text-sm text-red-400" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
