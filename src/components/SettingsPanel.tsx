/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { InventoryItem, MutationRecord } from '../types';

interface SettingsPanelProps {
  items: InventoryItem[];
  mutations: MutationRecord[];
  onImportBackup: (importedItems: InventoryItem[], importedMutations: MutationRecord[]) => void;
  onResetToMock: () => void;
  onClearAll: () => void;
  // Madrasah configuration
  madrasahName: string;
  onMadrasahNameChange: (name: string) => void;
}

export default function SettingsPanel({
  items,
  mutations,
  onImportBackup,
  onResetToMock,
  onClearAll,
  madrasahName,
  onMadrasahNameChange
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Trigger downloading full JSON backup
  const handleExportBackup = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      madrasahName,
      items,
      mutations
    };
    
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cadangan_SIMADRA_${madrasahName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process JSON backup uploads
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.mutations)) {
            // Apply backup
            onImportBackup(parsed.items, parsed.mutations);
            if (parsed.madrasahName) {
              onMadrasahNameChange(parsed.madrasahName);
            }
            setImportStatus({ success: true });
          } else {
            setImportStatus({ error: 'Format file tidak sesuai! Komponen cadangan .json tidak memiliki struktur "items" dan "mutations" yang valid.' });
          }
        } catch (err) {
          setImportStatus({ error: 'Gagal memproses file! Pastikan file adalah file cadangan JSON SIMADRA yang valid.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6" id="settings_panel">
      
      {/* 1. Profile Madrasah */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h2 className="font-sans font-bold text-gray-800 text-base mb-2">Identitas Sekolah / Madrasah</h2>
        <p className="text-xs text-gray-500 mb-4">
          Nama madrasah di bawah akan dicantumkan secara otomatis pada bagian kop surat/kop laporan Word, Excel, maupun PDF.
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Nama Lembaga Madrasah</label>
          <input
            type="text"
            value={madrasahName}
            onChange={(e) => onMadrasahNameChange(e.target.value)}
            placeholder="Contoh: MTs Al-Khairaat Bunyu"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition text-sm font-sans font-semibold text-gray-800"
          />
        </div>
      </div>

      {/* 2. Backup & Restore */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="pb-4 border-b border-gray-100 mb-6">
          <h2 className="font-sans font-bold text-gray-800 text-base">Amankan &amp; Cadangkan Data (Backup / Restore)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Unduh seluruh riwayat pergerakan mutasi dan koleksi aktif ke laptop/komputer Anda untuk diimpor kembali kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EXPORT BUTTON */}
          <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh Cadangan Database
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Kompilasi seluruh data inventaris dan mutasi ke satu file terenskripsi ringan (.json).
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-emerald-700 text-white font-sans text-xs font-bold py-2.5 rounded-lg hover:bg-emerald-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh File Cadangan (.json)
            </button>
          </div>

          {/* IMPORT BUTTON */}
          <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-700" />
                Pulihkan Cadangan
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Unggah kembali file cadangan .json yang pernah Anda unduh sebelumnya untuk restorasi database instan.
              </p>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white font-sans text-xs font-bold py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Unggah &amp; Pulihkan (.json)
            </button>
          </div>
        </div>

        {/* Import States Notifications */}
        {importStatus && (
          <div className="mt-4 animate-fade-in-rapid">
            {importStatus.success ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2.5 text-xs font-sans">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
                Database Berhasil Dipulihkan! Seluruh data aset terdaftar dan log mutasi berhasil diimpor dengan sempurna.
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-2.5 text-xs font-sans">
                <ShieldAlert className="w-5 h-5 text-rose-700 font-sans" />
                {importStatus.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Dangerous Area / Maintenance */}
      <div className="bg-red-50/40 border border-red-200/60 rounded-3xl p-6 shadow-sm">
        <h2 className="font-sans font-bold text-red-800 text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-700" />
          Zona Perawatan &amp; Reset Data
        </h2>
        <p className="text-xs text-red-650 mt-1 mb-6">
          Operasi di bawah bersifat tidak dapat dibatalkan. Harap berhati-hati sebelum menekan tombol pembersihan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Reset button */}
          <div className="flex-1 bg-white p-4 rounded-xl border border-red-100 flex flex-col justify-between items-start">
            <div className="mb-4">
              <h4 className="font-sans font-bold text-xs text-gray-800">Muat Ulang Demo Madrasah</h4>
              <p className="text-[10px] text-gray-500 mt-1">Mengembalikan isi database ke sekumpulan daftar aset madrasah peraga bawaan kami.</p>
            </div>
            
            {showConfirmReset ? (
              <div className="flex gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => { onResetToMock(); setShowConfirmReset(false); }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded cursor-pointer transition text-center"
                >
                  Ya, Reset!
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-[10px] py-1.5 rounded cursor-pointer transition text-center"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-700 font-sans text-xs font-semibold py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Ke Data Peraga
              </button>
            )}
          </div>

          {/* Wipe button */}
          <div className="flex-1 bg-white p-4 rounded-xl border border-red-100 flex flex-col justify-between items-start">
            <div className="mb-4">
              <h4 className="font-sans font-bold text-xs text-red-800">Bersihkan Seluruh Database</h4>
              <p className="text-[10px] text-gray-500 mt-1">Mengosongkan dan menghapus seluruh tabel aset inventaris serta log historis sekolahan.</p>
            </div>
            
            {showConfirmClear ? (
              <div className="flex gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => { onClearAll(); setShowConfirmClear(false); }}
                  className="flex-1 bg-red-800 hover:bg-red-900 text-white text-[10px] font-bold py-1.5 rounded cursor-pointer transition text-center"
                >
                  Ya, Bersihkan!
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-[10px] py-1.5 rounded cursor-pointer transition text-center"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-red-100 text-red-800 font-sans text-xs font-semibold py-2 rounded-lg hover:bg-red-200 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan Seluruh Data
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
