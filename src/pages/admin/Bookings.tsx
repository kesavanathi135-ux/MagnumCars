import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/api';
import { format } from 'date-fns';
import { 
  Search, Filter, Check, X, Eye, FileText, Upload, 
  MessageCircle, Calendar, MapPin, User, CreditCard, Camera, PenTool, DollarSign, ShieldCheck
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { generateInvoice } from '../../lib/pdfGenerator';
import { toast } from 'react-hot-toast';

interface Booking {
  id: string;
  created_at: string;
  city: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  deposit_amount?: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  occupation: string;
  address: string;
  trip_location: string;
  trip_purpose: string;
  start_km: number;
  end_km: number;
  fuel_level: string;
  fasttag_status: string;
  delivery_datetime: string;
  id_proof_1: string;
  id_proof_2: string;
  id_proof_3: string;
  customer_photo: string;
  signature_url: string;
  cars: {
    name: string;
    registration_number: string;
    image: string;
  };
}

interface Settings {
  whatsapp_number: string;
  google_maps_link: string;
  terms_text: string;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [deliveryData, setDeliveryData] = useState({
    start_km: '',
    delivery_datetime: '',
    fuel_level: 'Full',
    fasttag_status: 'Active',
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const sigPad = useRef<any>(null);

  useEffect(() => {
    fetchBookings();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) setSettings(data);
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (
            name,
            registration_number,
            image
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
      if (selectedBooking) setSelectedBooking(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files || !e.target.files[0] || !selectedBooking) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedBooking.id}/${field}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    setUploading(field);
    try {
      const { error: uploadError } = await supabase.storage.from('magnum-files').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('magnum-files').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('bookings').update({ [field]: publicUrl }).eq('id', selectedBooking.id);
      if (dbError) throw dbError;
      setSelectedBooking(prev => prev ? { ...prev, [field]: publicUrl } : null);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(null);
    }
  };

  const saveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty() || !selectedBooking) {
      toast.error('Please sign before saving');
      return;
    }
    setUploading('signature');
    try {
      const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `${selectedBooking.id}/signature_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from('magnum-files').upload(fileName, blob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('magnum-files').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('bookings').update({ signature_url: publicUrl }).eq('id', selectedBooking.id);
      if (dbError) throw dbError;
      setSelectedBooking(prev => prev ? { ...prev, signature_url: publicUrl } : null);
      toast.success('Signature saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save signature');
    } finally {
      setUploading(null);
    }
  };

  const submitDeliveryForm = async () => {
    if (!selectedBooking) return;
    try {
      const { error } = await supabase.from('bookings').update({ ...deliveryData, status: 'Ready for Pickup' }).eq('id', selectedBooking.id);
      if (error) throw error;
      toast.success('Delivery details saved');
      setShowDeliveryForm(false);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to save details');
    }
  };

  const sendWhatsApp = (type: 'confirm' | 'pickup' | 'invoice', booking: Booking) => {
    if (!settings) {
      toast.error('Please configure settings first');
      return;
    }
    let message = '';
    const carName = booking.cars?.name || 'Car';
    const regNo = booking.cars?.registration_number || 'TBD';
    const deposit = booking.deposit_amount || 5000;
    const rental = booking.total_amount - deposit;

    if (type === 'confirm') {
      message = `*BOOKING CONFIRMED* ✅%0A%0A` +
        `Dear ${booking.customer_name},%0A` +
        `Your booking for *${carName} (${regNo})* is confirmed.%0A%0A` +
        `📅 *Pickup:* ${format(new Date(booking.start_date), 'dd MMM yyyy HH:mm')}%0A` +
        `📅 *Return:* ${format(new Date(booking.end_date), 'dd MMM yyyy HH:mm')}%0A` +
        `💰 *Total Amount:* ₹${booking.total_amount} (Inc. ₹${deposit} Deposit)%0A` +
        `📍 *Location:* ${settings.google_maps_link}%0A%0A` +
        `Please bring your original ID and driving license.`;
    } else if (type === 'pickup') {
      message = `*VEHICLE READY FOR PICKUP* 🚗%0A%0A` +
        `Car: ${carName} (${regNo})%0A` +
        `Fuel Level: ${booking.fuel_level || 'Full'}%0A` +
        `Start KM: ${booking.start_km || 0}%0A%0A` +
        `📍 *Pickup Location:* ${settings.google_maps_link}%0A%0A` +
        `Drive safe!`;
    } else if (type === 'invoice') {
      message = `*INVOICE GENERATED* 📄%0A%0A` +
        `Booking ID: #${booking.id.slice(0, 8)}%0A` +
        `Rental: ₹${rental}%0A` +
        `Deposit: ₹${deposit} (Refundable)%0A` +
        `*Total Paid: ₹${booking.total_amount}*%0A%0A` +
        `Thank you for choosing Magnum Self Drive Cars!`;
    }
    window.open(`https://wa.me/${booking.customer_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.cars?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Booking ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Car</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Dates</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono text-gray-500">#{booking.id.slice(0, 8)}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{booking.customer_name}</span>
                      <span className="text-xs text-gray-500">{booking.customer_phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={booking.cars?.image || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x60'} 
                        alt={booking.cars?.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{booking.cars?.name}</span>
                        <span className="text-xs text-gray-500">{booking.cars?.registration_number || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col text-sm">
                      <span className="text-green-600">{format(new Date(booking.start_date), 'dd MMM HH:mm')}</span>
                      <span className="text-red-500">{format(new Date(booking.end_date), 'dd MMM HH:mm')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDeliveryForm(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                            className="p-2 hover:bg-green-50 rounded-full text-green-600"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                            className="p-2 hover:bg-red-50 rounded-full text-red-600"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold">Booking Details</h2>
                <p className="text-sm text-gray-500">ID: #{selectedBooking.id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl">
                <button 
                  onClick={() => setShowDeliveryForm(!showDeliveryForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PenTool className="w-4 h-4" />
                  {showDeliveryForm ? 'Hide Delivery Form' : 'Delivery Form'}
                </button>
                <button 
                  onClick={() => generateInvoice(selectedBooking)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                >
                  <FileText className="w-4 h-4" />
                  Generate Invoice
                </button>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => sendWhatsApp('confirm', selectedBooking)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200" title="Send Confirmation">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => sendWhatsApp('pickup', selectedBooking)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Send Pickup Info">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showDeliveryForm && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-6 animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-bold text-lg text-blue-900">Delivery & Handover Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start KM</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-lg"
                        value={deliveryData.start_km}
                        onChange={e => setDeliveryData({...deliveryData, start_km: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date/Time</label>
                      <input 
                        type="datetime-local" 
                        className="w-full p-2 border rounded-lg"
                        value={deliveryData.delivery_datetime}
                        onChange={e => setDeliveryData({...deliveryData, delivery_datetime: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Level</label>
                      <select 
                        className="w-full p-2 border rounded-lg"
                        value={deliveryData.fuel_level}
                        onChange={e => setDeliveryData({...deliveryData, fuel_level: e.target.value})}
                      >
                        <option>Empty</option>
                        <option>Reserve</option>
                        <option>25%</option>
                        <option>50%</option>
                        <option>75%</option>
                        <option>Full</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">FastTag Status</label>
                      <select 
                        className="w-full p-2 border rounded-lg"
                        value={deliveryData.fasttag_status}
                        onChange={e => setDeliveryData({...deliveryData, fasttag_status: e.target.value})}
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Low Balance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['id_proof_1', 'id_proof_2', 'id_proof_3', 'customer_photo'].map((field) => (
                      <div key={field} className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center bg-white hover:bg-blue-50 transition-colors relative group">
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, field)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={uploading === field}
                        />
                        {selectedBooking[field as keyof Booking] ? (
                          <div className="relative h-32 w-full">
                            <img 
                              src={selectedBooking[field as keyof Booking] as string} 
                              alt={field} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-xs font-medium">Click to Change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 flex flex-col items-center justify-center text-blue-400">
                            {uploading === field ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            ) : (
                              <>
                                <Camera className="w-8 h-8 mb-2" />
                                <span className="text-xs font-medium capitalize">{field.replace(/_/g, ' ')}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border rounded-xl p-4 bg-white">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Digital Signature</label>
                    {selectedBooking.signature_url ? (
                      <div className="relative group">
                        <img src={selectedBooking.signature_url} alt="Signature" className="h-32 border rounded bg-white" />
                        <button 
                          onClick={() => setSelectedBooking({...selectedBooking, signature_url: ''})}
                          className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="border rounded bg-white">
                          <SignatureCanvas 
                            ref={sigPad}
                            canvasProps={{className: 'w-full h-40'}}
                            backgroundColor="rgb(255, 255, 255)"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => sigPad.current?.clear()} className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-50">Clear</button>
                          <button onClick={saveSignature} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Signature</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={submitDeliveryForm}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
                    >
                      Save Delivery Details
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span> <span className="font-medium">{selectedBooking.customer_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="font-medium">{selectedBooking.customer_phone}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email</span> <span className="font-medium">{selectedBooking.customer_email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Occupation</span> <span className="font-medium">{selectedBooking.occupation}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Address</span> <span className="font-medium text-right max-w-[200px]">{selectedBooking.address}</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Trip Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Location</span> <span className="font-medium">{selectedBooking.trip_location}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Purpose</span> <span className="font-medium">{selectedBooking.trip_purpose}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Start</span> <span className="font-medium">{format(new Date(selectedBooking.start_date), 'dd MMM yyyy HH:mm')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">End</span> <span className="font-medium">{format(new Date(selectedBooking.end_date), 'dd MMM yyyy HH:mm')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Days</span> <span className="font-medium">{selectedBooking.total_days}</span></div>
                  </div>
                  
                  {/* Payment Breakdown Section */}
                  <div className="bg-blue-50 p-4 rounded-xl space-y-3 text-sm border border-blue-100">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Payment Breakdown
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Car Rental</span> 
                      <span className="font-medium">₹{(selectedBooking.total_amount - (selectedBooking.deposit_amount || 5000)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-800">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Security Deposit</span> 
                      <span className="font-medium">₹{(selectedBooking.deposit_amount || 5000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                      <span className="font-bold text-gray-900">Total Paid</span> 
                      <span className="font-bold text-gray-900">₹{selectedBooking.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
