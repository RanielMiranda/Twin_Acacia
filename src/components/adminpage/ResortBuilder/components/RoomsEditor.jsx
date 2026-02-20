import { 
  Plus, Trash2, Image, 
  CheckCircle, Users, BedDouble, 
  X, Edit3, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function RoomsEditor() {
  const { resort, updateResort, safeSrc } = useResort();
  const [localRooms, setLocalRooms] = useState(resort.rooms || []);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const roomsEndRef = useRef(null);

  // Sync local state if resort.rooms changes externally
  useEffect(() => setLocalRooms(resort.rooms || []), [resort.rooms]);

  const scrollToCenter = () => {
    // Use the ref that actually points to the new element or the end of the list
    roomsEndRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "center" // This replaces all that manual math!
    });
  };

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: "New Room",
      guests: 2,
      beds: "1 Queen Bed",
      price: 0,
      details: "",
      gallery: [],
      tags: []
    };
    setLocalRooms([...localRooms, newRoom]);
    setEditingRoomId(newRoom.id);
    setTimeout(scrollToCenter, 100);
  };

  const updateRoomLocal = (id, updates) => {
    setLocalRooms(localRooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const commitRoomUpdate = (id) => {
    const room = localRooms.find(r => r.id === id);
    if (room) {
      updateResort("rooms", localRooms);
    }
  };

  const removeRoom = (id, name) => {
    if (window.confirm(`Remove ${name}?`)) {
      const updated = localRooms.filter(r => r.id !== id);
      setLocalRooms(updated);
      updateResort("rooms", updated);
    }
  };

  const addRoomImage = (roomId) => {
    const room = localRooms.find(r => r.id === roomId);
    const url = prompt("Room Image URL:");
    if (!url || !room) return;
    updateRoomLocal(roomId, { gallery: [...room.gallery, url] });
    commitRoomUpdate(roomId);
  };

  const removeRoomImage = (roomId, index) => {
    const room = localRooms.find(r => r.id === roomId);
    if (!room) return;
    updateRoomLocal(roomId, { gallery: room.gallery.filter((_, i) => i !== index) });
    commitRoomUpdate(roomId);
  };

  return (
    <div id="rooms" className="max-w-6xl mx-auto px-4 mt-8 pb-32 ">
       <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Available Rooms</h2>
        <Button onClick={addRoom} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center">
            <Plus size={16} className="mr-2"/> Add Room
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {localRooms.map((room) => (
          <Card key={room.id} className={`rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md transition-all ${editingRoomId === room.id ? 'ring-2 ring-blue-400' : ''}`}>
            {/* IMAGE MOSAIC */}
            <div className="md:w-1/2 h-[260px] grid grid-cols-2 grid-rows-2 gap-1 relative group/mosaic">
              {safeSrc(room.gallery?.[0]) && <img src={safeSrc(room.gallery[0])} className="col-span-1 row-span-2 object-cover w-full h-full bg-slate-200 rounded-bl-xl rounded-tl-xl" />}
              {safeSrc(room.gallery?.[1]) && <img src={safeSrc(room.gallery[1])} className="object-cover w-full h-full bg-slate-100 rounded-tr-xl" />}
              <div className="relative">
                {safeSrc(room.gallery?.[2]) && <img src={safeSrc(room.gallery[2])} className="object-cover w-full h-full bg-slate-50 rounded-br-xl" />}
                {room.gallery.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                    +{room.gallery.length - 2} more
                  </div>
                )}
              </div>
            </div>

            {/* ROOM INFO */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <input 
                  className="text-xl font-semibold w-full bg-transparent border-none p-0 focus:ring-0"
                  value={room.name}
                  onChange={(e) => updateRoomLocal(room.id, { name: e.target.value })}
                  onBlur={() => commitRoomUpdate(room.id)}
                  placeholder="Room Name"
                />
                <div className="flex gap-1">
                  <button onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600">
                      {editingRoomId === room.id ? <CheckCircle size={18}/> : <Edit3 size={18}/>}
                  </button>
                  <button 
                    onClick={() => removeRoom(room.id, room.name)} 
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500"
                  >
                      <Trash2 size={18}/>
                  </button>
                </div>
                <button 
                  onClick={() => addRoomImage(room.id)}
                  className ="p-2 hover:bg-slate-100 rounded-full text-slate-400 mx-2">
                    <Camera size={18}/>
                </button>
              </div>

              <div className="flex gap-2 text-sm mb-4">
                <span className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-2xl">
                  <Users size={16} className="text-blue-700"/> 
                  <input type="number" className="bg-transparent border-none p-0 w-8 text-center focus:ring-0" value={room.guests} 
                    onChange={(e) => updateRoomLocal(room.id, { guests: e.target.value })} 
                    onBlur={() => commitRoomUpdate(room.id)}
                  />
                </span>
                <span className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-2xl w-full">
                  <BedDouble size={16} className="text-blue-700 shrink-0"/> 
                  <input className="bg-transparent border-none p-0 w-full focus:ring-0" value={room.beds} 
                    onChange={(e) => updateRoomLocal(room.id, { beds: e.target.value })} 
                    onBlur={() => commitRoomUpdate(room.id)}
                  />
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {room.tags?.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1 group/tag">
                    {tag} <X size={10} className="cursor-pointer hover:text-red-500 opacity-0 group-hover/tag:opacity-100" 
                      onClick={() => { updateRoomLocal(room.id, { tags: room.tags.filter((_, ti) => ti !== i) }); commitRoomUpdate(room.id); }}
                    />
                  </span>
                ))}
                {editingRoomId === room.id && (
                   <button onClick={() => { const t = prompt("Tag:"); if(t) { updateRoomLocal(room.id, { tags: [...room.tags, t] }); commitRoomUpdate(room.id); } }} 
                     className="text-xs bg-gray-100 px-3 py-1 rounded-full text-blue-600 hover:bg-blue-50">
                      + Tag
                   </button>
                )}
              </div>

              <textarea 
                className="text-gray-500 text-sm mt-2 w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
                value={room.details}
                onChange={(e) => updateRoomLocal(room.id, { details: e.target.value })}
                onBlur={() => commitRoomUpdate(room.id)}
                placeholder="Room details..."
                rows={2}
              />

              {/* Expanded gallery */}
              {editingRoomId === room.id && (
                <div className="mt-4 pt-4 border-t border-dashed animate-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gallery Management</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {room.gallery.map((img, i) => (
                      <div key={i} className="relative w-16 h-12 shrink-0 rounded overflow-hidden group/thumb">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeRoomImage(room.id, i)} 
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addRoomImage(room.id)} className="w-16 h-12 shrink-0 border border-dashed rounded flex items-center justify-center text-slate-400 hover:text-blue-500">
                        <Plus size={16}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
        <div ref={roomsEndRef} />
      </div>
    </div>
  );
};
