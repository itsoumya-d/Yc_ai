import { NextRequest, NextResponse } from 'next/server';
import { switchActiveBoard } from '@/lib/actions/boards';

export async function POST(req: NextRequest) {
  try {
    const { boardId } = await req.json();
    const result = await switchActiveBoard(boardId ?? null);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
