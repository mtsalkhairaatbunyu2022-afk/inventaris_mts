/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCondition, MutationRecord, MutationType } from '../types';
import { X, Calendar, MessageSquare, TrendingUp, TrendingDown, RefreshCcw, Save } from 'lucide-react';

interface MutationModalProps {
  item: InventoryItem;
  onSave: (mutationData: Omit<MutationRecord, 'id' | 'namaBarang'>) => void;
  onClose: () => void;
}

export default function MutationModal({ item, onSave, onClose }: MutationModalProps) {
  const [tipe, setTipe] = useState<MutationType>('MASUK');
  const [jumlahPerubahan, setJumlahPerubahan] = useState(1);
  const [kondisiSesudah, setKondisiSesudah] = useState<ItemCondition>(item.kondisi);
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Default to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTanggal(today);
  }, []);

  // Update change inputs default states depending on type selected
  useEffect(() => {
    if (tipe === 'KONDISI_BERUBAH') {
      setJumlahPerubahan(0);
    } else if (jumlahPerubahan === 0) {
      setJumlahPerubahan(1);
    }
  }, [tipe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety checks
    let quantityDiff = 0;
    if (tipe === 'MASUK') {
      quantityDiff = Math.abs(jumlahPerubahan);
    } else if (tipe === 'KELUAR') {
      quantityDiff = -Math.abs(jumlahPerubahan);
      // Validate inventory doesn't fall below zero
      if (item.jumlah + quantityDiff < 0) {
        alert(`Gagal Mutasi! Sisa unit aktif hanya ${item.jumlah}, tidak bisa dikurangi ${Math.abs(jumlahPerubahan)}.`);
        return;
      }
    } else if (tipe === 'KONDISI_BERUBAH') {
      quantityDiff = 0;
    }

    const nextQuantity = item.jumlah + quantityDiff;

    onSave({
      itemId: item.id,
      tipe: tipe,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      jumlahPerubahan: quantityDiff,
      jumlahSebelum: item.jumlah,
      jumlahSesudah: nextQuantity,
      kondisiSebelum: item.kondisi,
      kondisiSesudah: kondisiSesudah,
      keterangan: keterangan.trim() || getDefaultNotes(tipe, quantityDiff, item.kondisi, kondisiSesudah)
    });
  };

  const getDefaultNotes = (t: MutationType, qDiff: number, oldC: string, newC: string) => {
    if (t === 'MASUK') return `Penambahan pasokan barang baru sebanyak +${Math.abs(qDiff)} unit`;
    if (t === 'KELUAR') return `Pengurangan kuantitas inventaris sebanyak -${Math.abs(qDiff)} unit`;
    if (t === 'KONDISI_BERUBAH') return `Perubahan berkala kondisi aset dari [${oldC}] menjadi [${newC}]`;
    return 'Mutasi administrasi rutin';
  };

  const resultingStock = item.jumlah + (tipe === 'MASUK' ? jumlahPerubahan : tipe === 'KELUAR' ? -jumlahPerubahan : 0);

  return (
    <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 animate-fade-in-rapid" id="mutation_modal_overlay">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-gray-100 shadow-xl overflow-hidden relative" id="mutation_modal_body">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div>
            <span className="text-gray-400 text-[10px] font-sans font-bold uppercase tracking-wider block">Formulir Mutasi</span>
            <h2 className="font-sans font-bold text-base text-gray-800 flex items-center gap-1.5 mt-0.5">
              Pencatatan Mutasi: <span className="text-emerald-700 font-sans">{item.namaBarang}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tipe Mutasi Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Jenis Mutasi Barang
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* MASUK */}
              <button
                type="button"
                onClick={() => setTipe('MASUK')}
                className={`py-3.5 px-2.5 rounded-xl border font-sans text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  tipe === 'MASUK'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold leading-none">Barang Masuk</span>
                <span className="text-[10px] text-gray-400">Tambah Unit</span>
              </button>

              {/* KELUAR */}
              <button
                type="button"
                onClick={() => setTipe('KELUAR')}
                className={`py-3.5 px-2.5 rounded-xl border font-sans text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  tipe === 'KELUAR'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold leading-none">Barang Keluar</span>
                <span className="text-[10px] text-gray-400">Pengurangan unit</span>
              </button>

              {/* KONDISI */}
              <button
                type="button"
                onClick={() => setTipe('KONDISI_BERUBAH')}
                className={`py-3.5 px-2.5 rounded-xl border font-sans text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  tipe === 'KONDISI_BERUBAH'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <RefreshCcw className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold leading-none">Ubah Kondisi</span>
                <span className="text-[10px] text-gray-400">Penyusutan / Servis</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Perubahan Jumlah */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                {tipe === 'MASUK' ? 'Jumlah Masuk' : tipe === 'KELUAR' ? 'Jumlah Dibuang' : 'Perubahan Kuantitas'}
              </label>
              <input
                type="number"
                min={tipe === 'KONDISI_BERUBAH' ? "0" : "1"}
                disabled={tipe === 'KONDISI_BERUBAH'}
                value={jumlahPerubahan}
                onChange={(e) => setJumlahPerubahan(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              />
            </div>

            {/* Tanggal Mutasi */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Tanggal Mutasi
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              />
            </div>
          </div>

          {/* Kondisi Setelah */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Status Kondisi Setelah Mutasi
            </label>
            <select
              value={kondisiSesudah}
              onChange={(e) => setKondisiSesudah(e.target.value as ItemCondition)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
            >
              <option value="Baik">🟢 Baik (Bisa Dipergunakan Maksimal)</option>
              <option value="Rusak Ringan">🟡 Rusak Ringan (Perlu Service/Perawatan)</option>
              <option value="Rusak Berat">🔴 Rusak Berat (Mati Total/Pecah/Patah)</option>
            </select>
          </div>

          {/* Keterangan / Alasan Mutasi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              Alasan atau Keterangan Mutasi <span className="text-gray-400 text-[10px] lowercase font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder={
                tipe === 'MASUK' 
                  ? 'Contoh: Pengadaan dana BOS Madrasah Th. 2026' 
                  : tipe === 'KELUAR' 
                    ? 'Contoh: Rusak parah digilas air pasang, dibuang dari gudang' 
                    : 'Contoh: Perbaikan oleh tim teknisi madrasah'
              }
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 resize-none font-sans"
            />
          </div>

          {/* Visual calculation simulation box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2 font-sans text-xs">
            <h4 className="font-bold text-gray-700 tracking-wider uppercase text-[10px] mb-2">Simulasi Hasil Mutasi</h4>
            <div className="grid grid-cols-2 gap-y-2 text-gray-600">
              <span>Keadaan Fisik Stok:</span>
              <span className="font-bold text-gray-800 text-right">
                {item.jumlah} &rarr;{' '}
                <span className={resultingStock > item.jumlah ? 'text-emerald-700' : resultingStock < item.jumlah ? 'text-rose-600' : 'text-gray-800'}>
                  {resultingStock} unit
                </span>
              </span>

              <span>Keadaan Kondisi:</span>
              <span className="font-bold text-gray-800 text-right">
                {item.kondisi} &rarr;{' '}
                <span className={kondisiSesudah === 'Baik' ? 'text-emerald-700' : kondisiSesudah === 'Rusak Ringan' ? 'text-amber-700' : 'text-red-700'}>
                  {kondisiSesudah}
                </span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-sans font-semibold text-xs text-gray-500 hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl font-sans font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Selesaikan &amp; Dokumentasikan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
