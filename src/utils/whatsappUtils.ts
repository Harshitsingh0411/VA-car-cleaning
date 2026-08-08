import { dbBooking } from "../services/dbService";

export function getBookingWhatsAppSupportUrl(
  booking?: Partial<dbBooking> | null,
  phone = "919569949626"
): string {
  const cleanPhone = (phone || "919569949626").replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || "919569949626";

  if (!booking) {
    const defaultText = "Hello VA Car & Bike Care Support, I need help with my car detailing service.";
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(defaultText)}`;
  }

  const id = booking.id ? `#${booking.id}` : "N/A";
  const service = booking.serviceName || (booking as any).service || "N/A";
  const vehicle = booking.vehicleDetails || (booking as any).vehicle || "N/A";
  const date = booking.scheduledDate || (booking as any).date || "N/A";
  const time = booking.timeSlot || (booking as any).time || "Standard Slot";
  const status = booking.bookingStatus || (booking as any).status || "N/A";
  const price = booking.price ? `₹${booking.price}` : "N/A";
  const customerName = booking.customerName || (booking as any).name || "Valued Customer";
  const customerPhone = booking.customerPhone || (booking as any).phone || "N/A";

  const message = `Hello VA Car & Bike Care Support,

I need assistance regarding my booking details:

- Booking ID: ${id}
- Service: ${service}
- Vehicle: ${vehicle}
- Date & Slot: ${date} (${time})
- Status: ${status}
- Price: ${price}
- Customer Name: ${customerName}
- Contact Phone: ${customerPhone}

Please help me with this booking. Thank you!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
