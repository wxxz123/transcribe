// Simple rule-based analysis without LLM

export type AnalyzeOutput = {
  summary: string;
  keywords: string[];
  todos: string[];
};

function extractSentences(text: string): string[] {
  const norm = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!norm) return [];
  return norm.split(/(?<=[。.!?？！])/).map(s => s.trim()).filter(Boolean);
}

function getKeywords(text: string, max = 10): string[] {
  const stop = new Set([
    '的','了','和','是','在','就','都','而','及','与','或','一个','我们','你们','他们','以及','还有','然后','但是','如果','因为','所以','而且','这个','那个','这些','那些','以及','非常','比较','可能','需要','进行','通过','关于','相关','作为','可以','不会','没有','不是','已经','同时'
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w && w.length > 1 && !stop.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

function makeSummary(sentences: string[]): string {
  // 目标：返回 3~5 句
  const targetCount = Math.min(5, Math.max(3, Math.ceil(sentences.length * 0.15)));
  if (sentences.length <= targetCount) return sentences.join(' ');
  // Use simple scoring by sentence length and keyword overlap
  const joined = sentences.join(' ');
  const kws = new Set(getKeywords(joined, 20));
  const scored = sentences.map((s, idx) => {
    const tokens = s.split(/\s+/);
    const scoreKW = tokens.reduce((acc, t) => acc + (kws.has(t.toLowerCase()) ? 1 : 0), 0);
    const scoreLen = Math.min(tokens.length / 10, 1);
    const scorePos = idx === 0 ? 0.5 : 0; // lead bias
    return { s, score: scoreKW * 1.5 + scoreLen + scorePos };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .map(x => x.s)
    .join(' ');
}

function makeTodos(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const todos: string[] = [];
  const todoMarkers = /^(?:-\s*\[.\]|[-*•]|\d+\.|todo:)/i;
  for (const l of lines) {
    if (todoMarkers.test(l)) {
      const cleaned = l.replace(/^-\s*\[.\]\s*/i, '').replace(/^[-*•]\s*/,'').replace(/^\d+\.\s*/,'').replace(/^todo:\s*/i,'').trim();
      if (cleaned) todos.push(cleaned);
    }
  }
  // Heuristic: verbs indicating actions
  const actionHints = [/安排|确定|完成|修复|更新|联系|汇报|提交|讨论|实现|测试|部署|配置|购买|确认|对齐/];
  const sentences = extractSentences(text);
  for (const s of sentences) {
    if (actionHints.some(r => r.test(s))) {
      todos.push(s);
    }
  }
  // de-dup
  return Array.from(new Set(todos)).slice(0, 20);
}

export function analyze(text: string): AnalyzeOutput {
  const sentences = extractSentences(text);
  const summary = makeSummary(sentences);
  const keywords = getKeywords(text);
  const todos = makeTodos(text);
  return { summary, keywords, todos };
}

// 对外导出统一入口
export function analyzeAll(text: string): AnalyzeOutput {
  return analyze(text);
}

