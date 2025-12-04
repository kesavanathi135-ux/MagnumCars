import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Car, CITIES } from '../lib/types';
import { Fuel, Settings, Users, Gauge } from 'lucide-react';

export const CarList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cityId = searchParams.get('city') || 'tirunelveli';
  
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const allCars = await api.getCars();
        setCars(allCars.filter(c => c.cityId === cityId));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [cityId]);

  const cityName = CITIES.find(c => c.id === cityId)?.name || 'Unknown City';

  if (loading) return <div className="p-10 text-center">Loading cars...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Available Cars</h2>
          <p className="text-gray-500">Showing cars in <span className="font-semibold text-yellow-600">{cityName}</span></p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-sm text-blue-600 hover:underline"
        >
          Change City
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <div key={car.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition border border-gray-100">
            <div className="h-48 overflow-hidden relative">
               <img src={car.image} alt={car.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
               <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow">
                 {car.type}
               </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{car.name}</h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-gray-400" /> {car.gear}
                </div>
                <div className="flex items-center gap-2">
                  <Fuel size={16} className="text-gray-400" /> {car.fuel}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" /> {car.type}
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-gray-400" /> {car.mileage}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">24 Hours</p>
                  <p className="text-lg font-bold text-slate-900">₹{car.price24h}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">12 Hours</p>
                  <p className="text-lg font-bold text-slate-900">₹{car.price12h}</p>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/book/${car.id}?city=${cityId}`)}
                className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {cars.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No cars available in this city yet.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium">Go Back</button>
        </div>
      )}
    </div>
  );
};
