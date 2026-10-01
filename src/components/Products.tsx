import React, { useState } from "react";
import { 
  Plus, Layers, Search, Snowflake, Calendar, Tag, FileText, ChevronRight, Check, X
} from "lucide-react";
import { Product } from "../types";

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function Products({ products, onAddProduct }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Fruit" | "Vegetable" | "Mixed">("Fruit");
  const [seasonStart, setSeasonStart] = useState("January");
  const [seasonEnd, setSeasonEnd] = useState("December");
  const [targetTemp, setTargetTemp] = useState("-18°C");
  const [hsCode, setHsCode] = useState("0710.80");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      code: `${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90) + 10}`,
      category,
      seasonStart,
      seasonEnd,
      targetTemp,
      description,
      hsCode
    };

    onAddProduct(newProduct);
    
    // Reset form
    setName("");
    setDescription("");
    setIsAdding(false);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6" id="products-tab">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">IQF Product Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Surgical Individual Quick Freezing (IQF) products exported globally by Galina.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="mt-4 md:mt-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white transition px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Add Product Form Modal/Panel */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Register New IQF Production Line</h3>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name</label>
              <input 
                type="text" 
                placeholder="e.g. IQF Pomegranate"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              >
                <option value="Fruit">Fruit</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Mixed">Mixed Blend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">HS Code</label>
              <input 
                type="text" 
                placeholder="e.g. 0811.90"
                value={hsCode}
                onChange={e => setHsCode(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Season Start Month</label>
              <select 
                value={seasonStart}
                onChange={e => setSeasonStart(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Year-round">Year-round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Season End Month</label>
              <select 
                value={seasonEnd}
                onChange={e => setSeasonEnd(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Year-round">Year-round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Storage Temp</label>
              <input 
                type="text" 
                placeholder="e.g. -18°C"
                value={targetTemp}
                onChange={e => setTargetTemp(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Technical Specifications & Sourcing Origin</label>
            <textarea 
              rows={3}
              placeholder="Provide exact cut caliber, blanching status, Brix rating, variety description, and packaging recommendations."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            ></textarea>
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
              Save Product
            </button>
          </div>
        </form>
      )}

      {/* Product Search & Counter */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
        <Search className="text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search crop, variety, HS code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="text-xs bg-transparent border-none outline-none w-full"
        />
        <span className="text-[10px] text-slate-400 shrink-0 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
          Showing {filtered.length} of {products.length} Products
        </span>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-teal-200 transition">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    p.category === "Fruit" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    p.category === "Vegetable" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}>
                    {p.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base mt-2 font-display">{p.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">HS Code: {p.hsCode} | SKU: {p.code}</p>
                </div>
                <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
                  <Snowflake size={18} />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3.5 leading-relaxed line-clamp-3">
                {p.description}
              </p>

              {/* Technical features */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Calendar size={13} className="text-teal-600" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Active Season</p>
                    <p className="text-xs font-semibold text-slate-700">{p.seasonStart} - {p.seasonEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Snowflake size={13} className="text-teal-600" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Freezing Temp</p>
                    <p className="text-xs font-semibold text-slate-700">{p.targetTemp}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Sourcing Overview */}
            <div className="bg-slate-50/50 p-3 rounded-b-xl border-t border-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-400">Quality Certificate:</span>
              <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100 text-[10px]">
                BRCGS AA + FDA Compliance
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
