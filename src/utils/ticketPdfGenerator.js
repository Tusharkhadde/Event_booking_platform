// src/utils/ticketPdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateTicketPDF = async (ticket) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 100] // Custom ticket size
  });

  // Colors
  const primaryColor = [99, 102, 241]; // Indigo
  const textColor = [31, 41, 55];
  const lightGray = [156, 163, 175];

  // Header background
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 30, 'F');

  // Event Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(ticket.events?.title || 'Event Ticket', 15, 15);

  // Ticket type badge
  pdf.setFontSize(10);
  pdf.text(ticket.ticket_type?.toUpperCase() || 'GENERAL', 15, 23);

  // QR Code
  if (ticket.qr_code) {
    pdf.addImage(ticket.qr_code, 'PNG', 150, 35, 45, 45);
  }

  // Ticket details
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ticket Code:', 15, 45);
  pdf.setFont('helvetica', 'normal');
  pdf.text(ticket.ticket_code, 55, 45);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Date:', 15, 55);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    new Date(ticket.events?.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    35, 55
  );

  pdf.setFont('helvetica', 'bold');
  pdf.text('Time:', 15, 65);
  pdf.setFont('helvetica', 'normal');
  pdf.text(ticket.events?.time || 'TBA', 35, 65);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Location:', 15, 75);
  pdf.setFont('helvetica', 'normal');
  const location = ticket.events?.location || 'TBA';
  pdf.text(location.substring(0, 50), 40, 75);

  if (ticket.seat_number) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Seat:', 15, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticket.seat_number, 35, 85);
  }

  // Footer
  pdf.setTextColor(...lightGray);
  pdf.setFontSize(8);
  pdf.text('Present this ticket at the entrance. Screenshot or print accepted.', 15, 95);

  // Save
  pdf.save(`ticket-${ticket.ticket_code}.pdf`);
};

// Generate ticket as image for sharing
export const generateTicketImage = async (ticketElement) => {
  const canvas = await html2canvas(ticketElement, {
    scale: 2,
    backgroundColor: '#ffffff'
  });
  
  return canvas.toDataURL('image/png');
};

export default {
  generateTicketPDF,
  generateTicketImage
};