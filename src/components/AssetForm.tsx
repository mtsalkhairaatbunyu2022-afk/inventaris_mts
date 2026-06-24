/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CATEGORIES_LIST, CONDITIONS_LIST, FUNDING_SOURCES_LIST, InventoryItem, ItemCondition } from '../types';
import { Camera, Save, X, Trash2, Calendar, FileText, Info, Image as ImageIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';

interface AssetFormProps {
  itemToEdit?: InventoryItem | null;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'nomor'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function AssetForm({ itemToEdit, onSave, onCancel }: AssetFormProps) {
  const [namaBarang, setNamaBarang] = useState('');
  const [kategori, setKategori] = useState(CATEGORIES_LIST[0]);
  const [customKategori, setCustomKategori] = useState('');
  const [showCustomKategoriInput, setShowCustomKategoriInput] = useState(false);
  const [sumberDana, setSumberDana] = useState(FUNDING_SOURCES_LIST[0]);
  const [customSumberDana, setCustomSumberDana] = useState('');
  const [showCustomSumberDanaInput, setShowCustomSumberDanaInput] = useState(false);
  const [jumlah, setJumlah] = useState(1);
  const [kondisi, setKondisi] = useState<ItemCondition>('Baik');
  const [tanggalMutasi, setTanggalMutasi] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jenisPenggunaan, setJenisPenggunaan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [gambarUrl, setGambarUrl] = useState<string>('');
  
  const [showScanner, setShowScanner] = useState(false);

  // Load existing item details if editing
  useEffect(() => {
    if (itemToEdit) {
      setNamaBarang(itemToEdit.namaBarang);
      setJumlah(itemToEdit.jumlah);
      setKondisi(itemToEdit.kondisi);
      setTanggalMutasi(itemToEdit.tanggalMutasi);
      setLokasi(itemToEdit.lokasi || '');
      setJenisPenggunaan(itemToEdit.jenisPenggunaan || '');
      setKeterangan(itemToEdit.keterangan || '');
      setGambarUrl(itemToEdit.gambarUrl || '');
      
      if (CATEGORIES_LIST.includes(itemToEdit.kategori)) {
        setKategori(itemToEdit.kategori);
        setShowCustomKategoriInput(false);
      } else {
        setKategori('LAINNYA');
        setCustomKategori(itemToEdit.kategori);
        setShowCustomKategoriInput(true);
      }

      const itemSumber = itemToEdit.sumberDana || FUNDING_SOURCES_LIST[0];
      if (FUNDING_SOURCES_LIST.includes(itemSumber)) {
        setSumberDana(itemSumber);
        setShowCustomSumberDanaInput(false);
      } else {
        setSumberDana('LAINNYA');
        setCustomSumberDana(itemSumber);
        setShowCustomSumberDanaInput(true);
      }
    } else {
      setNamaBarang('');
      setKategori(CATEGORIES_LIST[0]);
      setCustomKategori('');
      setShowCustomKategoriInput(false);
      setSumberDana(FUNDING_SOURCES_LIST[0]);
      setCustomSumberDana('');
      setShowCustomSumberDanaInput(false);
      setJumlah(1);
      setKondisi('Baik');
      const today = new Date().toISOString().split('T')[0];
      setTanggalMutasi(today);
      setLokasi('');
      setJenisPenggunaan('');
      setKeterangan('');
      setGambarUrl('');
    }
  }, [itemToEdit]);

  const handleKategoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'LAINNYA') {
      setShowCustomKategoriInput(true);
    } else {
      setKategori(value);
      setShowCustomKategoriInput(false);
    }
  };

  const handleSumberDanaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'LAINNYA') {
      setShowCustomSumberDanaInput(true);
    } else {
      setSumberDana(value);
      setShowCustomSumberDanaInput(false);
    }
  };

  const handleImageCaptured = (dataUrl: string) => {
    setGambarUrl(dataUrl);
    setShowScanner(false);
  };

  const removePhoto = () => {
    setGambarUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) return;

    const finalKategori = showCustomKategoriInput ? (customKategori.trim() || 'Aset Lain-lain') : kategori;
    const finalSumberDana = showCustomSumberDanaInput ? (customSumberDana.trim() || 'Sumber Lainnya') : sumberDana;

    onSave({
      id: itemToEdit?.id,
      namaBarang: namaBarang.trim(),
      kategori: finalKategori,
      sumberDana: finalSumberDana,
      jumlah: Number(jumlah) || 0,
      kondisi: kondisi,
      tanggalMutasi: tanggalMutasi || new Date().toISOString().split('T')[0],
      lokasi: lokasi.trim(),
      jenisPenggunaan: jenisPenggunaan.trim(),
      keterangan: keterangan.trim(),
      gambarUrl: gambarUrl || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm" id="asset_form">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
        <h2 className="font-sans font-bold text-lg text-gray-800">
          {itemToEdit ? 'Ubah Informasi Barang / Aset' : 'Registrasi Barang / Aset Baru'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hand: Main Fields */}
        <div className="space-y-4">
          {/* Nama Barang */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 matches-label">
              Nama Lengkap Barang / Aset <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu LED Philips 18w, Lemari Berkas Guru"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Kategori Aset
              </label>
              <select
                value={showCustomKategoriInput ? 'LAINNYA' : kategori}
                onChange={handleKategoriChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
              >
                {CATEGORIES_LIST.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
                <option value="LAINNYA">+ Buat Kategori Baru...</option>
              </select>
            </div>

            {/* Sumber Dana */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Sumber Dana Aset
              </label>
              <select
                value={showCustomSumberDanaInput ? 'LAINNYA' : sumberDana}
                onChange={handleSumberDanaChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              >
                {FUNDING_SOURCES_LIST.map((source, i) => (
                  <option key={i} value={source}>{source}</option>
                ))}
                <option value="LAINNYA">+ Sumber Dana Lainnya...</option>
              </select>
            </div>
          </div>

          {/* Custom Kategori Input if selected */}
          {showCustomKategoriInput && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
              <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                Kategori Kustom Baru
              </label>
              <input
                type="text"
                placeholder="Tulis kategori baru di sini..."
                value={customKategori}
                onChange={(e) => setCustomKategori(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
              />
            </div>
          )}

          {/* Custom Sumber Dana Input if selected */}
          {showCustomSumberDanaInput && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
              <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                Sumber Dana Kustom Baru
              </label>
              <input
                type="text"
                placeholder="Contoh: Hibah Alumni Angkatan 2024, Sponsor..."
                value={customSumberDana}
                onChange={(e) => setCustomSumberDana(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jumlah */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Jumlah / Kuantitas Aset <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={jumlah}
                onChange={(e) => setJumlah(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kondisi Awal */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Kondisi Terkini
              </label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as ItemCondition)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              >
                {CONDITIONS_LIST.map((cond, i) => (
                  <option key={i} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Tanggal Terdaftar */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Tanggal Pencatatan
              </label>
              <input
                type="date"
                required
                value={tanggalMutasi}
                onChange={(e) => setTanggalMutasi(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans"
              />
            </div>
          </div>

          {/* Lokasi Ruangan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Lokasi Penempatan
            </label>
            <input
              type="text"
              placeholder="Contoh: Ruang Kepala Madrasah, Lab Bahasa, Kelas IX-B"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
            />
          </div>

          {/* Jenis Penggunaan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Jenis Penggunaan <span className="text-gray-400 font-normal lowercase">(fungsionalitas)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Administrasi Guru, Kegiatan Belajar Mengajar, Penunjang Seni"
              value={jenisPenggunaan}
              onChange={(e) => setJenisPenggunaan(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Catatan / Deskripsi Tambahan
            </label>
            <textarea
              rows={3}
              placeholder="Nomor barcode, nomor seri pabrik, ukuran spesifikasi, atau merk..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 resize-none"
            />
          </div>
        </div>

        {/* Right Hand: Image Scanning and Live Camera */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Gambar / Dukungan Visual Aset
          </label>

          {/* Image preview status */}
          {!showScanner && (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[180px] text-center relative overflow-hidden">
              {gambarUrl ? (
                <>
                  <img
                    src={gambarUrl}
                    alt="Preview Aset"
                    className="max-h-[160px] object-contain rounded-lg border border-gray-200 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition shadow-sm"
                    title="Ubah Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-green-700 font-medium mt-2 flex items-center gap-1.5">
                    ✓ Gambar aset berhasil ditautkan.
                  </p>
                </>
              ) : (
                <div className="p-4 w-full">
                  <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl border border-gray-100 shadow-sm mx-auto mb-3 text-gray-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-400 mb-4 max-w-[260px] leading-relaxed mx-auto">
                    Potret keadaan aset secara instan via Kamera, atau lewati jika komputer Anda tidak memiliki kamera dengan mengunggah gambar dari file lokal.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center items-center w-full max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Gunakan Kamera
                    </button>
                    
                    <label className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-sans text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      Pilih dari File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                handleImageCaptured(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Camera Scan Segment */}
          {showScanner && (
            <CameraCapture
              onImageCaptured={handleImageCaptured}
              currentImageUrl={gambarUrl}
              onClose={() => setShowScanner(false)}
            />
          )}

          {itemToEdit && (
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/70 flex items-start gap-2.5">
              <Info className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-800 leading-relaxed font-sans">
                <span className="font-semibold">Mencatat Mutasi Otomatis</span>: Menyunting informasi barang secara langsung akan memperbarui keadaan aset utama. Untuk mencatat pasokan masuk atau membuang barang rusak, disarankan memakai tombol <strong className="font-bold">"Mutasi" (+)</strong> di tabel untuk perekaman log bulanan yang akurat.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end border-t border-gray-100 mt-6 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl font-sans font-medium text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
        >
          Kembali
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl font-sans font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {itemToEdit ? 'Simpan Perubahan' : 'Registrasikan Barang'}
        </button>
      </div>
    </form>
  );
}
