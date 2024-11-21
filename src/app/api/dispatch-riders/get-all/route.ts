import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'dispatch_riders'));
    const riders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      data: riders
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching riders:', error);
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 });
  }
}
