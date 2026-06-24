/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, CATEGORIES_LIST, ItemCondition } from '../types';
import { Search, Filter, Camera, Plus, Edit2, RefreshCcw, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatIndoDate } from '../utils/exporter';

interface AssetTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onMutate?: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function AssetTable({ items, onEdit, onMutate, onDelete, onAddNew }: AssetTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [selectedCondition, setSelectedCondition] = useState('SEMUA');
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Derive custom categories present in items but not standard list
  const customCategoriesInItems = Array.from(
    new Set(items.map(item => item.kategori).filter(cat => !CATEGORIES_LIST.includes(cat)))
  );
  const allCategoriesFilterList = ['SEMUA', ...CATEGORIES_LIST, ...customCategoriesInItems];

  // Filtering Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.namaBarang.toLowerCase().includes(search.toLowerCase()) || 
                          (item.lokasi && item.lokasi.toLowerCase().includes(search.toLowerCase())) ||
                          (item.jenisPenggunaan && item.jenisPenggunaan.toLowerCase().includes(search.toLowerCase())) ||
                          (item.keterangan && item.keterangan.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'SEMUA' || item.kategori === selectedCategory;
    const matchesCondition = selectedCondition === 'SEMUA' || item.kondisi === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm" id="asset_table_root">
      
      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6" id="table_filter_bar">
        
        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari barang, lokasi penempatan, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-xs text-gray-800"
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap gap-2.5 w-full xl:w-auto justify-end">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-gray-700 font-sans"
            >
              <option value="SEMUA">Semua Kategori</option>
              {CATEGORIES_LIST.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
              {customCategoriesInItems.map((cat, i) => (
                <option key={`c-${i}`} value={cat}>{cat} (Kustom)</option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-gray-700 font-sans"
            >
              <option value="SEMUA">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          {/* Add New Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer ml-auto xl:ml-0"
          >
            <Plus className="w-4 h-4" />
            Registrasi Aset
          </button>
        </div>

      </div>

      {/* Main Table Layout */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-sm font-sans font-medium mb-1">Data barang tidak ditemukan</p>
          <p className="text-xs text-gray-400 font-sans">Cobalah kata kunci pencarian yang lain atau sesuaikan filter Anda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-sans text-xs" id="madrasah_inventory_table">
            <thead>
              <tr className="bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-4 w-12 text-center rounded-l-xl">No</th>
                <th className="py-4 px-4">Nama Barang</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Sumber Dana</th>
                <th className="py-4 px-4">Keterangan/Merk</th>
                <th className="py-4 px-4 text-center">Jml</th>
                <th className="py-4 px-4 text-center">Kondisi</th>
                <th className="py-4 px-4">Tgl Pendataan</th>
                <th className="py-4 px-4">Lokasi</th>
                <th className="py-4 px-4">Jenis Penggunaan</th>
                <th className="py-4 px-4 text-center">Gambar</th>
                <th className="py-4 px-4 text-center rounded-r-xl">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 group transition duration-150">
                  
                  {/* column 1: NOMOR */}
                  <td className="py-4 px-4 font-bold text-gray-400 text-center">{idx + 1}</td>
                  
                  {/* column 2: NAMA BARANG */}
                  <td className="py-4 px-4 font-bold text-gray-800 break-words group-hover:text-emerald-800 transition">
                    {item.namaBarang}
                  </td>
                  
                  {/* column 3: KATEGORI */}
                  <td className="py-4 px-4">
                    <span className="text-[10.5px] text-gray-600 bg-gray-100 font-medium px-2.5 py-1 rounded-full font-sans whitespace-nowrap">
                      {item.kategori}
                    </span>
                  </td>

                  {/* column 3.5: SUMBER DANA */}
                  <td className="py-4 px-4">
                    <span className="text-[10.5px] text-teal-850 bg-teal-50 border border-teal-100 font-semibold px-2.5 py-1 rounded-full font-sans whitespace-nowrap">
                      {item.sumberDana || 'Dana BOS'}
                    </span>
                  </td>

                  {/* column 4: KETERANGAN/MERK */}
                  <td className="py-4 px-4 text-gray-500 max-w-[150px] truncate" title={item.keterangan}>
                    {item.keterangan || '-'}
                  </td>

                  {/* column 5: JUMLAH */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[13px] font-bold font-mono text-gray-800">
                      {item.jumlah}
                    </div>
                  </td>

                  {/* column 6: KONDISI */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.kondisi === 'Baik' 
                        ? 'bg-emerald-55 border border-emerald-100 text-emerald-800' 
                        : item.kondisi === 'Rusak Ringan' 
                          ? 'bg-amber-55 border border-amber-100 text-amber-800'
                          : 'bg-rose-55 border border-rose-100 text-rose-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.kondisi === 'Baik' ? 'bg-emerald-500' : item.kondisi === 'Rusak Ringan' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      {item.kondisi}
                    </span>
                  </td>

                  {/* column 7: TANGGAL PENDATAAN */}
                  <td className="py-4 px-4 whitespace-nowrap text-gray-500 uppercase">
                    {formatIndoDate(item.tanggalMutasi)}
                  </td>

                  {/* column 8: LOKASI */}
                  <td className="py-4 px-4 font-medium text-gray-700">
                    {item.lokasi ? `📍 ${item.lokasi}` : '-'}
                  </td>

                  {/* column 9: JENIS PENGGUNAAN */}
                  <td className="py-4 px-4 text-gray-600 font-sans">
                    {item.jenisPenggunaan || '-'}
                  </td>

                  {/* column 10: GAMBAR */}
                  <td className="py-4 px-4 text-center">
                    {item.gambarUrl ? (
                      <div className="relative group/img inline-block cursor-pointer" onClick={() => setActiveImagePreview(item.gambarUrl || null)}>
                        <img
                           src={item.gambarUrl}
                           alt={item.namaBarang}
                           className="w-12 h-9 object-cover rounded-md border border-gray-200 transition hover:scale-105"
                           referrerPolicy="no-referrer"
                         />
                        <div className="absolute inset-0 bg-black/45 rounded-md opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                          KLIK
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-9 bg-gray-100 rounded-md border border-gray-100 inline-flex items-center justify-center text-gray-350" title="Foto barang belum dipindai">
                        <Camera className="w-4 h-4 stroke-[1.2]" />
                      </div>
                    )}
                  </td>

                  {/* column 11: TINDAKAN */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {deletingItemId === item.id ? (
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(item.id);
                            setDeletingItemId(null);
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItemId(null)}
                          className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center gap-1.5">
                        {/* EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Sunting Informasi Barang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setDeletingItemId(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Permanen Barang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full scale image display modal overlay */}
      {activeImagePreview && (
        <div 
          className="fixed inset-0 bg-slate-950/80 p-4 flex items-center justify-center z-50 animate-fade-in-rapid"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-2xl bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <img 
              src={activeImagePreview} 
              alt="Preview Besar Aset" 
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition cursor-pointer"
              onClick={() => setActiveImagePreview(null)}
            >
              <Trash2 className="w-4 h-4 hidden" /> {/* spacer */}
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
