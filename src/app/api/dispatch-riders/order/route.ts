import { db } from '@/firebase';
import { DispatchRiderDTO, OrderDTO } from '@/types';
import { collection, getDocs, query, where, GeoPoint, addDoc, updateDoc, doc } from 'firebase/firestore';
import { distanceBetween } from 'geofire-common';

interface CustomRequest extends Request {
    json(): Promise<OrderDTO>;
}
// id: string;
// pickupAddress: GeoPoint;
// details: string;
// assignedRiderId?: string;
// status: "pending" | "assigned" | "completed";
// createdAt: number;
// formattedAddress: string;

export async function POST(req: CustomRequest) {
    try {
        const { pickupAddress, details, companyId } = await req.json();

        if (!pickupAddress || !details || !companyId) {
            return new Response(JSON.stringify({ error: 'Missing order details' }), { status: 400 });
        }

        const ridersRef = collection(db, 'dispatch_riders');
        const snapshot = await getDocs(
            query(
                ridersRef,
                where("isAvailable", "==", true),
                where("companyId", "==", companyId)
            )
        );

        if (snapshot.empty) {
            return new Response(JSON.stringify({ error: 'No available riders, please try again later' }), { status: 404 });
        }

        const availableRiders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as DispatchRiderDTO[];

        const nearestRider = availableRiders.reduce((prev, curr) => {
            const prevDistance = distanceBetween(
                [pickupAddress.lat, pickupAddress.lng],
                [prev.location.lat, prev.location.lng]
            );
            const currDistance = distanceBetween(
                [pickupAddress.lat, pickupAddress.lng],
                [curr.location.lat, curr.location.lng]
            );
            return currDistance < prevDistance ? curr : prev;
        });

        // Assign the rider to the order
        const ordersRef = collection(db, 'orders');
        await addDoc(ordersRef, {
            pickupAddress: new GeoPoint(pickupAddress.lat, pickupAddress.lng),
            details,
            assignedRiderId: nearestRider.id,
            status: 'assigned',
        });

        // Update rider's availability
        const riderDocRef = doc(db, 'dispatch_riders', nearestRider.id);
        await updateDoc(riderDocRef, { isAvailable: false });

        return new Response(JSON.stringify({
            message: 'Rider assigned successfully',
            rider: nearestRider,
        }), { status: 200 });
    } catch (error) {
        console.error('Error ordering dispatch rider:', error);
        return new Response(JSON.stringify({ error: 'Failed to process order' }), { status: 500 });
    }
}
