"use client";
import { useState } from 'react';
import { analyze } from '@/lib/analyze';

type AnalyzeResult = ReturnType<typeof analyze>;

type Props = {
  transcript: string;
  summary: string;
  keywords: string[];
  onAnalyze: (r: { summary: string; keywords: string[]; todos: string[] }) => void;
};

export default function ResultPanel({ transcript, summary, keywords, onAnalyze }: Props) {
  const [error, setError] = useState<string | null>(null);

  const runAnalyze = () => {
    try {
      const r: AnalyzeResult = analyze(transcript);
      onAnalyze(r);
    } catch (e: any) {
      setError(e.message || '分析失败');
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">结果</h2>
        <div className="space-x-2">
          <button
            onClick={() => copyText(transcript)}
            disabled={!transcript}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm"
          >复制转写</button>
          <button
            onClick={runAnalyze}
            disabled={!transcript}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white"
          >生成摘要/关键词/待办</button>
        </div>
      </div>

      {!transcript && (
        <div className="text-sm text-gray-500">暂无转写结果。请上传音频文件。</div>
      )}

      {transcript && (
        <div className="rounded-md border p-3 text-sm whitespace-pre-wrap break-words">{transcript}</div>
      )}

      {summary && (
        <div className="rounded-md border p-3">
          <h3 className="font-medium mb-1">摘要</h3>
          <p className="text-sm whitespace-pre-wrap break-words">{summary}</p>
        </div>
      )}

      {keywords?.length > 0 && (
        <div className="rounded-md border p-3">
          <h3 className="font-medium mb-1">关键词</h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span key={k} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{k}</span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
    </section>
  );
}

