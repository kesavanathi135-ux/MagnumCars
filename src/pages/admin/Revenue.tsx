import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Car, Booking } from '../../types';
import { Loader2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Revenue = () => {
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        supabase.from('cars').select('*'),
        supabase.from('bookings').select('*')
      ]);

      if (carsRes.error) throw carsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      setCars(carsRes.data || []);
      setBookings(bookingsRes.data || []);
      calculateStats(bookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Booking[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalRev = 0;
    let monthlyRev = 0;
    let count = 0;

    data.forEach(booking => {
      if (booking.status !== 'Rejected') {
        // IMPORTANT: Subtract deposit (default 5000) from revenue calculation
        const deposit = booking.deposit_amount || 5000;
        const revenue = Math.max(0, booking.total_amount - deposit);
        
        totalRev += revenue;
        count++;

        const bookingDate = new Date(booking.start_date);
        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          monthlyRev += revenue;
        }
      }
    });

    setStats({
      totalRevenue: totalRev,
      monthlyRevenue: monthlyRev,
      totalBookings: count
    });
  };

  const handleShareChange = async (carId: string, newShare: string) => {
    const share = parseInt(newShare);
    if (isNaN(share) || share < 0 || share > 100) {
      toast.error('Please enter a valid percentage (0-100)');
      return;
    }

    try {
      const { error } = await supabase
        .from('cars')
        .update({ owner_share_percent: share })
        .eq('id', carId);

      if (error) throw error;
      
      toast.success('Owner share updated');
      setCars(cars.map(c => c.id === carId ? { ...c, owner_share_percent: share } : c));
    } catch (error) {
      toast.error('Failed to update share');
    }
  };

  const carRevenueData = cars.map(car => {
    const carBookings = bookings.filter(b => b.car_id === car.id && b.status !== 'Rejected');
    const totalRevenue = carBookings.reduce((sum, b) => {
      const deposit = b.deposit_amount || 5000;
      return sum + Math.max(0, b.total_amount - deposit);
    }, 0);
    
    return {
      name: car.name,
      revenue: totalRevenue,
      bookings: carBookings.length,
      owner: car.owner_name || 'Magnum',
      share: car.owner_share_percent || 0,
      id: car.id
    };
  }).sort((a, b) => b.revenue - a.revenue);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Revenue & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue (Net)</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">Car Performance & Owner Share</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Car Name</th>
                <th className="p-4">Total Bookings</th>
                <th className="p-4">Total Revenue (Net)</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Owner Share %</th>
                <th className="p-4">Owner Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {carRevenueData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.bookings}</td>
                  <td className="p-4 font-semibold text-green-600">₹{item.revenue.toLocaleString()}</td>
                  <td className="p-4 text-gray-600">{item.owner}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      className="w-16 p-1 border rounded text-center"
                      defaultValue={item.share}
                      onBlur={(e) => handleShareChange(item.id, e.target.value)}
                    />
                    <span className="ml-1">%</span>
                  </td>
                  <td className="p-4 font-bold text-blue-600">
                    ₹{Math.round(item.revenue * (item.share / 100)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue by Car</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={carRevenueData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="revenue" fill="#1e3a8a" name="Revenue" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Revenue;
