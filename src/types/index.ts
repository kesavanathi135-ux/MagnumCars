export interface Car {
  id: string;
  name: string;
  type: string; // '4-seater' | '6-seater' | '7-seater'
  gear: string; // 'Manual' | 'Automatic'
  fuel: string; // 'Petrol' | 'Diesel'
  price_24h: number;
  price_12h: number;
  mileage: string;
  image_url: string;
  city_id: string;
  available: boolean;
  owner_name?: string;
  owner_phone?: string;
  owner_share_percent?: number;
  reg_number?: string;
}

export interface Booking {
  id: string;
  car_id: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  deposit_amount?: number; // Added deposit field
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  customer_phone: string;
  customer_email: string;
  occupation: string;
  address: string;
  trip_location: string;
  trip_purpose: string;
  trip_days: number;
  delivery_needed: boolean;
  start_km?: number;
  end_km?: number;
  delivery_datetime?: string;
  fuel_level?: string;
  fasttag_status?: string;
  signature_url?: string;
  id_proof_1?: string;
  id_proof_2?: string;
  id_proof_3?: string;
  customer_photo?: string;
  created_at?: string;
  cars?: Car;
}

export interface City {
  id: string;
  name: string;
}
