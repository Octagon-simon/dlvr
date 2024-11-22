type GeoPoint = {
    lat: number;
    lng: number;
}

export interface CompanyDTO {
    id: string;
    companyName: string;
    location: GeoPoint;
    whatsapp: string;
    email?: string;
    formattedAddress: string;
    createdAt: number;
}

export interface DispatchRiderDTO{
    id: string;
    companyId: string;
    name: string;
    location: GeoPoint;
    isAvailable: boolean;
    formattedAddress: string;
    createdAt: number;
    whatsapp: string;
}

export interface OrderDTO{
    id: string;
    name: string;
    whatsapp: string;
    pickupAddress: GeoPoint;
    details: string;
    companyId: string;
    assignedRiderId?: string;
    status: "pending" | "assigned" | "completed";
    createdAt: number;
    formattedAddress: string;
}