import React from "react";
import { Card } from "@/components/ui/card";
import { Printer, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmation({ data, resortName, onBack }) {
  // Check if it's a confirmed booking or just an inquiry
  const isConfirmed = data?.status === "Confirmed";

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-[10vh]">
      <div className="flex justify-between items-center no-print">
        <Button variant="ghost" onClick={onBack}>← Back to List</Button>
        
        <div className="flex gap-3 items-center">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
            isConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {isConfirmed ? <CheckCircle size={14}/> : <Clock size={14}/>}
            {data?.status || "Pending Inquiry"}
          </div>
          
          <Button onClick={() => window.print()} className="bg-blue-600 flex items-center justify-center">
            <Printer size={16} className="mr-2 " /> Print Form
          </Button>
        </div>
      </div>

      <Card className="p-10 bg-white shadow-xl rounded-none relative overflow-hidden">

        <div className="text-center mb-12">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-1">{resortName}</h2>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Confirmation Booking Form</h1>
        </div>

        {/* Section 1: Details */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 border-b pb-1">Section 1: Details</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
             <DetailRow label="Guest Name" value={data?.guestName || "________________"} />
             <DetailRow label="Area" value={data?.area || ""} />
             <DetailRow label="Address" value={data?.address || ""} />
             <DetailRow label="# of Pax" value={data?.pax || ""} />
             <DetailRow label="Location" value={data?.location} />
             <DetailRow label="Rates (PHP)" value={data?.rates?.toLocaleString()} />
             <DetailRow label="Check-In" value={data?.checkInDate} />
             <DetailRow label="Check-In Time" value={data?.checkInTime} />
             <DetailRow label="Check-Out" value={data?.checkOutDate} />
             <DetailRow label="Check-Out Time" value={data?.checkOutTime} />
             <DetailRow label="Agent" value={data?.agent || ""} />
          </div>
        </div>

        {/* Section 2: Additional Services */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 border-b pb-1">Section 2: Additional Services</h3>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2">
            {data?.resortServices?.map((s, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-dotted pb-1">
                <span className="text-slate-500">{s.name}</span>
                <span className="font-bold">₱{s.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Breakdown */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 items-center">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Amount Due</p>
                <p className="text-3xl font-black text-slate-900">₱{data?.totalAmount || data?.rates}</p>
             </div>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Downpayment:</span>
                  <span className="font-bold">₱{data?.downpayment || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="font-bold uppercase text-[10px]">{data?.paymentMethod || "Pending"}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-black text-lg">
                  <span>Total Due:</span>
                  <span>₱{data?.totalAmount || data?.rates}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-20 flex justify-between">
           <div className="text-center">
              <p className="font-bold border-b border-slate-900 px-8">Management</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Resort Admin</p>
           </div>
           <div className="text-center">
              <p className="font-bold border-b border-slate-900 px-8">{data?.guestName || "________________"}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Client</p>
           </div>
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm gap-4"> {/* added gap to prevent overlap */}
      <span className="text-slate-500 font-medium whitespace-nowrap">{label}:</span>
      <span className="text-slate-900 font-bold text-right">{value}</span>
    </div>
  );
}