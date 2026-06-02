import { useState, useEffect, useMemo, useRef } from "react";

const DEFAULT_PRICES = { FWC:3500, FOIL:1300, TOP:430, PHOTO:900, BASE:430 };
const SPECIAL_PRICES_INIT = {
  "s00":25000,"ARG_1":4500,"ARG_3":45000,"POR_3":20000,"FRA_3":15000,
  "CRO_3":4000,"ESP_4":10000,"ENG_5":2000,"BRA_3":1000,"NOR_3":7000,
};
const PRICE_META = {
  FWC:  {label:"FWC Especial",emoji:"🌟",color:"#92400e",bg:"#fef3c7",border:"#f59e0b"},
  FOIL: {label:"Escudo FOIL", emoji:"🛡️",color:"#1e40af",bg:"#dbeafe",border:"#3b82f6"},
  TOP:  {label:"TOP Jugador", emoji:"⭐",color:"#6d28d9",bg:"#ede9fe",border:"#8b5cf6"},
  PHOTO:{label:"Formación",   emoji:"📸",color:"#065f46",bg:"#d1fae5",border:"#10b981"},
  BASE: {label:"Jugador",     emoji:"👕",color:"#374151",bg:"#f3f4f6",border:"#9ca3af"},
};
const PROVINCES_AR = ["Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Entre Ríos","Salta","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan","Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca","La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"];
const COUNTRIES = [
  {code:"MEX",name:"México",flag:"🇲🇽",conf:"Sede",group:"A",tops:["H. Lozano","S. Giménez","E. Álvarez"]},
  {code:"USA",name:"Estados Unidos",flag:"🇺🇸",conf:"Sede",group:"B",tops:["C. Pulisic","G. Reyna","T. Adams"]},
  {code:"CAN",name:"Canadá",flag:"🇨🇦",conf:"Sede",group:"C",tops:["A. Davies","J. David","J. Buchanan"]},
  {code:"ARG",name:"Argentina",flag:"🇦🇷",conf:"CONMEBOL",group:"B",tops:["L. Messi","J. Álvarez","R. De Paul","E. Mac Allister"]},
  {code:"BRA",name:"Brasil",flag:"🇧🇷",conf:"CONMEBOL",group:"F",tops:["Vinícius Jr.","Rodrygo","Raphinha","Endrick"]},
  {code:"URU",name:"Uruguay",flag:"🇺🇾",conf:"CONMEBOL",group:"H",tops:["F. Valverde","D. Núñez","R. Bentancur"]},
  {code:"COL",name:"Colombia",flag:"🇨🇴",conf:"CONMEBOL",group:"D",tops:["L. Díaz","J. Cuadrado","R. Arias"]},
  {code:"ECU",name:"Ecuador",flag:"🇪🇨",conf:"CONMEBOL",group:"G",tops:["E. Caicedo","P. Estupiñán","J. Sarmiento"]},
  {code:"PAR",name:"Paraguay",flag:"🇵🇾",conf:"CONMEBOL",group:"J",tops:["M. Almirón","A. Sanabria","O. Romero"]},
  {code:"CHI",name:"Chile",flag:"🇨🇱",conf:"CONMEBOL",group:"K",tops:["A. Vidal","C. Aranguiz","B. Brereton"]},
  {code:"VEN",name:"Venezuela",flag:"🇻🇪",conf:"CONMEBOL",group:"L",tops:["Y. Soteldo","S. Córdova","J. Martínez"]},
  {code:"BOL",name:"Bolivia",flag:"🇧🇴",conf:"CONMEBOL",group:"L",tops:["C. Morales","B. Saucedo","M. Terceros"]},
  {code:"PER",name:"Perú",flag:"🇵🇪",conf:"CONMEBOL",group:"I",tops:["P. Guerrero","C. Cueva","L. Iberico"]},
  {code:"ESP",name:"España",flag:"🇪🇸",conf:"UEFA",group:"C",tops:["Pedri","L. Yamal","R. Morata","Rodri"]},
  {code:"FRA",name:"Francia",flag:"🇫🇷",conf:"UEFA",group:"F",tops:["K. Mbappé","A. Griezmann","A. Tchouaméni"]},
  {code:"GER",name:"Alemania",flag:"🇩🇪",conf:"UEFA",group:"D",tops:["F. Wirtz","J. Musiala","T. Müller"]},
  {code:"ENG",name:"Inglaterra",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",conf:"UEFA",group:"G",tops:["J. Bellingham","H. Kane","B. Saka"]},
  {code:"POR",name:"Portugal",flag:"🇵🇹",conf:"UEFA",group:"E",tops:["C. Ronaldo","B. Félix","R. Leão","Vitinha"]},
  {code:"NED",name:"Países Bajos",flag:"🇳🇱",conf:"UEFA",group:"H",tops:["V. van Dijk","F. de Jong","C. Gakpo"]},
  {code:"BEL",name:"Bélgica",flag:"🇧🇪",conf:"UEFA",group:"F",tops:["K. De Bruyne","R. Lukaku","J. Doku"]},
  {code:"ITA",name:"Italia",flag:"🇮🇹",conf:"UEFA",group:"I",tops:["S. Tonali","F. Chiesa","G. Donnarumma"]},
  {code:"CRO",name:"Croacia",flag:"🇭🇷",conf:"UEFA",group:"G",tops:["L. Modrić","M. Brozović","I. Gvardiol"]},
  {code:"DEN",name:"Dinamarca",flag:"🇩🇰",conf:"UEFA",group:"K",tops:["C. Eriksen","V. Højlund","A. Christensen"]},
  {code:"AUT",name:"Austria",flag:"🇦🇹",conf:"UEFA",group:"L",tops:["M. Sabitzer","D. Alaba","C. Baumgartner"]},
  {code:"CHE",name:"Suiza",flag:"🇨🇭",conf:"UEFA",group:"K",tops:["G. Xhaka","B. Embolo","Y. Shaqiri"]},
  {code:"NOR",name:"Noruega",flag:"🇳🇴",conf:"UEFA",group:"J",tops:["E. Haaland","M. Ødegaard","A. Sörloth"]},
  {code:"TUR",name:"Turquía",flag:"🇹🇷",conf:"UEFA",group:"B",tops:["H. Çalhanoğlu","B. Yılmaz","A. Güler"]},
  {code:"SER",name:"Serbia",flag:"🇷🇸",conf:"UEFA",group:"D",tops:["D. Vlahović","A. Mitrović","N. Milinković-Savić"]},
  {code:"HUN",name:"Hungría",flag:"🇭🇺",conf:"UEFA",group:"L",tops:["D. Szoboszlai","R. Sallai","A. Schäfer"]},
  {code:"SCO",name:"Escocia",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",conf:"UEFA",group:"C",tops:["A. Robertson","S. McTominay","J. McGinn"]},
  {code:"MAR",name:"Marruecos",flag:"🇲🇦",conf:"CAF",group:"A",tops:["A. Hakimi","H. Ziyech","Y. En-Nesyri"]},
  {code:"EGY",name:"Egipto",flag:"🇪🇬",conf:"CAF",group:"F",tops:["M. Salah","T. Mohamed","R. Sobhi"]},
  {code:"SEN",name:"Senegal",flag:"🇸🇳",conf:"CAF",group:"A",tops:["S. Mané","I. Sarr","E. Mendy"]},
  {code:"NGR",name:"Nigeria",flag:"🇳🇬",conf:"CAF",group:"B",tops:["V. Osimhen","A. Iwobi","C. Bassey"]},
  {code:"RSA",name:"Sudáfrica",flag:"🇿🇦",conf:"CAF",group:"A",tops:["P. Tau","B. Zwane","S. Chaine"]},
  {code:"CMR",name:"Camerún",flag:"🇨🇲",conf:"CAF",group:"E",tops:["V. Aboubakar","A. Onana","K. Toko Ekambi"]},
  {code:"CIV",name:"Costa de Marfil",flag:"🇨🇮",conf:"CAF",group:"E",tops:["S. Haller","F. Gradel","E. Zaha"]},
  {code:"GHA",name:"Ghana",flag:"🇬🇭",conf:"CAF",group:"I",tops:["A. Ayew","J. Ayew","M. Kudus"]},
  {code:"ALG",name:"Argelia",flag:"🇩🇿",conf:"CAF",group:"B",tops:["R. Mahrez","I. Bennacer","A. Belaïli"]},
  {code:"TUN",name:"Túnez",flag:"🇹🇳",conf:"CAF",group:"H",tops:["Y. Msakni","H. Ben Amor","E. Jaziri"]},
  {code:"MLI",name:"Malí",flag:"🇲🇱",conf:"CAF",group:"J",tops:["A. Traoré","M. Diallo","H. Kouyaté"]},
  {code:"NAM",name:"Namibia",flag:"🇳🇦",conf:"CAF",group:"F",tops:["P. Shalulile","P. Jacobs","I. Rusike"]},
  {code:"GUI",name:"Guinea",flag:"🇬🇳",conf:"CAF",group:"K",tops:["S. Bah","M. Camará","N. Kouyaté"]},
  {code:"JPN",name:"Japón",flag:"🇯🇵",conf:"AFC",group:"D",tops:["S. Mitoma","J. Ito","H. Morita"]},
  {code:"KOR",name:"Corea del Sur",flag:"🇰🇷",conf:"AFC",group:"H",tops:["H. Son","J. Hwang","Y. Lee Kang-in"]},
  {code:"AUS",name:"Australia",flag:"🇦🇺",conf:"AFC",group:"I",tops:["M. Leckie","H. Irvine","J. Hrustic"]},
  {code:"IRI",name:"Irán",flag:"🇮🇷",conf:"AFC",group:"E",tops:["S. Azmoun","M. Taremi","A. Jahanbakhsh"]},
  {code:"SAU",name:"Arabia Saudita",flag:"🇸🇦",conf:"AFC",group:"D",tops:["S. Al-Dawsari","Y. Al-Shahrani","F. Al-Bulayhi"]},
  {code:"IRQ",name:"Irak",flag:"🇮🇶",conf:"AFC",group:"K",tops:["A. Al-Hamdani","A. Karimi","B. Al-Rashidi"]},
  {code:"MAL",name:"Malasia",flag:"🇲🇾",conf:"AFC",group:"C",tops:["M. Safawi","L. Faisal","A. Zaquan"]},
  {code:"NZL",name:"Nueva Zelanda",flag:"🇳🇿",conf:"OFC",group:"A",tops:["C. Wood","W. Coyle","T. Papadopoulos"]},
  {code:"PAN",name:"Panamá",flag:"🇵🇦",conf:"CONCACAF",group:"C",tops:["A. Figuero","R. Murillo","J. Córdoba"]},
  {code:"CRI",name:"Costa Rica",flag:"🇨🇷",conf:"CONCACAF",group:"E",tops:["K. Navas","J. Campbell","B. Ruiz"]},
];
const PLAYER_ROLES = ["Arquero titular","Arquero suplente","Defensor central 1","Defensor central 2","Lateral derecho","Lateral izquierdo","Mediocampista def.","Mediocampista central","Mediocampista of.","Extremo derecho","Extremo izquierdo","Delantero centro","Volante box-to-box","Segundo delantero","Comodín ofensivo","Promesa joven","Capitán","Referente"];
function buildCountryStickers(c){const ss=[];ss.push({key:`${c.code}_1`,num:`${c.code}1`,name:"Escudo oficial",type:"FOIL"});ss.push({key:`${c.code}_2`,num:`${c.code}2`,name:"Formación grupal",type:"PHOTO"});PLAYER_ROLES.forEach((r,i)=>ss.push({key:`${c.code}_${i+3}`,num:`${c.code}${i+3}`,name:c.tops?.[i]||r,type:c.tops?.[i]?"TOP":"BASE"}));return ss;}
const FWC_STICKERS=[{key:"s00",num:"00",name:"Logo Panini",type:"FWC"},{key:"fwc1",num:"FWC1",name:"Emblema Oficial",type:"FWC"},{key:"fwc2",num:"FWC2",name:"Emblema (var.)",type:"FWC"},{key:"fwc3",num:"FWC3",name:"Mascotas",type:"FWC"},{key:"fwc4",num:"FWC4",name:"Slogan Oficial",type:"FWC"},{key:"fwc5",num:"FWC5",name:"Balón Oficial",type:"FWC"},{key:"fwc6",num:"FWC6",name:"Canadá Sede",type:"FWC"},{key:"fwc7",num:"FWC7",name:"México Sede",type:"FWC"},{key:"fwc8",num:"FWC8",name:"USA Sede",type:"FWC"},{key:"fwc9",num:"FWC9",name:"MetLife Stadium",type:"FWC"},{key:"fwc10",num:"FWC10",name:"Rose Bowl",type:"FWC"},{key:"fwc11",num:"FWC11",name:"Estadio Azteca",type:"FWC"},{key:"fwc12",num:"FWC12",name:"SoFi Stadium",type:"FWC"},{key:"fwc13",num:"FWC13",name:"Estadio Dallas",type:"FWC"},{key:"fwc14",num:"FWC14",name:"Estadio Vancouver",type:"FWC"},{key:"fwc15",num:"FWC15",name:"Estadio Atlanta",type:"FWC"},{key:"fwc16",num:"FWC16",name:"Estadio Seattle",type:"FWC"},{key:"fwc17",num:"FWC17",name:"Estadio Toronto",type:"FWC"}];
const ALL_STICKERS=[...FWC_STICKERS,...COUNTRIES.flatMap(c=>buildCountryStickers(c))];
const DEFAULT_PRODUCTS = [
  {id:"p1",name:"Sobre Panini individual",desc:"1 sobre original cerrado · 7 figuritas",price:1500,stock:200,emoji:"📦",category:"sobre"},
  {id:"p2",name:"Pack 10 sobres",desc:"10 sobres Panini cerrados originales",price:12000,stock:50,emoji:"📦",category:"sobre"},
  {id:"p3",name:"Pack 25 sobres",desc:"25 sobres cerrados — mejor precio",price:28000,stock:30,emoji:"📦",category:"sobre"},
  {id:"p4",name:"Pack 50 sobres",desc:"50 sobres — el mejor precio por sobre",price:52000,stock:15,emoji:"📦",category:"sobre"},
  {id:"p5",name:"Lote 50 figuritas",desc:"50 figuritas variadas sin repetir",price:18000,stock:20,emoji:"🎴",category:"lote"},
  {id:"p6",name:"Lote 100 figuritas",desc:"100 figuritas variadas sin repetir",price:33000,stock:10,emoji:"🎴",category:"lote"},
  {id:"p7",name:"Lote ARGENTINA completo",desc:"Las 20 figuritas de Argentina (con Messi)",price:95000,stock:5,emoji:"🇦🇷",category:"lote"},
  {id:"p8",name:"Álbum vacío + 10 sobres",desc:"Álbum oficial Panini vacío + 10 sobres",price:22000,stock:8,emoji:"📖",category:"album"},
  {id:"p9",name:"Álbum COMPLETO sin pegar",desc:"Álbum con las 980 figuritas sin pegar",price:850000,stock:2,emoji:"🏆",category:"album"},
  {id:"p10",name:"Sobre Coca-Cola cerrado",desc:"Edición especial Coca-Cola · coleccionable",price:3500,stock:40,emoji:"🥤",category:"cocacola"},
  {id:"p11",name:"Pack 5 sobres Coca-Cola",desc:"5 sobres edición Coca-Cola cerrados",price:15000,stock:15,emoji:"🥤",category:"cocacola"},
];
const WA_NUM="5491100000000", IG_HANDLE="@figuritasmundial2026", WA_DISPLAY="+54 9 11 0000-0000", ADMIN_PW="admin2026", RES_MINS=20;
const B={dark:"#0f172a",mid:"#1e3a5f",acc:"#2563eb",tf:"'Bebas Neue',cursive"};
const fmt=(n)=>Number(n).toLocaleString("es-AR");
function fmtDate(ts){const d=new Date(ts);return`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;}
function getWeek(ts){const d=new Date(ts);const s=new Date(d);s.setDate(d.getDate()-d.getDay());return`${s.getDate()}/${s.getMonth()+1}`;}
function getMonthKey(ts){const d=new Date(ts);return`${d.getMonth()+1}/${d.getFullYear()}`;}
function getYearKey(ts){return String(new Date(ts).getFullYear());}
function padOrder(n){return String(n).padStart(4,"0");}
function ChipBtn({active,onClick,children}){return<button style={{padding:"3px 10px",borderRadius:14,border:`1.5px solid ${active?B.dark:"#e2e8f0"}`,background:active?B.dark:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",color:active?"#fff":"#475569",whiteSpace:"nowrap"}} onClick={onClick}>{children}</button>;}
const inp={padding:"9px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:B.dark,background:"#fff",width:"100%"};
const lbl={fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,marginBottom:5,display:"block"};
const aBtn={background:`linear-gradient(135deg,${B.acc},#1d4ed8)`,color:"#fff",border:"none",borderRadius:25,padding:"9px 20px",fontSize:13,fontWeight:800,cursor:"pointer"};
const bBtn={background:"none",border:"none",color:B.acc,fontSize:12,fontWeight:600,cursor:"pointer",padding:"0 0 10px",display:"block"};
const qBtn={width:22,height:22,borderRadius:4,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:12,fontWeight:800};
const tag=(bg,c)=>({fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:600,background:`#${bg}`,color:`#${c}`});

function GS(){return<style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif}input,select{font-family:'Outfit',sans-serif}.hov:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.1)!important;border-color:#3b82f6!important}.hov{transition:all .18s}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}input:focus,select:focus{outline:2px solid #3b82f6;outline-offset:1px}`}</style>;}

export default function App(){
  const [screen,setScreen]=useState("home");
  const [user,setUser]=useState(null);
  const [admin,setAdmin]=useState(false);
  const [stock,setStock]=useState({});
  const [prices,setPrices]=useState({...SPECIAL_PRICES_INIT});
  const [base,setBase]=useState({...DEFAULT_PRICES});
  const [res,setRes]=useState({});
  const [users,setUsers]=useState([]);
  const [orders,setOrders]=useState([]);
  const [oc,setOc]=useState(1);
  const [products,setProducts]=useState(DEFAULT_PRODUCTS);
  const [loaded,setLoaded]=useState(false);
  const [cart,setCart]=useState({});
  const [selC,setSelC]=useState(null);
  const [expiry,setExpiry]=useState(null);
  const [tab,setTab]=useState("figuritas");
  const tmr=useRef(null);

  useEffect(()=>{
    async function load(){
      try{
        const ks=["stk","prc","bprc","res","usr","ord","oc","prods"];
        const rs=await Promise.all(ks.map(k=>window.storage.get("mw26_"+k,true).catch(()=>null)));
        const p=(r,fb)=>{try{return r?.value?JSON.parse(r.value):fb;}catch{return fb;}};
        setStock(p(rs[0],{}));setPrices(p(rs[1],{...SPECIAL_PRICES_INIT}));setBase(p(rs[2],{...DEFAULT_PRICES}));
        const rv=p(rs[3],{}),now=Date.now();
        setRes(Object.fromEntries(Object.entries(rv).filter(([,v])=>v.expiresAt>now)));
        setUsers(p(rs[4],[]));setOrders(p(rs[5],[]));setOc(p(rs[6],1));setProducts(p(rs[7],DEFAULT_PRODUCTS));
      }catch(e){}
      setLoaded(true);
    }
    load();const iv=setInterval(load,12000);return()=>clearInterval(iv);
  },[]);

  const sv=(k,v,set)=>{set(v);window.storage.set("mw26_"+k,JSON.stringify(v),true).catch(()=>{});};
  const getP=(s)=>{if(s._isProduct)return s.price;return prices[s.key]??base[s.type]??DEFAULT_PRICES[s.type];};
  const getAvail=(key)=>{const tot=stock[key]||0,now=Date.now();const r=Object.values(res).filter(r=>r.key===key&&r.expiresAt>now&&(!user||r.userId!==user.id)).length;return Math.max(0,tot-r);};

  const startRes=async(keys)=>{
    if(!user)return;const exp=Date.now()+RES_MINS*60000;
    const nr={...res};keys.forEach(k=>{nr[`${user.id}_${k}`]={key:k,userId:user.id,expiresAt:exp};});
    sv("res",nr,setRes);setExpiry(exp);
    if(tmr.current)clearTimeout(tmr.current);
    tmr.current=setTimeout(()=>{releaseRes();setCart({});setExpiry(null);alert("⏰ Tu reserva expiró.");setScreen("shop");},RES_MINS*60000);
  };
  const releaseRes=async()=>{
    if(!user)return;
    const nr=Object.fromEntries(Object.entries(res).filter(([k])=>!k.startsWith(user.id+"_")));
    sv("res",nr,setRes);if(tmr.current)clearTimeout(tmr.current);setExpiry(null);
  };
  const placeOrder=async(delivery,fp)=>{
    const items=Object.values(cart).map(s=>({key:s.key,num:s.num||s.id,name:s.name,type:s.type||"PROD",price:getP(s),isProduct:!!s._isProduct,countryName:s._isProduct?null:COUNTRIES.find(c=>s.key?.startsWith(c.code+"_"))?.name||"FWC"}));
    const total=items.reduce((a,i)=>a+i.price,0);
    const order={orderNum:padOrder(oc),id:Date.now().toString(36).toUpperCase(),userId:user?.id||"g",
      userName:`${fp?.nombre||user?.nombre||""} ${fp?.apellido||user?.apellido||""}`.trim(),
      userEmail:fp?.email||user?.email||"",userPhone:fp?.telefono||"",userDni:fp?.dni||"",
      userAddress:fp?.direccion?`${fp.direccion}, CP ${fp.codigoPostal}`:"",userProvince:fp?.provincia||"",
      items,total,delivery,status:"pendiente",createdAt:Date.now(),
      week:getWeek(Date.now()),monthKey:getMonthKey(Date.now()),yearKey:getYearKey(Date.now()),dayKey:fmtDate(Date.now())};
    const nr={...res};
    items.filter(i=>!i.isProduct).forEach(i=>{nr[`${user?.id||"g"}_${i.key}`]={key:i.key,userId:user?.id||"g",expiresAt:Date.now()+48*3600000};});
    sv("res",nr,setRes);
    sv("ord",[...orders,order],setOrders);sv("oc",oc+1,setOc);
    if(fp){const nu={...fp,id:user?.id||Date.now().toString(36),registeredAt:Date.now()};setUser(nu);if(!users.find(u=>u.email===nu.email))sv("usr",[...users,nu],setUsers);}
    setCart({});return order;
  };
  const confirmOrder=async(orderId)=>{
    const order=orders.find(o=>o.id===orderId);if(!order||order.status==="pagado")return;
    const ns={...stock};const np=[...products];
    order.items.forEach(i=>{if(i.isProduct){const pi=np.findIndex(p=>p.id===i.key);if(pi>=0)np[pi]={...np[pi],stock:Math.max(0,(np[pi].stock||0)-1)};}else{ns[i.key]=Math.max(0,(ns[i.key]||0)-1);}});
    sv("stk",ns,setStock);sv("prods",np,setProducts);
    sv("ord",orders.map(o=>o.id===orderId?{...o,status:"pagado",paidAt:Date.now()}:o),setOrders);
  };

  const p={screen,setScreen,user,setUser,admin,setAdmin,stock,prices,base,
    saveStock:(v)=>sv("stk",v,setStock),savePrices:(v)=>sv("prc",v,setPrices),saveBase:(v)=>sv("bprc",v,setBase),
    res,cart,setCart,selC,setSelC,expiry,startRes,releaseRes,placeOrder,confirmOrder,
    users,saveUsers:(v)=>sv("usr",v,setUsers),orders,getP,getAvail,loaded,
    products,saveProducts:(v)=>sv("prods",v,setProducts),tab,setTab};

  if(!loaded)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:B.dark,gap:12}}><span style={{fontSize:50}}>⚽</span><div style={{fontFamily:B.tf,fontSize:24,color:"#fff",letterSpacing:2}}>CARGANDO...</div></div>;
  if(admin)return<AdminPanel {...p}/>;

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#f1f5f9",minHeight:"100vh",paddingBottom:80}}>
      <GS/>
      {/* TOP BAR */}
      <header style={{background:B.dark,padding:"9px 14px",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:960,margin:"0 auto"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:9,padding:0}} onClick={()=>setScreen("home")}>
            <span style={{fontSize:22}}>⚽</span>
            <div><div style={{fontFamily:B.tf,fontSize:19,color:"#fff",letterSpacing:1.5,lineHeight:1}}>FIGURITAS 2026</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>Mundial FIFA · Panini</div></div>
          </button>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <TimerPill expiry={expiry}/>
            {Object.keys(cart).length>0&&<button style={{position:"relative",background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 12px",fontSize:16,cursor:"pointer"}} onClick={()=>setScreen("cart")}>🛒<span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",borderRadius:10,fontSize:10,fontWeight:800,padding:"1px 5px",minWidth:17,textAlign:"center"}}>{Object.keys(cart).length}</span></button>}
            {user?<><span style={{color:"rgba(255,255,255,.6)",fontSize:12}}>👋 {user.nombre}</span><button style={{background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>{releaseRes();setCart({});setUser(null);}}>Salir</button></>:<button style={{background:B.acc,color:"#fff",border:"none",borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("figuritas");}}>Ver figuritas</button>}
            <button style={{background:"transparent",color:"rgba(255,255,255,.4)",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>setAdmin(true)}>Admin</button>
          </div>
        </div>
      </header>

      {/* NAV TABS */}
      {screen!=="home"&&screen!=="checkout"&&(
        <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
          {[["figuritas","⚽ Figuritas"],["products","🎴 Lotes"],["matches","📅 Partidos"]].map(([v,l])=>(
            <button key={v} style={{padding:"10px 16px",border:"none",background:"transparent",fontSize:13,fontWeight:700,cursor:"pointer",color:tab===v?B.acc:"#64748b",borderBottom:tab===v?`2px solid ${B.acc}`:"2px solid transparent",whiteSpace:"nowrap"}} onClick={()=>{setTab(v);setScreen("shop");}}>
              {l}
            </button>
          ))}
        </div>
      )}
      {/* PRICE RIBBON */}
      {tab==="figuritas"&&screen!=="home"&&screen!=="checkout"&&(
        <div style={{display:"flex",gap:5,overflowX:"auto",padding:"5px 10px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",scrollbarWidth:"none"}}>
          {Object.entries(PRICE_META).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,background:v.bg,color:v.color,border:`1px solid ${v.border}`}}>{v.emoji} {v.label} · <b>${fmt(base[k]||DEFAULT_PRICES[k])}</b></div>)}
        </div>
      )}

      {screen==="home"    &&<HomeScreen    {...p}/>}
      {screen==="shop"    &&tab==="figuritas"&&<ShopScreen    {...p}/>}
      {screen==="shop"    &&tab==="products" &&<ProductsScreen {...p}/>}
      {screen==="shop"    &&tab==="matches"  &&<MatchesScreen/>}
      {screen==="country" &&<CountryScreen  {...p}/>}
      {screen==="fwc"     &&<FWCScreen      {...p}/>}
      {screen==="cart"    &&<CartScreen     {...p}/>}
      {screen==="checkout"&&<CheckoutScreen {...p}/>}

      <footer style={{background:B.dark,padding:"12px 20px",textAlign:"center",marginTop:20}}>
        <div style={{display:"flex",justifyContent:"center",gap:18,flexWrap:"wrap"}}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{color:"#f472b6",fontWeight:700,fontSize:13,textDecoration:"none"}}>📸 {IG_HANDLE}</a>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{color:"#4ade80",fontWeight:700,fontSize:13,textDecoration:"none"}}>💬 {WA_DISPLAY}</a>
        </div>
      </footer>
    </div>
  );
}

function TimerPill({expiry}){const[t,setT]=useState("");useEffect(()=>{if(!expiry)return;const iv=setInterval(()=>{const d=expiry-Date.now();if(d<=0){setT("");return;}setT(`⏱ ${Math.floor(d/60000)}:${String(Math.floor((d%60000)/1000)).padStart(2,"0")}`);},1000);return()=>clearInterval(iv);},[expiry]);if(!t)return null;return<div style={{background:"#f59e0b",color:B.dark,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:800}}>{t}</div>;}

function HomeScreen({setScreen,setTab}){
  return(
    <div style={{minHeight:"calc(100vh - 60px)",background:`linear-gradient(160deg,${B.dark},${B.mid},#0c4a6e)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:"40px 20px",maxWidth:540}}>
        <div style={{fontSize:64}}>🏆</div>
        <h1 style={{fontFamily:B.tf,fontSize:50,color:"#fff",lineHeight:1,letterSpacing:2,margin:"10px 0 14px"}}>FIGURITAS<br/>MUNDIAL 2026</h1>
        <p style={{color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.7,marginBottom:26}}>980 figuritas · 48 selecciones · Álbum Panini oficial<br/>Lotes armados, sobres y álbumes completos</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
          <button style={{...aBtn,padding:"13px 26px",fontSize:15,borderRadius:28}} onClick={()=>{setScreen("shop");setTab("figuritas");}}>⚽ Ver figuritas</button>
          <button style={{background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff",border:"none",borderRadius:28,padding:"13px 26px",fontSize:15,fontWeight:800,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("products");}}>🎴 Lotes & Sobres</button>
        </div>
        <button style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.7)",border:"1px solid rgba(255,255,255,.2)",borderRadius:28,padding:"9px 22px",fontSize:13,fontWeight:600,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("matches");}}>📅 Ver partidos del Mundial</button>
        <div style={{marginTop:20,display:"flex",justifyContent:"center",gap:18}}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{color:"#f472b6",fontWeight:700,fontSize:13,textDecoration:"none"}}>📸 {IG_HANDLE}</a>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{color:"#4ade80",fontWeight:700,fontSize:13,textDecoration:"none"}}>💬 {WA_DISPLAY}</a>
        </div>
      </div>
    </div>
  );
}

function ShopScreen({setScreen,setSelC,cart,getAvail}){
  const [srch,setSrch]=useState("");const [conf,setConf]=useState("Todos");const [grp,setGrp]=useState("Todos");
  const cs=["Todos","Sede","CONMEBOL","UEFA","CAF","AFC","CONCACAF","OFC"];
  const gs=["Todos","A","B","C","D","E","F","G","H","I","J","K","L"];
  const fil=useMemo(()=>COUNTRIES.filter(c=>{const q=srch.toLowerCase();return(!q||c.name.toLowerCase().includes(q)||c.code.toLowerCase().includes(q))&&(conf==="Todos"||c.conf===conf)&&(grp==="Todos"||c.group===grp);}),[srch,conf,grp]);
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10}} onClick={()=>setScreen("fwc")}>🌟 Especiales FWC — Las más buscadas del álbum</button>
      <input style={{...inp,marginBottom:10}} placeholder="🔍 Buscar selección..." value={srch} onChange={e=>setSrch(e.target.value)}/>
      <div style={{marginBottom:8}}><div style={lbl}>Confederación</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{cs.map(c=><ChipBtn key={c} active={conf===c} onClick={()=>setConf(c)}>{c}</ChipBtn>)}</div></div>
      <div style={{marginBottom:12}}><div style={lbl}>Grupo</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{gs.map(g=><ChipBtn key={g} active={grp===g} onClick={()=>setGrp(g)}>{g}</ChipBtn>)}</div></div>
      <p style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>{fil.length} selecciones</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:9}}>
        {fil.map(c=>{const ss=buildCountryStickers(c);const inC=ss.filter(s=>cart[s.key]).length;const av=ss.filter(s=>getAvail(s.key)>0).length;return(
          <button key={c.code} className="hov" style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"12px 13px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 6px rgba(0,0,0,.04)"}} onClick={()=>{setSelC(c);setScreen("country");}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:28}}>{c.flag}</span>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:B.dark}}>{c.name}</div><div style={{fontSize:11,color:"#64748b"}}>Grupo {c.group} · {c.conf}</div></div>
              {inC>0&&<span style={{background:"#dbeafe",color:"#1e40af",fontSize:11,fontWeight:800,padding:"2px 7px",borderRadius:9}}>🛒{inC}</span>}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <span style={tag("dbeafe","1e40af")}>🛡️ FOIL</span>
              <span style={tag("ede9fe","6d28d9")}>⭐ {c.tops?.length||0} TOP</span>
              <span style={av>0?tag("d1fae5","065f46"):tag("fee2e2","991b1b")}>📦 {av}/20</span>
            </div>
          </button>
        );})}
      </div>
    </div>
  );
}

function ProductsScreen({cart,setCart,getP,products}){
  const [cat,setCat]=useState("todos");
  const cats=[["todos","Todos"],["sobre","📦 Sobres"],["lote","🎴 Lotes"],["album","📖 Álbumes"],["cocacola","🥤 Coca-Cola"]];
  const fil=useMemo(()=>cat==="todos"?products:products.filter(p=>p.category===cat),[cat,products]);
  const allTotal=Object.values(cart).reduce((a,s)=>a+getP(s),0);
  const allCount=Object.keys(cart).length;
  const toggle=(p)=>setCart(prev=>{const n={...prev};if(n[p.id])delete n[p.id];else n[p.id]={...p,key:p.id,_isProduct:true};return n;});
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <h1 style={{fontFamily:B.tf,fontSize:26,color:B.dark,marginBottom:4,letterSpacing:1}}>Lotes & Productos</h1>
      <p style={{color:"#64748b",fontSize:13,marginBottom:14}}>Sobres, lotes armados, álbumes y ediciones especiales</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{cats.map(([v,l])=><ChipBtn key={v} active={cat===v} onClick={()=>setCat(v)}>{l}</ChipBtn>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
        {fil.map(p=>{const sel=!!cart[p.id];const avail=p.stock||0;return(
          <div key={p.id} className="hov" style={{background:"#fff",border:`2px solid ${sel?B.acc:"#e2e8f0"}`,borderRadius:14,padding:16,cursor:"pointer",position:"relative"}} onClick={()=>{if(avail>0||sel)toggle(p);}}>
            <div style={{fontSize:36,marginBottom:8,textAlign:"center"}}>{p.emoji}</div>
            <div style={{fontWeight:800,fontSize:14,color:B.dark,marginBottom:4,textAlign:"center"}}>{p.name}</div>
            <div style={{fontSize:12,color:"#64748b",textAlign:"center",marginBottom:12,lineHeight:1.5}}>{p.desc}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:800,fontSize:17,color:B.acc}}>${fmt(p.price)}</span>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 7px",borderRadius:7,background:avail>0?"#d1fae5":"#fee2e2",color:avail>0?"#065f46":"#991b1b"}}>{avail>0?`📦 ${avail}`:"❌ Agotado"}</span>
            </div>
            {sel&&<div style={{position:"absolute",top:10,right:10,background:B.acc,color:"#fff",width:22,height:22,borderRadius:11,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</div>}
            {avail===0&&!sel&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,.65)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#ef4444"}}>Sin stock</div>}
          </div>
        );})}
      </div>
      {allCount>0&&<StickyCart count={allCount} total={allTotal}/>}
    </div>
  );
}

function MatchesScreen(){
  const [matches,setMatches]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(false);
  useEffect(()=>{
    async function go(){
      try{
        const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:"Busca resultados y próximos partidos del Mundial FIFA 2026. Devuelve SOLO un JSON array sin markdown, máximo 20 partidos. Cada objeto: homeTeam, awayTeam, homeFlag (emoji bandera), awayFlag (emoji bandera), homeScore (número o null), awayScore (número o null), date (DD/MM), time (hora Argentina), status ('finalizado'|'en vivo'|'programado'), stage. Si el mundial no empezó aún, usa el fixture oficial FIFA 2026."}]})});
        const data=await r.json();
        const text=data.content?.filter(c=>c.type==="text").map(c=>c.text).join("");
        const clean=text.replace(/```json|```/g,"").trim();
        const s=clean.indexOf("["),e=clean.lastIndexOf("]");
        if(s>=0&&e>s){setMatches(JSON.parse(clean.slice(s,e+1)));}else setErr(true);
      }catch{setErr(true);}
      setLoading(false);
    }
    go();
  },[]);
  const sc={finalizado:{bg:"#f1f5f9",c:"#475569"},programado:{bg:"#dbeafe",c:"#1e40af"},"en vivo":{bg:"#d1fae5",c:"#065f46"}};
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <h1 style={{fontFamily:B.tf,fontSize:26,color:B.dark,marginBottom:4,letterSpacing:1}}>📅 FIFA World Cup 2026</h1>
      <p style={{color:"#64748b",fontSize:13,marginBottom:14}}>Partidos y resultados — actualización en tiempo real</p>
      {loading&&<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:40}}>⚽</div><div style={{color:"#64748b",fontSize:14,marginTop:10}}>Cargando partidos...</div></div>}
      {err&&!loading&&(
        <div style={{background:"#fef3c7",borderRadius:12,padding:16,border:"1px solid #fbbf24",textAlign:"center"}}>
          <div style={{fontSize:26,marginBottom:8}}>📅</div>
          <div style={{fontWeight:700,color:"#92400e",marginBottom:6}}>Fixture no disponible en este momento</div>
          <div style={{fontSize:12,color:"#92400e",marginBottom:10}}>El Mundial FIFA 2026 comienza el 11 de junio de 2026</div>
          <div style={{background:"#fff",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#64748b",textAlign:"left",display:"inline-block"}}>
            <b>Fase de Grupos:</b> 11 jun – 3 jul · <b>Octavos:</b> 6–10 jul<br/>
            <b>Cuartos:</b> 13–14 jul · <b>Semis:</b> 17–18 jul<br/>
            <b>Final:</b> 19 jul 2026 · MetLife Stadium, NJ
          </div>
        </div>
      )}
      {matches&&!loading&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {matches.map((m,i)=>{const s=sc[m.status]||sc.programado;const hr=m.homeScore!==null&&m.awayScore!==null;return(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"12px 16px",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,justifyContent:"center"}}>
                <span style={{fontSize:24}}>{m.homeFlag||"🏳️"}</span>
                <div style={{textAlign:"right",flex:1}}><div style={{fontWeight:800,fontSize:13,color:B.dark}}>{m.homeTeam}</div></div>
                <div style={{fontFamily:B.tf,fontSize:22,color:B.dark,margin:"0 8px",minWidth:60,textAlign:"center"}}>{hr?`${m.homeScore} – ${m.awayScore}`:"vs"}</div>
                <div style={{textAlign:"left",flex:1}}><div style={{fontWeight:800,fontSize:13,color:B.dark}}>{m.awayTeam}</div></div>
                <span style={{fontSize:24}}>{m.awayFlag||"🏳️"}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,minWidth:100}}>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:7,background:s.bg,color:s.c}}>{m.status?.toUpperCase()}</span>
                <div style={{fontSize:11,color:"#64748b"}}>{m.date}{m.time&&` · ${m.time}`}</div>
                {m.stage&&<div style={{fontSize:10,color:"#94a3b8"}}>{m.stage}</div>}
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

function StickerCard({s,flag,av,sel,pr,onToggle,m}){
  return(
    <button onClick={()=>{if(av>0||sel)onToggle(s);}} style={{background:sel?"#eff6ff":"#fff",border:`2px solid ${sel?B.acc:av>0?m.border:"#e2e8f0"}`,borderRadius:12,padding:7,cursor:av>0||sel?"pointer":"not-allowed",textAlign:"left",position:"relative",opacity:av===0&&!sel?.5:1,transition:"all .15s"}}>
      <div style={{width:"100%",aspectRatio:"3/4",background:`linear-gradient(145deg,${m.bg},white)`,border:`1.5px solid ${m.border}`,borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:5}}>
        <div style={{fontSize:22,marginBottom:2}}>{flag}</div>
        <div style={{fontSize:10,fontWeight:800,color:m.color}}>{s.num}</div>
        <div style={{fontSize:8,color:m.color,textAlign:"center",padding:"0 3px",fontWeight:600,lineHeight:1.2}}>{s.name}</div>
      </div>
      <div style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4,display:"inline-block",marginBottom:3,background:m.bg,color:m.color}}>{m.emoji} {m.label}</div>
      <div style={{fontSize:12,fontWeight:800,color:B.dark,marginBottom:1}}>{s.num}</div>
      <div style={{fontSize:9,color:"#475569",lineHeight:1.3,minHeight:20,marginBottom:4}}>{s.name}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4,background:av>0?"#d1fae5":"#fee2e2",color:av>0?"#065f46":"#991b1b"}}>{av>0?`📦${av}`:"❌"}</span>
        <span style={{fontWeight:800,color:m.color,fontSize:12}}>${fmt(pr)}</span>
      </div>
      {sel&&<div style={{position:"absolute",top:5,right:5,background:B.acc,color:"#fff",width:18,height:18,borderRadius:9,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</div>}
    </button>
  );
}

function CDown({expiry}){const[t,setT]=useState("");useEffect(()=>{const iv=setInterval(()=>{const d=expiry-Date.now();if(d<=0){setT("Expirado");return;}setT(`⏱ ${Math.floor(d/60000)}:${String(Math.floor((d%60000)/1000)).padStart(2,"0")} para confirmar`);},1000);return()=>clearInterval(iv);},[expiry]);return<div style={{fontSize:11,color:"#fbbf24"}}>{t}</div>;}

function StickyCart({count,total,onClick}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:B.dark,color:"#fff",padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:300,gap:12}}>
      <div style={{fontWeight:700,fontSize:14}}>🛒 {count} items · ${fmt(total)}</div>
      {onClick&&<button style={{...aBtn,padding:"8px 18px",fontSize:13}} onClick={onClick}>Ver carrito →</button>}
    </div>
  );
}

function CountryScreen({selC:country,setScreen,cart,setCart,getP,getAvail,expiry}){
  const [fil,setFil]=useState("todas");
  const ss=useMemo(()=>buildCountryStickers(country),[country]);
  const fd=useMemo(()=>{if(fil==="stock")return ss.filter(s=>getAvail(s.key)>0);if(fil==="top")return ss.filter(s=>s.type==="TOP"||s.type==="FOIL");if(fil==="carrito")return ss.filter(s=>cart[s.key]);return ss;},[ss,fil,cart,getAvail]);
  const cC=ss.filter(s=>cart[s.key]),cT=cC.reduce((a,s)=>a+getP(s),0);
  const aC=Object.keys(cart).length,aT=Object.values(cart).reduce((a,s)=>a+getP(s),0);
  const tog=(s)=>setCart(p=>{const n={...p};if(n[s.key])delete n[s.key];else n[s.key]=s;return n;});
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("shop")}>← Volver a países</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <span style={{fontSize:44}}>{country.flag}</span>
        <div><h1 style={{fontFamily:B.tf,fontSize:26,color:B.dark,letterSpacing:1}}>{country.name}</h1><div style={{fontSize:12,color:"#64748b"}}>{country.conf} · Grupo {country.group}</div></div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {[[cC.length,"sel."],[`$${fmt(cT)}`,country.name,1],[aC,"total carrito"],[`$${fmt(aT)}`,"general",1]].map(([v,l,hi],i)=>(
          <div key={i} style={{flex:1,minWidth:74,background:"#fff",borderRadius:9,padding:"8px 9px",textAlign:"center",border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:16,fontWeight:800,color:hi?B.acc:B.dark}}>{v}</div>
            <div style={{fontSize:9,color:"#94a3b8"}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
        {[["todas","Todas"],["stock","Con stock"],["top","TOP/FOIL"],["carrito","En carrito"]].map(([v,l])=><ChipBtn key={v} active={fil===v} onClick={()=>setFil(v)}>{l}</ChipBtn>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:6}}>
        {fd.map(s=><StickerCard key={s.key} s={s} flag={country.flag} av={getAvail(s.key)} sel={!!cart[s.key]} pr={getP(s)} onToggle={tog} m={PRICE_META[s.type]}/>)}
      </div>
      {aC>0&&<StickyCart count={aC} total={aT} onClick={()=>setScreen("cart")}/>}
    </div>
  );
}

function FWCScreen({setScreen,cart,setCart,getP,getAvail}){
  const aC=Object.keys(cart).length,aT=Object.values(cart).reduce((a,s)=>a+getP(s),0);
  const tog=(s)=>setCart(p=>{const n={...p};if(n[s.key])delete n[s.key];else n[s.key]=s;return n;});
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("shop")}>← Volver a países</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:44}}>🌟</span><div><h1 style={{fontFamily:B.tf,fontSize:26,color:B.dark,letterSpacing:1}}>Especiales FWC</h1><div style={{fontSize:12,color:"#64748b"}}>FOIL metálico · Precios especiales</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:6}}>
        {FWC_STICKERS.map(s=><StickerCard key={s.key} s={s} flag="🌟" av={getAvail(s.key)} sel={!!cart[s.key]} pr={getP(s)} onToggle={tog} m={PRICE_META.FWC}/>)}
      </div>
      {aC>0&&<StickyCart count={aC} total={aT} onClick={()=>setScreen("cart")}/>}
    </div>
  );
}

function CartScreen({setScreen,cart,setCart,getP,startRes,expiry,setTab}){
  const entries=useMemo(()=>Object.values(cart),[cart]);
  const total=entries.reduce((a,s)=>a+getP(s),0);
  const byGroup=useMemo(()=>{const m={};entries.forEach(s=>{if(s._isProduct){if(!m["__p"])m["__p"]={label:"Lotes & Productos",emoji:"🎴",items:[]};m["__p"].items.push(s);}else{const c=COUNTRIES.find(c2=>s.key.startsWith(c2.code+"_"))||{name:"FWC",flag:"🌟",code:"FWC"};if(!m[c.code])m[c.code]={label:c.name,emoji:c.flag,items:[]};m[c.code].items.push(s);}});return Object.values(m);},[entries]);
  if(!entries.length)return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("shop")}>← Seguir buscando</button>
      <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:52}}>🛒</div><h2 style={{fontSize:20,fontWeight:800,color:B.dark,margin:"10px 0 8px"}}>Tu carrito está vacío</h2><p style={{color:"#64748b",marginBottom:20,fontSize:13}}>Explorá figuritas, lotes y sobres</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button style={{...aBtn}} onClick={()=>{setScreen("shop");setTab("figuritas");}}>⚽ Figuritas</button>
        <button style={{background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff",border:"none",borderRadius:25,padding:"9px 20px",fontSize:13,fontWeight:800,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("products");}}>🎴 Lotes</button>
      </div></div>
    </div>
  );
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("shop")}>← Seguir buscando</button>
      <h1 style={{fontSize:20,fontWeight:800,color:B.dark,marginBottom:4}}>Tu carrito 🛒</h1>
      <p style={{color:"#64748b",marginBottom:12,fontSize:13}}>{entries.length} items</p>
      {expiry&&<div style={{background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,padding:"7px 13px",marginBottom:10,fontSize:12,fontWeight:700,color:"#92400e"}}><CDown expiry={expiry}/></div>}
      {byGroup.map(g=>{const sub=g.items.reduce((a,s)=>a+getP(s),0);return(
        <div key={g.label} style={{background:"#fff",borderRadius:11,marginBottom:9,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
            <span style={{fontSize:20}}>{g.emoji}</span>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{g.label}</div><div style={{fontSize:11,color:"#64748b"}}>{g.items.length} items</div></div>
            <div style={{fontWeight:800,color:B.acc,fontSize:14}}>${fmt(sub)}</div>
          </div>
          {g.items.map(s=>{const m=s._isProduct?{emoji:"🎴",label:"Producto",bg:"#f8fafc",color:"#475569"}:PRICE_META[s.type];return(
            <div key={s.key||s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 13px",borderBottom:"1px solid #f8fafc"}}>
              <div style={{width:26,height:26,borderRadius:6,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{m.emoji}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:B.dark}}>{s.num||s.id} — {s.name}</div><span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:4,background:m.bg,color:m.color||"#475569"}}>{m.label}</span></div>
              <div style={{fontWeight:800,color:m.color||B.acc,marginRight:6,fontSize:12}}>${fmt(getP(s))}</div>
              <button style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:11,fontWeight:800}} onClick={()=>setCart(p=>{const n={...p};delete n[s.key||s.id];return n;})}>✕</button>
            </div>
          );})}
        </div>
      );})}
      <div style={{background:"#fff",borderRadius:11,padding:12,marginBottom:11,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:18,fontWeight:800,color:B.dark}}><span>TOTAL</span><span>${fmt(total)}</span></div>
      </div>
      <button style={{...aBtn,width:"100%",padding:13,fontSize:15,borderRadius:12}} onClick={async()=>{const sk=entries.filter(s=>!s._isProduct).map(s=>s.key);if(sk.length&&!expiry)await startRes(sk);setScreen("checkout");}}>Continuar con el pedido →</button>
    </div>
  );
}

function CheckoutScreen({user,setUser,cart,setCart,getP,setScreen,placeOrder,expiry}){
  const [step,setStep]=useState(user?.nombre?2:1);
  const [quick,setQuick]=useState({nombre:user?.nombre||"",apellido:user?.apellido||"",email:user?.email||""});
  const [delivery,setDelivery]=useState("retiro");
  const [pro,setPro]=useState({dni:"",telefono:"",direccion:"",codigoPostal:"",provincia:"",esAR:true});
  const [done,setDone]=useState(null);
  const [errs,setErrs]=useState({});
  const entries=Object.values(cart);
  const total=entries.reduce((a,s)=>a+getP(s),0);
  const vQ=()=>{const e={};if(!quick.nombre.trim())e.nombre="Requerido";if(!quick.apellido.trim())e.apellido="Requerido";if(!/^[^@]+@[^@]+\.[^@]+$/.test(quick.email))e.email="Email inválido";return e;};
  const vP=()=>{const e={};if(!/^\d{7,8}$/.test(pro.dni))e.dni="DNI inválido";if(pro.telefono.length<8)e.tel="Teléfono inválido";if(!pro.direccion.trim())e.dir="Requerido";if(!pro.codigoPostal.trim())e.cp="Requerido";if(pro.esAR&&!pro.provincia)e.prov="Seleccioná provincia";return e;};
  const buildWA=(o)=>{const ls=[`*🌍 Pedido Figuritas Mundial 2026*`,`🔢 Pedido: #${o.orderNum}`,``,`*👤 ${o.userName}*`,`📧 ${o.userEmail}`,o.userPhone&&`📱 ${o.userPhone}`,o.userDni&&`DNI: ${o.userDni}`,o.userAddress&&`📍 ${o.userAddress}`,o.userProvince&&`Provincia: ${o.userProvince}`,`Envío: ${delivery==="retiro"?"Retiro en mano":"Envío a domicilio"}`,``];o.items.forEach(i=>{const m=i.isProduct?{emoji:"🎴"}:PRICE_META[i.type];ls.push(`${m?.emoji||"📦"} ${i.num} — ${i.name} · $${fmt(i.price)}`);});ls.push(`\n*💰 TOTAL: $${fmt(o.total)}*`);return encodeURIComponent(ls.filter(Boolean).join("\n"));};
  const finish=async()=>{const ve=vP();if(Object.keys(ve).length){setErrs(ve);return;}const o=await placeOrder({type:delivery},{...quick,...pro});setDone(o);setStep(4);};
  const fi=(key,label,type="text",ph="",ek)=>(<div style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:12,fontWeight:600,color:"#374151"}}>{label}</label><input type={type} style={{...inp,...(errs[ek||key]?{borderColor:"#ef4444"}:{})}} placeholder={ph} value={pro[key]} onChange={e=>{setPro(p=>({...p,[key]:e.target.value}));setErrs(p=>{const n={...p};delete n[ek||key];return n;})}}/>{errs[ek||key]&&<span style={{fontSize:10,color:"#ef4444"}}>⚠ {errs[ek||key]}</span>}</div>);
  if(step===4&&done)return(
    <div style={{maxWidth:600,margin:"0 auto",padding:14}}>
      <div style={{textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:16,border:"1px solid #e2e8f0"}}>
        <div style={{fontSize:58}}>🎉</div>
        <div style={{fontFamily:B.tf,fontSize:30,color:B.dark,margin:"10px 0 4px",letterSpacing:1}}>¡PEDIDO ENVIADO!</div>
        <div style={{background:`linear-gradient(135deg,${B.acc},#1d4ed8)`,color:"#fff",borderRadius:10,padding:"10px 20px",display:"inline-block",fontSize:24,fontWeight:800,letterSpacing:3,margin:"10px 0 8px"}}>#{done.orderNum}</div>
        <p style={{color:"#64748b",fontSize:13,marginBottom:4}}>Tu número de pedido único</p>
        <p style={{color:"#475569",fontSize:13,marginBottom:18,fontWeight:600}}>{done.userName} · ${fmt(done.total)}</p>
        <p style={{color:"#64748b",fontSize:12,marginBottom:18}}>Te contactamos para coordinar el pago. También podés escribirnos directamente.</p>
        <a href={`https://wa.me/${WA_NUM}?text=${buildWA(done)}`} target="_blank" rel="noreferrer" style={{display:"block",background:"linear-gradient(135deg,#25d366,#128c7e)",color:"#fff",borderRadius:25,padding:"13px 20px",fontSize:15,fontWeight:800,textDecoration:"none",marginBottom:12}}>📲 Enviar pedido por WhatsApp</a>
        <button style={{...bBtn,display:"inline-block"}} onClick={()=>setScreen("shop")}>Seguir comprando →</button>
      </div>
    </div>
  );
  return(
    <div style={{maxWidth:600,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("cart")}>← Volver al carrito</button>
      {/* Step indicator */}
      <div style={{display:"flex",gap:4,marginBottom:14,alignItems:"center"}}>
        {[["1","Identificación"],["2","Entrega"],["3","Datos"]].map(([n,l],i)=>{const ac=step===i+1,dn=step>i+1;return<div key={n} style={{display:"flex",alignItems:"center",gap:3,flex:1}}><div style={{width:22,height:22,borderRadius:11,background:ac?B.acc:dn?"#10b981":"#e2e8f0",color:ac||dn?"#fff":"#94a3b8",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{dn?"✓":n}</div><div style={{fontSize:9,fontWeight:600,color:ac?B.acc:dn?"#10b981":"#94a3b8",flex:1}}>{l}</div>{i<2&&<div style={{width:16,height:1,background:"#e2e8f0"}}/>}</div>;})}
      </div>
      {expiry&&<div style={{background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:11,fontWeight:700,color:"#92400e"}}><CDown expiry={expiry}/></div>}
      {step===1&&(
        <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0"}}>
          <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>👋 ¿Cómo te llamamos?</h2>
          <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Solo nombre y email — los datos de envío los pedimos después</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
            {[["nombre","Nombre","Juan"],["apellido","Apellido","Pérez"]].map(([k,l,ph])=>(
              <div key={k} style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>{l}</label>
                <input style={{...inp,...(errs[k]?{borderColor:"#ef4444"}:{})}} placeholder={ph} value={quick[k]} onChange={e=>{setQuick(p=>({...p,[k]:e.target.value}));setErrs(p=>{const n={...p};delete n[k];return n;})}}/>
                {errs[k]&&<span style={{fontSize:10,color:"#ef4444"}}>⚠ {errs[k]}</span>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Email</label>
            <input type="email" style={{...inp,...(errs.email?{borderColor:"#ef4444"}:{})}} placeholder="juan@email.com" value={quick.email} onChange={e=>{setQuick(p=>({...p,email:e.target.value}));setErrs(p=>{const n={...p};delete n.email;return n;})}}/>
            {errs.email&&<span style={{fontSize:10,color:"#ef4444"}}>⚠ {errs.email}</span>}
          </div>
          <button style={{...aBtn,width:"100%",padding:12}} onClick={()=>{const e=vQ();if(Object.keys(e).length){setErrs(e);return;}setUser(prev=>({...prev,...quick}));setStep(2);}}>Continuar →</button>
          <p style={{fontSize:10,color:"#94a3b8",textAlign:"center",marginTop:8}}>Solo para identificar tu pedido. No spam.</p>
        </div>
      )}
      {step===2&&(
        <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0"}}>
          <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>📦 ¿Cómo querés recibirlo?</h2>
          <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Hola <b>{quick.nombre}</b>, ya casi terminamos</p>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
            {[["retiro","🤝 Retiro en mano","Coordinamos punto de entrega por WhatsApp"],["envio","🚚 Envío a domicilio","Coordinamos costo y forma de envío"]].map(([v,l,d])=>(
              <label key={v} style={{display:"flex",alignItems:"flex-start",gap:9,cursor:"pointer",padding:"11px 13px",borderRadius:10,border:`2px solid ${delivery===v?B.acc:"#e2e8f0"}`,background:delivery===v?"#eff6ff":"#fff"}}>
                <input type="radio" name="del" checked={delivery===v} onChange={()=>setDelivery(v)} style={{accentColor:B.acc,marginTop:2}}/>
                <div><div style={{fontWeight:700,fontSize:13}}>{l}</div><div style={{fontSize:11,color:"#64748b"}}>{d}</div></div>
              </label>
            ))}
          </div>
          <div style={{background:"#f8fafc",borderRadius:9,padding:11,marginBottom:14,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:5}}>Resumen</div>
            {Object.values(cart).slice(0,3).map((s,i)=><div key={i} style={{fontSize:11,color:"#475569",padding:"2px 0"}}>{s._isProduct?s.emoji:PRICE_META[s.type]?.emoji} {s.name} — ${fmt(getP(s))}</div>)}
            {Object.values(cart).length>3&&<div style={{fontSize:11,color:"#94a3b8"}}>...y {Object.values(cart).length-3} más</div>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"1px solid #e2e8f0",fontWeight:800,fontSize:14,color:B.dark}}><span>TOTAL</span><span>${fmt(total)}</span></div>
          </div>
          <button style={{...aBtn,width:"100%",padding:12}} onClick={()=>setStep(3)}>Completar datos →</button>
        </div>
      )}
      {step===3&&(
        <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0"}}>
          <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>📋 Datos de envío</h2>
          <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Para confirmar el pedido y coordinar la entrega</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:9,marginBottom:11}}>
            {fi("dni","DNI","text","30123456","dni")}
            {fi("telefono","Teléfono / WhatsApp","text","1123456789","tel")}
            {fi("direccion","Dirección","text","Calle y número","dir")}
            {fi("codigoPostal","Código postal","text","1650","cp")}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:9}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>País</label>
            <div style={{display:"flex",gap:12}}>{[true,false].map(v=><label key={String(v)} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:12,fontWeight:pro.esAR===v?700:400}}><input type="radio" checked={pro.esAR===v} onChange={()=>setPro(p=>({...p,esAR:v}))} style={{accentColor:B.acc}}/>{v?"🇦🇷 Argentina":"🌍 Otro"}</label>)}</div>
          </div>
          {pro.esAR&&(
            <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:11}}>
              <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Provincia</label>
              <select style={{...inp,...(errs.prov?{borderColor:"#ef4444"}:{})}} value={pro.provincia} onChange={e=>{setPro(p=>({...p,provincia:e.target.value}));setErrs(p=>{const n={...p};delete n.prov;return n;});}}>
                <option value="">Seleccioná tu provincia</option>
                {PROVINCES_AR.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              {errs.prov&&<span style={{fontSize:10,color:"#ef4444"}}>⚠ {errs.prov}</span>}
            </div>
          )}
          <div style={{background:"#f0f9ff",borderRadius:8,padding:"10px 12px",marginBottom:13,border:"1px solid #bae6fd"}}>
            <div style={{fontSize:12,color:"#0369a1"}}><b>{quick.nombre} {quick.apellido}</b> · {quick.email}</div>
            <div style={{fontSize:12,color:"#0369a1"}}>Total: <b>${fmt(total)}</b> · <b>{delivery==="retiro"?"Retiro":"Envío a domicilio"}</b></div>
          </div>
          <button style={{...aBtn,width:"100%",padding:12}} onClick={finish}>✅ Confirmar pedido</button>
          <p style={{fontSize:10,color:"#94a3b8",textAlign:"center",marginTop:8}}>Se genera tu número de pedido único. El pago se coordina después.</p>
        </div>
      )}
    </div>
  );
}

// ══════ ADMIN PANEL ══════
function AdminPanel({setAdmin,stock,saveStock,prices,savePrices,base,saveBase,users,orders,confirmOrder,res,getAvail,products,saveProducts}){
  const [authed,setAuthed]=useState(false);const [pw,setPw]=useState("");const [tab,setTab]=useState("dashboard");
  if(!authed)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:B.dark}}>
      <GS/>
      <div style={{background:"#fff",borderRadius:16,padding:28,width:300,textAlign:"center"}}>
        <div style={{fontSize:36}}>🔐</div>
        <h2 style={{fontFamily:B.tf,fontSize:22,margin:"8px 0 12px"}}>PANEL ADMIN</h2>
        <input type="password" style={{...inp,marginBottom:10}} placeholder="Contraseña" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PW?setAuthed(true):alert("Incorrecta"))}/>
        <button style={{...aBtn,width:"100%",padding:11}} onClick={()=>pw===ADMIN_PW?setAuthed(true):alert("Contraseña incorrecta")}>Ingresar</button>
        <button style={{...bBtn,color:"#64748b",display:"block",margin:"10px auto 0"}} onClick={()=>setAdmin(false)}>← Volver al sitio</button>
      </div>
    </div>
  );
  const tabs=[["dashboard","📊 Dashboard"],["orders","📋 Pedidos"],["sales","📈 Ventas"],["stock","📦 Stock"],["prices","💰 Precios"],["products","🎴 Productos"],["users","👥 Usuarios"]];
  return(
    <div style={{fontFamily:"'Outfit',sans-serif",minHeight:"100vh",background:"#f1f5f9"}}>
      <GS/>
      <div style={{background:B.dark,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:B.tf,fontSize:18,color:"#fff",letterSpacing:1}}>⚽ ADMIN 2026</div>
        <button style={{background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"5px 11px",cursor:"pointer",fontSize:11}} onClick={()=>setAdmin(false)}>← Sitio</button>
      </div>
      <div style={{display:"flex",gap:2,padding:"8px 11px",background:"#fff",borderBottom:"1px solid #e2e8f0",overflowX:"auto",scrollbarWidth:"none"}}>
        {tabs.map(([v,l])=><button key={v} style={{padding:"6px 11px",borderRadius:7,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",background:tab===v?B.acc:"transparent",color:tab===v?"#fff":"#475569",whiteSpace:"nowrap"}} onClick={()=>setTab(v)}>{l}</button>)}
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:12}}>
        {tab==="dashboard"&&<ADash orders={orders} users={users} res={res} stock={stock}/>}
        {tab==="orders"   &&<AOrders orders={orders} confirmOrder={confirmOrder}/>}
        {tab==="sales"    &&<ASales orders={orders}/>}
        {tab==="stock"    &&<AStock stock={stock} saveStock={saveStock}/>}
        {tab==="prices"   &&<APrices prices={prices} savePrices={savePrices} base={base} saveBase={saveBase}/>}
        {tab==="products" &&<AProducts products={products} saveProducts={saveProducts}/>}
        {tab==="users"    &&<AUsers users={users}/>}
      </div>
    </div>
  );
}

function SB({icon,val,lbl,sub,color}){return<div style={{background:"#fff",borderRadius:10,padding:11,border:"1px solid #e2e8f0",textAlign:"center"}}><div style={{fontSize:20,marginBottom:2}}>{icon}</div><div style={{fontSize:18,fontWeight:800,color:color||B.dark}}>{val}</div><div style={{fontSize:10,color:"#64748b"}}>{lbl}</div>{sub&&<div style={{fontSize:9,color:"#94a3b8"}}>{sub}</div>}</div>;}

function ADash({orders,users,res,stock}){
  const totalStk=Object.values(stock).reduce((a,b)=>a+b,0);
  const activeRes=Object.values(res).filter(r=>r.expiresAt>Date.now()).length;
  const confirmed=orders.filter(o=>o.status==="pagado");
  const pending=orders.filter(o=>o.status==="pendiente");
  const totalRev=confirmed.reduce((a,o)=>a+o.total,0);
  const byType=Object.fromEntries(Object.keys(PRICE_META).map(t=>[t,ALL_STICKERS.filter(s=>s.type===t).reduce((a,s)=>a+(stock[s.key]||0),0)]));
  const byCountry=COUNTRIES.map(c=>{const ss=buildCountryStickers(c);const tot=ss.reduce((a,s)=>a+(stock[s.key]||0),0);const bt={};Object.keys(PRICE_META).forEach(t=>{bt[t]=ss.filter(s=>s.type===t).reduce((a,s)=>a+(stock[s.key]||0),0);});return{...c,total:tot,byType:bt};}).sort((a,b)=>b.total-a.total);
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:11}}>Dashboard</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7,marginBottom:14}}>
        <SB icon="👥" val={users.length} lbl="Usuarios"/>
        <SB icon="📋" val={orders.length} lbl="Pedidos totales"/>
        <SB icon="⏳" val={pending.length} lbl="Pendientes" color="#d97706"/>
        <SB icon="✅" val={confirmed.length} lbl="Confirmados" color="#10b981"/>
        <SB icon="⏱" val={activeRes} lbl="Reservas activas"/>
        <SB icon="📦" val={totalStk} lbl="En stock"/>
        <SB icon="💰" val={"$"+fmt(totalRev)} lbl="Ingresos" color={B.acc}/>
      </div>
      <div style={{background:"#fff",borderRadius:10,padding:11,border:"1px solid #e2e8f0",marginBottom:11}}>
        <h3 style={{fontSize:12,fontWeight:700,marginBottom:8}}>📦 Stock por etiqueta</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:6}}>
          {Object.entries(PRICE_META).map(([type,m])=><div key={type} style={{background:m.bg,borderRadius:7,padding:"8px 9px",border:`1px solid ${m.border}`,textAlign:"center"}}><div style={{fontSize:14}}>{m.emoji}</div><div style={{fontWeight:800,fontSize:15,color:m.color}}>{byType[type]||0}</div><div style={{fontSize:9,color:m.color,opacity:.8}}>{m.label}</div></div>)}
          <div style={{background:"#fef3c7",borderRadius:7,padding:"8px 9px",border:"1px solid #f59e0b",textAlign:"center"}}><div style={{fontSize:14}}>🌟</div><div style={{fontWeight:800,fontSize:15,color:"#92400e"}}>{FWC_STICKERS.reduce((a,s)=>a+(stock[s.key]||0),0)}</div><div style={{fontSize:9,color:"#92400e",opacity:.8}}>FWC</div></div>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{padding:"8px 11px",fontWeight:700,fontSize:12,borderBottom:"1px solid #f1f5f9"}}>📦 Stock por país — top 15</div>
        <div style={{maxHeight:280,overflowY:"auto"}}>
          {byCountry.slice(0,15).map(c=>(
            <div key={c.code} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 11px",borderBottom:"1px solid #f8fafc"}}>
              <span style={{fontSize:15}}>{c.flag}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:11}}>{c.name}</div>
                <div style={{display:"flex",gap:3,marginTop:2,flexWrap:"wrap"}}>{Object.entries(c.byType).filter(([,v])=>v>0).map(([t,v])=>{const m=PRICE_META[t];return<span key={t} style={{fontSize:8,padding:"1px 4px",borderRadius:3,background:m.bg,color:m.color,fontWeight:700}}>{m.emoji}{v}</span>;})}</div>
              </div>
              <b style={{color:B.dark,fontSize:12}}>{c.total}</b>
              <div style={{width:55,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:B.acc,borderRadius:3,width:`${Math.min(100,(c.total/50)*100)}%`}}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AOrders({orders,confirmOrder}){
  const [fil,setFil]=useState("todos");
  const fo=useMemo(()=>{if(fil==="pendiente")return orders.filter(o=>o.status==="pendiente");if(fil==="pagado")return orders.filter(o=>o.status==="pagado");return orders;},[orders,fil]);
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>Pedidos ({orders.length})</h2>
      <div style={{display:"flex",gap:5,marginBottom:11,flexWrap:"wrap"}}>{[["todos","Todos"],["pendiente","⏳ Pendientes"],["pagado","✅ Pagados"]].map(([v,l])=><ChipBtn key={v} active={fil===v} onClick={()=>setFil(v)}>{l}</ChipBtn>)}</div>
      {fo.length===0&&<p style={{color:"#94a3b8"}}>Sin pedidos</p>}
      {[...fo].reverse().map(o=>(
        <div key={o.id} style={{background:"#fff",borderRadius:10,border:`1px solid ${o.status==="pendiente"?"#fbbf24":"#e2e8f0"}`,marginBottom:8,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:o.status==="pendiente"?"#fffbeb":"#f8fafc",borderBottom:"1px solid #e2e8f0",flexWrap:"wrap",gap:6}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontFamily:B.tf,fontSize:18,color:B.acc}}>#{o.orderNum}</span>
              <div><div style={{fontWeight:700,fontSize:12,color:B.dark}}>{o.userName}</div><div style={{fontSize:10,color:"#64748b"}}>{o.userEmail}{o.userPhone&&` · ${o.userPhone}`}</div></div>
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <span style={{fontSize:10,color:"#64748b"}}>{fmtDate(o.createdAt)}</span>
              <span style={{fontWeight:800,color:B.acc,fontSize:13}}>${fmt(o.total)}</span>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:7,background:o.status==="pagado"?"#d1fae5":"#fef3c7",color:o.status==="pagado"?"#065f46":"#92400e"}}>{o.status==="pagado"?"✅ PAGADO":"⏳ PENDIENTE"}</span>
              {o.status==="pendiente"&&<button style={{background:"#10b981",color:"#fff",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:800,cursor:"pointer"}} onClick={()=>{if(window.confirm(`¿Confirmar pago del pedido #${o.orderNum}?\nEsto actualizará el stock.`))confirmOrder(o.id);}}>✅ Confirmar pago</button>}
            </div>
          </div>
          <div style={{padding:"6px 12px",display:"flex",gap:3,flexWrap:"wrap"}}>
            {o.items.map((it,i)=>{const m=it.isProduct?{emoji:"🎴",bg:"#f1f5f9",color:"#475569"}:PRICE_META[it.type];return<span key={i} style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4,background:m.bg,color:m.color||"#475569"}}>{m.emoji} {it.num}</span>;})}
          </div>
          {(o.userDni||o.userAddress)&&<div style={{padding:"3px 12px 7px",fontSize:10,color:"#64748b",display:"flex",gap:10,flexWrap:"wrap"}}>{o.userDni&&<span>DNI: {o.userDni}</span>}{o.userAddress&&<span>📍 {o.userAddress}</span>}{o.userProvince&&<span>{o.userProvince}</span>}<span>{o.delivery?.type==="envio"?"📦 Envío":"🤝 Retiro"}</span></div>}
        </div>
      ))}
    </div>
  );
}

function ASales({orders}){
  const conf=useMemo(()=>orders.filter(o=>o.status==="pagado"),[orders]);
  const [view,setView]=useState("dia");
  const grouped=useMemo(()=>{const m={};conf.forEach(o=>{let k;if(view==="dia")k=o.dayKey||fmtDate(o.createdAt);else if(view==="semana")k="Sem. "+(o.week||getWeek(o.createdAt));else if(view==="mes")k=o.monthKey||getMonthKey(o.createdAt);else k=o.yearKey||getYearKey(o.createdAt);if(!m[k])m[k]={key:k,total:0,count:0,ts:o.createdAt};m[k].total+=o.total;m[k].count++;});return Object.values(m).sort((a,b)=>b.ts-a.ts);},[conf,view]);
  const gTotal=grouped.reduce((a,g)=>a+g.total,0);
  const gCount=grouped.reduce((a,g)=>a+g.count,0);
  const maxV=grouped.length>0?Math.max(...grouped.map(g=>g.total),1):1;
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:11}}>📈 Control de Ventas</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:7,marginBottom:13}}>
        {[["Hoy",conf.filter(o=>o.dayKey===fmtDate(Date.now())).reduce((a,o)=>a+o.total,0),conf.filter(o=>o.dayKey===fmtDate(Date.now())).length],["Esta semana",conf.filter(o=>o.week===getWeek(Date.now())).reduce((a,o)=>a+o.total,0),conf.filter(o=>o.week===getWeek(Date.now())).length],["Este mes",conf.filter(o=>o.monthKey===getMonthKey(Date.now())).reduce((a,o)=>a+o.total,0),conf.filter(o=>o.monthKey===getMonthKey(Date.now())).length],[new Date().getFullYear(),conf.filter(o=>o.yearKey===getYearKey(Date.now())).reduce((a,o)=>a+o.total,0),conf.filter(o=>o.yearKey===getYearKey(Date.now())).length]].map(([l,t,n])=><SB key={l} icon="💰" val={"$"+fmt(t)} lbl={l} sub={n+" pedidos"} color={B.acc}/>)}
      </div>
      <div style={{background:"#fff",borderRadius:10,padding:13,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
          <h3 style={{fontSize:13,fontWeight:700}}>Desglose</h3>
          <div style={{display:"flex",gap:4}}>{[["dia","Día"],["semana","Semana"],["mes","Mes"],["año","Año"]].map(([v,l])=><ChipBtn key={v} active={view===v} onClick={()=>setView(v)}>{l}</ChipBtn>)}</div>
        </div>
        {conf.length===0?<p style={{color:"#94a3b8",fontSize:12}}>Sin ventas confirmadas todavía. Confirmá pedidos desde la pestaña Pedidos.</p>:(
          <>
            {grouped.length>0&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:130,marginBottom:11}}>
                {grouped.slice(0,12).map((g,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:0}}>
                    <div style={{fontSize:8,fontWeight:700,color:B.acc}}>${(g.total/1000).toFixed(0)}k</div>
                    <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:`linear-gradient(180deg,${B.acc},#1d4ed8)`,height:`${Math.max(5,(g.total/maxV)*105)}px`}}/>
                    <div style={{fontSize:7,color:"#94a3b8",textAlign:"center",lineHeight:1.2,overflow:"hidden"}}>{g.key}</div>
                    <div style={{fontSize:7,color:"#64748b"}}>{g.count}p</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{border:"1px solid #e2e8f0",borderRadius:7,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr",padding:"5px 11px",background:B.dark,color:"#fff",fontSize:10,fontWeight:700,gap:7}}><span>Período</span><span>Ingresos</span><span>Pedidos</span></div>
              <div style={{maxHeight:250,overflowY:"auto"}}>
                {grouped.map((g,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr",padding:"5px 11px",borderBottom:"1px solid #f1f5f9",fontSize:11,gap:7,background:i%2===0?"#fff":"#f8fafc"}}><span style={{fontWeight:600,color:B.dark}}>{g.key}</span><span style={{fontWeight:800,color:B.acc}}>${fmt(g.total)}</span><span style={{color:"#475569"}}>{g.count}</span></div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr",padding:"7px 11px",background:"#f0f9ff",fontSize:12,fontWeight:800,gap:7,color:B.dark}}><span>TOTAL</span><span style={{color:B.acc}}>${fmt(gTotal)}</span><span>{gCount}</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AStock({stock,saveStock}){
  const [srch,setSrch]=useState("");const [cf,setCf]=useState("Todos");const [bulk,setBulk]=useState("");
  const all=useMemo(()=>ALL_STICKERS.map(s=>{const c=COUNTRIES.find(cx=>s.key.startsWith(cx.code+"_"));return{...s,cN:c?.name||"FWC",cF:c?.flag||"🌟",cC:c?.conf||"FWC"}}),[]);
  const fil=useMemo(()=>all.filter(s=>(!srch||s.num.toLowerCase().includes(srch.toLowerCase())||s.name.toLowerCase().includes(srch.toLowerCase())||s.cN.toLowerCase().includes(srch.toLowerCase()))&&(cf==="Todos"||s.cC===cf)),[all,srch,cf]);
  const upd=async(key,val)=>saveStock({...stock,[key]:Math.max(0,parseInt(val)||0)});
  const applyBulk=async()=>{if(!bulk)return;const v=parseInt(bulk);if(isNaN(v))return;const n={};all.forEach(s=>n[s.key]=v);await saveStock(n);setBulk("");alert(`Stock de todas las figuritas: ${v}`);};
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:10}}>Gestión de Stock</h2>
      <div style={{display:"flex",gap:6,marginBottom:7,flexWrap:"wrap"}}>
        <input style={{...inp,flex:1,minWidth:150}} placeholder="Buscar figurita..." value={srch} onChange={e=>setSrch(e.target.value)}/>
        <input style={{...inp,width:75}} type="number" placeholder="Bulk" value={bulk} onChange={e=>setBulk(e.target.value)}/>
        <button style={{...aBtn,padding:"7px 13px",fontSize:11}} onClick={applyBulk}>Aplicar todo</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{["Todos","Sede","CONMEBOL","UEFA","CAF","AFC","CONCACAF","OFC","FWC"].map(c=><ChipBtn key={c} active={cf===c} onClick={()=>setCf(c)}>{c}</ChipBtn>)}</div>
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 2fr 1fr 95px",padding:"5px 11px",background:B.dark,color:"#fff",fontSize:9,fontWeight:700,gap:6}}><span>Nro.</span><span>Figurita</span><span>Tipo</span><span>Stock</span></div>
        <div style={{maxHeight:440,overflowY:"auto"}}>
          {fil.map(s=>{const m=PRICE_META[s.type],qty=stock[s.key]||0;return(
            <div key={s.key} style={{display:"grid",gridTemplateColumns:"1.2fr 2fr 1fr 95px",padding:"4px 11px",borderBottom:"1px solid #f1f5f9",alignItems:"center",gap:6,fontSize:10}}>
              <span style={{fontWeight:700}}>{s.cF} {s.num}</span>
              <span style={{color:"#475569"}}>{s.name}</span>
              <span style={{fontSize:8,fontWeight:700,padding:"2px 4px",borderRadius:3,display:"inline-block",background:m.bg,color:m.color}}>{m.emoji}</span>
              <div style={{display:"flex",gap:3,alignItems:"center"}}>
                <button style={qBtn} onClick={()=>upd(s.key,qty-1)}>−</button>
                <input type="number" style={{width:35,textAlign:"center",padding:"2px",border:"1px solid #e2e8f0",borderRadius:3,fontSize:10,fontWeight:700}} value={qty} onChange={e=>upd(s.key,e.target.value)}/>
                <button style={qBtn} onClick={()=>upd(s.key,qty+1)}>+</button>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function APrices({prices,savePrices,base,saveBase}){
  const [srch,setSrch]=useState("");const [eb,setEb]=useState({...base});
  const all=useMemo(()=>ALL_STICKERS.map(s=>{const c=COUNTRIES.find(cx=>s.key.startsWith(cx.code+"_"));return{...s,cN:c?.name||"FWC",cF:c?.flag||"🌟"}}),[]);
  const fil=useMemo(()=>all.filter(s=>!srch||s.num.toLowerCase().includes(srch.toLowerCase())||s.name.toLowerCase().includes(srch.toLowerCase())||s.cN.toLowerCase().includes(srch.toLowerCase())),[all,srch]);
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:11}}>Gestión de Precios</h2>
      <div style={{background:"#fff",borderRadius:10,padding:12,border:"1px solid #e2e8f0",marginBottom:11}}>
        <h3 style={{fontSize:12,fontWeight:700,marginBottom:8}}>💰 Precios base</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
          {Object.entries(PRICE_META).map(([k,m])=>(
            <div key={k} style={{background:m.bg,borderRadius:7,padding:"8px 9px",border:`1px solid ${m.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:m.color,marginBottom:4}}>{m.emoji} {m.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:2}}><span style={{fontWeight:800,color:m.color,fontSize:11}}>$</span><input type="number" style={{width:"100%",padding:"3px 5px",border:`1px solid ${m.border}`,borderRadius:4,fontSize:11,fontWeight:700,background:"rgba(255,255,255,.8)",color:m.color}} value={eb[k]||0} onChange={e=>setEb(p=>({...p,[k]:parseInt(e.target.value)||0}))}/></div>
            </div>
          ))}
        </div>
        <button style={{...aBtn,marginTop:8,padding:"6px 14px",fontSize:11}} onClick={async()=>{await saveBase(eb);alert("✅ Guardado");}}>Guardar precios base</button>
      </div>
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{padding:"8px 11px",borderBottom:"1px solid #f1f5f9"}}><h3 style={{fontSize:12,fontWeight:700,marginBottom:6}}>✏️ Precio individual</h3><input style={{...inp,width:"100%"}} placeholder="Buscar figurita..." value={srch} onChange={e=>setSrch(e.target.value)}/></div>
        <div style={{maxHeight:420,overflowY:"auto"}}>
          {fil.map(s=>{const m=PRICE_META[s.type],cp=prices[s.key],bv=base[s.type]||DEFAULT_PRICES[s.type];return(
            <div key={s.key} style={{display:"grid",gridTemplateColumns:"1.2fr 2fr .6fr 1fr",padding:"4px 11px",borderBottom:"1px solid #f8fafc",alignItems:"center",gap:6,fontSize:10}}>
              <span style={{fontWeight:700}}>{s.cF} {s.num}</span>
              <span style={{color:"#475569"}}>{s.name}</span>
              <span style={{fontSize:8,fontWeight:700,padding:"2px 4px",borderRadius:3,display:"inline-block",background:m.bg,color:m.color}}>{m.emoji}</span>
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                <span style={{color:"#94a3b8",fontSize:8}}>${bv}→</span>
                <input type="number" style={{width:58,textAlign:"center",padding:"2px 4px",border:`1px solid ${cp?m.border:"#e2e8f0"}`,borderRadius:3,fontSize:10,fontWeight:700,color:cp?m.color:"#475569",background:cp?m.bg:"#fff"}} placeholder={bv} value={cp||""} onChange={e=>savePrices({...prices,[s.key]:parseInt(e.target.value)||0})}/>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function AProducts({products,saveProducts}){
  const [editId,setEditId]=useState(null);const [form,setForm]=useState({});
  const upd=async(id,field,val)=>{const np=products.map(p=>p.id===id?{...p,[field]:field==="price"||field==="stock"?Number(val):val}:p);await saveProducts(np);};
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:11}}>🎴 Productos</h2>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {products.map(p=>(
          <div key={p.id} style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",padding:"11px 13px"}}>
            {editId===p.id?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:7,marginBottom:7}}>
                  <div><label style={{fontSize:10,fontWeight:600,color:"#374151"}}>Nombre</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
                  <div><label style={{fontSize:10,fontWeight:600,color:"#374151"}}>Precio</label><input type="number" style={inp} value={form.price} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))}/></div>
                  <div><label style={{fontSize:10,fontWeight:600,color:"#374151"}}>Stock</label><input type="number" style={inp} value={form.stock} onChange={e=>setForm(f=>({...f,stock:Number(e.target.value)}))}/></div>
                </div>
                <div style={{marginBottom:7}}><label style={{fontSize:10,fontWeight:600,color:"#374151"}}>Descripción</label><input style={inp} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
                <div style={{display:"flex",gap:7}}>
                  <button style={{...aBtn,padding:"5px 13px",fontSize:11}} onClick={async()=>{await saveProducts(products.map(px=>px.id===p.id?{...px,...form}:px));setEditId(null);}}>Guardar</button>
                  <button style={{background:"#f1f5f9",color:"#475569",border:"none",borderRadius:7,padding:"5px 13px",fontSize:11,cursor:"pointer"}} onClick={()=>setEditId(null)}>Cancelar</button>
                </div>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:11,flexWrap:"wrap"}}>
                <span style={{fontSize:26}}>{p.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:12,color:B.dark}}>{p.name}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{p.desc}</div>
                </div>
                <div style={{display:"flex",gap:11,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{textAlign:"center"}}><div style={{fontWeight:800,color:B.acc,fontSize:14}}>${fmt(p.price)}</div><div style={{fontSize:9,color:"#94a3b8"}}>Precio</div></div>
                  <div style={{textAlign:"center"}}>
                    <div style={{display:"flex",gap:3,alignItems:"center"}}>
                      <button style={qBtn} onClick={()=>upd(p.id,"stock",(p.stock||0)-1)}>−</button>
                      <span style={{fontWeight:800,fontSize:14,minWidth:22,textAlign:"center"}}>{p.stock||0}</span>
                      <button style={qBtn} onClick={()=>upd(p.id,"stock",(p.stock||0)+1)}>+</button>
                    </div>
                    <div style={{fontSize:9,color:"#94a3b8"}}>Stock</div>
                  </div>
                  <button style={{background:"#eff6ff",color:B.acc,border:"none",borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={()=>{setEditId(p.id);setForm({...p});}}>Editar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AUsers({users}){
  const ar=users.filter(u=>u.esAR||u.provincia);
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>Usuarios ({users.length})</h2>
      <p style={{fontSize:11,color:"#64748b",marginBottom:9}}>🇦🇷 {ar.length} de Argentina ({users.length>0?Math.round(ar.length/users.length*100):0}%)</p>
      {users.length===0&&<p style={{color:"#94a3b8"}}>Sin usuarios todavía</p>}
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr",padding:"5px 11px",background:B.dark,color:"#fff",fontSize:9,fontWeight:700,gap:6}}><span>Nombre</span><span>Email</span><span>DNI</span><span>Tel.</span><span>Provincia</span></div>
        <div style={{maxHeight:440,overflowY:"auto"}}>
          {users.map(u=>(
            <div key={u.id||u.email} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr",padding:"5px 11px",borderBottom:"1px solid #f1f5f9",fontSize:9,gap:6,alignItems:"center"}}>
              <span style={{fontWeight:600}}>{u.nombre} {u.apellido}</span>
              <span style={{color:B.acc}}>{u.email}</span>
              <span>{u.dni||"—"}</span>
              <span>{u.telefono||"—"}</span>
              <span style={{color:"#475569"}}>{u.provincia||"—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
