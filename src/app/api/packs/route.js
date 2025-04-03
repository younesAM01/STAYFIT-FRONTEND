import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import Pack from '@/models/Pack';

export async function GET() {
  await connectMongoDB();

  const packs = await Pack.find();
  return NextResponse.json(packs);
}
