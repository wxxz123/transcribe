import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const key = process.env.CHATANYWHERE_KEY;
    if (!key) {
      return NextResponse.json({ error: '缺少环境变量 CHATANYWHERE_KEY' }, { status: 500 });
    }

    const bodyReq = (await req.json().catch(() => null)) as { text?: string } | null;
    const text = bodyReq?.text?.toString?.().trim() || '';
    if (!text) {
      return NextResponse.json({ error: '空文本' }, { status: 400 });
    }

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '你是中文任务分解助手。根据用户提供的转写文本输出严格 JSON：{"summary":"三到五句中文摘要","todos_tree":[{"title":"...","due":null,"children":[{"title":"...","children":[]}]}]}. 要求：1) todos_tree 是层级结构；2) 如无待办，todos_tree=[]；3) title 使用可执行动词短语，可包含时间/数量/章节信息；4) 只输出 JSON，不要解释。',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
    };

    const res = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: '分析失败', details: t }, { status: res.status });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: '', todos_tree: [] };
    }

    const summary = typeof parsed?.summary === 'string' ? parsed.summary : '';
    const todos_tree = Array.isArray(parsed?.todos_tree) ? parsed.todos_tree : [];

    return NextResponse.json({ summary, todos_tree });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


