/** Triển khai dưới tài khoản có quyền đọc các thư mục Drive. */
const FOLDERS={sgk:'1vPSXp3EB81P7tzC_B535mpMpJ-9U75PO',khbd:'1QIbo__RNpTmhPLNmXCbCA-IQv-6DVjIg',baigiang:'18tRGY4FK5_CdaLUY5F5_UwFeXtFuN-hT',phieu:'1IyZ1K7XCbizwQptwh5c-ScHuBhBZvRwE',dethi:'1cMjA9_k5IBuWuX2Qmholo5VrTcvEoOm3'};
function doGet(e){
 const p=e.parameter||{},key=p.category||'';
 const callback=p.callback||'';
 if(!/^[A-Za-z_$][\w$]{0,100}$/.test(callback))return ContentService.createTextOutput('Invalid callback');
 let result={ok:false,category:key,files:[]};
 try{
  if(!Object.prototype.hasOwnProperty.call(FOLDERS,key))throw Error('Unknown category');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
   const props=PropertiesService.getScriptProperties(),storeKey='files_'+key;
   let saved=[];try{saved=JSON.parse(props.getProperty(storeKey)||'[]')}catch(_){}
   const byId={};saved.forEach(f=>{if(f.id)byId[f.id]=f});
   const iter=DriveApp.getFolderById(FOLDERS[key]).getFiles();
   while(iter.hasNext()){const f=iter.next();byId[f.getId()]={id:f.getId(),name:f.getName(),mimeType:f.getMimeType()}}
   const files=Object.values(byId).sort((a,b)=>a.name.localeCompare(b.name,'vi'));
   // Script Properties limit: 9 KB per value. Keep only a small cache here.
   const serialized=JSON.stringify(files);
   if(serialized.length<8000)props.setProperty(storeKey,serialized);
   result={ok:true,category:key,files:files};
  }finally{lock.releaseLock()}
 }catch(err){result.error=String(err.message||err)}
 return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
