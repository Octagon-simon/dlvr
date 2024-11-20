export interface CompanyDTO {
    companyName: string;
    locationObject: {
        lat: number;
        lng: number;
    };
    whatsapp: string;
    email?: string;
    formattedAddress: string;
}