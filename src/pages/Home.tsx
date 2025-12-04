import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Shield, Clock, Car } from 'lucide-react';
import { CITIES } from '../lib/types';

export const Home = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');

  const handleSearch = () => {
    if (selectedCity) {
      navigate(`/cars?city=${selectedCity}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-slate-900 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=2128&auto=format&fit=crop" 
            alt="Car Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Drive Your <span className="text-yellow-400">Dreams</span> Today
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Premium self-drive cars starting at just ₹1600/12hrs. 
              No hidden charges. Unlimited freedom.
            </p>

            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Your City</label>
              <div className="relative mb-4">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <select 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none appearance-none bg-white"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">Choose a city...</option>
                  {CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleSearch}
                disabled={!selectedCity}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Cars <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Range of Cars</h3>
              <p className="text-gray-600">From hatchbacks to premium SUVs, choose the perfect car for your journey.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & Sanitized</h3>
              <p className="text-gray-600">Every car is thoroughly sanitized and maintained for your safety.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We are always here to help you with round-the-clock roadside assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
