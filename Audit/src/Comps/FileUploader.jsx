import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { processFile } from '../utils/fileProcessors';

const FileUploader = ({ onFileProcessed, disabled }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setProcessing(true);
      setError(null);

      try {
        const processed = await processFile(file);
        setFileInfo({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: processed.type,
          format: processed.format,
        });
        onFileProcessed?.(processed);
      } catch (err) {
        setError(err.message || 'Failed to process file');
        setFileInfo(null);
      } finally {
        setProcessing(false);
      }
    },
    [onFileProcessed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: disabled || processing,
  });

  const formatBadgeColor = {
    csv: 'bg-emerald-100 text-emerald-700',
    json: 'bg-amber-100 text-amber-700',
    txt: 'bg-slate-100 text-slate-600',
    image: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="w-full max-w-xl mx-auto z-10">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full min-h-[8rem] border-2 border-dashed rounded-2xl cursor-pointer transition-all group
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {processing ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Processing file…</p>
          </div>
        ) : fileInfo ? (
          <div className="flex flex-col items-center py-5 px-4">
            <div className="flex items-center space-x-3 mb-2">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {fileInfo.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{fileInfo.size}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  formatBadgeColor[fileInfo.type === 'image' ? 'image' : fileInfo.format] ||
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {fileInfo.format?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Drop another file to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
            <svg
              className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-4 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-base md:text-lg text-slate-700 dark:text-slate-300 font-medium text-center px-4">
              <span className="font-semibold text-blue-600 dark:text-blue-500">
                Click to upload
              </span>{' '}
              or drag and drop your dataset
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              CSV, JSON, TXT, or Image files
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
