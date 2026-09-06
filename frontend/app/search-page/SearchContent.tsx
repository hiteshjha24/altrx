'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { addCartItem, getAuthenticatedUser } from '@/lib/cart';


interface Medicine {
  id?: string;
  name?: string;
  medicine_name?: string;
  price?: number | string;
  manufacturer?: string;
  brand?: string;
  composition?: string;
}


export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with URL search param if present (e.g. from Home search), otherwise empty
  const urlQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sync state if URL parameter changes
  useEffect(() => {
    const param = searchParams.get('q') || '';
    setSearchTerm(param);
    setQuery(param);
  }, [searchParams]);

  // Execute API call only when query is non-empty
  useEffect(() => {
    const fetchMedicines = async () => {
      const cleanQuery = query.trim().toLowerCase();
      
      // Don't execute fetch if the user hasn't searched anything yet
      if (!cleanQuery) {
        setMedicines([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://p01--backend--dym8ktl2tt29.code.run/api/search?q=${encodeURIComponent(cleanQuery)}&limit=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch medicine data.');
        }

        const data = await response.json();
        setMedicines(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong fetching medicines.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedTerm = searchTerm.trim();
    if (!formattedTerm) return;

    setQuery(formattedTerm);
    router.push(`/search?q=${encodeURIComponent(formattedTerm)}`);
  };

  const getMedicineId = (medicine: Medicine, index: number) => String(medicine.id ?? index);

  const updateQuantity = (medicineId: string, change: number) => {
    setQuantities((current) => ({ ...current, [medicineId]: Math.max(1, (current[medicineId] ?? 1) + change) }));
  };

  const addToCart = (medicine: Medicine, index: number) => {
    if (!getAuthenticatedUser()) {
      window.location.href = `/login?next=/search-page${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      return;
    }

    const id = getMedicineId(medicine, index);
    const quantity = quantities[id] ?? 1;
    addCartItem({ ...medicine, id, price: medicine.price ?? 0 }, quantity);
    setAddedId(id);
    window.setTimeout(() => setAddedId((current) => current === id ? null : current), 1600);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Back Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors gap-2"
          >
            <span>&larr;</span> Back home
          </Link>
        </div>

        {/* Search Header & Input */}
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">
            Find <span className="text-[#00e599]">Medicines</span>
          </h1>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for brand name or active ingredient..."
                className="w-full bg-[#121212] border border-gray-800 focus:border-[#00e599] rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00e599] hover:bg-[#00c784] text-black font-bold px-6 py-3.5 rounded-xl transition-all shrink-0 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* 1. Initial Empty Search Prompt (When user hasn't typed anything yet) */}
        {!query.trim() && !loading && (
          <div className="border border-gray-900 bg-[#0a0a0a] rounded-2xl p-12 text-center max-w-2xl mx-auto my-8">
            <div className="p-4 bg-gray-900/60 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-[#00e599]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Search for medicines</h3>
            <p className="text-gray-500 text-sm">
              Type the name of a medicine or active ingredient above to search our inventory.
            </p>
          </div>
        )}

        {/* 2. Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 border border-gray-900 bg-[#0a0a0a] rounded-2xl">
            <div className="w-10 h-10 border-4 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4 text-sm">Searching inventory...</p>
          </div>
        )}

        {/* 3. Error State */}
        {error && (
          <div className="text-center py-12 text-red-400 bg-red-950/20 rounded-xl border border-red-900/40">
            <p>{error}</p>
          </div>
        )}

        {/* 4. No Results Found (User searched, but 0 results came back) */}
        {!loading && !error && query.trim() !== '' && medicines.length === 0 && (
          <div className="border border-gray-900 bg-[#0a0a0a] rounded-2xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-1">No medicines found</h3>
            <p className="text-gray-500 text-sm">
              We couldn&apos;t find any results for &quot;{query}&quot;. Try typing another medicine name!
            </p>
          </div>
        )}

        {/* 5. Results Grid */}
        {!loading && !error && medicines.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-medium text-gray-400">
                Results for &quot;<span className="text-white font-semibold">{query}</span>&quot;
              </h2>
              <span className="text-xs text-gray-500">{medicines.length} items found</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-base text-white line-clamp-1">
                        {item.name || item.medicine_name || 'Medicine'}
                      </h3>
                      <span className="bg-[#00e599]/10 text-[#00e599] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#00e599]/20 shrink-0">
                        {item.price ? `₹${item.price}` : 'In Stock'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      <span className="text-gray-500">Manufacturer:</span> {item.manufacturer || item.brand || 'N/A'}
                    </p>

                    {item.composition && (
                      <p className="text-xs bg-[#121212] text-gray-300 p-2.5 rounded-lg mb-4 border border-gray-800/80">
                        <span className="text-gray-500 font-semibold block mb-0.5">Composition:</span> 
                        {item.composition}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                      <span>Quantity</span>
                      <button type="button" onClick={() => updateQuantity(getMedicineId(item, index), -1)} aria-label="Decrease quantity" className="flex h-7 w-7 items-center justify-center rounded border border-gray-800 bg-[#121212] text-gray-300"><Minus size={14} /></button>
                      <span className="min-w-5 text-center font-bold text-white">{quantities[getMedicineId(item, index)] ?? 1}</span>
                      <button type="button" onClick={() => updateQuantity(getMedicineId(item, index), 1)} aria-label="Increase quantity" className="flex h-7 w-7 items-center justify-center rounded border border-gray-800 bg-[#121212] text-gray-300"><Plus size={14} /></button>
                    </div>
                    <div className="text-right text-xs text-gray-300">Total: <strong className="text-white">₹{(Number(item.price || 0) * (quantities[getMedicineId(item, index)] ?? 1)).toFixed(2)}</strong></div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button type="button" onClick={() => addToCart(item, index)} className="flex items-center justify-center gap-2 rounded-lg border border-[#00e599] bg-[#00e599] px-3 py-2.5 text-sm font-bold text-black transition-colors">
                        <ShoppingCart size={16} /> {addedId === getMedicineId(item, index) ? 'Added' : 'Add to cart'}
                      </button>
                      <Link href={`/medicines/${item.id}/alternatives`} className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#121212] px-3 py-2.5 text-center text-sm font-bold text-gray-200 transition-colors hover:border-[#00e599] hover:text-[#00e599]">
                        View alternatives
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}