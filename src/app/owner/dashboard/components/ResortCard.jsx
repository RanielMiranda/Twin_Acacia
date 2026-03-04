import { Edit3, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function ResortCard({ resort, onEdit, onPreview, ownerImage }) {
  const heroImage = resort?.gallery?.[0] || resort?.profileImage || "";
  const resortName = resort?.name || "No resort assigned";
  const updatedLabel = resort?.created_at
    ? `Added ${new Date(resort.created_at).toLocaleDateString()}`
    : "No recent update";

  return (
    <Card className="overflow-hidden rounded-2xl shadow-md bg-white">
      <div className="h-56 relative overflow-hidden">
        {heroImage ? (
          <img
            src={getTransformedSupabaseImageUrl(heroImage, { width: 1024, quality: 80, format: "webp" })}
            srcSet={getSupabaseSrcSet(heroImage)}
            sizes="(max-width: 768px) 100vw, 66vw"
            className="w-full h-full object-cover rounded-md"
            alt={resortName}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-semibold">
            No resort image
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">
          Active Resort
        </div>
      </div>
      
      <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Owner Profile Mini-Image beside name */}
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm bg-slate-100">
            {ownerImage ? (
              <img
                src={getTransformedSupabaseImageUrl(ownerImage, { width: 128, quality: 80, format: "webp" })}
                srcSet={getSupabaseSrcSet(ownerImage, [64, 96, 128], 80)}
                sizes="40px"
                alt="Owner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 text-sm font-black">
                {resortName?.charAt(0) || "R"}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{resortName}</h3>
            <p className="text-sm text-slate-500 mt-1">{updatedLabel}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onEdit} className="rounded-xl flex items-center justify-center">
            <Edit3 size={18} className="mr-2" /> Edit
          </Button>
          <Button onClick={onPreview} disabled={!resort?.name} className="rounded-xl flex items-center justify-center">
            <Eye size={18} className="mr-2" /> Preview
          </Button>
        </div>
      </div>
    </Card>
  );
}
