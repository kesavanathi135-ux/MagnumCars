export interface Car {
  id: string;
  name: string;
  type: '4-Seater' | '6-Seater' | '7-Seater';
  gear: 'Manual' | 'Automatic';
  fuel: 'Petrol' | 'Diesel';
  price24h: number;
  price12h: number;
  mileage: string;
  image: string;
  cityId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerSharePercent?: number;
  totalRevenue?: number;
  totalBookings?: number;
  registrationNumber?: string;
  isMaintenance?: boolean;
}

export interface Booking {
  id: string;
  carId: string;
  cityId: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Ready for Pickup' | 'Completed';
  
  // Stage 1: Customer
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  occupation: string;
  address: string;
  tripLocation: string;
  tripPurpose: string;
  tripDays: number;
  deliveryNeeded: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  totalAmount: number;
  
  // Stage 2: Admin Delivery Details
  startKm?: number;
  endKm?: number;
  deliveryDateTime?: string;
  fuelLevel?: string;
  fastTagStatus?: string;
  signatureUrl?: string;
  idProofUrls?: string[];
  customerPhotoUrl?: string;
  
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category?: 'general' | 'whatsapp' | 'invoice' | 'legal';
}

export const CITIES = [
  { id: 'tirunelveli', name: 'Tirunelveli (Head Office)' },
  { id: 'tenkasi', name: 'Tenkasi' },
  { id: 'tuticorin', name: 'Tuticorin' },
  { id: 'kanyakumari', name: 'Kanyakumari' },
];
