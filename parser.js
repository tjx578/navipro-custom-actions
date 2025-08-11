import mapping from './mapping-singkatan.json' assert { type: 'json' };

/**
 * Parse narasi rally jadi langkah navigasi terstruktur
 * @param {string} narasi - Teks narasi rally
 * @param {Array} lokasiDB - Array lokasi dari DB Replit
 * @returns {Array} steps - Langkah navigasi terstruktur
 */
export function parseNarasi(narasi, lokasiDB) {
  const steps = [];
  
  // Pisah per kalimat dengan titik atau koma
  const potongan = narasi.split(/[\.,]/).map(s => s.trim()).filter(Boolean);

  for (const p of potongan) {
    const foundCodes = [];
    const foundActions = [];

    // Cari semua singkatan yang muncul di teks (tidak hanya di awal)
    for (const [code, action] of Object.entries(mapping)) {
      const regex = new RegExp(`\\b${code}\\b`, 'i');
      if (regex.test(p)) {
        foundCodes.push(code);
        foundActions.push(action);
      }
    }

    // Buat object step
    const step = {
      actionCodes: foundCodes.length > 0 ? foundCodes : null,
      actions: foundActions.length > 0 ? foundActions : null,
      description: p
    };

    // Cek apakah ada lokasi di DB yang cocok di deskripsi
    const lokasi = lokasiDB.find(l =>
      p.toLowerCase().includes(l.name.toLowerCase())
    );
    if (lokasi) {
      step.placeId = lokasi.placeId;
      step.coordinate = lokasi.coordinate;
    }

    steps.push(step);
  }

  return steps;
}
