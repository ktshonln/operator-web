import { http, HttpResponse } from "msw";
import { baseUrl } from "../../services/apiClient";

let tickets = [
          {
          ticketId: "tkt_91381",
          tripId: "trip_4021",
          passenger: {
            passengerId: "p_87231",
            firstName: "Jane",
            lastName: "Doe",
          },
          ticketQuantity: 1,
          seatNumber: 7,
          origin: "Kigali",
          destination: "Huye",
          departureTime: "2025-04-10T08:30:00+02:00",
          arrivalTime: "2025-04-10T10:30:00+02:00",
          busId: "bus_001",
          companyId: 'comp_001',
          company: { id: "comp 001", name: "Volcano Express" },
          pricing: { basePrice: 3800, vatIncluded: 540, serviceFee: 65, totalCharged: 3065 },
          status: "PAID",
          purchaseTime: "2025-04-16T10:35:00+02:00",
          invoice: { invoiceNumber: "EBM-INV-129383", ebmStatus: "SUCCESS", timestamp: "2025-04-16T10:35:02+02:00" },
          printableTicketUrl: "https://katisha-online.com/print/tkt_91382",
          reminder: "Please arrive at the station at least 15 minutes before departure",
          IssuedBy: "Katisha Online",
        },
          {
          ticketId: "tkt_91382",
          tripId: "trip_4021",
          passenger: { passengerId: "p_87231", firstName: "Jane", lastName: "Doe" },
          ticketQuantity: 1,
          seatNumber: 7,
          origin: "Kigali",
          destination: "Huye",
          departureTime: "2025-04-10T08:30:00+02:00",
          arrivalTime: "2025-04-10T10:30:00+02:00",
          busId: "bus_001",
          companyId: 'comp_001',
          company: { id: "comp 001", name: "Volcano Express" },
          pricing: { basePrice: 3800, vatIncluded: 540, serviceFee: 65, totalCharged: 3065 },
          status: "PAID",
          purchaseTime: "2025-04-16T10:35:00+02:00",
          invoice: { invoiceNumber: "EBM-INV-129383", ebmStatus: "SUCCESS", timestamp: "2025-04-16T10:35:02+02:00" },
          printableTicketUrl: "https://katisha-online.com/print/tkt_91382",
          reminder: "Please arrive at the station at least 15 minutes before departure",
          IssuedBy: "Katisha Online",
        },
          {
          ticketId: "tkt_91383",
          tripId: "trip_4021",
          passenger: { passengerId: "p_87231", firstName: "Jane", lastName: "Doe" },
          ticketQuantity: 1,
          seatNumber: 7,
          origin: "Kigali",
          destination: "Huye",
          departureTime: "2025-04-10T08:30:00+02:00",
          arrivalTime: "2025-04-10T10:30:00+02:00",
          busId: "bus_001",
          companyId: 'comp_001',
          company: { id: "comp 001", name: "Volcano Express" },
          pricing: { basePrice: 3800, vatIncluded: 540, serviceFee: 65, totalCharged: 3065 },
          status: "PAID",
          purchaseTime: "2025-04-16T10:35:00+02:00",
          invoice: { invoiceNumber: "EBM-INV-129383", ebmStatus: "SUCCESS", timestamp: "2025-04-16T10:35:02+02:00" },
          printableTicketUrl: "https://katisha-online.com/print/tkt_91382",
          reminder: "Please arrive at the station at least 15 minutes before departure",
          IssuedBy: "Katisha Online",
        },
        ]

// ─── Print receipt HTML builder ───────────────────────────────────────────────

function buildReceiptHtml(ticketId: string, size: string): string {
  const is58 = size === "58mm";
  const is80 = size === "80mm";
  const isA4 = size === "a4";

  const bodyWidth   = is58 ? "58mm" : is80 ? "80mm" : "210mm";
  const qrSize      = is58 ? "30mm" : is80 ? "40mm" : "50mm";
  const pageSize    = is58 ? "58mm auto" : is80 ? "80mm auto" : "a4";
  const pageMargin  = isA4 ? "0" : "0";
  const wrapperStyle = isA4
    ? "max-width:80mm;margin:20mm auto;"
    : "";

  // Minimal inline QR placeholder (real server would embed base64 qrcode image)
  const qrPlaceholder = `<svg width="${qrSize}" height="${qrSize}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
    <rect width="100" height="100" fill="white"/>
    <rect x="10" y="10" width="30" height="30" fill="black"/>
    <rect x="15" y="15" width="20" height="20" fill="white"/>
    <rect x="20" y="20" width="10" height="10" fill="black"/>
    <rect x="60" y="10" width="30" height="30" fill="black"/>
    <rect x="65" y="15" width="20" height="20" fill="white"/>
    <rect x="70" y="20" width="10" height="10" fill="black"/>
    <rect x="10" y="60" width="30" height="30" fill="black"/>
    <rect x="15" y="65" width="20" height="20" fill="white"/>
    <rect x="20" y="70" width="10" height="10" fill="black"/>
    <rect x="45" y="10" width="10" height="10" fill="black"/>
    <rect x="45" y="25" width="10" height="10" fill="black"/>
    <rect x="10" y="45" width="10" height="10" fill="black"/>
    <rect x="25" y="45" width="10" height="10" fill="black"/>
    <rect x="45" y="45" width="10" height="10" fill="black"/>
    <rect x="60" y="45" width="10" height="10" fill="black"/>
    <rect x="75" y="45" width="10" height="10" fill="black"/>
    <rect x="45" y="60" width="10" height="10" fill="black"/>
    <rect x="60" y="60" width="10" height="10" fill="black"/>
    <rect x="75" y="75" width="10" height="10" fill="black"/>
    <rect x="60" y="75" width="10" height="10" fill="black"/>
  </svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ticket - ${ticketId}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Courier New',monospace;font-size:11px;background:#fff;color:#000;width:${bodyWidth};}
.receipt-wrapper{${wrapperStyle}}
.receipt{width:100%;padding:4mm;}
.company-name{text-align:center;font-size:13px;font-weight:bold;margin-bottom:3mm;}
.divider{border-top:1px dashed #000;margin:2mm 0;}
.title{text-align:center;font-size:12px;font-weight:bold;letter-spacing:2px;margin:2mm 0;}
.row{display:flex;justify-content:space-between;margin:1mm 0;}
.label{color:#555;}
.qr-wrapper{text-align:center;margin:3mm 0;}
.ticket-id{text-align:center;font-size:9px;color:#555;margin-bottom:3mm;}
.powered-by{text-align:center;font-size:8px;color:#999;margin-top:3mm;}
@media print{body{margin:0;}@page{margin:${pageMargin};size:${pageSize};}}
</style>
</head>
<body>
<div class="receipt-wrapper"><div class="receipt">
<div class="company-name">Volcano Express</div>
<div class="divider"></div>
<div class="title">TICKET</div>
<div class="divider"></div>
<div class="row"><span class="label">Passenger</span><span>Kalisa Nkusi</span></div>
<div class="row"><span class="label">Phone</span><span>+250788***456</span></div>
<div class="divider"></div>
<div class="row"><span class="label">From</span><span>Kigali</span></div>
<div class="row"><span class="label">To</span><span>Musanze</span></div>
<div class="row"><span class="label">Date</span><span>${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
<div class="row"><span class="label">Time</span><span>08:00 AM</span></div>
<div class="divider"></div>
<div class="row"><span class="label">Seats</span><span>1</span></div>
<div class="row"><span class="label">Amount</span><span>RWF 2,000</span></div>
<div class="row"><span class="label">Method</span><span>Cash</span></div>
<div class="divider"></div>
<div class="row"><span class="label">Bus</span><span>RAA 001 A</span></div>
<div class="row"><span class="label">Driver</span><span>Jean Uwimana</span></div>
<div class="row"><span class="label">Issued by</span><span>Alice M.</span></div>
<div class="divider"></div>
<div class="qr-wrapper">${qrPlaceholder}</div>
<div class="ticket-id">${ticketId}</div>
<div class="divider"></div>
<div class="powered-by">powered by katisha online</div>
</div></div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;
}

export const handlers = [
  // ── HEAD /tickets/:id/print — preflight auth/existence check ────────────────
  http.head(`${baseUrl}/tickets/:ticketId/print`, ({ params }) => {
    const { ticketId } = params as { ticketId: string };
    // Any ticket ID that starts with "ticket-" or "tkt_" is valid in mock
    if (!ticketId || ticketId === "not-found") {
      return HttpResponse.json(
        { error: { code: "TICKET_NOT_FOUND" } },
        { status: 404 }
      );
    }
    return new HttpResponse(null, { status: 200 });
  }),

  // ── GET /tickets/:id/print — returns self-contained HTML receipt ─────────────
  http.get(`${baseUrl}/tickets/:ticketId/print`, ({ params, request }) => {
    const { ticketId } = params as { ticketId: string };
    const url = new URL(request.url);
    const size = url.searchParams.get("size") ?? "80mm";

    if (!ticketId || ticketId === "not-found") {
      return HttpResponse.json(
        { error: { code: "TICKET_NOT_FOUND" } },
        { status: 404 }
      );
    }

    const html = buildReceiptHtml(ticketId, size);
    return new HttpResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }),

  // ── GET /tickets — legacy list ───────────────────────────────────────────────
  http.get(`${baseUrl}/tickets`, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const status = url.searchParams.get("status");

    let filteredTickets = [...tickets];

    if (from) {
      filteredTickets = filteredTickets.filter(
        (t) => new Date(t.departureTime ?? t.purchaseTime) >= new Date(from)
      );
    }
    if (to) {
      filteredTickets = filteredTickets.filter(
        (t) => new Date(t.departureTime ?? t.purchaseTime) <= new Date(to)
      );
    }
    if (status) {
      filteredTickets = filteredTickets.filter(
        (t) => t.status.toLowerCase() === status.toLowerCase()
      );
    }

    return HttpResponse.json(
      {
        query: { tripId: "trip_4021" },
        tickets: filteredTickets,
        total: filteredTickets.length,
      },
      { status: 200 }
    );
  }),

  // ── GET /tickets/:ticketId — legacy single ───────────────────────────────────
  http.get(`${baseUrl}/tickets/:ticketId`, ({ params }) => {
    if (params.ticketId)
      return HttpResponse.json(
        tickets.filter((ticket) => ticket.ticketId === params.ticketId)[0],
        { status: 200 }
      );
  }),

  // ── POST /tickets — legacy create ────────────────────────────────────────────
  http.post(`${baseUrl}/tickets`, async ({ request }) => {
    const payload = await request.json() as any;
    return HttpResponse.json({
      id: "tkt_" + Math.floor(Math.random() * 100000),
      status: "confirmed",
      passenger_name: payload.passenger_name || "Jane Doe",
      phone: payload.phone || "+250780000000",
      seats_count: payload.seats_count || 1,
      amount: payload.seats_count ? payload.seats_count * 2500 : 2500,
      currency: "RWF",
      payment_method: payload.payment_method || "cash",
      boarding_stop: { id: payload.boarding_stop_id || "stop1", name: "Boarding Stop" },
      alighting_stop: { id: payload.alighting_stop_id || "stop2", name: "Alighting Stop" }
    }, { status: 201 });
  }),
];
