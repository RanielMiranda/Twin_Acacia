import React from "react";
import { Card } from "@/components/ui/card";
import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmation({ data, onBack }) {
  // Mock data for display if none provided
  const info = data || {
    guestName: "John Doe",
    address: "123 Maple Street, Manila",
    location: "Resort Main Branch",
    checkInDate: "Oct 24, 2024",
    checkOutDate: "Oct 26, 2024",
    checkedInBy: "Admin Sarah",
    area: "Garden View",
    pax: "4 Adults, 2 Kids",
    rooms: "2 Deluxe Rooms",
    rates: "15,000",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    agent: "Direct Booking",
    services: [
      { name: "Extra Bed", price: "500" },
      { name: "Late Checkout", price: "1,000" },
      { name: "Breakfast Buffet", price: "2,400" },
      { name: "Pool Access (Night)", price: "800" }
    ],
    totalDue: "19,700",
    downpayment: "5,000",
    channel: "GCash",
    additionalTotal: "4,700"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-center no-print">
        <Button variant="ghost" onClick={onBack}>← Back to Manager</Button>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
             <Printer size={16} /> Print
           </Button>
        </div>
      </div>

      <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-none md:rounded-3xl border-t-8 border-t-blue-600">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Booking Confirmation</h1>
          <p className="text-slate-500 font-medium">Official Reservation Voucher</p>
        </div>

        {/* Section 1: Details */}
        <div className="mb-10">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 border-b pb-2">Section 1: Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Column 1 */}
            <div className="space-y-3">
              <DetailRow label="Guest Name" value={info.guestName} />
              <DetailRow label="Address" value={info.address} />
              <DetailRow label="Location" value={info.location} />
              <DetailRow label="Check-In Date" value={info.checkInDate} />
              <DetailRow label="Check-Out Date" value={info.checkOutDate} />
              <DetailRow label="Checked In By" value={info.checkedInBy} />
            </div>
            {/* Column 2 */}
            <div className="space-y-3">
              <DetailRow label="Area" value={info.area} />
              <DetailRow label="# of Pax" value={info.pax} />
              <DetailRow label="# of Room" value={info.rooms} />
              <DetailRow label="Rates (PHP)" value={info.rates} />
              <DetailRow label="Check-In Time" value={info.checkInTime} />
              <DetailRow label="Check-Out Time" value={info.checkOutTime} />
              <DetailRow label="Agent" value={info.agent} />
            </div>
          </div>
        </div>

        {/* Section 2: Additional Services */}
        <div className="mb-10">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 border-b pb-2">Section 2: Additional Services</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
            {info.services.map((service, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-50 pb-1">
                <span className="text-slate-500">{service.name}</span>
                <span className="font-bold text-slate-700">₱{service.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Breakdown */}
        <div className="bg-slate-50 p-6 rounded-2xl mb-12">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Section 3: Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Amount Due</p>
              <p className="text-3xl font-black text-slate-900">PHP {info.totalDue}</p>
            </div>
            <div className="space-y-2 text-sm border-l border-slate-200 pl-8">
              <div className="flex justify-between">
                <span className="text-slate-500">Downpayment:</span>
                <span className="font-bold text-emerald-600">PHP {info.downpayment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium italic">Channel:</span>
                <span className="text-slate-700">{info.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Additional Services:</span>
                <span className="text-slate-700">PHP {info.additionalTotal}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold text-slate-900">Final Total:</span>
                <span className="font-black text-blue-600 text-lg">PHP {info.totalDue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-20 flex justify-between items-end px-4">
          <div className="text-center">
            <div className="w-48 border-b-2 border-slate-900 font-bold text-slate-900 pb-1">Juan Dela Cruz</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Resort Admin</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b-2 border-slate-900 font-bold text-slate-900 pb-1">_________________</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Client</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1">
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className="text-slate-900 font-bold">{value}</span>
    </div>
  );
}