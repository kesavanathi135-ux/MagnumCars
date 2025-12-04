import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Booking, Car } from '../../lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from 'date-fns';

export const CalendarView = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const [c, b] = await Promise.all([api.getCars(), api.getBookings()]);
      setCars(c);
      setBookings(b);
    };
    loadData();
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getBookingStatus = (carId: string, day: Date) => {
    const booking = bookings.find(b => 
      b.carId === carId && 
      b.status !== 'Rejected' &&
      b.status !== 'Completed' &&
      isWithinInterval(day, { 
        start: parseISO(b.startDate), 
        end: parseISO(b.endDate) 
      })
    );

    if (booking) {
      return {
        status: booking.status,
        customer: booking.customerName
      };
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Availability Calendar</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>Prev</button>
          <span className="font-bold px-4 py-1 bg-white border rounded">{format(currentDate, 'MMMM yyyy')}</span>
          <button className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>Next</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto flex-1">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="flex border-b bg-gray-50">
            <div className="w-48 p-3 font-bold sticky left-0 bg-gray-50 border-r z-10 shadow-sm">Car</div>
            {daysInMonth.map(day => (
              <div key={day.toString()} className={`w-10 flex-shrink-0 border-r p-2 text-center text-xs ${[0,6].includes(day.getDay()) ? 'bg-gray-100' : ''}`}>
                <div className="font-bold">{format(day, 'd')}</div>
                <div className="text-gray-500">{format(day, 'EEEEE')}</div>
              </div>
            ))}
          </div>

          {/* Car Rows */}
          {cars.map(car => (
            <div key={car.id} className="flex border-b hover:bg-gray-50 transition">
              <div className="w-48 p-3 text-sm font-medium sticky left-0 bg-white border-r z-10 flex items-center justify-between shadow-sm">
                <span className="truncate">{car.name}</span>
                {car.isMaintenance && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Maintenance"></span>}
              </div>
              {daysInMonth.map(day => {
                const bookingInfo = getBookingStatus(car.id, day);
                return (
                  <div key={day.toString()} className={`w-10 flex-shrink-0 border-r h-12 relative group ${[0,6].includes(day.getDay()) ? 'bg-gray-50/50' : ''}`}>
                    {car.isMaintenance ? (
                        <div className="absolute inset-1 bg-gray-300 rounded-sm opacity-50" title="Under Maintenance"></div>
                    ) : bookingInfo && (
                      <div 
                        className={`absolute inset-1 rounded-sm cursor-pointer transition hover:scale-105 ${
                          bookingInfo.status === 'Pending' ? 'bg-orange-300' : 'bg-green-500'
                        }`}
                        title={`${bookingInfo.customer} (${bookingInfo.status})`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex gap-6 text-sm bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Confirmed Booking</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-300 rounded"></div> Pending Request</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded"></div> Maintenance</div>
      </div>
    </div>
  );
};
