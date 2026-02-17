import React, { useState } from "react";
import ResortResults from "../homepage/resort/ResortResults";
import HeroGallery from "../resortpages/Gallery/HeroGallery";
import ShortcutBar from "../resortpages/rooms/ShortcutBar";
import ResortInfo from "../resortpages/rooms/ResortInfo";
import RoomsSection from "../resortpages/rooms/RoomsSection";

export default function ResortJsBuilder() {
  const [resort, setResort] = useState({
    name: "",
    location: "",
    price: 0,
    contactPhone: "",
    contactEmail: "",
    description: { summary: "" },
    profileImage: "",
    gallery: [],
    facilities: [],
    extraServices: [],
    rooms: [],
    tags: [],
  });

  const [newFacility, setNewFacility] = useState({ name: "", image: "" });
  const [newRoom, setNewRoom] = useState({ name: "", guests: 1, beds: "", price: 0, details: "", gallery: [], tags: [], });
  const [newRoomTag, setNewRoomTag] = useState("");
  const [newRoomGalleryItem, setNewRoomGalleryItem] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newGallery, setNewGallery] = useState("");
  const [newService, setNewService] = useState({ name: "", description: "", cost: 0 });

  const [showCardPreview, setShowCardPreview] = useState(true);
  const [showDetailPreview, setShowDetailPreview] = useState(true);

  // --- Resort Functions ---
  const addFacility = () => {
    if (!newFacility.name) return;
    setResort({ ...resort, facilities: [...resort.facilities, newFacility] });
    setNewFacility({ name: "", image: "" });
  };

  const addRoom = () => {
    if (!newRoom.name) return;
    setResort({ ...resort, rooms: [...resort.rooms, { ...newRoom, id: Date.now() }] });
    setNewRoom({ name: "", guests: 1, beds: "", price: 0, details: "", gallery: [], tags: [] });
  };

  const addRoomTag = () => {
    if (!newRoomTag) return;
    setNewRoom({ ...newRoom, tags: [...newRoom.tags, newRoomTag] });
    setNewRoomTag("");
  };

  const addRoomGalleryItem = () => {
    if (!newRoomGalleryItem) return;
    setNewRoom({ ...newRoom, gallery: [...newRoom.gallery, newRoomGalleryItem] });
    setNewRoomGalleryItem("");
  };

  const addTag = () => {
    if (!newTag) return;
    setResort({ ...resort, tags: [...resort.tags, newTag] });
    setNewTag("");
  };

  const moveTag = (fromIndex, toIndex) => {
    const tags = [...resort.tags];
    const [removed] = tags.splice(fromIndex, 1);
    tags.splice(toIndex, 0, removed);
    setResort({ ...resort, tags });
  };

  const addGallery = () => {
    if (!newGallery) return;
    setResort({ ...resort, gallery: [...resort.gallery, newGallery] });
    setNewGallery("");
  };

    const addService = () => {
    if (!newService.name) return;
    setResort({ ...resort, extraServices: [...resort.extraServices, newService] });
    setNewService({ name: "", description: "", cost: 0 });
  };

  // --- Generate JS file output ---
  const generateJsOutput = () => {
      // 1. Convert to JSON string
      const jsonString = JSON.stringify([resort], null, 2);
      
      // 2. This Regex removes quotes from keys (e.g., "name": -> name:)
      const cleanJs = jsonString.replace(/"([^"]+)":/g, '$1:');
      
      return `export const resorts = ${cleanJs};`;
    };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-center">Resort JS Builder</h1>

      {/* Basic Info */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Resort Info</h2>
        <input
          type="text"
          placeholder="Resort Name"
          className="border px-3 py-2 w-full rounded"
          value={resort.name}
          onChange={(e) => setResort({ ...resort, name: e.target.value })}
        />
        <label className="block">Profile Image URL</label>
        <input
          type="text"
          placeholder="https://example.com/profile.jpg"
          className="border px-3 py-2 w-full rounded"
          value={resort.profileImage}
          onChange={(e) =>
            setResort({ ...resort, profileImage: e.target.value })
          }
        />        
        <input
          type="text"
          placeholder="Location"
          className="border px-3 py-2 w-full rounded"
          value={resort.location}
          onChange={(e) => setResort({ ...resort, location: e.target.value })}
        />
        <label className="block">Average Pricing</label>
        <input
          type="number"
          placeholder="Price"
          className="border px-3 py-2 w-full rounded"
          value={resort.price}
          onChange={(e) => setResort({ ...resort, price: Number(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Contact Phone"
          className="border px-3 py-2 w-full rounded"
          value={resort.contactPhone}
          onChange={(e) => setResort({ ...resort, contactPhone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact Email"
          className="border px-3 py-2 w-full rounded"
          value={resort.contactEmail}
          onChange={(e) => setResort({ ...resort, contactEmail: e.target.value })}
        />
        <textarea
          placeholder="Short Summary"
          className="border px-3 py-2 w-full rounded"
          value={resort.description.summary}
          onChange={(e) => setResort({ ...resort, description: { summary: e.target.value } })}
        />
      </section>

      {/* Tags */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Resort Tags</h2>
        <div className="flex flex-wrap gap-2">
          {resort.tags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {tag}
              {idx > 0 && <button onClick={() => moveTag(idx, idx - 1)}>↑</button>}
              {idx < resort.tags.length - 1 && <button onClick={() => moveTag(idx, idx + 1)}>↓</button>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="New Tag"
            className="border px-2 py-1 rounded flex-1"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button onClick={addTag} className="bg-blue-600 text-white px-4 py-1 rounded">
            Add Tag
          </button>
        </div>
      </section>

      {/* Facilities */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {resort.facilities.map((f, idx) => (
            <div key={idx} className="flex flex-col items-center bg-gray-100 p-2 rounded">
              <div className="font-medium">{f.name}</div>
              {f.image && <img src={f.image} alt={f.name} className="w-20 h-20 object-cover rounded mt-1" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Facility Name"
            className="border px-2 py-1 rounded flex-1"
            value={newFacility.name}
            onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="border px-2 py-1 rounded flex-1"
            value={newFacility.image}
            onChange={(e) => setNewFacility({ ...newFacility, image: e.target.value })}
          />
          <button onClick={addFacility} className="bg-green-600 text-white px-4 py-1 rounded">
            Add Facility
          </button>
        </div>
      </section>

      {/* Extra Services */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Extra Services</h2>
        {resort.extraServices.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 bg-gray-100 p-2 rounded">
            <div>{s.name}</div>
            <div>{s.description}</div>
            <div className="font-semibold text-blue-600">₱{s.cost}</div>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Service Name"
            className="border px-2 py-1 rounded flex-1"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="border px-2 py-1 rounded flex-1"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Cost"
            className="border px-2 py-1 rounded w-24"
            value={newService.cost}
            onChange={(e) => setNewService({ ...newService, cost: Number(e.target.value) })}
          />
          <button onClick={addService} className="bg-blue-600 text-white px-4 py-1 rounded">
            Add Service
          </button>
        </div>
      </section>

      {/* Rooms */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Rooms</h2>
        {resort.rooms.map((room) => (
          <div key={room.id} className="border p-3 rounded space-y-2 bg-gray-50">
            <div className="font-semibold text-lg">{room.name}</div>
            <div>Guests: {room.guests}, Beds: {room.beds}, Price: ₱{room.price}</div>
            <div className="text-sm text-gray-600 italic">{room.details}</div>
            <div className="flex gap-2 flex-wrap">
              {room.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            {room.gallery.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {room.gallery.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 bg-gray-200 rounded overflow-hidden">
                    <img src={img} alt={`room-${room.name}-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* New Room */}
        <div className="border p-4 rounded space-y-2 bg-gray-50">
          <input
            type="text"
            placeholder="Room Name"
            className="border px-2 py-1 rounded w-full"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          />
          <label className="block">Number of Guests:</label>
          <input
            type="number"
            placeholder="Guests"
            className="border px-2 py-1 rounded w-full"
            value={newRoom.guests}
            onChange={(e) => setNewRoom({ ...newRoom, guests: Number(e.target.value) })}
          />
          <input
            type="text"
            placeholder="Beds"
            className="border px-2 py-1 rounded w-full"
            value={newRoom.beds}
            onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
          />
          <label className="block">Pricing</label>
          <input
            type="number"
            placeholder="Price"
            className="border px-2 py-1 rounded w-full"
            value={newRoom.price}
            onChange={(e) => setNewRoom({ ...newRoom, price: Number(e.target.value) })}
          />

          <textarea
              placeholder="Room Details (e.g. Near the pool, quiet area...)"
              className="border px-2 py-1 rounded w-full"
              value={newRoom.details}
              onChange={(e) => setNewRoom({ ...newRoom, details: e.target.value })}
            />          

          {/* Room Tags */}
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Room Tag"
              className="border px-2 py-1 rounded flex-1"
              value={newRoomTag}
              onChange={(e) => setNewRoomTag(e.target.value)}
            />
            <button onClick={addRoomTag} className="bg-green-600 text-white px-4 py-1 rounded">
              Add Tag
            </button>
          </div>

          {/* Room Gallery */}
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Gallery Image URL"
              className="border px-2 py-1 rounded flex-1"
              value={newRoomGalleryItem}
              onChange={(e) => setNewRoomGalleryItem(e.target.value)}
            />
            <button onClick={addRoomGalleryItem} className="bg-blue-600 text-white px-4 py-1 rounded">
              Add Image
            </button>
          </div>

          <button onClick={addRoom} className="bg-blue-700 text-white px-4 py-2 rounded mt-2 w-full">
            Add Room
          </button>
        </div>
      </section>

      {/* Resort Gallery */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Resort Gallery</h2>
        <div className="flex gap-2 flex-wrap">
          {resort.gallery.map((img, idx) => (
            <div key={idx} className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
              <img src={img} alt={`resort-gallery-${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="New Gallery Item URL"
            className="border px-2 py-1 rounded flex-1"
            value={newGallery}
            onChange={(e) => setNewGallery(e.target.value)}
          />
          <button onClick={addGallery} className="bg-blue-600 text-white px-4 py-1 rounded">
            Add Gallery
          </button>
        </div>
      </section>

      {/* Toggle Preview */}
      <div className="flex gap-4 justify-center">
        <button className="px-4 py-1 bg-gray-300 rounded" onClick={() => setShowCardPreview(!showCardPreview)}>
          {showCardPreview ? "Hide Card Preview" : "Show Card Preview"}
        </button>
        <button className="px-4 py-1 bg-gray-300 rounded" onClick={() => setShowDetailPreview(!showDetailPreview)}>
          {showDetailPreview ? "Hide Detail Preview" : "Show Detail Preview"}
        </button>
      </div>

      {/* JS Output */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-xl">Generated JS</h2>
        <textarea
          className="w-full border rounded p-2 h-64 font-mono text-xs"
          value={generateJsOutput()}
          readOnly
        />
      </section>

      {/* Preview */}
      <section className="space-y-6">
        {showCardPreview && (
          <div>
            <h2 className="font-semibold mb-2">ResortResults Preview</h2>
            <ResortResults resorts={[resort]} />
          </div>
        )}

        {showDetailPreview && (
          <div>
            <h2 className="font-semibold mb-2">ResortDetailPage Preview</h2>
            <div className="border p-4 rounded bg-white">
              <HeroGallery resort={resort} onOpen={() => {}} />
              <ShortcutBar />
              <ResortInfo resort={resort} onFacilityOpen={() => {}} />
              <RoomsSection resort={resort} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
