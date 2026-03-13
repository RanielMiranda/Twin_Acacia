import React from "react";
import { Briefcase } from "lucide-react";
import { SectionLabel } from "../BookingEditorAtoms";

export default function AssignRoomsCardSection({
  resortRooms,
  assignedRoomIds,
  toggleAssignedRoom,
  isRoomConflicting,
  isEditing = false,
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <SectionLabel icon={<Briefcase size={14} />} label="Assign Rooms" />
      <p className="text-xs text-slate-500">Assign rooms based on the discussions.</p>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {(resortRooms || []).map((room) => {
          const roomId = room.id;
          const selected = assignedRoomIds.includes(roomId);
          const conflict = isRoomConflicting(roomId);
          return (
            <label
              key={roomId}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 cursor-pointer ${
                selected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={selected} onChange={() => toggleAssignedRoom(roomId)} disabled={!isEditing} />
                <div>
                  <p className="text-sm font-bold text-slate-800">{room.name || `Room ${roomId}`}</p>
                  <p className="text-[11px] text-slate-500">Sleeps {Number(room.guests || 0)} pax</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                conflict ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {conflict ? "Conflict" : "Available"}
              </span>
            </label>
          );
        })}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-black uppercase text-slate-500">Assigned</p>
        <p className="text-xs text-slate-700 mt-1">
          {assignedRoomIds.length > 0
            ? (resortRooms || []).filter((room) => assignedRoomIds.includes(room.id)).map((room) => room.name).join(", ")
            : "No room assigned yet."}
        </p>
        {!isEditing ? <p className="mt-2 text-[11px] text-slate-500">Click Edit, then Save Changes to update assigned rooms.</p> : null}
      </div>
    </div>
  );
}
