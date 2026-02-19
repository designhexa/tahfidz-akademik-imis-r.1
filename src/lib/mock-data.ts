// Centralized mock data - sinkronisasi data santri, ustadz, kelas, halaqoh, dan users

// ============ KELAS ============
export interface MockKelas {
  id: string;
  nama_kelas: string;
  deskripsi: string;
}

export const MOCK_KELAS: MockKelas[] = [
  { id: "ka", nama_kelas: "KBTK A", deskripsi: "Kelompok Bermain TK A" },
  { id: "kb", nama_kelas: "KBTK B", deskripsi: "Kelompok Bermain TK B" },
  { id: "k1", nama_kelas: "Paket A Kelas 1", deskripsi: "Paket A setara SD Kelas 1" },
  { id: "k2", nama_kelas: "Paket A Kelas 2", deskripsi: "Paket A setara SD Kelas 2" },
  { id: "k3", nama_kelas: "Paket A Kelas 3", deskripsi: "Paket A setara SD Kelas 3" },
  { id: "k4", nama_kelas: "Paket A Kelas 4", deskripsi: "Paket A setara SD Kelas 4" },
  { id: "k5", nama_kelas: "Paket A Kelas 5", deskripsi: "Paket A setara SD Kelas 5" },
  { id: "k6", nama_kelas: "Paket A Kelas 6", deskripsi: "Paket A setara SD Kelas 6" },
  { id: "k7", nama_kelas: "Paket B Kelas 7", deskripsi: "Paket B setara SMP Kelas 7" },
  { id: "k8", nama_kelas: "Paket B Kelas 8", deskripsi: "Paket B setara SMP Kelas 8" },
  { id: "k9", nama_kelas: "Paket B Kelas 9", deskripsi: "Paket B setara SMP Kelas 9" },
];

// ============ USTADZ ============
export interface MockUstadz {
  id: string;
  nama: string;
  email: string;
  phone: string;
  status: string;
}

export const MOCK_USTADZ: MockUstadz[] = [
  { id: "u1", nama: "Ustadz Ahmad Fauzi, S.Pd.I", email: "ahmad@imis.sch.id", phone: "081234567891", status: "Aktif" },
  { id: "u2", nama: "Ustadz Budi Santoso, Lc.", email: "budi@imis.sch.id", phone: "081234567892", status: "Aktif" },
  { id: "u3", nama: "Ustadz Muhammad Yusuf, S.Ag", email: "yusuf@imis.sch.id", phone: "081234567893", status: "Aktif" },
  { id: "u4", nama: "Ustadzah Siti Aminah, S.Pd", email: "aminah@imis.sch.id", phone: "081234567894", status: "Aktif" },
  { id: "u5", nama: "Ustadz Hasan Basri, S.Pd.I", email: "hasan@imis.sch.id", phone: "081234567895", status: "Aktif" },
];

// ============ HALAQOH ============
export interface MockHalaqoh {
  id: string;
  nama: string;
  idUstadz: string;
  tingkat: string;
  jumlahSantri: number;
}

export const MOCK_HALAQOH: MockHalaqoh[] = [
  { id: "h1", nama: "Halaqoh Al-Fatih", idUstadz: "u1", tingkat: "Pemula", jumlahSantri: 4 },
  { id: "h2", nama: "Halaqoh An-Nur", idUstadz: "u2", tingkat: "Menengah", jumlahSantri: 4 },
  { id: "h3", nama: "Halaqoh Al-Furqon", idUstadz: "u3", tingkat: "Lanjutan", jumlahSantri: 3 },
  { id: "h4", nama: "Halaqoh Al-Hidayah", idUstadz: "u4", tingkat: "Pemula", jumlahSantri: 2 },
  { id: "h5", nama: "Halaqoh As-Salam", idUstadz: "u5", tingkat: "Menengah", jumlahSantri: 2 },
];

// ============ SANTRI ============
export interface MockSantri {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  idKelas: string;
  idHalaqoh: string;
  idWali: string;
  tanggalMasuk: string;
  status: string;
  // Tilawah
  jilidSaatIni: number;
  halamanSaatIni: number;
}

export const MOCK_SANTRI: MockSantri[] = [
  { id: "s1", nis: "161", nisn: "0113806416", nama: "Qurrata 'Ayun", idKelas: "k8", idHalaqoh: "h2", idWali: "w1", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 4, halamanSaatIni: 28 },
  { id: "s2", nis: "124", nisn: "0137489265", nama: "Azzahra Zainab", idKelas: "k8", idHalaqoh: "h2", idWali: "w2", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 3, halamanSaatIni: 22 },
  { id: "s3", nis: "128", nisn: "0116049771", nama: "Fayyadah Fayola", idKelas: "k8", idHalaqoh: "h3", idWali: "w3", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 5, halamanSaatIni: 12 },
  { id: "s4", nis: "101", nisn: "2115038077", nama: "Dzaki Ash Shiddiq", idKelas: "k8", idHalaqoh: "h1", idWali: "w4", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 4, halamanSaatIni: 35 },
  { id: "s5", nis: "130", nisn: "0108552956", nama: "Salwah Lathifah Wasiso", idKelas: "k8", idHalaqoh: "h3", idWali: "w5", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 3, halamanSaatIni: 40 },
  { id: "s6", nis: "006", nisn: "0119283745", nama: "Khadijah Alesha W.", idKelas: "k6", idHalaqoh: "h1", idWali: "w6", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 2, halamanSaatIni: 17 },
  { id: "s7", nis: "007", nisn: "0118374625", nama: "Muhammad Zidan Ar Rasyid", idKelas: "k5", idHalaqoh: "h2", idWali: "w7", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 2, halamanSaatIni: 38 },
  { id: "s8", nis: "008", nisn: "0117463528", nama: "Hamzah Abdurrohman", idKelas: "k5", idHalaqoh: "h1", idWali: "w8", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 3, halamanSaatIni: 15 },
  { id: "s9", nis: "009", nisn: "0116584739", nama: "Fahimah Nadeen D.", idKelas: "k6", idHalaqoh: "h2", idWali: "w9", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 1, halamanSaatIni: 33 },
  { id: "s10", nis: "110", nisn: "0115693847", nama: "Mazzayanun Nisa Z.A.M.", idKelas: "k9", idHalaqoh: "h3", idWali: "w10", tanggalMasuk: "2024-01-10", status: "Aktif", jilidSaatIni: 5, halamanSaatIni: 30 },
  { id: "s11", nis: "111", nisn: "0114782956", nama: "Umar Abdurrohman", idKelas: "k9", idHalaqoh: "h4", idWali: "w11", tanggalMasuk: "2024-01-10", status: "Aktif", jilidSaatIni: 6, halamanSaatIni: 20 },
  { id: "s12", nis: "112", nisn: "0113871065", nama: "Aisyah Mentari Azzahra", idKelas: "k7", idHalaqoh: "h4", idWali: "w12", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 4, halamanSaatIni: 10 },
  { id: "s13", nis: "013", nisn: "0112960174", nama: "Fatimah Zahra", idKelas: "k3", idHalaqoh: "h5", idWali: "w13", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 1, halamanSaatIni: 20 },
  { id: "s14", nis: "014", nisn: "0112049283", nama: "Ali Akbar", idKelas: "k4", idHalaqoh: "h5", idWali: "w14", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 2, halamanSaatIni: 8 },
  { id: "s15", nis: "015", nisn: "0111138392", nama: "Muhammad Rizki", idKelas: "k3", idHalaqoh: "h1", idWali: "w15", tanggalMasuk: "2024-07-15", status: "Aktif", jilidSaatIni: 1, halamanSaatIni: 35 },
];

// ============ WALI SANTRI ============
export interface MockWali {
  id: string;
  nama: string;
  email: string;
  phone: string;
}

export const MOCK_WALI: MockWali[] = [
  { id: "w1", nama: "Bapak Yusuf", email: "yusuf.wali@gmail.com", phone: "081345678901" },
  { id: "w2", nama: "Ibu Maryam", email: "maryam.wali@gmail.com", phone: "081345678902" },
  { id: "w3", nama: "Bapak Ridwan", email: "ridwan.wali@gmail.com", phone: "081345678903" },
  { id: "w4", nama: "Bapak Hamid", email: "hamid.wali@gmail.com", phone: "081345678904" },
  { id: "w5", nama: "Ibu Zahra", email: "zahra.wali@gmail.com", phone: "081345678905" },
  { id: "w6", nama: "H. Abdullah", email: "abdullah.wali@gmail.com", phone: "081345678906" },
  { id: "w7", nama: "Bapak Hasan", email: "hasan.wali@gmail.com", phone: "081345678907" },
  { id: "w8", nama: "Bapak Umar", email: "umar.wali@gmail.com", phone: "081345678908" },
  { id: "w9", nama: "Ibu Fatimah", email: "fatimah.wali@gmail.com", phone: "081345678909" },
  { id: "w10", nama: "Bapak Ali", email: "ali.wali@gmail.com", phone: "081345678910" },
  { id: "w11", nama: "Ibu Khadijah", email: "khadijah.wali@gmail.com", phone: "081345678911" },
  { id: "w12", nama: "Bapak Bilal", email: "bilal.wali@gmail.com", phone: "081345678912" },
  { id: "w13", nama: "Ibu Aisyah", email: "aisyah.wali@gmail.com", phone: "081345678913" },
  { id: "w14", nama: "Bapak Salman", email: "salman.wali@gmail.com", phone: "081345678914" },
  { id: "w15", nama: "Bapak Zaid", email: "zaid.wali@gmail.com", phone: "081345678915" },
];

// ============ USERS (akun pengguna) ============
export interface MockUser {
  id: string;
  nama: string;
  username: string;
  role: "Admin" | "Koordinator" | "Asatidz" | "WaliSantri" | "Yayasan";
  email: string;
  phone: string;
  status: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: "usr1", nama: "Admin Utama", username: "admin", role: "Admin", email: "admin@imis.sch.id", phone: "081200000001", status: "Aktif" },
  { id: "usr2", nama: "Koordinator Tahfidz", username: "koordinator", role: "Koordinator", email: "koordinator@imis.sch.id", phone: "081200000002", status: "Aktif" },
  { id: "usr3", nama: "Ketua Yayasan", username: "yayasan", role: "Yayasan", email: "yayasan@imis.sch.id", phone: "081200000003", status: "Aktif" },
  // Ustadz accounts
  { id: "usr4", nama: MOCK_USTADZ[0].nama, username: "ahmad.fauzi", role: "Asatidz", email: MOCK_USTADZ[0].email, phone: MOCK_USTADZ[0].phone, status: "Aktif" },
  { id: "usr5", nama: MOCK_USTADZ[1].nama, username: "budi.santoso", role: "Asatidz", email: MOCK_USTADZ[1].email, phone: MOCK_USTADZ[1].phone, status: "Aktif" },
  { id: "usr6", nama: MOCK_USTADZ[2].nama, username: "m.yusuf", role: "Asatidz", email: MOCK_USTADZ[2].email, phone: MOCK_USTADZ[2].phone, status: "Aktif" },
  { id: "usr7", nama: MOCK_USTADZ[3].nama, username: "siti.aminah", role: "Asatidz", email: MOCK_USTADZ[3].email, phone: MOCK_USTADZ[3].phone, status: "Aktif" },
  { id: "usr8", nama: MOCK_USTADZ[4].nama, username: "hasan.basri", role: "Asatidz", email: MOCK_USTADZ[4].email, phone: MOCK_USTADZ[4].phone, status: "Aktif" },
  // Wali santri accounts
  ...MOCK_WALI.map((w, i) => ({
    id: `usr${9 + i}`,
    nama: w.nama,
    username: w.nama.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10),
    role: "WaliSantri" as const,
    email: w.email,
    phone: w.phone,
    status: "Aktif",
  })),
];

// ============ HELPERS ============
export const getKelasById = (id: string) => MOCK_KELAS.find(k => k.id === id);
export const getKelasNama = (id: string) => getKelasById(id)?.nama_kelas || "-";
export const getUstadzById = (id: string) => MOCK_USTADZ.find(u => u.id === id);
export const getUstadzNama = (id: string) => getUstadzById(id)?.nama || "-";
export const getHalaqohById = (id: string) => MOCK_HALAQOH.find(h => h.id === id);
export const getHalaqohNama = (id: string) => getHalaqohById(id)?.nama || "-";
export const getWaliById = (id: string) => MOCK_WALI.find(w => w.id === id);
export const getWaliNama = (id: string) => getWaliById(id)?.nama || "-";

export const getSantriByHalaqoh = (halaqohId: string) =>
  MOCK_SANTRI.filter(s => s.idHalaqoh === halaqohId && s.status === "Aktif");

export const getUstadzHalaqoh = (ustadzId: string) =>
  MOCK_HALAQOH.filter(h => h.idUstadz === ustadzId);
