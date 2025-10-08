"use client";
import { useMemo } from 'react';

export type TodoItem = { text: string; done: boolean };

type Props = {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
};

function toMarkdown(items: TodoItem[]) {
  return items.map(i => `- [${i.done ? 'x' : ' '}] ${i.text}`).join('\n');
}

export default function TodoList({ items, onChange }: Props) {
  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter(i => i.done).length;
    return { total, done };
  }, [items]);

  const toggle = (idx: number) => {
    const next = items.map((i, n) => (n === idx ? { ...i, done: !i.done } : i));
    onChange(next);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMD = () => {
    const content = toMarkdown(items);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">待办清单</h2>
        <div className="space-x-2">
          <button onClick={exportJSON} disabled={items.length===0} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm">导出JSON</button>
          <button onClick={exportMD} disabled={items.length===0} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm">导出Markdown</button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">暂无待办，请先生成分析结果。</div>
      ) : (
        <ul className="space-y-2">
          {items.map((t, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(idx)}
                className="h-4 w-4"
              />
              <span className={t.done ? 'line-through text-gray-500' : ''}>{t.text}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="text-xs text-gray-500">完成 {stats.done}/{stats.total}</div>
    </section>
  );
}

