import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const key = process.env.SONIOX_API_KEY;
  return NextResponse.json({
    hasKey: Boolean(!!key),
    length: key ? key.length : 0,
    runtime: 'node',
  });
}

