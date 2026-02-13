import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BedDouble, Flag } from "lucide-react";

export default function RoomsSection({ resort, onOpenRoomGallery }) {
  return (
    <div id="rooms" className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-2xl font-semibold mb-6">Available Rooms</h2>

      <div className="flex flex-col gap-6">
        {resort.rooms?.map((room) => (
          <Card
            key={room.id}
            className="rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md"
          >
            {/* IMAGE MOSAIC */}
            <div className="md:w-1/2 h-[260px] grid grid-cols-2 grid-rows-2 gap-1">
              <img
                src={room.gallery?.[0] || resort.gallery[0]}
                onClick={() => onOpenRoomGallery(room.gallery, 0)}
                className="col-span-1 row-span-2 object-cover w-full h-full cursor-pointer"
              />

              {room.gallery?.[1] && (
                <img
                  src={room.gallery[1]}
                  onClick={() => onOpenRoomGallery(room.gallery, 1)}
                  className="object-cover w-full h-full cursor-pointer"
                />
              )}

              {room.gallery?.[2] && (
                <div className="relative">
                  <img
                    src={room.gallery[2]}
                    onClick={() => onOpenRoomGallery(room.gallery, 2)}
                    className="object-cover w-full h-full cursor-pointer"
                  />
                  {room.gallery.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                      +{room.gallery.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{room.name}</h3>

                <div className="flex gap-2 text-sm mb-4">
                  <span className="flex items-center gap-2 bg-blue-100 px-2 py-1 rounded-2xl">
                    <Users size={16} /> {room.guests}
                  </span>
                  <span className="flex items-center gap-2 bg-blue-100 px-2 py-1 rounded-2xl">
                    <BedDouble size={16} /> {room.beds}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {room.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {room.details && (
                  <p className="text-gray-500 text-sm mt-2">
                    {room.details}
                  </p>
                )}
              </div>

              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="text-sm text-gray-500">Price per night</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₱{room.price.toLocaleString()}
                  </p>
                </div>

                <Button className="flex items-center gap-2 hover:scale-105 transition">
                  <Flag className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
