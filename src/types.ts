/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface InventoryItem {
  id: string;
  nomor: number; // For sequential table displays
  namaBarang: string;
  kategori: string;
  sumberDana?: string; // Optional: e.g. Dana BOS, Komite, Yayasan
  jumlah: number;
  kondisi: ItemCondition;
  tanggalMutasi: string; // YYYY-MM-DD
  gambarUrl?: string; // Base64 data-URL or local image
  lokasi?: string; // Optional: e.g. Kelas VII-A, Kantor, Lab IPA
  jenisPenggunaan?: string; // Optional: e.g. Administrasi Guru, Kegiatan Belajar Mengajar
  keterangan?: string; // Optional: notes
}

export type MutationType = 'MASUK' | 'KELUAR' | 'KONDISI_BERUBAH' | 'EDIT_DATA';

export interface MutationRecord {
  id: string;
  itemId: string;
  namaBarang: string;
  tipe: MutationType;
  tanggal: string; // YYYY-MM-DD
  jumlahPerubahan: number; // e.g., +5 or -2 (can be 0 for just condition updates)
  jumlahSebelum: number;
  jumlahSesudah: number;
  kondisiSebelum: ItemCondition;
  kondisiSesudah: ItemCondition;
  keterangan: string; // Notes about why mutate
}

export interface MonthlySummary {
  itemId: string;
  namaBarang: string;
  kategori: string;
  awalJumlah: number;
  awalKondisi: ItemCondition;
  akhirJumlah: number;
  akhirKondisi: ItemCondition;
  masuk: number;
  keluar: number;
  tanggalMutasiTerbaru: string;
}

export const CATEGORIES_LIST = [
  'Peralatan Kelas',
  'Alat Elektronik & TIK',
  'Meubeler (Meja & Kursi)',
  'Buku & Alat Tulis Kantor',
  'Perlengkapan Olahraga',
  'Peralatan Laboratorium',
  'Perlengkapan Masjid/Mushola',
  'Aset Umum Madrasah'
];

export const FUNDING_SOURCES_LIST = [
  'Dana BOS (Bantuan Operasional Sekolah)',
  'Dana Komite / Orang Tua',
  'Dana Yayasan',
  'Sumbangan / Hibah Pemerintah',
  'Wakaf / Hibah Perorangan',
  'Kas Madrasah'
];

export const CONDITIONS_LIST: ItemCondition[] = ['Baik', 'Rusak Ringan', 'Rusak Berat'];
