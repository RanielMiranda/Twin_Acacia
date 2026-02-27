import { Edit3, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResortCard({ onEdit, onPreview }) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-md bg-white">
      <div className="h-56 relative overflow-hidden">
        <img
          src="https://cibirdplhynnpqctcjzj.supabase.co/storage/v1/object/public/resort-images/kasbah-villa---hot-spring-resort/hero/1771915023358-gallery-1.jpg"
          className="w-full h-full object-cover"
          alt="Resort"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">
          Active Resort
        </div>
      </div>
      <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Kasbah Villa - Hot Spring Resort</h3>
          <p className="text-sm text-slate-500 mt-1">Last updated 2 days ago</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onEdit} className="rounded-xl flex items-center justify-center">
            <Edit3 size={18} className="mr-2" /> Edit
          </Button>
          <Button variant="outline" onClick={onPreview} className="rounded-xl flex items-center justify-center">
            <Eye size={18} className="mr-2" /> Preview
          </Button>
        </div>
      </div>
    </Card>
  );
}