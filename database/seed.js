const fs=require('fs'),path=require('path');
module.exports=function(db){
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'80_jenis_surat_dan_field.json'),'utf8'));
 const grouped={}; data.forEach(x=>{if(!grouped[x.kode_surat])grouped[x.kode_surat]=[];grouped[x.kode_surat].push(x)});
 const ins=db.prepare('INSERT OR IGNORE INTO jenis_surat(kode,nama,kategori,aktif,field_json) VALUES(?,?,?,?,?)');
 db.transaction(()=>Object.entries(grouped).forEach(([k,arr])=>ins.run(k,arr[0].nama_surat,'Administrasi Desa',1,JSON.stringify(arr))))();
 const defaultIsi = `Yang bertanda tangan di bawah ini menerangkan bahwa:\n\nNama            : {{nama}}\nNIK             : {{nik}}\nNo. KK          : {{no_kk}}\nTempat/Tgl Lahir: {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin   : {{jenis_kelamin}}\nAgama           : {{agama}}\nPekerjaan       : {{pekerjaan}}\nAlamat          : {{alamat}}, RT {{rt}} / RW {{rw}}, Desa {{desa}}\n\n{{keperluan}}\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`;
 db.prepare("INSERT OR IGNORE INTO template_surat(kode,nama,judul,isi) VALUES('001','Template Surat Keterangan Domisili','SURAT KETERANGAN DOMISILI',?)").run(defaultIsi);
};