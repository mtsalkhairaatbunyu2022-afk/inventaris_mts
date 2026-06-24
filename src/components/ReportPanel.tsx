/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, MutationRecord, CATEGORIES_LIST } from '../types';
import { FileDown, Calendar, FileText, CheckCircle2, AlertOctagon, HelpCircle, Search, Filter, Camera } from 'lucide-react';
import { formatIndoDate, exportToExcel, exportToPDF, exportToWord } from '../utils/exporter';

interface ReportPanelProps {
  items: InventoryItem[];
  mutations: MutationRecord[];
  madrasahName?: string;
}

const MONTHS_LIST = [
  { val: '01', label: 'Januari' },
  { val: '02', label: 'Februari' },
  { val: '03', label: 'Maret' },
  { val: '04', label: 'April' },
  { val: '05', label: 'Mei' },
  { val: '06', label: 'Juni' },
  { val: '07', label: 'Juli' },
  { val: '08', label: 'Agustus' },
  { val: '09', label: 'September' },
  { val: '10', label: 'Oktober' },
  { val: '11', label: 'November' },
  { val: '12', label: 'Desember' }
];

export default function ReportPanel({ items, mutations, madrasahName = 'MTs Al-Khairaat Bunyu' }: ReportPanelProps) {
  const currentYear = new Date().getFullYear();
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategory, setAssetCategory] = useState('SEMUA');
  const [assetCondition, setAssetCondition] = useState('SEMUA');
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  const yearsRange = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

  // Filter mutations matching the selected month and year
  const filteredMutations = mutations.filter(mut => {
    if (!mut.tanggal) return false;
    const parts = mut.tanggal.split('-'); // YYYY-MM-DD
    return parts[1] === selectedMonth && parseInt(parts[0], 10) === selectedYear;
  });

  // Grab the text label of selected month
  const monthLabel = MONTHS_LIST.find(m => m.val === selectedMonth)?.label || 'Bulan';
  const reportPeriodLabel = `${monthLabel} ${selectedYear}`;

  // Derive custom categories present in items but not standard list
  const customCategoriesInItems = Array.from(
    new Set(items.map(item => item.kategori).filter(cat => !CATEGORIES_LIST.includes(cat)))
  );

  // Filtering Logic for Asset items in report panel (matches AssetTable filtering)
  const filteredItemsList = items.filter(item => {
    const matchesSearch = item.namaBarang.toLowerCase().includes(assetSearch.toLowerCase()) || 
                          (item.lokasi && item.lokasi.toLowerCase().includes(assetSearch.toLowerCase())) ||
                          (item.jenisPenggunaan && item.jenisPenggunaan.toLowerCase().includes(assetSearch.toLowerCase())) ||
                          (item.keterangan && item.keterangan.toLowerCase().includes(assetSearch.toLowerCase()));
    
    const matchesCategory = assetCategory === 'SEMUA' || item.kategori === assetCategory;
    const matchesCondition = assetCondition === 'SEMUA' || item.kondisi === assetCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  // Export triggers
  const handleExcelExport = () => {
    exportToExcel(items, mutations, `Laporan_Inventaris_Madrasah_${monthLabel}_${selectedYear}`);
  };

  const handlePdfExport = () => {
    exportToPDF(items, reportPeriodLabel, madrasahName);
  };

  const handleWordExport = () => {
    exportToWord(items, reportPeriodLabel, madrasahName);
  };

  return (
    <div className="space-y-6" id="report_panel">
      
      {/* Target Period Selector */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm" id="report_period_selector">
        <h3 className="font-sans font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5 animate-pulse">
          <Calendar className="w-5 h-5 text-emerald-700" />
          Pilih Periode Laporan Bulanan
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 font-sans">Pilih Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans font-medium"
            >
              {MONTHS_LIST.map((m, i) => (
                <option key={i} value={m.val}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 font-sans">Pilih Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm text-gray-800 font-sans font-medium"
            >
              {yearsRange.map((y, i) => (
                <option key={i} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* download dashboard row */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm" id="export_panel_actions">
        <div className="text-center md:text-left md:flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
          <div>
            <h2 className="font-sans font-bold text-base text-gray-800">Unduh &amp; Cetak Berkas Administrasi</h2>
            <p className="text-xs text-gray-500 mt-1">
              Unduh laporan rekapitulasi data keadaan aset periode <span className="font-semibold text-emerald-800">{reportPeriodLabel}</span>.
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block font-sans">
            Total {items.length} Aset Terdata
          </div>
        </div>

        {/* 3 Large Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="export_buttons_grid">
          {/* WORD ACTION */}
          <button
            type="button"
            onClick={handleWordExport}
            className="group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 p-5 rounded-2xl text-left cursor-pointer transition shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                <FileDown className="w-6 h-6" />
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-sans">WORD (DOC)</span>
            </div>
            <div className="mt-5">
              <h4 className="font-sans font-bold text-sm text-gray-800">Ekspor Dokumen Word</h4>
              <p className="text-[11px] text-gray-500 mt-1 font-sans">Ekspor data lengkap beserta foto base64 yang siap diedit di MS Word secara offline.</p>
            </div>
          </button>

          {/* EXCEL ACTION */}
          <button
            type="button"
            onClick={handleExcelExport}
            className="group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 p-5 rounded-2xl text-left cursor-pointer transition shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="p-3 bg-emerald-100 text-emerald-750 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <FileDown className="w-6 h-6" />
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-sans">EXCEL (XLSX)</span>
            </div>
            <div className="mt-5">
              <h4 className="font-sans font-bold text-sm text-gray-800">Ekspor Spreadsheet Excel</h4>
              <p className="text-[11px] text-gray-500 mt-1 font-sans">Simpan riwayat mutasi mutakhir dan database aset ke format biner *.xlsx modern.</p>
            </div>
          </button>

          {/* PDF ACTION */}
          <button
            type="button"
            onClick={handlePdfExport}
            className="group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 duration-200 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 p-5 rounded-2xl text-left cursor-pointer transition shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="p-3 bg-rose-100 text-rose-700 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition">
                <FileDown className="w-6 h-6" />
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded font-sans font-semibold">PDF FORMAT</span>
            </div>
            <div className="mt-5">
              <h4 className="font-sans font-bold text-sm text-gray-800">Cetak Dokumen PDF</h4>
              <p className="text-[11px] text-gray-500 mt-1 font-sans">Keluarkan berkas laporan resmi bersampul hijau madrasah dengan kolom tanda tangan terlampir.</p>
            </div>
          </button>
        </div>
      </div>

      {/* TABLE DATA ENTRI (CURRENT INVENTORY ACTIVE ITEMS) - EXACT DUPLICATE FORMAT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm" id="report_assets_entries_block">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-gray-100 mb-6 gap-3">
          <div>
            <h3 className="font-sans font-bold text-sm text-gray-850 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              Tabel Keadaan Aset Madrasah Saat Ini (Data Entri)
            </h3>
            <p className="text-xs text-gray-550 mt-1">
              Pratinjau seluruh baris barang terdaftar yang akan dicetak/diekspor ke dalam laporan bulan <span className="font-bold text-emerald-800">{reportPeriodLabel}</span>.
            </p>
          </div>
        </div>

        {/* Filters Bar (Identical to AssetTable UI) */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6" id="report_table_filter_bar">
          
          {/* Search */}
          <div className="relative w-full xl:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari barang, lokasi penempatan, atau deskripsi..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-xs text-gray-800"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto justify-end">
            
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-gray-750 font-sans"
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
                value={assetCondition}
                onChange={(e) => setAssetCondition(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-gray-750 font-sans"
              >
                <option value="SEMUA">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Items Table */}
        {filteredItemsList.length === 0 ? (
          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
            <p className="text-xs font-sans font-medium mb-1">Data barang tidak ditemukan</p>
            <p className="text-[11px] text-gray-400 font-sans">Cobalah kata kunci pencarian yang lain atau sesuaikan filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-xs">
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
                  <th className="py-4 px-4 text-center rounded-r-xl">Gambar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItemsList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 group transition duration-150">
                    
                    {/* column 1: NOMOR */}
                    <td className="py-4 px-4 font-bold text-gray-400 text-center">{idx + 1}</td>
                    
                    {/* column 2: NAMA BARANG */}
                    <td className="py-4 px-4 font-bold text-gray-800 break-words group-hover:text-emerald-855 transition">
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
                          <Camera className="w-4.5 h-4.5 stroke-[1.2]" />
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Laporan Mutasi Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm" id="report_mutations_block">
        <h3 className="font-sans font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5 pb-3 border-b border-gray-100">
          <FileText className="w-4 h-4 text-emerald-700" />
          Rincian Mutasi Barang - {reportPeriodLabel}
        </h3>

        {filteredMutations.length === 0 ? (
          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs leading-relaxed max-w-[280px] mx-auto font-sans">
              Tidak ada catatan mutasi barang yang didaftarkan secara berkala pada periode <span className="font-semibold text-gray-600">{reportPeriodLabel}</span>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4 text-center">Jumlah Perubahan</th>
                  <th className="py-3 px-4 text-center">Sisa Stok</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4 rounded-r-xl">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMutations.map((mut, idx) => (
                  <tr key={mut.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-600 whitespace-nowrap">{formatIndoDate(mut.tanggal)}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{mut.namaBarang}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mut.tipe === 'MASUK' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : mut.tipe === 'KELUAR' 
                            ? 'bg-rose-100 text-rose-800'
                            : mut.tipe === 'KONDISI_BERUBAH'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                      }`}>
                        {mut.tipe === 'MASUK' ? '📥 BARANG MASUK' : mut.tipe === 'KELUAR' ? '📤 BARANG KELUAR' : mut.tipe === 'KONDISI_BERUBAH' ? '🔄 KONDISI' : '📝 SUNTING'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-center font-bold font-mono ${
                      mut.jumlahPerubahan > 0 ? 'text-emerald-600' : mut.jumlahPerubahan < 0 ? 'text-rose-600' : 'text-gray-400'
                    }`}>
                      {mut.jumlahPerubahan > 0 ? `+${mut.jumlahPerubahan}` : mut.jumlahPerubahan}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-gray-700">
                      {mut.jumlahSesudah}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className={`w-2 h-2 rounded-full ${
                          mut.kondisiSesudah === 'Baik' ? 'bg-emerald-500' : mut.kondisiSesudah === 'Rusak Ringan' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="font-semibold text-gray-700">{mut.kondisiSesudah}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={mut.keterangan}>
                      {mut.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white px-3 py-1.5 rounded-full transition cursor-pointer font-bold text-xs"
              onClick={() => setActiveImagePreview(null)}
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
