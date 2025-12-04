import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CarList } from './pages/CarList';
import { Booking } from './pages/Booking';
import { AdminLogin } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Revenue } from './pages/admin/Revenue';
import { Bookings } from './pages/admin/Bookings';
import { CarsManagement } from './pages/admin/Cars';
import { CalendarView } from './pages/admin/Calendar';
import { Settings } from './pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cars" element={<CarList />} />
          <Route path="book/:carId" element={<Booking />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="cars" element={<CarsManagement />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
