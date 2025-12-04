import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Car } from '../types';
import { format } from 'date-fns';

export const generateInvoice = (booking: Booking, car: Car, settings: any) => {
  const doc = new jsPDF();
  const companyName = settings?.company_name || 'MAGNUM SELF DRIVE CARS';
  const companyPhone = settings?.whatsapp_number || '+91 7845012402';
  const companyEmail = settings?.company_email || 'carsmagnum583@gmail.com';
  const companyAddress = settings?.company_address || 'L133, Josy Cottage, Anbu Nagar Water Tank 2nd Street, Palayamkottai, Tirunelveli - 627007';

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setFontSize(22);
  doc.setTextColor(250, 204, 21);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${companyPhone}`, 14, 28);
  doc.text(`Email: ${companyEmail}`, 14, 33);
  
  const addressLines = doc.splitTextToSize(companyAddress, 120);
  doc.text(addressLines, 14, 38);

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', 160, 25);
  
  doc.setFontSize(10);
  doc.text(`No: #${booking.id.slice(0, 8).toUpperCase()}`, 160, 33);
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 160, 38);

  doc.setTextColor(0, 0, 0);

  doc.autoTable({
    startY: 55,
    head: [['BILLED TO', 'VEHICLE DETAILS']],
    body: [[
      `Name: ${booking.customer_name}\nPhone: ${booking.customer_phone}\nEmail: ${booking.customer_email}\nAddress: ${booking.address}`,
      `Car: ${car.name}\nReg No: ${car.reg_number || car.registration_number || 'N/A'}\nFuel: ${car.fuel} | ${car.gear}\nStart KM: ${booking.start_km || 'N/A'}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [100, 100, 100], fontStyle: 'bold', lineWidth: 0 },
    styles: { cellPadding: 6, fontSize: 10, textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200] },
    columnStyles: { 0: { cellWidth: 100 } }
  });

  const start = format(new Date(booking.start_date), 'dd MMM yyyy, hh:mm a');
  const end = format(new Date(booking.end_date), 'dd MMM yyyy, hh:mm a');

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Trip Start', 'Trip End', 'Duration', 'Destination']],
    body: [[start, end, `${booking.trip_days} Days`, booking.trip_location]],
    theme: 'striped',
    headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0] },
    styles: { fontSize: 10 }
  });

  const deposit = booking.deposit_amount || 5000;
  const rentalAmount = booking.total_amount - deposit;

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Description', 'Amount (INR)']],
    body: [
      [`Vehicle Rental Charges (${booking.trip_days} Days)`, `Rs. ${rentalAmount.toLocaleString()}`],
      [`Security Deposit (Refundable within 24h)`, `Rs. ${deposit.toLocaleString()}`],
      [{ content: 'TOTAL AMOUNT PAID', styles: { fontStyle: 'bold', fontSize: 12 } }, { content: `Rs. ${booking.total_amount.toLocaleString()}`, styles: { fontStyle: 'bold', fontSize: 12, textColor: [30, 41, 59] } }]
    ],
    theme: 'plain',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: { 1: { halign: 'right' } },
    footStyles: { fillColor: [255, 255, 255] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', 14, finalY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  
  const terms = [
    "1. Security Deposit (Rs. 5000) will be refunded within 12-24 hours after vehicle return, subject to vehicle condition.",
    "2. MAXIMUM SPEED LIMIT: 100 KM/PH. Overspeeding fines are the sole responsibility of the customer.",
    "3. Fuel Policy: Vehicle must be returned with the same fuel level as pickup. Shortage will be deducted from deposit.",
    "4. The customer is fully liable for any accidents, damages, or traffic violations during the rental period.",
    "5. In case of accident damage, the customer agrees to pay up to Rs. 30,000 or actual repair costs.",
    "6. Late Return Penalty: Rs. 200 per hour. Delays exceeding 6 hours will be charged as a full day rental.",
    "7. Smoking and drinking alcohol inside the vehicle is strictly prohibited."
  ];
  
  let currentY = finalY + 7;
  terms.forEach(term => {
    doc.text(term, 14, currentY);
    currentY += 5;
  });

  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(200);
  doc.line(14, pageHeight - 40, 70, pageHeight - 40);
  doc.line(140, pageHeight - 40, 196, pageHeight - 40);
  
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text('Customer Signature', 14, pageHeight - 35);
  doc.text('Authorized Signatory', 140, pageHeight - 35);
  doc.text('Magnum Self Drive Cars', 140, pageHeight - 30);

  if (booking.signature_url) {
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('(Signed Digitally)', 14, pageHeight - 30);
  }

  doc.save(`Invoice_${booking.customer_name.replace(/\s+/g, '_')}_${booking.id.slice(0,6)}.pdf`);
};
