import React, { useState } from "react";
import { 
  Plus, Search, Star, MapPin, Award, Phone, Users, ShieldCheck, X
} from "lucide-react";
import { Supplier } from "../types";

interface SuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
}

export default function Suppliers({ suppliers, onAddSupplier }: SuppliersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"Farm" | "Packaging" | "Logistics">("Farm");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [certs, setCerts] = useState("");
  const [crops, setCrops] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !phone) return;

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      type,
      location,
      rating: 4.5,
      certificates: certs ? certs.split(",").map(c => c.trim()) : ["HACCP"],
      productsSourced: crops ? crops.split(",").map(cr => cr.trim()) : ["IQF Crops"],
      contactPerson,
      phone
    };

    onAddSupplier(newSupplier);
    
    // Reset Form
    setName("");
    setLocation("");
    setPhone("");
    setContactPerson("");
    setCerts("");
    setCrops("");
    setIsAdding(false);
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.productsSourced.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="suppliers-tab">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">Sourcing & Supplier Network</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Egyptian local farms, packaging factories, and temperature-controlled logistics partners.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 md:mt-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white transition px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add Sourcing Partner</span>
          </button>
        )}
      </div>

      {/* Add Sourcing Partner Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Register New Egyptian Sourcing Partner</h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Partner Name</label>
              <input 
                type="text" 
                placeholder="e.g. Al-Sharkia Crop Cooperative"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Partner Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              >
                <option value="Farm">Farm / Agricultural Co-Op</option>
                <option value="Packaging">Packaging Manufacturer</option>
                <option value="Logistics">Reefer Trucking / Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Headquarters / Location</label>
              <input 
                type="text" 
                placeholder="e.g. Ismailia, Egypt"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Person</label>
              <input 
                type="text" 
                placeholder="e.g. Eng. Ahmed Al-Aswad"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input 
                type="text" 
                placeholder="e.g. +20 100 987 6543"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Certificates (Comma Separated)</label>
              <input 
                type="text" 
                placeholder="e.g. GLOBALG.A.P., Organic, ISO"
                value={certs}
                onChange={e => setCerts(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Crops / Services Supplied (Comma Separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Strawberry, Mango, Frozen Cartons, Reefer Corridors"
              value={crops}
              onChange={e => setCrops(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
            >
              Save Sourcing Partner
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
        <Search className="text-slate-400" size={15} />
        <input 
          type="text" 
          placeholder="Search farms, logistics corridors, certification standards..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="text-xs bg-transparent border-none outline-none w-full"
        />
      </div>

      {/* Sourcing Partner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    s.type === "Farm" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    s.type === "Packaging" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-sky-50 text-sky-700 border border-sky-100"
                  }`}>
                    {s.type} Partner
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm font-display mt-2">{s.name}</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {s.location}</p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-xs px-2 py-1 rounded">
                  <Star size={11} className="fill-amber-500 text-amber-500" />
                  <span>{s.rating}</span>
                </div>
              </div>

              {/* Products Supplied */}
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Crops & Services Delivered</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.productsSourced.map(crop => (
                    <span key={crop} className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quality Standards */}
              <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/30 flex items-start gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-emerald-800">
                  <span className="font-bold">Verified Quality Standards:</span> {s.certificates.join(", ")}
                </div>
              </div>
            </div>

            {/* Sourcing Contact Details */}
            <div className="pt-3 border-t border-slate-50 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Person: <strong>{s.contactPerson}</strong></span>
              <span>Tel: <strong>{s.phone}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
