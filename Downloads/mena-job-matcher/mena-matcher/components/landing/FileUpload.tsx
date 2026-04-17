'use client';
// components/landing/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n/LanguageContext';

// ─── PDF text extraction via pdfjs-dist v3 (runs in the browser) ──────────────
async function extractTextFromPdf(file: File): Promise<string> {
  // pdfjs-dist v3 uses a legacy build compatible with Next.js webpack
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');

  // Use the matching legacy worker via CDN (no local file needed)
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FileUpload() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      // ── 1. File-size guard: 10 MB ────────────────────────────────────────
      const MAX_BYTES = 10 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        throw new Error('File too large. Please upload a CV under 10 MB.');
      }

      // ── 2. Extract text based on file type ───────────────────────────────
      let cvText = '';

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Use pdfjs-dist for real text extraction — file.text() only returns binary garbage for PDFs
        cvText = await extractTextFromPdf(file);
      } else if (
        file.type === 'text/plain' ||
        file.name.toLowerCase().endsWith('.txt')
      ) {
        cvText = await file.text();
      } else {
        throw new Error(t.uploadError);
      }

      // ── 3. Validate extracted text ───────────────────────────────────────
      const trimmed = cvText.trim();
      if (trimmed.length < 20) {
        throw new Error(
          lang === 'ar'
            ? 'لم نتمكن من قراءة النص من هذا الملف. يرجى التأكد من أن الملف يحتوي على نص قابل للاختيار وليس صوراً فقط.'
            : 'Could not read text from this file. Please make sure the PDF contains selectable text, not just scanned images.'
        );
      }

      // ── 4. Send to backend API ───────────────────────────────────────────
      const response = await fetch('/api/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: trimmed, lang }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t.apiError);
      }

      const { profile } = await response.json();

      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userLang', lang);

      // Save to Supabase if user is logged in
      try {
        const { createClient, saveProfile } = await import('@/lib/supabase');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await saveProfile(profile);
      } catch { /* guest user — skip */ }

      // Verify storage was set before navigating
      const saved = sessionStorage.getItem('userProfile');
      if (!saved) throw new Error('Could not save profile. Please try again.');

      router.push('/dashboard');
    } catch (err) {
      console.error('[FileUpload] Error:', err);
      setError(err instanceof Error ? err.message : t.apiError);
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) await processFile(files[0]);
    },
    [lang]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await processFile(files[0]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-neutral-900 mb-3">
          {t.uploadTitle}
        </h2>
        <p className="text-neutral-600">{t.uploadSubtitle}</p>
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          transition-all duration-300 bg-white
          ${isDragging
            ? 'border-primary-500 bg-primary-50 scale-105 shadow-lg'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'}
          ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('cv-file-input')?.click()}
      >
        <input
          id="cv-file-input"
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-4 animate-fade-in">
            <Loader2 className="w-16 h-16 text-primary-500 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-medium text-neutral-900 mb-1">{t.analyzing}</p>
              <p className="text-sm text-neutral-500">{fileName}</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4 animate-fade-in">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="text-sm text-neutral-600 mb-2">{error}</p>
            <Button onClick={() => setError(null)} variant="outline">
              {t.retry}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-primary-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-neutral-900 mb-1">{t.dragDrop}</p>
              <p className="text-sm text-neutral-500">{t.orClick}</p>
            </div>
            <div className="flex justify-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <FileText className="w-4 h-4" />
                <span>{t.pdfTxt}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ar' ? 'آمن وخاص' : 'Secure & Private'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}