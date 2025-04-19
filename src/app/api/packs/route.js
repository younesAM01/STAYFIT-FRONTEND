import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import Pack from '@/models/Pack';

export async function GET(request) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const pack = await Pack.findById(id);
      if (!pack) {
        return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
      }
      return NextResponse.json(pack);
    }

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
