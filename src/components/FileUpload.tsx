'use client';

import { useState, useCallback } from 'react';
import { Upload, FileArchive, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { parseTwitterArchive, parseBookmarksJson } from '@/lib/parseArchive';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setBookmarks, setIsLoading, setError } = useBookmarkStore();

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setUploadStatus('uploading');
    setErrorMessage(null);
    setIsLoading(true);
    setError(null);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((r) => setTimeout(r, 50));
    }

    setUploadStatus('processing');

    try {
      let bookmarks;

      if (file.name.endsWith('.zip')) {
        bookmarks = await parseTwitterArchive(file);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.json')) {
        bookmarks = await parseBookmarksJson(file);
      } else {
        throw new Error('Please upload a .zip archive or a .js/.json bookmarks file');
      }

      if (bookmarks.length === 0) {
        throw new Error('No bookmarks found in the archive. Make sure you uploaded a Twitter data archive containing bookmarks.');
      }

      setBookmarks(bookmarks);
      setUploadStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse archive';
      setErrorMessage(message);
      setError(message);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [setBookmarks, setIsLoading, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const reset = useCallback(() => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setFileName(null);
    setErrorMessage(null);
  }, []);

  if (uploadStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
          Upload Complete!
        </h3>
        <p className="text-[var(--twitter-dark-gray)] mb-4">
          Your bookmarks have been imported successfully.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/bookmarks"
            className="btn-twitter btn-twitter-primary"
          >
            View Bookmarks
          </a>
          <button
            onClick={reset}
            className="btn-twitter btn-twitter-outline"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  if (uploadStatus === 'uploading' || uploadStatus === 'processing') {
    return (
      <div className="bg-white rounded-2xl border border-[var(--twitter-extra-light-gray)] p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-[var(--twitter-blue-light)] mb-4">
          <Loader2 className="w-8 h-8 text-[var(--twitter-blue)] animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
        </h3>
        <p className="text-[var(--twitter-dark-gray)] mb-4">
          {fileName}
        </p>
        {uploadStatus === 'uploading' && (
          <div className="w-full bg-[var(--twitter-extra-light-gray)] rounded-full h-2">
            <div
              className="bg-[var(--twitter-blue)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        {uploadStatus === 'processing' && (
          <p className="text-sm text-[var(--twitter-dark-gray)]">
            Extracting bookmarks from archive...
          </p>
        )}
      </div>
    );
  }

  if (uploadStatus === 'error') {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-100 mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
          Upload Failed
        </h3>
        <p className="text-red-600 mb-4">
          {errorMessage}
        </p>
        <button
          onClick={reset}
          className="btn-twitter btn-twitter-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging
          ? 'border-[var(--twitter-blue)] bg-[var(--twitter-blue-light)]'
          : 'border-[var(--twitter-extra-light-gray)] hover:border-[var(--twitter-light-gray)]'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-[var(--twitter-blue-light)] mb-4">
        <FileArchive className="w-8 h-8 text-[var(--twitter-blue)]" />
      </div>

      <h3 className="text-xl font-bold text-[var(--twitter-black)] mb-2">
        Upload Your Twitter Archive
      </h3>

      <p className="text-[var(--twitter-dark-gray)] mb-6 max-w-md mx-auto">
        Drag and drop your Twitter data archive (.zip) or bookmarks file (.js/.json) here,
        or click to browse.
      </p>

      <label className="btn-twitter btn-twitter-primary cursor-pointer">
        <Upload className="w-5 h-5 mr-2" />
        Choose File
        <input
          type="file"
          accept=".zip,.js,.json"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>

      <div className="mt-6 p-4 bg-[var(--twitter-bg-gray)] rounded-xl text-left">
        <h4 className="font-bold text-sm text-[var(--twitter-black)] mb-2">
          How to get your Twitter archive:
        </h4>
        <ol className="text-sm text-[var(--twitter-dark-gray)] space-y-1 list-decimal list-inside">
          <li>Go to Twitter Settings → Your Account → Download an archive</li>
          <li>Request your archive and wait for the email</li>
          <li>Download the .zip file from the email link</li>
          <li>Upload it here without extracting</li>
        </ol>
      </div>
    </div>
  );
}
