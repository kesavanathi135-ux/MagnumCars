import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Car, Setting } from './types';
import { format } from 'date-fns';

export const generateInvoice = (booking: Booking, car: Car, settings: Setting[]) => {
  const doc = new jsPDF();
  
  // Helper to get setting
  const getVal = (key: string, fallback: string) => settings.find(s => s.key === key)?.value || fallback;

  const companyName = getVal('company_name', 'MAGNUM SELF DRIVE CARS');
  const companyAddr = getVal('company_address', 'L133, Josy Cottage, Tirunelveli');
  const companyEmail = getVal('company_email', 'carsmagnum583@gmail.com');
  const companyPhone = getVal('whatsapp_number', '7845012402');

  // --- Header ---
  doc.setFillColor(255, 204, 0); // Yellow
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddr, 14, 28);
  doc.text(`Phone: +${companyPhone} | Email: ${companyEmail}`, 14, 35);

  // --- Invoice Details ---
  doc.setFontSize(14);
  doc.text("INVOICE", 14, 55);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${booking.id.slice(0, 8).toUpperCase()}`, 14, 62);
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 14, 67);
  
  // --- Customer Details ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", 14, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${booking.customerName}`, 14, 86);
  doc.text(`Phone: ${booking.customerPhone}`, 14, 91);
  doc.text(`Address: ${booking.address || 'N/A'}`, 14, 96);

  // --- Car Details ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Vehicle Details:", 120, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Car: ${car.name}`, 120, 86);
  doc.text(`Fuel: ${car.fuel}`, 120, 91);
  doc.text(`Gear: ${car.gear}`, 120, 96);
  if(car.registrationNumber) doc.text(`Reg No: ${car.registrationNumber}`, 120, 101);

  // --- Table ---
  const tableData = [
    ['Description', 'Details'],
    ['Trip Duration', `${booking.tripDays} Days`],
    ['Start Date', `${booking.startDate} ${booking.startTime}`],
    ['End Date', `${booking.endDate} ${booking.endTime}`],
    ['Start KM', booking.startKm ? `${booking.startKm} km` : 'N/A'],
    ['Total Amount', `Rs. ${booking.totalAmount.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: 110,
    head: [['Item', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40] },
  });

  // --- Footer ---
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 14, finalY);
  doc.setFontSize(8);
  doc.setTextColor(100);
  
  const terms = [
    "1. Fuel charges are borne by the customer.",
    "2. Any damage to the vehicle will be charged as per actuals.",
    "3. Speed limit is 80 kmph. Overspeeding fine: Rs. 500.",
    "4. Late return penalty applies as per policy."
  ];
  terms.forEach((term, i) => {
    doc.text(term, 14, finalY + 6 + (i * 5));
  });

  doc.save(`Invoice_${booking.customerName}_${booking.startDate}.pdf`);
};
