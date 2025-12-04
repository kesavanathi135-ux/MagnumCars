import { Booking, Car, INITIAL_CARS } from './data';

// Simple LocalStorage wrapper to simulate Backend DB
const STORAGE_KEYS = {
  CARS: 'magnum_cars',
  BOOKINGS: 'magnum_bookings',
  AUTH: 'magnum_auth_token'
};

export const mockApi = {
  getCars: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CARS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(INITIAL_CARS));
      return INITIAL_CARS;
    }
    return JSON.parse(stored) as Car[];
  },

  updateCar: (updatedCar: Car) => {
    const cars = mockApi.getCars();
    const index = cars.findIndex(c => c.id === updatedCar.id);
    if (index !== -1) {
      cars[index] = updatedCar;
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    }
    return updatedCar;
  },

  getBookings: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return stored ? JSON.parse(stored) as Booking[] : [];
  },

  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const bookings = mockApi.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: `bk_${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
  },

  updateBooking: (id: string, updates: Partial<Booking>) => {
    const bookings = mockApi.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return bookings[index];
    }
    throw new Error('Booking not found');
  },

  login: (email: string, pass: string) => {
    if (email === 'carsmagnum583@gmail.com' && pass === 'Magnum@123') {
      const token = 'mock_jwt_token_admin_123';
      localStorage.setItem(STORAGE_KEYS.AUTH, token);
      return { token, role: 'admin' };
    }
    throw new Error('Invalid credentials');
  }
};
