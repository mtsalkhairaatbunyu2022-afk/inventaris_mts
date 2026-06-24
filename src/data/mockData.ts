/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, MutationRecord } from '../types';

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    nomor: 1,
    namaBarang: 'Meja Kayu Guru',
    kategori: 'Meubeler (Meja & Kursi)',
    sumberDana: 'Sumbangan / Hibah Pemerintah',
    jumlah: 15,
    kondisi: 'Baik',
    tanggalMutasi: '2026-06-01',
    lokasi: 'Ruang Guru & Kelas',
    jenisPenggunaan: 'Administrasi Guru',
    keterangan: 'Kayu jati kokoh, bantuan Pemprov DKI 2024'
  },
  {
    id: 'item-2',
    nomor: 2,
    namaBarang: 'Kursi Belajar Siswa',
    kategori: 'Meubeler (Meja & Kursi)',
    sumberDana: 'Dana BOS (Bantuan Operasional Sekolah)',
    jumlah: 120,
    kondisi: 'Baik',
    tanggalMutasi: '2026-06-12',
    lokasi: 'Ruang Kelas VII, VIII, IX',
    jenisPenggunaan: 'Kegiatan Belajar Mengajar',
    keterangan: 'Bahan besi-kayu lipat'
  },
  {
    id: 'item-3',
    nomor: 3,
    namaBarang: 'Proyektor Epson EB-X500',
    kategori: 'Alat Elektronik & TIK',
    sumberDana: 'Dana BOS (Bantuan Operasional Sekolah)',
    jumlah: 4,
    kondisi: 'Baik',
    tanggalMutasi: '2026-05-18',
    lokasi: 'Laboratorium & Kelas',
    jenisPenggunaan: 'Media Pembelajaran Digital',
    keterangan: 'Lengkap dengan tripod screen'
  },
  {
    id: 'item-4',
    nomor: 4,
    namaBarang: 'Komputer Asus Core i5 (Lab)',
    kategori: 'Alat Elektronik & TIK',
    sumberDana: 'Dana BOS (Bantuan Operasional Sekolah)',
    jumlah: 15,
    kondisi: 'Baik',
    tanggalMutasi: '2026-06-20',
    lokasi: 'Ruang Komputer / Lab TIK',
    jenisPenggunaan: 'Praktikum Komputer / TIK',
    keterangan: 'Pengadaan BOS Madrasah'
  },
  {
    id: 'item-5',
    nomor: 5,
    namaBarang: 'Al-Qur\'an Juz Amma Sinar Baru',
    kategori: 'Perlengkapan Masjid/Mushola',
    sumberDana: 'Wakaf / Hibah Perorangan',
    jumlah: 80,
    kondisi: 'Baik',
    tanggalMutasi: '2026-06-15',
    lokasi: 'Mushola Baburrahman',
    keterangan: 'Wakaf dari donatur'
  },
  {
    id: 'item-6',
    nomor: 6,
    namaBarang: 'Buku Paket Fiqih Kelas VIII (Kemenag)',
    kategori: 'Buku & Alat Tulis Kantor',
    sumberDana: 'Dana Yayasan',
    jumlah: 45,
    kondisi: 'Baik',
    tanggalMutasi: '2026-06-05',
    lokasi: 'Perpustakaan',
    keterangan: 'Buku wajib kurikulum merdeka'
  },
  {
    id: 'item-7',
    nomor: 7,
    namaBarang: 'Air Conditioner (AC) Sharp 1 PK',
    kategori: 'Alat Elektronik & TIK',
    sumberDana: 'Dana Komite / Orang Tua',
    jumlah: 3,
    kondisi: 'Rusak Ringan',
    tanggalMutasi: '2026-06-22',
    lokasi: 'Lab Komputer & Kantor',
    keterangan: 'AC di ruang kepala sekolah kurang dingin, perlu service freon'
  },
  {
    id: 'item-8',
    nomor: 8,
    namaBarang: 'Mikroskop Monokuler Yazumi',
    kategori: 'Peralatan Laboratorium',
    sumberDana: 'Dana BOS (Bantuan Operasional Sekolah)',
    jumlah: 5,
    kondisi: 'Baik',
    tanggalMutasi: '2026-04-10',
    lokasi: 'Laboratorium IPA',
    keterangan: 'Disimpan di lemari kaca anti-lembab'
  },
  {
    id: 'item-9',
    nomor: 9,
    namaBarang: 'Bola Voli Molten V5M5000',
    kategori: 'Perlengkapan Olahraga',
    sumberDana: 'Kas Madrasah',
    jumlah: 4,
    kondisi: 'Rusak Berat',
    tanggalMutasi: '2026-06-10',
    lokasi: 'Gudang Olahraga',
    keterangan: '2 bola bocor robek jahitan samping'
  }
];

export const INITIAL_MUTATIONS: MutationRecord[] = [
  {
    id: 'mut-1',
    itemId: 'item-1',
    namaBarang: 'Meja Kayu Guru',
    tipe: 'MASUK',
    tanggal: '2026-06-01',
    jumlahPerubahan: 5,
    jumlahSebelum: 10,
    jumlahSesudah: 15,
    kondisiSebelum: 'Baik',
    kondisiSesudah: 'Baik',
    keterangan: 'Penambahan 5 unit meja guru baru dari hibah'
  },
  {
    id: 'mut-2',
    itemId: 'item-2',
    namaBarang: 'Kursi Belajar Siswa',
    tipe: 'EDIT_DATA',
    tanggal: '2026-06-12',
    jumlahPerubahan: 0,
    jumlahSebelum: 120,
    jumlahSesudah: 120,
    kondisiSebelum: 'Rusak Ringan',
    kondisiSesudah: 'Baik',
    keterangan: 'Penyelesaian perbaikan 12 kursi patah las kaki besi'
  },
  {
    id: 'mut-3',
    itemId: 'item-9',
    namaBarang: 'Bola Voli Molten V5M5000',
    tipe: 'KONDISI_BERUBAH',
    tanggal: '2026-06-10',
    jumlahPerubahan: 0,
    jumlahSebelum: 4,
    jumlahSesudah: 4,
    kondisiSebelum: 'Baik',
    kondisiSesudah: 'Rusak Berat',
    keterangan: 'Perubahan status kondisi dari Baik ke Rusak Berat karena robek tergores kawat pagar'
  },
  {
    id: 'mut-4',
    itemId: 'item-7',
    namaBarang: 'Air Conditioner (AC) Sharp 1 PK',
    tipe: 'KONDISI_BERUBAH',
    tanggal: '2026-06-22',
    jumlahPerubahan: 0,
    jumlahSebelum: 3,
    jumlahSesudah: 3,
    kondisiSebelum: 'Baik',
    kondisiSesudah: 'Rusak Ringan',
    keterangan: 'AC Kantor Kepala Sekolah kurang dingin, ditandai rusak ringan menunggu service freon'
  }
];
