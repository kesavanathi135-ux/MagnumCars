import { supabase } from './supabase';
import { Booking, Car, Setting } from './types';

// Re-export supabase so other files can use it
export { supabase };

// Map DB columns (snake_case) to App types (camelCase)
const mapCar = (data: any): Car => ({
  id: data.id,
  name: data.name,
  type: data.type,
  gear: data.gear,
  fuel: data.fuel,
  price24h: data.price24h,
  price12h: data.price12h,
  mileage: data.mileage,
  image: data.image,
  cityId: data.city_id,
  ownerName: data.owner_name,
  ownerPhone: data.owner_phone,
  ownerSharePercent: data.owner_share_percent,
  totalRevenue: data.total_revenue,
  totalBookings: data.total_bookings,
  registrationNumber: data.registration_number,
  isMaintenance: data.is_maintenance
});

const mapBooking = (data: any): Booking => ({
  id: data.id,
  carId: data.car_id,
  cityId: data.city_id,
  status: data.status,
  customerName: data.customer_name,
  customerPhone: data.customer_phone,
  customerEmail: data.customer_email,
  occupation: data.occupation,
  address: data.address,
  tripLocation: data.trip_location,
  tripPurpose: data.trip_purpose,
  tripDays: Number(data.trip_days),
  deliveryNeeded: data.delivery_needed,
  startDate: data.start_date,
  startTime: data.start_time,
  endDate: data.end_date,
  endTime: data.end_time,
  totalAmount: data.total_amount,
  startKm: data.start_km,
  deliveryDateTime: data.delivery_datetime,
  fuelLevel: data.fuel_level,
  fastTagStatus: data.fasttag_status,
  signatureUrl: data.signature_url,
  idProofUrls: data.id_proof_urls,
  customerPhotoUrl: data.customer_photo_url,
  createdAt: data.created_at
});

export const api = {
  // --- CARS ---
  getCars: async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at');
    if (error) throw error;
    return data.map(mapCar);
  },

  createCar: async (car: Partial<Car>) => {
    const dbCar = {
      name: car.name,
      type: car.type,
      gear: car.gear,
      fuel: car.fuel,
      price24h: car.price24h,
      price12h: car.price12h,
      mileage: car.mileage,
      image: car.image,
      city_id: car.cityId,
      owner_name: car.ownerName,
      owner_phone: car.ownerPhone,
      owner_share_percent: car.ownerSharePercent,
      registration_number: car.registrationNumber
    };
    const { data, error } = await supabase.from('cars').insert(dbCar).select().single();
    if (error) throw error;
    return mapCar(data);
  },

  updateCar: async (car: Partial<Car> & { id: string }) => {
    const dbUpdates: any = {};
    if (car.ownerSharePercent !== undefined) dbUpdates.owner_share_percent = car.ownerSharePercent;
    if (car.registrationNumber !== undefined) dbUpdates.registration_number = car.registrationNumber;
    if (car.isMaintenance !== undefined) dbUpdates.is_maintenance = car.isMaintenance;
    
    const { data, error } = await supabase.from('cars').update(dbUpdates).eq('id', car.id).select().single();
    if (error) throw error;
    return mapCar(data);
  },

  deleteCar: async (id: string) => {
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;
  },

  // --- BOOKINGS ---
  getBookings: async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapBooking);
  },

  createBooking: async (booking: Partial<Booking>) => {
    const dbPayload = {
      car_id: booking.carId,
      city_id: booking.cityId,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail,
      occupation: booking.occupation,
      address: booking.address,
      trip_location: booking.tripLocation,
      trip_purpose: booking.tripPurpose,
      trip_days: booking.tripDays,
      delivery_needed: booking.deliveryNeeded,
      start_date: booking.startDate,
      start_time: booking.startTime,
      end_date: booking.endDate,
      end_time: booking.endTime,
      total_amount: booking.totalAmount,
      status: 'Pending'
    };

    const { data, error } = await supabase.from('bookings').insert(dbPayload).select().single();
    if (error) throw error;
    return mapBooking(data);
  },

  updateBooking: async (id: string, updates: Partial<Booking>) => {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.startKm) dbUpdates.start_km = updates.startKm;
    if (updates.deliveryDateTime) dbUpdates.delivery_datetime = updates.deliveryDateTime;
    if (updates.fuelLevel) dbUpdates.fuel_level = updates.fuelLevel;
    if (updates.fastTagStatus) dbUpdates.fasttag_status = updates.fastTagStatus;
    if (updates.signatureUrl) dbUpdates.signature_url = updates.signatureUrl;
    if (updates.idProofUrls) dbUpdates.id_proof_urls = updates.idProofUrls;
    if (updates.customerPhotoUrl) dbUpdates.customer_photo_url = updates.customerPhotoUrl;

    const { data, error } = await supabase.from('bookings').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;
    return mapBooking(data);
  },

  // --- SETTINGS ---
  getSettings: async () => {
    const { data, error } = await supabase.from('settings').select('*').order('key');
    if (error) throw error;
    return data as Setting[];
  },

  updateSetting: async (key: string, value: string, description?: string, category?: string) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, description, category }, { onConflict: 'key' })
      .select()
      .single();
      
    if (error) throw error;
    return data as Setting;
  },

  // --- AUTH ---
  login: async (email: string, pass: string) => {
    if (email === 'carsmagnum583@gmail.com' && pass === 'Magnum@123') {
      return { token: 'admin-session-token', role: 'admin' };
    }
    throw new Error('Invalid credentials');
  },

  // --- STORAGE ---
  uploadFile: async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('magnum-files').upload(path, file);
    if (error) throw error;
    return supabase.storage.from('magnum-files').getPublicUrl(path).data.publicUrl;
  }
};
