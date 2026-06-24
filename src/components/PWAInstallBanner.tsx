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
    return null; // Don't show anything if already native
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in" id="pwa_native_prompt">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Visual Brand Header */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-3xl p-1.5 shadow-xl mb-4 border border-emerald-100 transform rotate-3">
              <img 
                src="/icon-512.jpg" 
                alt="Logo SIMADRA" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <h3 className="text-white font-sans font-bold text-xl tracking-tight">SIMADRA</h3>
            <p className="text-emerald-100 text-xs font-medium mt-1">Sistem Informasi Aset Madrasah</p>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">Mode Aplikasi Native</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">Jalankan aplikasi tanpa ribon browser. Nikmati tampilan layar penuh dan akses lebih cepat.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">Keamanan & Performa</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">Data tetap tersimpan aman di perangkat Anda. Mendukung penggunaan tanpa koneksi internet.</p>
              </div>
            </div>
          </div>

          {installingState === 'installing' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-widest">
                <span>Mengintegrasikan Sistem...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={deferredPrompt ? handleInstallClick : simulateInstallation}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-2xl font-sans font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Download className="w-5 h-5" />
                PASANG SEKARANG
              </button>
              
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-sans font-bold text-xs transition flex items-center justify-center gap-2"
              >
                Lanjutkan via Browser
              </button>
            </div>
          )}

          {showGuide && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Panduan Manual</span>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  {isIOS 
                    ? "Ketuk ikon 'Bagikan' (Share) di bawah, lalu pilih 'Tambah ke Layar Utama' (Add to Home Screen) untuk menginstal di iPhone/iPad."
                    : "Jika tombol otomatis gagal, buka menu browser (titik tiga) lalu pilih 'Instal Aplikasi' atau 'Tambahkan ke Layar Utama'."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
