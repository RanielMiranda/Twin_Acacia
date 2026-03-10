import { Card } from "@/components/ui/card";
import { Users, BedDouble } from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";
import { useFilters } from "@/components/useclient/ContextFilter"; 
import { getSupabaseSrcSet, getTransformedSupabaseImageUrl } from "@/lib/utils";

export default function RoomsSection({
  onOpenRoomGallery,
  unavailableRoomIds = [],
  selectedRoomIds = [],
  onToggleRoomSelection,
  className = "max-w-6xl mx-auto px-4 pb-16",
}) {
  const { resort } = useResort(); 
  const { selectedTags } = useFilters(); 

  if (!resort || !resort.rooms) return null;

  const displayedRooms = resort.rooms.filter((room) => {
    const roomUnavailable = (unavailableRoomIds || []).includes(room?.id?.toString());
    if (roomUnavailable) return false;
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tag => room.tags?.includes(tag));
  });

  return (
    <div id="rooms" className={className}>
      <div className="flex flex-col gap-6">
        {displayedRooms.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No rooms match your selected period.</p>
          </div>
        ) : (
          displayedRooms.map((room) => {
            const imageCount = Math.min(room.gallery?.length || 1, 3);

            return (
              <Card
                key={room.id}
                onClick={() => onToggleRoomSelection?.(room.id)}
                className={`rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md border-2 cursor-pointer transition-all ${
                  selectedRoomIds.includes(room.id)
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                {/* IMAGE MOSAIC */}
                <div 
                  className={`md:w-1/2 h-[260px] grid gap-1 ${
                    imageCount === 1 ? "grid-cols-1" :
                    imageCount === 2 ? "grid-cols-2" :
                    "grid-cols-2 grid-rows-2"
                  }`}
                >
                  {/* Image 1 */}
                  <div className={`overflow-hidden ${imageCount === 1 ? "rounded-xl" : "rounded-l-xl"} row-span-${imageCount === 3 ? 2 : 1}`}>
                    <img
                      src={getTransformedSupabaseImageUrl(room.gallery?.[0] || resort.gallery[0], { width: 960, quality: 80, format: "webp" })}
                      srcSet={getSupabaseSrcSet(room.gallery?.[0] || resort.gallery[0])}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRoomGallery(room.gallery, 0);
                      }}
                      className="object-cover w-full h-full cursor-pointer"
                    />
                  </div>

                  {/* Image 2 */}
                  {imageCount >= 2 && (
                    <div className={`overflow-hidden ${imageCount === 2 ? "rounded-r-xl" : "rounded-tr-xl"}`}>
                      <img
                        src={getTransformedSupabaseImageUrl(room.gallery[1], { width: 640, quality: 80, format: "webp" })}
                        srcSet={getSupabaseSrcSet(room.gallery[1], [320, 480, 640], 80)}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRoomGallery(room.gallery, 1);
                        }}
                        className="object-cover w-full h-full cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Image 3 */}
                  {imageCount === 3 && (
                    <div className="overflow-hidden relative rounded-br-xl">
                      <img
                        src={getTransformedSupabaseImageUrl(room.gallery[2], { width: 640, quality: 80, format: "webp" })}
                        srcSet={getSupabaseSrcSet(room.gallery[2], [320, 480, 640], 80)}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRoomGallery(room.gallery, 2);
                        }}
                        className="object-cover w-full h-full cursor-pointer"
                      />
                      {room.gallery.length > 3 && (
                        <div
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRoomGallery(room.gallery, 2);
                          }}
                        >
                          +{room.gallery.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="md:w-1/2 p-6 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{room.name}</h3>
                      {selectedRoomIds.includes(room.id) ? (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-1">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2 text-sm mb-4">
                      <span className="flex items-center gap-2 bg-blue-100/50 text-blue-700 px-3 py-1 rounded-2xl font-medium">
                        <Users size={16} /> {room.guests} Guests
                      </span>
                      <span className="flex items-center gap-2 bg-blue-100/50 text-blue-700 px-3 py-1 rounded-2xl font-medium">
                        <BedDouble size={16} /> {room.beds} Beds
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {room.details && (
                      <p className="text-gray-500 text-sm mt-4 leading-relaxed">{room.details}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
