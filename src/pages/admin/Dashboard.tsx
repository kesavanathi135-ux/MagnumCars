import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Booking, Car } from '../../lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [b, c] = await Promise.all([api.getBookings(), api.getCars()]);
      setBookings(b);
      setCars(c);
    };
    loadData();
  }, []);

  const pending = bookings.filter(b => b.status === 'Pending').length;
  const active = bookings.filter(b => b.status === 'Approved' || b.status === 'Ready for Pickup').length;
  const totalRevenue = cars.reduce((acc, car) => acc + (car.totalRevenue || 0), 0);

  const data = [
    { name: 'Mon', bookings: 4 },
    { name: 'Tue', bookings: 3 },
    { name: 'Wed', bookings: 2 },
    { name: 'Thu', bookings: 6 },
    { name: 'Fri', bookings: 8 },
    { name: 'Sat', bookings: 12 },
    { name: 'Sun', bookings: 10 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h3 className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Pending Requests</p>
          <h3 className="text-3xl font-bold text-orange-500">{pending}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active Bookings</p>
          <h3 className="text-3xl font-bold text-blue-600">{active}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h3 className="font-bold mb-4">Weekly Bookings</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
