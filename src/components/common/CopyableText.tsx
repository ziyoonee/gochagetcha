"use client";

import { useState, useCallback } from "react";
import Toast from "./Toast";

interface CopyableTextProps {
  text: string;
  className?: string;
}

export default function CopyableText({ text, className = "" }: CopyableTextProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <>
      <button
        onClick={handleCopy}
        className={`group flex items-center gap-2 text-left transition-all ${className}`}
        title="클릭하여 복사"
      >
        <span className="flex-1 group-hover:text-rose-500 underline decoration-dotted decoration-rose-300 underline-offset-4 transition-colors">
          {text}
        </span>
        <span className="shrink-0 p-1.5 rounded-full bg-rose-50 text-rose-400 group-hover:bg-rose-100 group-hover:text-rose-500 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </span>
      </button>
      <Toast message="복사 완료!" isVisible={showToast} onClose={handleCloseToast} />
    </>
  );
}
