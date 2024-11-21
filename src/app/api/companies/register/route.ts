import { db } from '@/firebase'; 
import { CompanyDTO } from '@/types';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

interface CustomRequest extends Request{
    json(): Promise<CompanyDTO>;
}

export async function POST(req: CustomRequest) {
    try {
        const body = await req.json(); // Parse the request body

        // Validate the input
        const { companyName, location, whatsapp, email, formattedAddress } = body;

        if (!companyName || !location || !whatsapp) {
            return NextResponse.json(
                { error: 'Missing required fields: name, location, or whatsapp' },
                { status: 400 }
            );
        }

        const docRef = await addDoc(collection(db, 'companies'), {
            companyName,
            location,
            whatsapp,
            formattedAddress,
            email: email || null,
            createdAt: Date.now()
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
