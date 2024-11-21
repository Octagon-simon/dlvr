import { db } from '@/firebase';
import { DispatchRiderDTO } from '@/types';
import { collection, addDoc } from 'firebase/firestore';

interface CustomRequest extends Request{
    json(): Promise<DispatchRiderDTO>;
}

export async function POST(req: CustomRequest) {
    try {
        const { companyId, name, location, formattedAddress } = await req.json();

        if (!companyId || !name || !location || !formattedAddress) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const riderRef = collection(db, 'dispatch_riders');
        await addDoc(riderRef, {
            companyId,
            name,
            location,
            formattedAddress,
            isAvailable: true,
        });

        return new Response(JSON.stringify({ message: 'Rider registered successfully' }), { status: 201 });
    } catch (error) {
        console.error('Error registering rider:', error);
        return new Response(JSON.stringify({ error: 'Failed to register rider' }), { status: 500 });
    }
}
