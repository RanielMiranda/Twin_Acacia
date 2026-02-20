import { useState, useEffect } from "react";
import { 
  Plus, Image as ImageIcon, 
  X, DollarSign, MapPin, Phone, Mail, Facebook
} from "lucide-react";
import { useResort } from "@/components/useclient/ContextEditor";

export default function ProfileEditor() {
  const { resort, updateResort, safeSrc } = useResort();

  // 🔹 Local form state
  const [form, setForm] = useState(resort);

  // 🔹 Sync form when resort context changes
  useEffect(() => {
    if (resort) setForm(resort);
  }, [resort]);

  // 🔹 Tag handlers
  const addTag = () => {
    const tag = prompt("Enter new tag:");
    if (!tag) return;
    setForm({ ...form, tags: [...form.tags, tag] });
    updateResort("tags", [...form.tags, tag]);
  };

  const removeTag = (index) => {
    const newTags = form.tags.filter((_, i) => i !== index);
    setForm({ ...form, tags: newTags });
    updateResort("tags", newTags);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div className="relative group shrink-0">
          {safeSrc(form.profileImage) && (
            <img
              src={safeSrc(form.profileImage)}
              className="w-32 h-32 rounded-full object-cover"
              alt="Profile"
            />
          )}
          <button 
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
            onClick={() => {
              const newUrl = prompt("New profile image URL:", form.profileImage);
              if (!newUrl) return;
              setForm({ ...form, profileImage: newUrl });
              updateResort("profileImage", newUrl);
            }}
          >
            <ImageIcon size={20} />
          </button>
        </div>

        {/* Text Inputs */}
        <div className="flex-1 w-full space-y-4">
          <input 
            className="text-4xl font-black w-full bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 rounded transition placeholder:text-slate-300"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => updateResort("name", form.name)}
            placeholder="Resort Name"
          />

          <div className="flex flex-col gap-2 text-gray-800">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <input 
                 className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full font-medium"
                 value={form.location || ""}
                 onChange={(e) => setForm({ ...form, location: e.target.value })}
                 onBlur={() => updateResort("location", form.location)}
                 placeholder="Add Location"
              />
            </div>

            <div className="flex items-center gap-1">
              <Facebook size={16} />
              <input 
                 className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full text-blue-600 underline"
                 value={form.contactMedia || ""}
                 onChange={(e) => setForm({ ...form, contactMedia: e.target.value })}
                 onBlur={() => updateResort("contactMedia", form.contactMedia)}
                 placeholder="Add Facebook Link"
              />
            </div>

            <div className="flex items-center gap-1">
               <Mail size={16} />
               <input 
                 className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full"
                 value={form.contactEmail || ""}
                 onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                 onBlur={() => updateResort("contactEmail", form.contactEmail)}
                 placeholder="Add Email"
              />
            </div>

            <div className="flex items-center gap-1">
               <Phone size={16} />
               <input 
                 className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full"
                 value={form.contactPhone || ""}
                 onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                 onBlur={() => updateResort("contactPhone", form.contactPhone)}
                 placeholder="Add Phone"
              />
            </div>

            <div className="flex items-center gap-1">
               <DollarSign size={16} />
               <input 
                 type="number"
                 className="bg-transparent border-none p-1 focus:ring-0 hover:bg-slate-50 rounded w-full"
                 value={form.price || ""}
                 onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                 onBlur={() => updateResort("price", form.price)}
                 placeholder="Base Price"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8">
        <textarea 
          className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-600 leading-relaxed focus:border-blue-400 focus:bg-white outline-none transition"
          rows={5}
          value={form.description?.summary || ""}
          onChange={(e) => setForm({ 
            ...form, 
            description: { ...form.description, summary: e.target.value } 
          })}
          onBlur={() => updateResort("description", form.description)}
        />
      </div>

      {/* Resort Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {form.tags?.map((tag, i) => (
          <div key={i} className="group relative bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
            {tag}
            <X size={12} className="cursor-pointer text-blue-400 hover:text-red-500" onClick={() => removeTag(i)} />
          </div>
        ))}
        <button onClick={addTag} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
           <Plus size={12} /> Add Tag
        </button>
      </div>
    </div>
  );
}
