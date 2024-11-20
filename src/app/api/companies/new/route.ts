import { db } from '@/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json(); // Parse the request body

        // Validate the input
        const { companyName, locationObject, whatsapp, email, formattedAddress } = body;

        if (!companyName || !locationObject || !whatsapp) {
            return NextResponse.json(
                { error: 'Missing required fields: name, location, or whatsapp' },
                { status: 400 }
            );
        }

        const docRef = await addDoc(collection(db, 'companies'), {
            companyName,
            locationObject,
            whatsapp,
            formattedAddress,
            email: email || null,
        });

        return NextResponse.json(
            { message: 'Company added successfully', id: docRef.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding company:', error);
        return NextResponse.json(
            { error: 'Failed to add company' },
            { status: 500 }
        );
    }
}
