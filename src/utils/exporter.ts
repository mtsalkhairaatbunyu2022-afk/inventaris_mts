/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem, MutationRecord } from '../types';

// Helper to format date to Indonesian format (e.g., 23 Juni 2026)
export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${day} ${months[monthIdx]} ${year}`;
}

// 1. EXCEL EXPORTER WITH EMBEDDED IMAGES
export async function exportToExcel(
  items: InventoryItem[],
  mutations: MutationRecord[],
  reportTitle: string = 'Laporan_Inventaris_Madrasah'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIMADRA';
  workbook.lastModifiedBy = 'SIMADRA';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Active Inventory sheet
  const wsInventory = workbook.addWorksheet('Daftar Aset Aktif');

  // Set columns and widths layout
  wsInventory.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Nama Barang/Aset', key: 'namaBarang', width: 28 },
    { header: 'Kategori', key: 'kategori', width: 20 },
    { header: 'Sumber Dana', key: 'sumberDana', width: 20 },
    { header: 'Keterangan/Merk', key: 'keterangan', width: 25 },
    { header: 'Jml (Jumlah)', key: 'jumlah', width: 14 },
    { header: 'Kondisi', key: 'kondisi', width: 15 },
    { header: 'Tgl Pendataan', key: 'tanggalMutasi', width: 22 },
    { header: 'Lokasi Penempatan', key: 'lokasi', width: 22 },
    { header: 'Jenis Penggunaan', key: 'jenisPenggunaan', width: 26 },
    { header: 'Foto Aset (Gambar)', key: 'gambar', width: 24 } // Column K (index 10, 0-based)
  ];

  // Headings styling
  const headerRow = wsInventory.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '15803D' } // Green Madrasah
    };
    cell.font = {
      name: 'Arial',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' }
    };
  });

  // Populate Active Inventory rows
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const rowIndex = idx + 2; // Row index is 1-based, index 1 is headers, so we start at row 2
    
    wsInventory.addRow({
      no: idx + 1,
      namaBarang: item.namaBarang,
      kategori: item.kategori,
      sumberDana: item.sumberDana || 'Dana BOS',
      keterangan: item.keterangan || '-',
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      tanggalMutasi: formatIndoDate(item.tanggalMutasi),
      lokasi: item.lokasi || '-',
      jenisPenggunaan: item.jenisPenggunaan || '-',
      gambar: '' // Will place image overlay here inside Col K
    });

    const currRow = wsInventory.getRow(rowIndex);
    currRow.height = 68; // Space to display item image clearly
    
    // Borders & Alignment for each column cell
    currRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D1D5DB' } },
        left: { style: 'thin', color: { argb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
        right: { style: 'thin', color: { argb: 'D1D5DB' } }
      };
      
      if (colNumber === 1 || colNumber === 6 || colNumber === 7 || colNumber === 8 || colNumber === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });

    // Embed Image inside cell
    if (item.gambarUrl && item.gambarUrl.startsWith('data:image')) {
      try {
        const base64Data = item.gambarUrl;
        let ext: 'png' | 'jpeg' | 'gif' = 'jpeg';
        
        if (base64Data.toLowerCase().includes('data:image/png')) {
          ext = 'png';
        } else if (base64Data.toLowerCase().includes('data:image/gif')) {
          ext = 'gif';
        }
        
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: ext
        });

        // Column K is index 10 (0-based)
        wsInventory.addImage(imageId, {
          tl: { col: 10.1, row: rowIndex - 1 + 0.1 } as any,
          br: { col: 10.9, row: rowIndex - 0.1 } as any,
          editAs: 'oneCell'
        });
      } catch (err) {
        console.error('Gagal menyisipkan gambar pada baris Excel:', err);
      }
    }
  }

  // Mutation ledger sheet
  const wsMutations = workbook.addWorksheet('Riwayat Mutasi');
  wsMutations.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Nama Barang', key: 'namaBarang', width: 30 },
    { header: 'Tipe Mutasi', key: 'tipe', width: 18 },
    { header: 'Tanggal Mutasi', key: 'tanggal', width: 22 },
    { header: 'Jumlah Perubahan', key: 'jumlahPerubahan', width: 18 },
    { header: 'Kuantitas Sebelum', key: 'jumlahSebelum', width: 18 },
    { header: 'Kuantitas Setelah', key: 'jumlahSesudah', width: 18 },
    { header: 'Kondisi Sebelum', key: 'kondisiSebelum', width: 18 },
    { header: 'Kondisi Setelah', key: 'kondisiSesudah', width: 18 },
    { header: 'Catatan / Keterangan', key: 'keterangan', width: 35 }
  ];

  const headerRowMut = wsMutations.getRow(1);
  headerRowMut.height = 25;
  headerRowMut.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '334155' } // Slate
    };
    cell.font = {
      name: 'Arial',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' }
    };
  });

  mutations.forEach((mut, idx) => {
    wsMutations.addRow({
      no: idx + 1,
      namaBarang: mut.namaBarang,
      tipe: mut.tipe,
      tanggal: formatIndoDate(mut.tanggal),
      jumlahPerubahan: mut.jumlahPerubahan,
      jumlahSebelum: mut.jumlahSebelum,
      jumlahSesudah: mut.jumlahSesudah,
      kondisiSebelum: mut.kondisiSebelum,
      kondisiSesudah: mut.kondisiSesudah,
      keterangan: mut.keterangan || '-'
    });

    const currRow = wsMutations.getRow(idx + 2);
    currRow.height = 22;
    currRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
      
      if (colNumber === 1 || colNumber === 3 || colNumber === 4 || (colNumber >= 5 && colNumber <= 9)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Export File Buffer & Download standard
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateSuffix = new Date().toISOString().split('T')[0];
  
  anchor.href = url;
  anchor.download = `${reportTitle}_${dateSuffix}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

// 2. PDF EXPORTER WITH EXPLICIT CELLED DRAWN IMAGES
export function exportToPDF(
  items: InventoryItem[],
  reportMonthStr: string, // e.g. "Juni 2026"
  madrasahName: string = 'MTs Al-Khairaat Bunyu'
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Header Madrasah
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN INVENTARIS DAN ASET MADRASAH', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(madrasahName.toUpperCase(), 105, 21, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Periode Laporan: ${reportMonthStr}`, 105, 27, { align: 'center' });
  
  // Horizontal Line
  doc.setLineWidth(0.5);
  doc.line(15, 30, 195, 30);
  
  // Table columns
  const head = [['No', 'Nama Barang', 'Kategori', 'Sumber Dana', 'Keterangan/Merk', 'Jml', 'Kondisi', 'Tgl Pendataan', 'Lokasi', 'Jenis Penggunaan', 'Gambar']];
  
  const body = items.map((item, idx) => [
    idx + 1,
    item.namaBarang,
    item.kategori,
    item.sumberDana || 'Dana BOS',
    item.keterangan || '-',
    item.jumlah,
    item.kondisi,
    formatIndoDate(item.tanggalMutasi),
    item.lokasi || '-',
    item.jenisPenggunaan || '-',
    '' // Will be filled dynamically by didDrawCell
  ]);
  
  // Generate Table
  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontStyle: 'bold' }, // Madrasah green
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 }, // Sumber Dana
      4: { cellWidth: 18 }, // Keterangan
      5: { cellWidth: 8, halign: 'center' }, // Jml
      6: { cellWidth: 14, halign: 'center' }, // Kondisi
      7: { cellWidth: 18 }, // Tgl Pendataan
      8: { cellWidth: 18 }, // Lokasi
      9: { cellWidth: 20 }, // Jenis Penggunaan
      10: { cellWidth: 18, halign: 'center' } // Gambar
    },
    styles: { fontSize: 8, cellPadding: 2, valign: 'middle', minCellHeight: 18 },
    margin: { left: 15, right: 15 },
    didDrawCell: (data) => {
      if (data.column.index === 10 && data.cell.section === 'body') {
        const item = items[data.row.index];
        if (item && item.gambarUrl && item.gambarUrl.startsWith('data:image')) {
          // Calculate safe drawing boundaries within the cell padding
          const x = data.cell.x + 1.5;
          const y = data.cell.y + 1.5;
          const w = data.cell.width - 3;
          const h = data.cell.height - 3;
          try {
            let format = 'JPEG';
            if (item.gambarUrl.toLowerCase().includes('data:image/png')) {
              format = 'PNG';
            }
            doc.addImage(item.gambarUrl, format, x, y, w, h);
          } catch (e) {
            console.error('Gagal melampirkan gambar ke dokumen PDF:', e);
          }
        }
      }
    }
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  const todayStr = formatIndoDate(new Date().toISOString().split('T')[0]);
  doc.text(`Bunyu, ${todayStr}`, 145, finalY + 15);
  doc.text('Petugas Inventaris,', 145, finalY + 20);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('_____________________', 145, finalY + 40);
  
  // Trigger file download
  const safeMonth = reportMonthStr.replace(' ', '_');
  doc.save(`Laporan_Inventaris_Madrasah_${safeMonth}.pdf`);
}

// 3. WORD EXPORTER WITH CELL IMAGES
export function exportToWord(
  items: InventoryItem[],
  reportMonthStr: string,
  madrasahName: string = 'MTs Al-Khairaat Bunyu'
) {
  const todayStr = formatIndoDate(new Date().toISOString().split('T')[0]);
  
  let tableRowsHtml = '';
  items.forEach((item, idx) => {
    let imgHtml = '-';
    if (item.gambarUrl) {
      imgHtml = `<img src="${item.gambarUrl}" width="60" height="45" style="border:1px solid #ccc; max-width:60px; max-height:45px;" />`;
    }

    tableRowsHtml += `
      <tr style="mso-yfti-irow:${idx + 1};">
        <td style="border: 1.0pt solid #15803D; padding: 5px; text-align: center; font-size: 10pt;">${idx + 1}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-weight: bold; font-size: 10pt;">${item.namaBarang}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${item.kategori}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${item.sumberDana || 'Dana BOS'}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${item.keterangan || '-'}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; text-align: center; font-size: 10pt;">${item.jumlah}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; text-align: center; font-size: 10pt;">
          <span style="color: ${item.kondisi === 'Baik' ? '#166534' : item.kondisi === 'Rusak Ringan' ? '#9a3412' : '#991b1b'}; font-weight: bold;">
            ${item.kondisi}
          </span>
        </td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${formatIndoDate(item.tanggalMutasi)}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${item.lokasi || '-'}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; font-size: 10pt;">${item.jenisPenggunaan || '-'}</td>
        <td style="border: 1.0pt solid #15803D; padding: 5px; text-align: center;">${imgHtml}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Laporan Inventaris Madrasah</title>
      <style>
        body { font-family: 'Arial', sans-serif; color: #333333; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #15803D; padding-bottom: 10px; }
        .title { font-size: 16pt; font-weight: bold; color: #15803D; margin: 0; }
        .school { font-size: 13pt; font-weight: bold; margin: 5px 0 0 0; }
        .meta { font-size: 10pt; color: #666; margin: 5px 0 0 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; mso-table-lspace:0pt; mso-table-rspace:0pt; }
        th { background-color: #15803D; color: #ffffff; border: 1.0pt solid #15803D; padding: 8px; font-weight: bold; text-align: center; font-size: 10pt; }
        .footer-sec { margin-top: 40px; float: right; width: 250px; text-align: left; font-size: 10pt; }
        .sig-space { height: 60px; }
      </style>
    </head>
    <body>
      <div class="header">
        <p class="title">LAPORAN INVENTARISASI KEADAAN ASET MADRASAH</p>
        <p class="school">${madrasahName.toUpperCase()}</p>
        <p class="meta">Laporan Bulanan Keadaan Barang &amp; Mutasi Aset Berkala | Periode: ${reportMonthStr}</p>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 15%;">Nama Barang</th>
            <th style="width: 10%;">Kategori</th>
            <th style="width: 10%;">Sumber Dana</th>
            <th style="width: 11%;">Keterangan/Merk</th>
            <th style="width: 5%;">Jml</th>
            <th style="width: 8%;">Kondisi</th>
            <th style="width: 9%;">Tgl Pendataan</th>
            <th style="width: 10%;">Lokasi</th>
            <th style="width: 10%;">Jenis Penggunaan</th>
            <th style="width: 7%;">Gambar</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div style="width: 100%; overflow: hidden; margin-top: 50px;">
        <div class="footer-sec" style="margin-left: 60%;">
          <p>Bunyu, ${todayStr}</p>
          <p>Mengetahui/Menyetujui,<br/><b>Petugas Penanggung Jawab Inventaris</b></p>
          <div class="sig-space"></div>
          <p><b><u>_____________________________</u></b><br/>NIP/NUPTK: _________________</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create document blob and initiate download
  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const trigger = document.createElement('a');
  trigger.href = url;
  
  const safeMonth = reportMonthStr.replace(' ', '_');
  trigger.download = `Laporan_Inventaris_Madrasah_${safeMonth}.doc`;
  document.body.appendChild(trigger);
  trigger.click();
  document.body.removeChild(trigger);
  URL.revokeObjectURL(url);
}
