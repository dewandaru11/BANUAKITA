import { useState, useRef } from 'react';
import { letterTypes, defaultVillageInfo } from './data/letters';
import { LetterType, FormData, VillageInfo } from './types';

function formatDate(dateStr: string): string {
  if (!dateStr) return '...........................';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getTodayFormatted(): string {
  return formatDate(new Date().toISOString().split('T')[0]);
}

// Group letters by category
const categories = [
  { id: 'Kependudukan', name: 'Kependudukan', icon: '👥', color: 'blue' },
  { id: 'Sosial', name: 'Sosial', icon: '🤝', color: 'purple' },
  { id: 'Ekonomi', name: 'Ekonomi', icon: '💼', color: 'green' },
  { id: 'Pernikahan', name: 'Pernikahan', icon: '💍', color: 'pink' },
  { id: 'Kesehatan', name: 'Kesehatan', icon: '🏥', color: 'red' },
  { id: 'Pendidikan', name: 'Pendidikan', icon: '🎓', color: 'yellow' },
];

export default function App() {
  const [selectedLetter, setSelectedLetter] = useState<LetterType | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [villageInfo] = useState<VillageInfo>(defaultVillageInfo);
  const [showPreview, setShowPreview] = useState(false);
  const [suratNumber, setSuratNumber] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectLetter = (letter: LetterType) => {
    setSelectedLetter(letter);
    setFormData({});
    setShowPreview(false);
    setSuratNumber('');
    setActiveCategory(letter.category);
  };

  const handlePrint = () => {
    window.print();
  };

  const getLettersByCategory = (categoryId: string) => {
    return letterTypes.filter(l => l.category === categoryId);
  };

  const renderLetterContent = () => {
    if (!selectedLetter) return null;
    const d = formData;

    switch (selectedLetter.id) {
      case 'surat-kematian':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Telah meninggal dunia pada:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Hari/Tanggal</td><td className="py-0.5">: {formatDate(d.tanggalMeninggal)}</td></tr>
                <tr><td className="py-0.5">Pukul</td><td className="py-0.5">: {d.waktuMeninggal || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat</td><td className="py-0.5">: {d.tempatMeninggal || '...........................'}</td></tr>
                <tr><td className="py-0.5">Penyebab</td><td className="py-0.5">: {d.penyebabMeninggal || '...........................'}</td></tr>
                <tr><td className="py-0.5">Dimakamkan di</td><td className="py-0.5">: {d.tempatPemakaman || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Demikian surat keterangan ini dibuat dengan sebenarnya berdasarkan laporan dari pelapor:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Pelapor</td><td className="py-0.5">: {d.pelapor || '...........................'}</td></tr>
                <tr><td className="py-0.5">Hubungan</td><td className="py-0.5">: {d.hubunganPelapor || '...........................'}</td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'surat-domisili':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, dengan ini menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat KTP</td><td className="py-0.5">: {d.alamatKTP || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Adalah benar warga kami yang saat ini berdomisili di:</p>
            <p className="ml-4 font-semibold">{d.alamatDomisili || '...........................'}</p>
            <p className="mt-3">Surat keterangan ini dibuat untuk keperluan: <strong>{d.tujuan || '...........................'}</strong></p>
          </div>
        );
      case 'surat-kehilangan-kk':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Berdasarkan laporan yang bersangkutan, Kartu Keluarga dengan nomor:</p>
            <p className="ml-4 font-semibold text-center text-lg">{d.nomorKK || '...........................'}</p>
            <p>Dinyatakan hilang dengan kronologi sebagai berikut:</p>
            <p className="ml-4 italic">{d.kronologi || '...........................'}</p>
            <p>Perkiraan tanggal kehilangan: {formatDate(d.tanggalKehilangan)}</p>
          </div>
        );
      case 'surat-kehilangan-ktp':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Berdasarkan laporan yang bersangkutan, KTP elektronik (e-KTP) dengan NIK tersebut di atas dinyatakan hilang dengan kronologi:</p>
            <p className="ml-4 italic">{d.kronologi || '...........................'}</p>
            <p>Perkiraan tanggal kehilangan: {formatDate(d.tanggalKehilangan)}</p>
          </div>
        );
      case 'surat-kelahiran':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa telah lahir seorang bayi:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Bayi</td><td className="py-0.5">: {d.namaBayi || '...........................'}</td></tr>
                <tr><td className="py-0.5">Lahir pada</td><td className="py-0.5">: {formatDate(d.tanggalLahirBayi)}, Pukul {d.waktuLahirBayi || '.......'}</td></tr>
                <tr><td className="py-0.5">Tempat Lahir</td><td className="py-0.5">: {d.tempatLahirBayi || '...........................'}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelaminBayi || '...........................'}</td></tr>
                <tr><td className="py-0.5">Berat Badan</td><td className="py-0.5">: {d.beratBayi || '...........................'}</td></tr>
                <tr><td className="py-0.5">Panjang Badan</td><td className="py-0.5">: {d.panjangBayi || '...........................'}</td></tr>
                <tr><td className="py-0.5">Anak ke-</td><td className="py-0.5">: {d.anakKe || '.......'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Dari seorang ibu:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Ibu</td><td className="py-0.5">: {d.namaIbu || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK Ibu</td><td className="py-0.5">: {d.nikIbu || '...........................'}</td></tr>
                <tr><td className="py-0.5">Umur</td><td className="py-0.5">: {d.umurIbu || '.......'} tahun</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaanIbu || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Dan seorang ayah:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Ayah</td><td className="py-0.5">: {d.namaAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK Ayah</td><td className="py-0.5">: {d.nikAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Umur</td><td className="py-0.5">: {d.umurAyah || '.......'} tahun</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaanAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamatAyah || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Penolong persalinan: <strong>{d.penolongPersalinan || '...........................'}</strong></p>
          </div>
        );
      case 'surat-tidak-mampu-kis':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
                <tr><td className="py-0.5">Penghasilan/bulan</td><td className="py-0.5">: {d.penghasilan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tanggungan</td><td className="py-0.5">: {d.tanggungan || '.......'} orang</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Orang tersebut di atas benar tergolong keluarga <strong>TIDAK MAMPU</strong> dan surat ini digunakan untuk keperluan: <strong>{d.tujuan || '...........................'}</strong></p>
          </div>
        );
      case 'surat-tidak-mampu-kip':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Adalah peserta didik di:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Sekolah</td><td className="py-0.5">: {d.namaSekolah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Jenjang</td><td className="py-0.5">: {d.jenjang || '...........................'}</td></tr>
                <tr><td className="py-0.5">Kelas</td><td className="py-0.5">: {d.kelas || '...........................'}</td></tr>
                <tr><td className="py-0.5">NISN</td><td className="py-0.5">: {d.nisn || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Anak dari:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Ayah/Wali</td><td className="py-0.5">: {d.namaAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaanAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Penghasilan/bulan</td><td className="py-0.5">: {d.penghasilan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tanggungan</td><td className="py-0.5">: {d.tanggungan || '.......'} orang</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Orang tersebut di atas benar tergolong keluarga <strong>TIDAK MAMPU</strong> dan membutuhkan bantuan biaya pendidikan melalui program KIP.</p>
          </div>
        );
      case 'surat-tidak-mampu':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
                <tr><td className="py-0.5">Penghasilan/bulan</td><td className="py-0.5">: {d.penghasilan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tanggungan</td><td className="py-0.5">: {d.tanggungan || '.......'} orang</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Orang tersebut di atas benar tergolong keluarga <strong>TIDAK MAMPU</strong>. Surat keterangan ini dibuat untuk keperluan: <strong>{d.tujuan || '...........................'}</strong></p>
          </div>
        );
      case 'surat-usaha':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Adalah benar memiliki dan menjalankan usaha:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Usaha</td><td className="py-0.5">: {d.namaUsaha || '...........................'}</td></tr>
                <tr><td className="py-0.5">Jenis Usaha</td><td className="py-0.5">: {d.jenisUsaha || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat Usaha</td><td className="py-0.5">: {d.alamatUsaha || '...........................'}</td></tr>
                <tr><td className="py-0.5">Lama Berusaha</td><td className="py-0.5">: {d.lamaUsaha || '...........................'}</td></tr>
                <tr><td className="py-0.5">Omset/bulan</td><td className="py-0.5">: {d.omset || '...........................'}</td></tr>
                <tr><td className="py-0.5">Jumlah Karyawan</td><td className="py-0.5">: {d.jumlahKaryawan || '.......'} orang</td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'surat-pindah':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusKawin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Kewarganegaraan</td><td className="py-0.5">: {d.kewarganegaraan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat Asal</td><td className="py-0.5">: {d.alamatAsal || '...........................'}</td></tr>
                <tr><td className="py-0.5">RT/RW</td><td className="py-0.5">: {d.rtRwAsal || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Akan pindah ke alamat:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Alamat Tujuan</td><td className="py-0.5">: {d.alamatTujuan || '...........................'}</td></tr>
                <tr><td className="py-0.5">RT/RW</td><td className="py-0.5">: {d.rtRwTujuan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Desa/Kelurahan</td><td className="py-0.5">: {d.desaTujuan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Kecamatan</td><td className="py-0.5">: {d.kecamatanTujuan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Kabupaten/Kota</td><td className="py-0.5">: {d.kabupatenTujuan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Provinsi</td><td className="py-0.5">: {d.provinsiTujuan || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Alasan pindah: <strong>{d.alasanPindah || '...........................'}</strong></p>
            <p>Jumlah keluarga yang ikut pindah: <strong>{d.jumlahKeluarga || '.......'} orang</strong></p>
          </div>
        );
      case 'surat-nikah-laki':
      case 'surat-nikah-perempuan':
        const isLaki = selectedLetter.id === 'surat-nikah-laki';
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Agama</td><td className="py-0.5">: {d.agama || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pendidikan</td><td className="py-0.5">: {d.pendidikan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
                <tr><td className="py-0.5">Status</td><td className="py-0.5">: {d.statusSebelum || '...........................'}</td></tr>
                <tr><td className="py-0.5">Nama Ayah</td><td className="py-0.5">: {d.namaAyah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Nama Ibu</td><td className="py-0.5">: {d.namaIbu || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Akan melangsungkan pernikahan dengan:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama {isLaki ? 'Calon Istri' : 'Calon Suami'}</td><td className="py-0.5">: {d.namaCalon || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nikCalon || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahirCalon || '.......'}, {formatDate(d.tanggalLahirCalon)}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamatCalon || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Demikian surat pengantar ini dibuat untuk dipergunakan sebagai syarat pendaftaran nikah di KUA.</p>
          </div>
        );
      case 'surat-imunisasi-catin':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Adalah calon pengantin yang akan menikah dengan:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama Pasangan</td><td className="py-0.5">: {d.namaPasangan || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nikPasangan || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Surat ini dibuat sebagai pengantar untuk melakukan <strong>{d.tujuan || '...........................'}</strong> di <strong>{d.puskesmasTujuan || '...........................'}</strong>.</p>
          </div>
        );
      case 'surat-tugas-puskesmas':
        return (
          <div className="space-y-3 text-justify">
            <p>Yang bertanda tangan di bawah ini Kepala Desa {villageInfo.namaDesa}, Kecamatan {villageInfo.kecamatan}, Kabupaten {villageInfo.kabupaten}, menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Jenis Kelamin</td><td className="py-0.5">: {d.jenisKelamin || '...........................'}</td></tr>
                <tr><td className="py-0.5">Pekerjaan</td><td className="py-0.5">: {d.pekerjaan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Dengan ini diberikan surat pengantar/tugas untuk melakukan pemeriksaan kesehatan di <strong>{d.puskesmasTujuan || '...........................'}</strong>.</p>
            <p className="mt-2">Keperluan: <strong>{d.keperluan || '...........................'}</strong></p>
            <p>Rencana tanggal periksa: <strong>{formatDate(d.tanggalPeriksa)}</strong></p>
          </div>
        );
      case 'surat-beasiswa':
        return (
          <div className="space-y-3 text-justify">
            <p className="text-center font-bold mb-4">UNDANGAN</p>
            <p>Kepada Yth. Sdr/i:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Nama</td><td className="py-0.5">: {d.nama || '...........................'}</td></tr>
                <tr><td className="py-0.5">NIK</td><td className="py-0.5">: {d.nik || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat/Tgl Lahir</td><td className="py-0.5">: {d.tempatLahir || '.......'}, {formatDate(d.tanggalLahir)}</td></tr>
                <tr><td className="py-0.5">Alamat</td><td className="py-0.5">: {d.alamat || '...........................'}</td></tr>
                <tr><td className="py-0.5">Sekolah</td><td className="py-0.5">: {d.namaSekolah || '...........................'}</td></tr>
                <tr><td className="py-0.5">Jenjang</td><td className="py-0.5">: {d.jenjang || '...........................'}</td></tr>
                <tr><td className="py-0.5">Kelas/Semester</td><td className="py-0.5">: {d.kelas || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Dengan ini kami mengundang Bapak/Ibu/Saudara/i beserta orang tua/wali (<strong>{d.namaOrangTua || '...........................'}</strong>) untuk hadir pada acara penyerahan bantuan beasiswa berprestasi yang akan dilaksanakan pada:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr><td className="w-44 py-0.5">Hari/Tanggal</td><td className="py-0.5">: {formatDate(d.tanggalUndangan)}</td></tr>
                <tr><td className="py-0.5">Waktu</td><td className="py-0.5">: {d.waktuUndangan || '...........................'}</td></tr>
                <tr><td className="py-0.5">Tempat</td><td className="py-0.5">: {d.tempatUndangan || '...........................'}</td></tr>
              </tbody>
            </table>
            <p className="mt-3">Prestasi yang diraih:</p>
            <p className="ml-4 italic">{d.prestasi || '...........................'}</p>
            <p className="mt-3">Demikian undangan ini kami sampaikan. Atas kehadiran Bapak/Ibu/Saudara/i kami ucapkan terima kasih.</p>
          </div>
        );
      default:
        return <p>Template belum tersedia</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg print:hidden">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-700 rounded-lg transition lg:hidden"
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🏛️</div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Sistem Informasi Surat Desa</h1>
                <p className="text-green-200 text-xs">Desa {villageInfo.namaDesa} - Kecamatan {villageInfo.kecamatan}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="bg-green-700/50 px-3 py-1 rounded-full">{letterTypes.length} Jenis Surat</span>
            <span className="bg-green-700/50 px-3 py-1 rounded-full">{categories.length} Kategori</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-y-auto print:hidden flex-shrink-0 overflow-x-hidden`}>
          <div className="p-4 w-72">
            {/* Dashboard Button */}
            <button
              onClick={() => { setSelectedLetter(null); setShowPreview(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl mb-4 transition-all flex items-center gap-3 ${
                !selectedLetter ? 'bg-green-100 text-green-800 font-semibold border border-green-200' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </button>

            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu Kategori</h2>
            
            {/* Category Menu */}
            <nav className="space-y-1">
              {categories.map(cat => {
                const catLetters = getLettersByCategory(cat.id);
                const isActive = activeCategory === cat.id;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setActiveCategory(isActive ? null : cat.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                        isActive ? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{catLetters.length}</span>
                        <span className={`transition-transform ${isActive ? 'rotate-90' : ''}`}>›</span>
                      </div>
                    </button>
                    
                    {/* Sub menu */}
                    {isActive && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                        {catLetters.map(letter => (
                          <button
                            key={letter.id}
                            onClick={() => handleSelectLetter(letter)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                              selectedLetter?.id === letter.id
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            <span>{letter.icon}</span>
                            <span className="leading-tight">{letter.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {!selectedLetter ? (
            /* Dashboard */
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Selamat Datang 👋</h2>
                <p className="text-gray-500">Pilih jenis surat yang ingin dibuat dari menu di sebelah kiri</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-center"
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium text-gray-600">{cat.name}</div>
                    <div className="text-lg font-bold text-green-600">{getLettersByCategory(cat.id).length}</div>
                  </button>
                ))}
              </div>

              {/* All Letters Grid */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Semua Jenis Surat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {letterTypes.map(letter => (
                    <button
                      key={letter.id}
                      onClick={() => handleSelectLetter(letter)}
                      className="text-left p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{letter.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800 group-hover:text-green-700 text-sm">{letter.name}</h4>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{letter.category}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : showPreview ? (
            /* Preview Mode */
            <div>
              <div className="flex items-center justify-between mb-4 print:hidden">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                >
                  ← Kembali ke Form
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium text-sm shadow"
                >
                  🖨️ Cetak / Simpan PDF
                </button>
              </div>
              <div ref={printRef} className="bg-white shadow-lg p-8 md:p-12 print:shadow-none print:p-4 max-w-4xl mx-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
                {/* KOP SURAT */}
                <div className="text-center border-b-4 border-double border-black pb-3 mb-4">
                  <p className="text-sm font-bold">PEMERINTAH KABUPATEN {villageInfo.kabupaten.toUpperCase()}</p>
                  <p className="text-sm font-bold">KECAMATAN {villageInfo.kecamatan.toUpperCase()}</p>
                  <p className="text-lg font-bold">DESA {villageInfo.namaDesa.toUpperCase()}</p>
                  <p className="text-xs">Jl. Contoh No. 1, {villageInfo.kecamatan}, {villageInfo.kabupaten}, {villageInfo.provinsi} {villageInfo.kodePos}</p>
                </div>

                {/* JUDUL SURAT */}
                <div className="text-center mb-6">
                  <h2 className="text-base font-bold underline uppercase">{selectedLetter.name}</h2>
                  <p className="text-sm">Nomor: {suratNumber || '......./......./......./2026'}</p>
                </div>

                {/* ISI SURAT */}
                <div className="text-sm leading-relaxed">
                  {renderLetterContent()}
                </div>

                {/* TANDA TANGAN */}
                <div className="mt-8 flex justify-end">
                  <div className="text-center text-sm">
                    <p>{villageInfo.kabupaten}, {getTodayFormatted()}</p>
                    <p className="font-bold">Kepala Desa {villageInfo.namaDesa}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{villageInfo.kepalaDesa}</p>
                    <p className="text-xs">{villageInfo.nipKepalaDesa}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Form Mode */
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>{selectedLetter.category}</span>
                <span>›</span>
                <span className="text-green-700 font-medium">{selectedLetter.name}</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{selectedLetter.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedLetter.name}</h2>
                  <p className="text-sm text-gray-500">Kategori: {selectedLetter.category} • {selectedLetter.fields.length} field</p>
                </div>
              </div>

              {/* Info Surat */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                  <span>📋</span> Informasi Surat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nomor Surat</label>
                    <input
                      type="text"
                      value={suratNumber}
                      onChange={e => setSuratNumber(e.target.value)}
                      placeholder="Contoh: 470/001/DS/2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Surat</label>
                    <input
                      type="text"
                      value={getTodayFormatted()}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                  <span>📝</span> Data Surat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLetter.fields.map(field => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        >
                          <option value="">-- Pilih --</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2 text-sm shadow"
                  >
                    👁️ Preview Surat
                  </button>
                  <button
                    onClick={() => { setFormData({}); }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
                  >
                    🔄 Reset Form
                  </button>
                  <button
                    onClick={() => { setSelectedLetter(null); setFormData({}); }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
