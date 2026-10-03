const fs=require('fs'),path=require('path');
module.exports=function(db){
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'80_jenis_surat_dan_field.json'),'utf8'));
 const grouped={}; data.forEach(x=>{if(!grouped[x.kode_surat])grouped[x.kode_surat]=[];grouped[x.kode_surat].push(x)});
 const ins=db.prepare('INSERT OR IGNORE INTO jenis_surat(kode,nama,kategori,aktif,field_json) VALUES(?,?,?,?,?)');
 db.transaction(()=>Object.entries(grouped).forEach(([k,arr])=>ins.run(k,arr[0].nama_surat,'Administrasi Desa',1,JSON.stringify(arr))))();
 db.prepare("INSERT OR IGNORE INTO template_surat(kode,nama,judul,isi) VALUES('DEFAULT','Template Umum','SURAT KETERANGAN','Yang bertanda tangan di bawah ini menerangkan bahwa {nama} dengan NIK {nik}.')").run();
};