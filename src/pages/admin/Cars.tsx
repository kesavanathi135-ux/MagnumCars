import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/api';
import { Plus, Trash2, Edit2, X, Save, Car as CarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Correct Interface matching Database Schema
interface Car {
  id: string;
  name: string;
  city_id: string;
  price_24h: number;
  price_12h: number;
  fuel: string;       // Corrected from fuel_type
  gear: string;       // Corrected from transmission
  type: string;       // Corrected from seats
  image: string;
  registration_number: string;
  mileage: string;    // Corrected from mileage_range
  owner_name: string;
  owner_phone: string;
  owner_share_percent: number;
}

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  // Form State matching DB columns
  const [formData, setFormData] = useState({
    name: '',
    city_id: 'Tirunelveli',
    price_24h: '',
    price_12h: '',
    fuel: 'Petrol',
    gear: 'Manual',
    type: '4-Seater',
    image: '',
    registration_number: '',
    mileage: '',
    owner_name: '',
    owner_phone: '',
    owner_share_percent: '100'
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      name: car.name || '',
      city_id: car.city_id || 'Tirunelveli',
      price_24h: car.price_24h?.toString() || '',
      price_12h: car.price_12h?.toString() || '',
      fuel: car.fuel || 'Petrol',
      gear: car.gear || 'Manual',
      type: car.type || '4-Seater',
      image: car.image || '',
      registration_number: car.registration_number || '',
      mileage: car.mileage || '',
      owner_name: car.owner_name || '',
      owner_phone: car.owner_phone || '',
      owner_share_percent: car.owner_share_percent?.toString() || '100'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        city_id: formData.city_id,
        price_24h: Number(formData.price_24h),
        price_12h: Number(formData.price_12h),
        fuel: formData.fuel,
        gear: formData.gear,
        type: formData.type,
        image: formData.image,
        registration_number: formData.registration_number,
        mileage: formData.mileage,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_share_percent: Number(formData.owner_share_percent)
      };

      if (editingCar) {
        // Update existing car
        const { error } = await supabase
          .from('cars')
          .update(payload)
          .eq('id', editingCar.id);

        if (error) throw error;
        toast.success('Car updated successfully');
      } else {
        // Create new car
        const { error } = await supabase
          .from('cars')
          .insert([payload]);

        if (error) throw error;
        toast.success('Car added successfully');
      }

      setShowModal(false);
      setEditingCar(null);
      resetForm();
      fetchCars();
    } catch (error) {
      toast.error(editingCar ? 'Failed to update car' : 'Failed to add car');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', city_id: 'Tirunelveli', price_24h: '', price_12h: '',
      fuel: 'Petrol', gear: 'Manual', type: '4-Seater', image: '',
      registration_number: '', mileage: '', owner_name: '', owner_phone: '',
      owner_share_percent: '100'
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) throw error;
      toast.success('Car deleted');
      fetchCars();
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
        <button 
          onClick={() => {
            setEditingCar(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add New Car
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => handleEdit(car)}
                  className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                  title="Edit Car"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(car.id)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  title="Delete Car"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {car.city_id}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{car.name}</h3>
                  <p className="text-sm text-gray-500">{car.registration_number || 'No Reg No'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{car.price_24h}</p>
                  <p className="text-xs text-gray-500">/24h</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
                  <span className="text-xs">⛽ {car.fuel}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
                  <span className="text-xs">⚙️ {car.gear}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
                  <span className="text-xs">💺 {car.type}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
                  <span className="text-xs">⚡ {car.mileage}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Name</label>
                  <input required type="text" className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input type="text" className="w-full p-2 border rounded-lg" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value})}>
                    <option value="Tirunelveli">Tirunelveli</option>
                    <option value="Tenkasi">Tenkasi</option>
                    <option value="Tuticorin">Tuticorin</option>
                    <option value="Kanyakumari">Kanyakumari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input required type="url" className="w-full p-2 border rounded-lg" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (24 Hours)</label>
                  <input required type="number" className="w-full p-2 border rounded-lg" value={formData.price_24h} onChange={e => setFormData({...formData, price_24h: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (12 Hours)</label>
                  <input required type="number" className="w-full p-2 border rounded-lg" value={formData.price_12h} onChange={e => setFormData({...formData, price_12h: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.gear} onChange={e => setFormData({...formData, gear: e.target.value})}>
                    <option>Manual</option>
                    <option>Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>4-Seater</option>
                    <option>6-Seater</option>
                    <option>7-Seater</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                  <input type="text" placeholder="e.g. 18-22 KMPL" className="w-full p-2 border rounded-lg" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <input type="text" className="w-full p-2 border rounded-lg" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
                  <input type="text" className="w-full p-2 border rounded-lg" value={formData.owner_phone} onChange={e => setFormData({...formData, owner_phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Share %</label>
                  <input type="number" min="0" max="100" className="w-full p-2 border rounded-lg" value={formData.owner_share_percent} onChange={e => setFormData({...formData, owner_share_percent: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {editingCar ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
