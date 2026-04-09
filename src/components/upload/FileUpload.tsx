'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function FileUpload() {
  const { handleFile } = useFileUpload();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        cursor-pointer border-2 border-dashed rounded-xl p-12
        flex flex-col items-center gap-4 transition-colors
        ${dragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-600 hover:border-slate-400'}
      `}
    >
      <Upload className="w-12 h-12 text-slate-400" />
      <div className="text-center">
        <p className="text-lg font-medium text-slate-200">
          Arraste o arquivo Excel aqui
        </p>
        <p className="text-sm text-slate-400 mt-1">
          ou clique para selecionar (.xlsx exportado do opcoes.net.br)
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
