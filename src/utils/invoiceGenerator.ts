import { dbBooking } from "../services/dbService";

export interface InvoiceOptions {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGst?: string;
}

const DEFAULT_COMPANY: Required<InvoiceOptions> = {
  companyName: "VA Car & Bike Care",
  companyAddress: "Kanpur, Uttar Pradesh",
  companyPhone: "(+91 95699 49626), (+91 92501 64163)",
  companyEmail: "vacarcleanservice3@gmail.com",
  companyGst: "N/A",
};

export function formatInvoiceId(bookingId: string | undefined): string {
  if (!bookingId) return "INV- KQ1WL0FU";
  const cleanId = bookingId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `INV- ${cleanId.slice(0, 8)}`;
}

export function generateInvoiceHTML(booking: Partial<dbBooking> | any, options?: InvoiceOptions): string {
  const company = { ...DEFAULT_COMPANY, ...options };
  const invId = formatInvoiceId(booking.id);

  let rawPrice = booking.price;
  if (typeof rawPrice === "string") {
    rawPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0;
  }
  const price = typeof rawPrice === "number" && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 100;
  const discount = typeof booking.discount === "number" ? booking.discount : 0;

  const finalTotal = Math.max(0, price - discount);
  const netBeforeTax = Math.round(finalTotal / 1.18);
  const totalTax = finalTotal - netBeforeTax;
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;

  const isPaid = (booking.paymentStatus || "").toLowerCase() === "paid";
  const statusLabel = isPaid ? "PAID IN FULL" : "PAYMENT AT DOORSTEP";
  const statusBg = isPaid ? "#DCFCE7" : "#FEF3C7";
  const statusColor = isPaid ? "#15803D" : "#D97706";
  const statusBorder = isPaid ? "#86EFAC" : "#FDE047";
  const statusIcon = isPaid ? "✓" : "💳";

  const customerName = booking.customerName || booking.name || "Divyanshu Kashyap";
  const customerPhone = booking.customerPhone || booking.phone || "+91 80053 43226";
  const customerAddress = booking.address || "Cafe 2004, NH19;NH27, Sachendi, Kanpur Nagar, Uttar Pradesh, 209305, India";
  const vehicleDetails = booking.vehicleDetails || booking.vehicle || "Tata Tarzan (Up-78-BL5252)";
  const scheduledDate = booking.scheduledDate || booking.date || "2026-08-06";
  const timeSlot = booking.timeSlot || booking.time || "Morning (8:00 AM - 12:00 PM)";
  const serviceName = booking.serviceName || booking.service || "Bike Full Wash";

  // Real Crew Data Extraction
  const hasCrew = Boolean(booking.assignedEmployeeName || booking.assignedEmployee || booking.crewName || booking.employeeName);
  const crewName = hasCrew 
    ? (booking.assignedEmployeeName || booking.assignedEmployee || booking.crewName || booking.employeeName) 
    : "Unassigned (Pending Squad Assignment)";
  
  const rawCrewPhone = booking.assignedEmployeePhone || booking.crewPhone || booking.employeePhone;
  const crewPhone = rawCrewPhone 
    ? rawCrewPhone 
    : (hasCrew ? "+91 95699 49626 (Support Helpline)" : "Pending Assignment");

  let crewEta = "Pending Assignment";
  if (booking.crewArrivingDate || booking.crewArrivingTime) {
    crewEta = `${booking.crewArrivingDate || ""} ${booking.crewArrivingTime || ""}`.trim();
  } else if (hasCrew) {
    crewEta = `Assigned for ${booking.scheduledDate || booking.date || "Slot"} (${booking.timeSlot || booking.time || "Scheduled"})`;
  } else if ((booking.bookingStatus || "").toLowerCase() === "completed") {
    crewEta = "Service Completed";
  } else {
    crewEta = `Scheduled: ${booking.scheduledDate || booking.date || "Slot"}`;
  }
  // Real Timestamps Extraction
  const formatTimestamp = (ts?: string) => {
    if (!ts) return "";
    try {
      if (ts.includes("T") || ts.includes("-")) {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
      }
      return ts;
    } catch {
      return ts;
    }
  };

  const bookingTime = formatTimestamp(booking.createdAt || booking.bookingTime) || `${scheduledDate} (${timeSlot})`;
  const completionTime = formatTimestamp(booking.completedAt) || ((booking.bookingStatus || "").toLowerCase() === "completed" ? "Completed" : "In Progress");

  const isBike = /bike|motorcycle|scooter|two\s*wheeler|bullet|activa|pulsar|splendor|royal\s*enfield|ktm|scooty|vespa|2\s*wheeler/i.test(`${serviceName} ${vehicleDetails}`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice #${invId} - ${company.companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: #0B132B;
      padding: 30px 15px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-card {
      max-width: 850px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .top-action-bar {
      max-width: 850px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
    }

    .btn-download {
      background: #0047FF;
      color: #FFFFFF;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
      box-shadow: 0 4px 12px rgba(0, 71, 255, 0.3);
    }
    .btn-download:hover { background: #0036CC; }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .brand-logo-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-svg {
      width: 60px;
      height: 60px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      margin-top: 2px;
    }

    .inv-meta-group {
      text-align: right;
    }

    .inv-title {
      font-size: 28px;
      font-weight: 900;
      color: #0047FF;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1;
    }

    .inv-number {
      font-size: 13px;
      font-weight: 800;
      color: #475569;
      margin-top: 6px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: ${statusBg};
      color: ${statusColor};
      border: 1.5px solid ${statusBorder};
    }

    /* Accent Line */
    .divider-line {
      height: 2px;
      background: linear-gradient(90deg, #0047FF 0%, #60A5FA 100%);
      border-radius: 2px;
      margin-bottom: 28px;
      opacity: 0.8;
    }

    /* 2 Column Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }

    .info-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
    }

    .info-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .icon-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0047FF;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .info-card-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0047FF;
      letter-spacing: 0.5px;
    }

    .info-card-title {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 12px;
      color: #334155;
      font-weight: 600;
      line-height: 1.5;
    }

    .info-icon {
      color: #0047FF;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Service Table */
    .table-container {
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 28px;
    }

    .table-header {
      background: #040D21;
      color: #FFFFFF;
      display: grid;
      grid-template-columns: 2.2fr 1.5fr 0.5fr 0.8fr;
      padding: 14px 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-header .text-right { text-align: right; }
    .table-header .text-center { text-align: center; }

    .table-row {
      display: grid;
      grid-template-columns: 2.2fr 1.5fr 0.5fr 0.8fr;
      padding: 20px;
      align-items: center;
      background: #FFFFFF;
    }

    .service-desc-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .service-thumb {
      width: 70px;
      height: 70px;
      border-radius: 14px;
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .service-title {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
    }

    .service-subtitle {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      margin-top: 4px;
    }

    .date-box {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }

    .date-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .time-sub {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .qty-text {
      text-align: center;
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
    }

    .price-text {
      text-align: right;
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }

    /* Totals Box */
    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }

    .totals-box {
      width: 360px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }

    .totals-row.total {
      border-top: 1.5px solid #E2E8F0;
      margin-top: 8px;
      padding-top: 14px;
      font-size: 18px;
      font-weight: 900;
      color: #0047FF;
    }

    /* Footer verification section */
    .footer-verification {
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 24px;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      align-items: center;
      margin-bottom: 28px;
    }

    .footer-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .shield-blue-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #0047FF;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .footer-thankyou {
      font-size: 15px;
      font-weight: 800;
      color: #0047FF;
      margin-bottom: 4px;
    }

    .footer-text {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      line-height: 1.5;
    }

    .verified-badge-box {
      border: 2px dashed #22C55E;
      background: #F0FDF4;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .verified-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #22C55E;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .verified-title {
      font-size: 14px;
      font-weight: 900;
      color: #15803D;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .verified-sub {
      font-size: 10px;
      color: #166534;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Dark Bottom Strip */
    .dark-bottom-bar {
      background: #040D21;
      border-radius: 16px;
      padding: 24px 20px;
      color: #FFFFFF;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 16px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0, 71, 255, 0.2);
      border: 1px solid rgba(0, 71, 255, 0.4);
      color: #60A5FA;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .feature-title {
      font-size: 11px;
      font-weight: 900;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .feature-desc {
      font-size: 9px;
      color: #94A3B8;
      font-weight: 500;
      margin-top: 2px;
      line-height: 1.3;
    }

    .bottom-copyright {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
    }

    @media print {
      body { background: none; padding: 0; }
      .invoice-card { border: none; box-shadow: none; border-radius: 0; padding: 0; }
      .top-action-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="top-action-bar">
    <button class="btn-download" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download / Save as PDF
    </button>
  </div>

  <div class="invoice-card">
    
    <!-- BRAND HEADER -->
    <div class="header">
      <div class="brand-logo-group">
        <!-- VA Logo Image -->
        <img src="/icon.svg" alt="VA Car & Bike Care Logo" style="height: 65px; width: auto; object-fit: contain;" />
        <div>
          <div class="brand-title">${company.companyName}</div>
          <div class="brand-subtitle">Premium Doorstep Car & Bike Detailing</div>
        </div>
      </div>

      <div class="inv-meta-group">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-number">${invId}</div>
        <div class="status-badge">
          ${statusIcon} ${statusLabel}
        </div>
      </div>
    </div>

    <div class="divider-line"></div>

    <!-- 3 COLUMN SERVICE PROVIDER & BILLED TO & CREW GRID -->
    <div class="info-grid" style="grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));">
      <!-- Left Card: SERVICE PROVIDER -->
      <div class="info-card">
        <div class="info-card-header">
          <div class="icon-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div class="info-card-label">SERVICE PROVIDER</div>
            <div class="info-card-title">${company.companyName}</div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span>${company.companyAddress}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📞</span>
            <span>${company.companyPhone}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">✉️</span>
            <span>${company.companyEmail}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📄</span>
            <span>GSTIN: ${company.companyGst || "N/A"}</span>
          </div>
        </div>
      </div>

      <!-- Center Card: BILLED TO (CUSTOMER) -->
      <div class="info-card">
        <div class="info-card-header">
          <div class="icon-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="info-card-label">BILLED TO (CUSTOMER)</div>
            <div class="info-card-title">${customerName}</div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-icon">📞</span>
            <span>${customerPhone}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span>${customerAddress}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🚘</span>
            <span><strong>Vehicle:</strong> ${vehicleDetails}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🕒</span>
            <span><strong>Slot:</strong> ${scheduledDate} (${timeSlot})</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📝</span>
            <span><strong>Booking Time:</strong> ${bookingTime}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🏁</span>
            <span><strong>Completion Time:</strong> ${completionTime}</span>
          </div>
        </div>
      </div>

      <!-- Right Card: ASSIGNED DETAILING CREW -->
      <div class="info-card" style="background: ${hasCrew ? "#F0FDF4" : "#FFFBEB"}; border-color: ${hasCrew ? "#BBF7D0" : "#FDE68A"};">
        <div class="info-card-header">
          <div class="icon-circle" style="background: ${hasCrew ? "#16A34A" : "#D97706"};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <div class="info-card-label" style="color: ${hasCrew ? "#15803D" : "#B45309"};">${hasCrew ? "ASSIGNED CREW" : "CREW ASSIGNMENT"}</div>
            <div class="info-card-title" style="color: ${hasCrew ? "#14532D" : "#78350F"};">${crewName}</div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item" style="color: ${hasCrew ? "#166534" : "#92400E"};">
            <span class="info-icon" style="color: ${hasCrew ? "#16A34A" : "#D97706"};">👤</span>
            <span><strong>Technician:</strong> ${crewName}</span>
          </div>
          <div class="info-item" style="color: ${hasCrew ? "#166534" : "#92400E"};">
            <span class="info-icon" style="color: ${hasCrew ? "#16A34A" : "#D97706"};">📞</span>
            <span><strong>Crew Contact:</strong> ${crewPhone}</span>
          </div>
          <div class="info-item" style="color: ${hasCrew ? "#166534" : "#92400E"};">
            <span class="info-icon" style="color: ${hasCrew ? "#16A34A" : "#D97706"};">🚚</span>
            <span><strong>Dispatch Status:</strong> ${crewEta}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <div class="table-header">
        <div>SERVICE DESCRIPTION</div>
        <div>DATE & TIME</div>
        <div class="text-center">QTY</div>
        <div class="text-right">PRICE</div>
      </div>

      <div class="table-row">
        <!-- Service desc + icon thumbnail -->
        <div class="service-desc-box">
          <div class="service-thumb">
            ${isBike ? `
            <!-- Bike Illustration SVG -->
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0047FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5.5" cy="17.5" r="3.5"/>
              <circle cx="18.5" cy="17.5" r="3.5"/>
              <path d="M15 6h2l1 4h-4"/>
              <path d="M12 17.5V14l-3-4H4"/>
              <path d="M5.5 17.5L9 10h6.5l3 7.5"/>
            </svg>
            ` : `
            <!-- Car Illustration SVG -->
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0047FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <path d="M9 17h6"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
            `}
          </div>
          <div>
            <div class="service-title">${serviceName}</div>
            <div class="service-subtitle">Doorstep detailing for ${vehicleDetails}</div>
            ${hasCrew 
              ? `<div class="service-subtitle" style="color: #059669; font-weight: 700; margin-top: 4px;">👷 Detailer: ${crewName} ${rawCrewPhone ? `(${rawCrewPhone})` : ""}</div>`
              : `<div class="service-subtitle" style="color: #D97706; font-weight: 700; margin-top: 4px;">⏳ Squad Assignment: In Progress</div>`
            }
          </div>
        </div>

        <!-- Date & Time -->
        <div class="date-box">
          <div class="date-row">
            <span>📅</span>
            <span>${scheduledDate}</span>
          </div>
          <div class="time-sub">
            <span>🕒</span>
            <span>${timeSlot}</span>
          </div>
          <div class="time-sub" style="margin-top: 6px; font-size: 10px; color: #475569;">
            <span>📝 Booked: ${bookingTime}</span>
          </div>
          <div class="time-sub" style="margin-top: 2px; font-size: 10px; color: #16A34A; font-weight: 700;">
            <span>🏁 Completed: ${completionTime}</span>
          </div>
        </div>

        <!-- Qty -->
        <div class="qty-text">1</div>

        <!-- Price -->
        <div class="price-text">₹${netBeforeTax}</div>
      </div>
    </div>

    <!-- TOTALS -->
    <div class="totals-container">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal (Excl. Tax)</span>
          <span>₹${netBeforeTax}</span>
        </div>
        ${discount > 0 ? `
        <div class="totals-row" style="color: #16A34A;">
          <span>Discount Applied</span>
          <span>- ₹${discount}</span>
        </div>` : ""}
        <div class="totals-row">
          <span>CGST (9%)</span>
          <span>₹${cgst}</span>
        </div>
        <div class="totals-row">
          <span>SGST (9%)</span>
          <span>₹${sgst}</span>
        </div>
        <div class="totals-row total">
          <span>Total Amount</span>
          <span>₹${finalTotal}</span>
        </div>
      </div>
    </div>

    <!-- FOOTER VERIFICATION SECTION -->
    <div class="footer-verification">
      <div class="footer-left">
        <div class="shield-blue-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <div class="footer-thankyou">Thank you for choosing ${company.companyName}!</div>
          <div class="footer-text">For support or inquiries, contact us at ${company.companyEmail}</div>
          <div class="footer-text" style="margin-top: 4px;">This is a computer-generated invoice. No physical signature required.</div>
        </div>
      </div>

      <div class="verified-badge-box">
        <div class="verified-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <div class="verified-title">VERIFIED INVOICE</div>
          <div class="verified-sub">This invoice is system generated and verified.</div>
        </div>
      </div>
    </div>

    <!-- DARK BOTTOM STRIP WITH 4 FEATURES -->
    <div class="dark-bottom-bar">
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">100% SAFE</div>
            <div class="feature-desc">Your vehicle is in safe hands</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">PREMIUM CARE</div>
            <div class="feature-desc">Top quality products & expert service</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">ON TIME</div>
            <div class="feature-desc">Always punctual, every time</div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 4.4-3.6 8-8 8z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">ECO FRIENDLY</div>
            <div class="feature-desc">Gentle on your car, kind to nature</div>
          </div>
        </div>
      </div>

      <div class="bottom-copyright">
        ${company.companyName} &nbsp;•&nbsp; Kanpur, Uttar Pradesh &nbsp;•&nbsp; +91 95699 49626
      </div>
    </div>

  </div>

</body>
</html>`;
}

export function downloadInvoice(booking: Partial<dbBooking> | any, options?: InvoiceOptions): void {
  const htmlContent = generateInvoiceHTML(booking, options);
  const invId = formatInvoiceId(booking.id);

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (e) {
        console.warn("Auto-print deferred or blocked by browser:", e);
      }
    }, 500);
  } else {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
