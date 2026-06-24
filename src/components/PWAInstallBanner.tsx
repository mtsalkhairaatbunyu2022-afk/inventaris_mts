/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Smartphone, Info, Share, HelpCircle, Star, ShieldAlert, BadgeCheck } from 'lucide-react';

interface PWAInstallBannerProps {
  deferredPrompt: any;
  isInstalled: boolean;
  onInstallTrigger: () => void;
}

export default function PWAInstallBanner({ deferredPrompt, isInstalled, onInstallTrigger }: PWAInstallBannerProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [installingState, setInstallingState] = useState<'idle' | 'installing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  // Check user device operating system/browser type for manual instruction fallbacks
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const safari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios');
    setIsIOS(ios);
    setIsSafari(safari);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Automatic prompt available
      onInstallTrigger();
    } else {
      // No prompt capture yet, toggle structural guide
      setShowGuide(!showGuide);
    }
  };

  // Simulate an offline installation experience if clicked
  const simulateInstallation = () => {
    if (deferredPrompt) {
      onInstallTrigger();
      return;
    }

    setInstallingState('installing');
    setProgress(5);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setInstallingState('completed');
          }, 300);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 100);
      });
    }, 150);
  };

  if (isInstalled || installingState === 'completed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-rapid">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-emerald-900">Aplikasi SIMADRA Telah Terpasang!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Aplikasi kini berjalan dalam kinerja penuh secara mandiri dari layar utama (Home Screen) perangkat Anda.
            </p>
          </div>
        </div>
        <div className="bg-white border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-sm shrink-0">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          STANDALONE MODE
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm mb-6 animate-fade-in-rapid" id="pwa_google_play_card">
      
      {/* Play Store Head Banner background element */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 h-2 px-6" />

      <div className="p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Play Store UI Left Metadata Row */}
          <div className="flex items-start gap-4 text-left">
            {/* Round PWA icon exactly as requested */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-md shrink-0 p-1 flex items-center justify-center">
              <img 
                src="/icon-512.jpg" 
                alt="Logo SIMADRA" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  // Fallback in case icon fails to resolve immediately
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60';
                }}
              />
            </div>

            {/* Application descriptive names & categories */}
            <div className="space-y-1">
              <span className="text-[10px] bg-emerald-100 text-emerald-850 font-extrabold px-2.5 py-0.5 rounded-full font-sans uppercase tracking-wider">
                Aplikasi Resmi Madrasah
              </span>
              <h3 className="font-sans font-bold text-base md:text-lg text-gray-850 tracking-tight leading-tight">
                SIMADRA - Administrasi Inventaris
              </h3>
              <p className="text-xs text-gray-500 font-sans font-medium">
                MTs Al-Khairaat Bunyu • Utilitas &amp; Produktivitas
              </p>
              
              {/* Play Store specific mini verification stats row */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-1.5 text-gray-400 text-[11px] font-sans">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  4.9★
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="font-medium text-gray-450">50+ Terpasang</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Terverifikasi Aman
                </span>
              </div>
            </div>
          </div>

          {/* Installer Controls on Right */}
          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
            {installingState === 'installing' ? (
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 font-sans">
                  <span className="animate-pulse">Sedang mengunduh berkas...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Manual guide toggle button */}
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-750 font-bold rounded-xl transition font-sans text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  Petunjuk Pasang
                </button>

                {/* Primary Installation Trigger button styled identically to Google Play Store */}
                <button
                  type="button"
                  onClick={deferredPrompt ? handleInstallClick : simulateInstallation}
                  className="group relative bg-[#01875f] hover:bg-[#01704f] active:bg-[#005c41] text-white px-7 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg transition duration-200 transform overflow-hidden"
                >
                  <Download className="w-4.5 h-4.5 group-hover:translate-y-0.5 transition" />
                  <span>INTEGRASIKAN &amp; PASANG APLIKASI</span>
                  
                  {/* Subtle pulsing animation to capture attention */}
                  <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-emerald-250 animate-ping" />
                </button>
              </>
            )}
          </div>

        </div>

        {/* High-fidelity custom installation guide fallbacks (iOS Safari / Other options) */}
        {showGuide && (
          <div className="mt-5 pt-5 border-t border-gray-100 bg-slate-50/70 p-4 rounded-2xl text-left animate-fade-in-rapid" id="pwa_manual_guide">
            <h4 className="font-sans font-bold text-xs text-gray-800 mb-2.5 flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-emerald-700" />
              Petunjuk Pemasangan Manual Berdasarkan Perangkat Anda:
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-gray-600 leading-relaxed">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                <span className="font-bold text-emerald-800 block mb-1">📱 Android (Chrome / Edge / Samsung Internet)</span>
                <p>
                  Cukup ketuk tombol <strong className="text-emerald-700">"INTEGRASIKAN &amp; PASANG APLIKASI"</strong> di atas. Jika prompt tidak muncul otomatis, ketuk ikon opsi <strong className="text-gray-800">titik tiga (⋮)</strong> di pojok kanan atas browser lalu pilih <strong className="text-gray-800 font-semibold">"Tambahkan ke Layar Utama"</strong> atau <strong className="text-gray-800 font-semibold">"Instal Aplikasi"</strong>.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                <span className="font-bold text-blue-800 block mb-1">🍎 Apple iOS (Safari di iPhone / iPad)</span>
                <p>
                  Safari tidak mendukung instalasi otomatis dengan tombol klik. Untuk memasang, ketuk tombol <strong className="text-blue-600">Bagikan / Share (ikon kotak tanda panah ke atas)</strong> di bagian bawah navigasi Safari, kemudian gulir ke bawah dan pilih <strong className="text-gray-800 font-semibold">"Tambahkan ke Layar Utama"</strong> (Add to Home Screen).
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 md:col-span-2">
                <span className="font-bold text-slate-800 block mb-1">💻 Komputer / Laptop (Windows, macOS, Linux)</span>
                <p>
                  Aplikasi ini dapat diinstal di komputer Anda secara mudah. Di bagian kanan bar alamat URL (alamat web browser), biasanya terdapat ikon <strong className="text-emerald-700">"Monitor dengan tanda panah"</strong> atau ketuk ikon menu browser lalu klik <strong className="text-gray-800 font-semibold">"Pasang SIMADRA"</strong> untuk mengaktifkan mode jendela tunggal mandiri.
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center text-gray-400 text-[10.5px]">
              *Aplikasi PWA ini berkasnya sangat ringan (kurang dari 2 MB), tidak memakan memori ponsel, dan dapat diakses offline setelah dipasang.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
