import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/api';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    google_maps_link: '',
    terms_text: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...settings });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const initializeDefaults = () => {
    setSettings({
      whatsapp_number: '917845012402',
      google_maps_link: 'https://maps.app.goo.gl/PLACEHOLDER',
      terms_text: `1. I will not allow anyone else to use this vehicle.
2. I will not drive at high speed (Max 100 km/ph); I am responsible for damages & fines.
3. I will not allow drunk persons to travel in the vehicle.
4. I will use this vehicle only for personal use, not business.
5. I will not use the car for illegal activities including drugs, ration goods, or liquor.
6. For minor scratches/dents, the deposit will not be refunded.
7. I am personally responsible for accidents.
8. I will pay all fines personally.
9. Deposit (₹5000) will be refunded within 12-24 hours after vehicle return.
10. Fuel difference amount will be deducted from deposit.`,
      company_name: 'Magnum Self Drive Cars',
      company_address: 'L133, Josy Cottage, Anbu Nagar, Tirunelveli',
      company_phone: '+91 7845012402',
      company_email: 'carsmagnum583@gmail.com'
    });
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <div className="flex gap-2">
          <button 
            onClick={initializeDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" /> Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-8">
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">General Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (No +)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={settings.whatsapp_number}
                  onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Location Link</label>
                <input 
                  type="url" 
                  className="w-full p-2 border rounded-lg"
                  value={settings.google_maps_link}
                  onChange={e => setSettings({...settings, google_maps_link: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={settings.company_name}
                  onChange={e => setSettings({...settings, company_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded-lg"
                  value={settings.company_email}
                  onChange={e => setSettings({...settings, company_email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={settings.company_address}
                  onChange={e => setSettings({...settings, company_address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Terms & Conditions</h2>
            <p className="text-sm text-gray-500 mb-2">This text will appear in the booking form and generated invoices.</p>
            <textarea 
              rows={12}
              className="w-full p-4 border rounded-lg font-mono text-sm bg-gray-50"
              value={settings.terms_text}
              onChange={e => setSettings({...settings, terms_text: e.target.value})}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
