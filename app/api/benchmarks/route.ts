import { NextRequest, NextResponse } from 'next/server';
import { getBenchmarks, addBenchmarkResult, getExercises } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const [{ benchmarks, results }, exercises] = await Promise.all([getBenchmarks(), getExercises()]);

  const enriched = benchmarks.map(b => ({
    ...b,
    exercises: (b.exercises || []).map((id: string) => exercises.find(e => e.id === id)),
    myResults: results.filter(r => r.memberId === session.id && r.benchmarkId === b.id)
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const result = {
    id: generateId(),
    memberId: session.id,
    benchmarkId: body.benchmarkId,
    date: body.date || new Date().toISOString().split('T')[0],
    result: body.result,
    rxd: body.rxd || false,
    notes: body.notes || ''
  };

  await addBenchmarkResult(result);
  return NextResponse.json(result);
}
