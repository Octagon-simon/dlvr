type GeoPoint = {
    lat: number;
    lng: number;
}

export interface CompanyDTO {
    companyName: string;
    location: GeoPoint;
    whatsapp: string;
    email?: string;
    formattedAddress: string;
}

export interface DispatchRiderDTO{
    id: string;
    companyId: string;
    name: string;
    location: GeoPoint;
    isAvailable: boolean;
    formattedAddress: string;
}

export interface OrderDTO{
    id: string;
    orderLocation: GeoPoint;
    details: string;
    assignedRiderId?: string;
    status: "pending" | "assigned" | "completed";
}