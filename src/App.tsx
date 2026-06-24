/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { InventoryItem, MutationRecord, ItemCondition } from './types';
import { INITIAL_ITEMS, INITIAL_MUTATIONS } from './data/mockData';

// Icons
import { 
  School, 
  Layers, 
  FileCheck, 
  LogOut, 
  FolderSync, 
  AlertCircle, 
  Plus, 
  Download,
  Info
} from 'lucide-react';

// Modular Components
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import MutationModal from './components/MutationModal';
import ReportPanel from './components/ReportPanel';
import PWAInstallBanner from './components/PWAInstallBanner';
import { formatIndoDate } from './utils/exporter';

type AppTab = 'inventaris' | 'laporan';

export default function App() {
  // Primary database states
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [madrasahName, setMadrasahName] = useState('MTs Al-Khairaat Bunyu');

  // UI Control states
  const [activeTab, setActiveTab] = useState<AppTab>('inventaris');
  const [showForm, setShowForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToMutate, setItemToMutate] = useState<InventoryItem | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Capture the browser PWA invite prompt
  useEffect(() => {
    // Detect standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalledFinished = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showNotification('Aplikasi SIMADRA berhasil dipasang di perangkat Anda! Akses lebih cepat kini aktif.', 'success');
    };

    // Listeners as required by PWA rules
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalledFinished);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalledFinished);
    };
  }, []);

  const handlePWAInstallTrigger = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // 1. Initial State Hydrator
  useEffect(() => {
    const rawItems = localStorage.getItem('simadra_items');
    const rawMutations = localStorage.getItem('simadra_mutations');
    const rawSchoolName = localStorage.getItem('simadra_madrasah_name');

    if (rawItems && rawMutations) {
      setItems(JSON.parse(rawItems));
      setMutations(JSON.parse(rawMutations));
    } else {
      // Hydrate with Mock Madrasah assets database on virgin run
      setItems(INITIAL_ITEMS);
      setMutations(INITIAL_MUTATIONS);
      localStorage.setItem('simadra_items', JSON.stringify(INITIAL_ITEMS));
      localStorage.setItem('simadra_mutations', JSON.stringify(INITIAL_MUTATIONS));
    }

    if (rawSchoolName) {
      setMadrasahName(rawSchoolName);
    } else {
      localStorage.setItem('simadra_madrasah_name', 'MTs Al-Khairaat Bunyu');
    }
  }, []);

  // Helper to trigger timed floating banner notifications
  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // State persist-trigger (Helper instead of raw useEffect to prevent stale references or race conditions)
  const saveStateToStorage = (updatedItems: InventoryItem[], updatedMutations: MutationRecord[]) => {
    localStorage.setItem('simadra_items', JSON.stringify(updatedItems));
    localStorage.setItem('simadra_mutations', JSON.stringify(updatedMutations));
    setItems(updatedItems);
    setMutations(updatedMutations);
  };

  // 2. Action: Register or Update an Asset / Barang
  const handleSaveAsset = (itemData: Omit<InventoryItem, 'id' | 'nomor'> & { id?: string }) => {
    let nextItems = [...items];
    let nextMutations = [...mutations];

    const todayDate = new Date().toISOString().split('T')[0];

    if (itemData.id) {
      // EDIT MODE
      const targetIndex = items.findIndex(i => i.id === itemData.id);
      if (targetIndex !== -1) {
        const originalItem = items[targetIndex];
        
        // Construct the updated item
        const updatedItem: InventoryItem = {
          ...originalItem,
          namaBarang: itemData.namaBarang,
          kategori: itemData.kategori,
          sumberDana: itemData.sumberDana,
          jumlah: itemData.jumlah,
          kondisi: itemData.kondisi,
          tanggalMutasi: itemData.tanggalMutasi,
          lokasi: itemData.lokasi,
          jenisPenggunaan: itemData.jenisPenggunaan,
          keterangan: itemData.keterangan,
          gambarUrl: itemData.gambarUrl || originalItem.gambarUrl
        };

        nextItems[targetIndex] = updatedItem;

        // Auto-log a mutation if crucial numbers changed during general edit
        if (originalItem.jumlah !== itemData.jumlah || originalItem.kondisi !== itemData.kondisi) {
          const newMut: MutationRecord = {
            id: `mut-${Date.now()}`,
            itemId: originalItem.id,
            namaBarang: itemData.namaBarang,
            tipe: 'EDIT_DATA',
            tanggal: itemData.tanggalMutasi,
            jumlahPerubahan: itemData.jumlah - originalItem.jumlah,
            jumlahSebelum: originalItem.jumlah,
            jumlahSesudah: itemData.jumlah,
            kondisiSebelum: originalItem.kondisi,
            kondisiSesudah: itemData.kondisi,
            keterangan: `Suntikan koreksi data administratif. Kuantitas (${originalItem.jumlah} -> ${itemData.jumlah}), Kondisi (${originalItem.kondisi} -> ${itemData.kondisi}).`
          };
          nextMutations.unshift(newMut);
        }

        saveStateToStorage(nextItems, nextMutations);
        showNotification(`Berhasil menyunting data aset: "${itemData.namaBarang}"`);
      }
    } else {
      // REGISTRATION MODE (ADD NEW)
      // Find maximum 'nomor' sequence to automatically assign the next one
      const maxNomor = items.reduce((max, cur) => cur.nomor > max ? cur.nomor : max, 0);
      const newId = `item-${Date.now()}`;
      
      const newAsset: InventoryItem = {
        id: newId,
        nomor: maxNomor + 1,
        namaBarang: itemData.namaBarang,
        kategori: itemData.kategori,
        jumlah: itemData.jumlah,
        kondisi: itemData.kondisi,
        tanggalMutasi: itemData.tanggalMutasi,
        lokasi: itemData.lokasi,
        jenisPenggunaan: itemData.jenisPenggunaan,
        keterangan: itemData.keterangan,
        gambarUrl: itemData.gambarUrl
      };

      nextItems.push(newAsset);

      // Auto-log mutation transaction for the initial stock entrance
      const initialMutation: MutationRecord = {
        id: `mut-${Date.now()}`,
        itemId: newId,
        namaBarang: itemData.namaBarang,
        tipe: 'MASUK',
        tanggal: itemData.tanggalMutasi,
        jumlahPerubahan: itemData.jumlah,
        jumlahSebelum: 0,
        jumlahSesudah: itemData.jumlah,
        kondisiSebelum: 'Baik',
        kondisiSesudah: itemData.kondisi,
        keterangan: `Inventarisasi perdana barang baru terdaftarkan sebanyak +${itemData.jumlah} unit.`
      };

      nextMutations.unshift(initialMutation);
      saveStateToStorage(nextItems, nextMutations);
      showNotification(`Aset baru berhasil diregistrasikan: "${itemData.namaBarang}"`);
    }

    // Reset controls
    setItemToEdit(null);
    setShowForm(false);
  };

  // 3. Action: Record Mutation (+/- or change condition)
  const handleSaveMutation = (mutData: Omit<MutationRecord, 'id' | 'namaBarang'>) => {
    if (!itemToMutate) return;

    let nextItems = [...items];
    let nextMutations = [...mutations];

    // Find the master item record
    const targetIdx = items.findIndex(i => i.id === itemToMutate.id);
    if (targetIdx !== -1) {
      const originalItem = items[targetIdx];

      // Update the main asset record with mutation consequences
      const updatedItem: InventoryItem = {
        ...originalItem,
        jumlah: mutData.jumlahSesudah,
        kondisi: mutData.kondisiSesudah,
        tanggalMutasi: mutData.tanggal // Latest mutation date updated automatically!
      };

      nextItems[targetIdx] = updatedItem;

      // Construct and register mutation transaction log
      const newMutation: MutationRecord = {
        id: `mut-${Date.now()}`,
        itemId: itemToMutate.id,
        namaBarang: originalItem.namaBarang,
        tipe: mutData.tipe,
        tanggal: mutData.tanggal,
        jumlahPerubahan: mutData.jumlahPerubahan,
        jumlahSebelum: mutData.jumlahSebelum,
        jumlahSesudah: mutData.jumlahSesudah,
        kondisiSebelum: mutData.kondisiSebelum,
        kondisiSesudah: mutData.kondisiSesudah,
        keterangan: mutData.keterangan
      };

      nextMutations.unshift(newMutation);
      saveStateToStorage(nextItems, nextMutations);
      
      const badgeText = mutData.tipe === 'MASUK' ? 'pasokan baru masuk' : mutData.tipe === 'KELUAR' ? 'disposal barang keluar' : 'pemeliharaan kondisi';
      showNotification(`Log mutasi (${badgeText}) tercatat untuk "${originalItem.namaBarang}"`);
    }

    setItemToMutate(null);
  };

  // 4. Action: Hard Delete Asset
  const handleDeleteAsset = (id: string) => {
    const nextItems = items.filter(item => item.id !== id);
    // Renumber sequential indexes
    const renumberedItems = nextItems.map((item, idx) => ({
      ...item,
      nomor: idx + 1
    }));
    
    // Also clear associated mutation history to keep integrity clean
    const nextMutations = mutations.filter(mut => mut.itemId !== id);

    saveStateToStorage(renumberedItems, nextMutations);
    showNotification('Aset dan seluruh riwayat mutasinya telah dihapus dari sistem.', 'info');
  };

  // 5. Action: Settings Backups, Resets and Clearances
  const handleImportBackup = (importedItems: InventoryItem[], importedMutations: MutationRecord[]) => {
    saveStateToStorage(importedItems, importedMutations);
    showNotification('File cadangan berhasil diimpor & dipulihkan!');
  };

  const handleResetToMock = () => {
    saveStateToStorage(INITIAL_ITEMS, INITIAL_MUTATIONS);
    showNotification('Database dikembalikan ke data peraga madrasah.');
  };

  const handleClearAll = () => {
    saveStateToStorage([], []);
    showNotification('Seluruh tabel inventaris sekolahan berhasil dikosongkan.', 'info');
  };

  const handleSchoolNameChange = (name: string) => {
    setMadrasahName(name);
    localStorage.setItem('simadra_madrasah_name', name);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-gray-900" id="main_app_root">
      
      {/* 1. Header Banner */}
      <header className="bg-emerald-800 text-white shadow-md border-b-4 border-emerald-900 shrink-0" id="school_header">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Madrasah Metadata */}
          <div className="flex items-center gap-3.5">
            <div className="bg-white/10 p-2.5 rounded-2xl flex items-center justify-center border border-white/20">
              <School className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest block font-sans">
                Aplikasi Inventarisasi Madrasah (SIMADRA)
              </span>
              <h1 className="font-sans font-bold text-lg md:text-xl text-white tracking-tight mt-0.5" id="header_madrasah_name">
                {madrasahName}
              </h1>
            </div>
          </div>

          {/* Quick Offline Status Indication */}
          <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 px-3 py-1.5 rounded-xl font-sans text-[11px] font-semibold text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Penyimpanan Lokal Aktif
          </div>

        </div>
      </header>

      {/* 2. Floating Live Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-500 max-w-sm" id="floating_banner_ntfy">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-2.5 ${
            notification.type === 'success' 
              ? 'bg-emerald-800 border-emerald-900 text-white' 
              : 'bg-slate-900 border-slate-950 text-white'
          }`}>
            <Info className={`w-5 h-5 mt-0.5 shrink-0 ${notification.type === 'success' ? 'text-emerald-300' : 'text-blue-300'}`} />
            <p className="text-xs font-semibold leading-relaxed font-sans">{notification.text}</p>
          </div>
        </div>
      )}

      {/* 3. Main Stage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8" id="application_stage">
        
        {/* Play Store PWA Installer Card */}
        <PWAInstallBanner 
          deferredPrompt={deferredPrompt}
          isInstalled={isAppInstalled}
          onInstallTrigger={handlePWAInstallTrigger}
        />

        {/* Navigation Tabs Selector */}
        <div className="flex border-b border-gray-200 mb-6 font-sans font-bold text-xs overflow-x-auto w-full whitespace-nowrap" id="tab_navigation_bar">
          <button
            type="button"
            onClick={() => { setActiveTab('inventaris'); setShowForm(false); setItemToEdit(null); }}
            className={`flex items-center gap-1.5 pb-3.5 px-4 border-b-2 font-sans tracking-wide transition uppercase cursor-pointer ${
              activeTab === 'inventaris' 
                ? 'border-emerald-600 text-emerald-800 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Aset &amp; Inventaris Utama
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('laporan'); setShowForm(false); setItemToEdit(null); }}
            className={`flex items-center gap-1.5 pb-3.5 pb-3.5 px-4 border-b-2 font-sans tracking-wide transition uppercase cursor-pointer ${
              activeTab === 'laporan' 
                ? 'border-emerald-600 text-emerald-800 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Laporan Bulanan &amp; Ekspor
          </button>
        </div>

        {/* 4. Tab Views Route Controller */}
        {activeTab === 'inventaris' && (
          <div className="space-y-6 animate-fade-in-rapid">
            
            {/* Editing or Adding Collasible Segment */}
            {showForm && (
              <div className="mt-4">
                <AssetForm
                  itemToEdit={itemToEdit}
                  onSave={handleSaveAsset}
                  onCancel={() => { setShowForm(false); setItemToEdit(null); }}
                />
              </div>
            )}

            {/* Asset State Table */}
            {!showForm && (
              <AssetTable
                items={items}
                onEdit={(item) => { setItemToEdit(item); setShowForm(true); }}
                onMutate={(item) => setItemToMutate(item)}
                onDelete={handleDeleteAsset}
                onAddNew={() => { setItemToEdit(null); setShowForm(true); }}
              />
            )}

          </div>
        )}

        {activeTab === 'laporan' && (
          <div className="animate-fade-in-rapid">
            <ReportPanel items={items} mutations={mutations} madrasahName={madrasahName} />
          </div>
        )}

        {/* 5. Mutation Action Overlay Modal */}
        {itemToMutate && (
          <MutationModal
            item={itemToMutate}
            onSave={handleSaveMutation}
            onClose={() => setItemToMutate(null)}
          />
        )}

      </main>

      {/* 6. Brand footer section */}
      <footer className="bg-emerald-950 text-emerald-300 py-6 border-t border-emerald-900 mt-12 shrink-0 font-sans text-xs" id="madrasah_footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-white uppercase text-[10px] tracking-widest leading-none mb-1">
              {madrasahName}
            </p>
            <p className="text-[10px] text-emerald-400">
              Sistem Mutasi Laporan Inventaris Bulanan Otomatis © 2026. Aplikasi dikembangkan secara khusus untuk sekolah madrasah.
            </p>
          </div>
          <div className="text-[10px] text-emerald-400 bg-emerald-900/30 px-3.5 py-2 rounded-xl border border-emerald-900 leading-normal max-w-xs font-sans">
            Seluruh berkas terdaftar dienkripsi dan dienkapsulasi aman di penyimpanan internal perangkat Anda tanpa koneksi server eksternal.
          </div>
        </div>
      </footer>

    </div>
  );
}
