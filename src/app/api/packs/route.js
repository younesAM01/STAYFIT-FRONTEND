import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import Pack from '@/models/Pack';

export async function GET() {
  try {
    await connectMongoDB();

    const packs = await Pack.find();
    if (!packs || packs.length === 0) {
      console.error('No packs found in the database.');
    }
    return NextResponse.json(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 });
  }
}
