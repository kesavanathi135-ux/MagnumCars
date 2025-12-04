import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Info, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react';
import { format, differenceInHours, parseISO, addDays, differenceInDays } from 'date-fns';
import { supabase } from '../lib/api';
import { Car } from '../lib/types';
import toast from 'react-hot-toast';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { car, cityId } = location.state as { car: Car; cityId: string } || {};

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [deliveryNeeded, setDeliveryNeeded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    tripLocation: '',
    tripPurpose: '',
  });

  useEffect(() => {
    if (!car) {
      navigate('/');
      return;
    }
    fetchSettings();
  }, [car, navigate]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      if (!error && data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return { rental: 0, deposit: 5000, total: 0, days: 0 };

    const start = parseISO(`${startDate}T${startTime}`);
    const end = parseISO(`${endDate}T${endTime}`);
    
    const hours = differenceInHours(end, start);
    if (hours <= 0) return { rental: 0, deposit: 5000, total: 0, days: 0 };

    const days = Math.ceil(hours / 24);
    
    // Calculate rental cost
    let rentalCost = 0;
    const p24 = (car as any).price_24h || car.price24h;
    const p12 = (car as any).price_12h || car.price12h;

    if (hours <= 12) {
      rentalCost = p12;
    } else {
      rentalCost = days * p24;
    }

    const deposit = 5000; // Mandatory Deposit

    return {
      rental: rentalCost,
      deposit: deposit,
      total: rentalCost + deposit,
      days
    };
  };

  const { rental, deposit, total, days } = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    if (total <= 5000) {
      toast.error('Invalid date range');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            car_id: car.id,
            customer_name: formData.fullName,
            customer_phone: formData.phone,
            customer_email: formData.email,
            occupation: formData.occupation,
            address: formData.address,
            trip_location: formData.tripLocation,
            trip_purpose: formData.tripPurpose,
            start_date: `${startDate}T${startTime}`,
            end_date: `${endDate}T${endTime}`,
            total_amount: total,
            deposit_amount: deposit,
            trip_days: days,
            delivery_needed: deliveryNeeded,
            status: 'Pending',
            city_id: cityId
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Send WhatsApp Alert to Admin
      const adminPhone = settings?.whatsapp_number || '917845012402';
      const message = encodeURIComponent(
        `*New Booking Request*\n\n` +
        `Car: ${car.name}\n` +
        `Customer: ${formData.fullName}\n` +
        `Phone: ${formData.phone}\n` +
        `City: ${cityId}\n` +
        `Dates: ${startDate} to ${endDate}\n` +
        `Total Days: ${days}\n` +
        `Rental: ₹${rental}\n` +
        `Deposit: ₹${deposit}\n` +
        `*Total Payable: ₹${total}*\n` +
        `Delivery: ${deliveryNeeded ? 'Yes' : 'No'}`
      );
      
      window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');

      toast.success('Booking request sent successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultTerms = [
    "I will not allow anyone else to use this vehicle.",
    "I will not drive at high speed (Max 100 km/ph); I am responsible for damages & fines. I will not drink or keep alcohol in this vehicle.",
    "I will not allow drunk persons to travel in the vehicle.",
    "I will use this vehicle only for personal use, not business.",
    "I will not use the car for illegal activities including drugs, ration goods, or liquor.",
    "For minor scratches/dents, the deposit will not be refunded; I will take photos/videos during pickup & return.",
    "I am personally responsible for accidents, violations, or fines. I agree to pay ₹10,000 for accident compensation or ₹30,000 if I cannot continue driving after accident.",
    "I will pay all fines personally.",
    "Deposit (₹5000) will be refunded within 12–24 hours after vehicle return. I agree to ₹500 cleaning charge if car is returned dirty.",
    "Fuel difference amount will be deducted from deposit.",
    "I agree to ₹200 per hour or half-day rent (whichever is lower) for late return.",
    "Half-day rental = 6 hrs; full-day rental applies after.",
    "Management is not responsible for any injury to me or passengers.",
    "Cancellation: Must inform 48 hours before trip for full refund."
  ];

  const termsList = settings?.terms_text
    ? settings.terms_text.split('\n').filter((t: string) => t.trim())
    : defaultTerms;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-slate-900 text-white p-6">
            <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            <p className="text-gray-300 mt-2">Fill in your details to reserve the {car.name}</p>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src={car.image} 
                alt={car.name} 
                className="w-24 h-16 object-cover rounded-md"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{car.name}</h3>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>{car.gear}</span>
                  <span>•</span>
                  <span>{car.fuel}</span>
                  <span>•</span>
                  <span>{car.type}</span>
                </div>
                <div className="mt-2 font-semibold text-blue-700">
                  ₹{(car as any).price_24h || car.price24h}/day
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      required
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Location</label>
                    <input
                      type="text"
                      name="tripLocation"
                      required
                      value={formData.tripLocation}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Kodaikanal, Munnar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Purpose</label>
                    <input
                      type="text"
                      name="tripPurpose"
                      required
                      value={formData.tripPurpose}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Family Vacation, Wedding"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Home Delivery Needed?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryNeeded}
                    onChange={(e) => setDeliveryNeeded(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {days > 0 && (
                <div className="bg-blue-50 p-5 rounded-xl space-y-3 border border-blue-100">
                  <h3 className="font-bold text-gray-900 border-b border-blue-200 pb-2 mb-2">Payment Details</h3>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Duration</span>
                    <span>{days} Days</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Car Rental Charges</span>
                    <span>₹{rental.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-blue-800 font-medium bg-blue-100/50 p-2 rounded">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Security Deposit (Mandatory)
                    </span>
                    <span>₹{deposit.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-3 mt-2 flex justify-between font-bold text-xl text-gray-900">
                    <span>Total Payable</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs text-gray-500 mt-2 bg-white p-2 rounded border border-gray-100">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p>The security deposit of ₹5,000 is fully refundable within 24 hours of returning the vehicle, subject to no damages or traffic violations.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-800">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Terms & Conditions
                  </button>
                  , including the <span className="font-bold text-red-600">100 km/ph speed limit</span> and <span className="font-bold">24-hour deposit refund policy</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" /> Terms & Conditions
              </h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ul className="space-y-3">
                {termsList.map((term: string, index: number) => (
                  <li key={index} className="flex gap-3 text-gray-700 text-sm">
                    <span className="font-bold text-blue-900 min-w-[20px]">{index + 1}.</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTerms(false);
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
              >
                I Accept & Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
