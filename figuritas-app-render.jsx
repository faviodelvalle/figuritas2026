import { useState, useEffect, useMemo, useRef } from "react";

// ══════════════════════════════════════════════
// CLOUDINARY — Cloud Name: dxen86i43
// Subí las fotos a Cloudinary con el nombre exacto
// de la figurita. Ej: ARG17.jpg, MEX1.jpg, NZL6.jpg
// Carpeta recomendada: "figuritas2026"
// ══════════════════════════════════════════════
const CLOUD_NAME = "dxen86i43";
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const IMG_OPTS = "q_auto,f_auto,w_300";

// ══════════════════════════════════════════════
// CÓMO FUNCIONAN LAS FOTOS (LEER ESTO)
// ──────────────────────────────────────────────
// El sistema busca cada foto en Cloudinary por su NÚMERO de figurita.
// El nombre del archivo en Cloudinary tiene que ser igual al número
// que se ve en la app:
//    MEX1.jpg, MEX2.jpg ... MEX20.jpg
//    RSA1.jpg ... RSA20.jpg
//    KOR1.jpg ... KOR20.jpg
//    ARG1.jpg ... ARG20.jpg
//    FWC00.jpg (logo Panini), FWC1.jpg ... FWC17.jpg
//
// AL SUBIR A CLOUDINARY (Settings > Upload):
//   ✔ "Use filename as Public ID" = ACTIVADO
//   ✘ "Unique filename"           = DESACTIVADO
// Así NO te agrega el sufijo random (_uykrv8) y todo coincide solo.
//
// STICKER_MAP = excepciones. Solo para fotos que YA están subidas con
// un nombre distinto (ej: Argentina, subida antes con sufijo). Si una
// key está acá, este nombre manda; si no, usa el número limpio.
// ══════════════════════════════════════════════
const STICKER_MAP = {
  // Argentina — ya subida en Cloudinary con sufijo (no tocar)
  "ARG_1":"IMG_2538_uykrv8","ARG_2":"IMG_2539_vyi2xd","ARG_3":"IMG_2540_kuingm","ARG_4":"IMG_2541_ncnktc",
  "ARG_5":"IMG_2542_f35gh5","ARG_6":"IMG_2543_bjpzav","ARG_7":"IMG_2544_ydw33t","ARG_8":"IMG_2545_pjigtq",
  "ARG_9":"IMG_2546_kwh0yp","ARG_10":"IMG_2547_bj6o9u","ARG_11":"IMG_2548_iezwa4","ARG_12":"IMG_2549_tjh9mf",
  "ARG_13":"IMG_2550_cwlr0w","ARG_14":"IMG_2551_zx3xul","ARG_15":"IMG_2552_fcspex","ARG_16":"IMG_2553_spmul5",
  "ARG_17":"IMG_2554_j7iom0","ARG_18":"IMG_2555_tgnhhu","ARG_19":"IMG_2556_y5owrl","ARG_20":"IMG_2557_un8ggs",
  // 👉 Si re-subís MEX/RSA/KOR/FWC con sufijo en vez de nombre limpio,
  //    pegá acá las excepciones igual que ARG. Si las subís con nombre
  //    limpio (MEX1, MEX2...), NO hace falta tocar nada acá.
};

// Convierte la key interna en el nombre de archivo "limpio" esperado.
//   "MEX_1" -> "MEX1"   |   "fwc3" -> "FWC3"   |   "s00" -> "FWC00"
function cleanStickerName(key) {
  if (key === "s00") return "FWC00";
  if (/^fwc\d+$/.test(key)) return "FWC" + key.slice(3);
  return key.replace("_", "");
}

function getStickerImage(key) {
  if (!key) return null;
  // 1) Si hay excepción en el mapa, usar ese nombre exacto.
  // 2) Si no, usar el nombre limpio (número de la figurita).
  const filename = STICKER_MAP[key] || cleanStickerName(key);
  return `${CLOUDINARY_BASE}/${IMG_OPTS}/figuritas2026/${filename}.jpg`;
}

const STICKER_IMAGES = {};

// PRECIOS BASE POR ETIQUETA
const DEFAULT_PRICES = { FWC:2500, FOIL:1300, TOP:1900, PHOTO:700, BASE:475 };

// PRECIOS ESPECIALES INDIVIDUALES
const SPECIAL_PRICES_INIT = {
  // FWC Especiales
  "s00":25000,   // FWC00 - Logo Panini
  "fwc1":2500,"fwc2":2500,"fwc3":2500,"fwc4":2500,
  "fwc5":2500,"fwc6":2500,"fwc7":2500,"fwc8":2500,
  "fwc9":3900,"fwc10":3900,"fwc11":3900,"fwc12":3900,
  "fwc13":3900,"fwc14":3900,"fwc15":3900,"fwc16":3900,"fwc17":3900,
  // Argentina especiales
  "ARG_1":4500,   // Escudo ARG FOIL
  "ARG_17":39000, // Messi
  "ARG_2":2900,   // Dibu Martinez
  "ARG_19":2900,  // Julian Alvarez
  // ARG jugadores base = $1900 (TOP_KEYS los marca como TOP → usa DEFAULT_PRICES.TOP)
  // Estrellas mundiales
  "POR_15":20000, // Cristiano Ronaldo
  "FRA_20":15000, // Mbappé
  "ESP_15":12000, // Lamine Yamal
  "NOR_15":7500,  // Haaland
  "ENG_16":2500,  // Harry Kane
  "NZL_6":10000,  // Tim Payne
  "COL_17":1000,  // Luis Díaz
  "BRA_14":1000,  // Vinícius Jr.
  "CRO_13":6000,  // Modrić
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
  // GRUPO A
  {code:"MEX",name:"México",flag:"🇲🇽",conf:"Sede",group:"A",players:["Luis Malagón","Johan Vasquez","Jorge Sánchez","Cesar Montes","Jesus Gallardo","Israel Reyes","Diego Lainez","Carlos Rodriguez","Edson Alvarez","Orbelin Pineda","Marcel Ruiz","Érick Sánchez","Hirving Lozano","Santiago Giménez","Raúl Jiménez","Alexis Vega","Roberto Alvarado","Cesar Huerta"]},
  {code:"RSA",name:"Sudáfrica",flag:"🇿🇦",conf:"CAF",group:"A",players:["Ronwen Williams","Sipho Chaine","Aubrey Modiba","Samukele Kabini","Mbekezeli Mbokazi","Khulumani Ndamane","Siyabonga Ngezana","Khuliso Mudau","Nkosinathi Sibisi","Teboho Mokoena","Thalente Mbatha","Bathusi Aubaas","Yaya Sithole","Sipho Mbule","Lyle Foster","Iqraam Rayners","Mohau Nkota","Oswin Appollis"]},
  {code:"KOR",name:"Corea del Sur",flag:"🇰🇷",conf:"AFC",group:"A",players:["Hyeon-woo Jo","Seung-Gyu Kim","Min-jae Kim","Yu-min Cho","Young-woo Seol","Han-beom Lee","Tae-seok Lee","Myung-jae Lee","Jae-sung Lee","In-beom Hwang","Kang-in Lee","Seung-ho Paik","Jens Castrop","Dong-gyeong Lee","Gue-sung Cho","Heung-min Son","Hee-chan Hwang","Hyeon-Gyu Oh"]},
  {code:"CZE",name:"República Checa",flag:"🇨🇿",conf:"UEFA",group:"A",players:["Matej Kovar","Jindrich Stanek","Ladislav Krejci","Vladimir Coufal","Jaroslav Zeleny","Tomas Holes","David Zima","Michal Sadilek","Lukas Provod","Lukas Cerv","Tomas Soucek","Pavel Sulc","Matej Vydra","Vasil Kusej","Tomas Chory","Vaclav Cerny","Adam Hlozek","Patrik Schick"]},
  // GRUPO B
  {code:"CAN",name:"Canadá",flag:"🇨🇦",conf:"Sede",group:"B",players:["Dayne St.Clair","Alphonso Davies","Alistair Johnston","Samuel Adekugbe","Richie Laryea","Derek Cornelius","Moïse Bombito","Kamal Miller","Stephen Eustáquio","Ismaël Koné","Jonathan Osorio","Jacob Shaffelburg","Mathieu Choinière","Niko Sigur","Tajon Buchanan","Liam Millar","Cyle Larin","Jonathan David"]},
  {code:"QAT",name:"Qatar",flag:"🇶🇦",conf:"AFC",group:"B",players:["Meshaal Barsham","Sultan Albrake","Lucas Mendes","Homam Ahmed","Boualem Khoukhi","Pedro Miguel","Tarek Salman","Mohamed Al-Mannai","Karim Boudiaf","Assim Madibo","Ahmed Fatehi","Mohammed Waad","Abdulaziz Hatem","Hassan Al-Haydos","Edmilson Junior","Akram Hassan Afif","Ahmed Al Ganehi","Almoez Ali"]},
  {code:"CHE",name:"Suiza",flag:"🇨🇭",conf:"UEFA",group:"B",players:["Gregor Kobel","Yvon Mvogo","Manuel Akanji","Ricardo Rodriguez","Nico Elvedi","Aurèle Amenda","Silvan Widmer","Granit Xhaka","Denis Zakaria","Remo Freuler","Fabian Rieder","Ardon Jashari","Johan Manzambi","Michel Aebischer","Breel Embolo","Ruben Vargas","Dan Ndoye","Zeki Amdouni"]},
  {code:"BIH",name:"Bosnia y Herzegovina",flag:"🇧🇦",conf:"UEFA",group:"B",players:["Nikola Vasilj","Amer Dedic","Sead Kolasinac","Tarik Muharemovic","Nihad Mujakic","Nikola Katic","Amir Hadziahmetovic","Benjamin Tahirovic","Armin Gigovic","Ivan Sunjic","Ivan Basic","Dzenis Burnic","Esmir Bajraktarevic","Amar Memic","Ermedin Demirovic","Edin Dzeko","Samed Bazdar","Haris Tabakovic"]},
  // GRUPO C
  {code:"BRA",name:"Brasil",flag:"🇧🇷",conf:"CONMEBOL",group:"C",players:["Alisson","Bento","Marquinhos","Éder Militão","Gabriel Magalhães","Danilo","Wesley","Lucas Paquetá","Casemiro","Bruno Guimarães","Luiz Henrique","Vinicius Júnior","Rodrygo","João Pedro","Matheus Cunha","Gabriel Martinelli","Raphinha","Estévão"]},
  {code:"MAR",name:"Marruecos",flag:"🇲🇦",conf:"CAF",group:"C",players:["Yassine Bounou","Munir El Kajoui","Achraf Hakimi","Noussair Mazraoui","Nayef Aguerd","Roman Saiss","Jawad El Yamiq","Adam Masina","Sofyan Amrabat","Azzedine Ounahi","Eliesse Ben Seghir","Bilal El Khannouss","Ismael Saibari","Youssef En-Nesyri","Abde Ezzalzouli","Soufiane Rahimi","Brahim Diaz","Ayoub El Kaabi"]},
  {code:"HAI",name:"Haití",flag:"🇭🇹",conf:"CONCACAF",group:"C",players:["Johny Placide","Carlens Arcus","Martin Expérience","Jean-Kevin Duverne","Ricardo Adé","Duke Lacroix","Garven Metusala","Hannes Delcroix","Leverton Pierre","Danley Jean Jacques","Jean-Ricner Bellegarde","Christopher Attys","Derrick Etienne Jr","Josue Casimir","Ruben Providence","Duckens Nazon","Louicius Deedson","Frantzdy Pierrot"]},
  {code:"SCO",name:"Escocia",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",conf:"UEFA",group:"C",players:["Angus Gunn","Jack Hendry","Kieran Tierney","Aaron Hickey","Andrew Robertson","Scott McKenna","John Souttar","Anthony Ralston","Grant Hanley","Scott McTominay","Billy Gilmour","Lewis Ferguson","Ryan Christie","Kenny McLean","John McGinn","Lyndon Dykes","Che Adams","Ben Doak"]},
  // GRUPO D
  {code:"USA",name:"Estados Unidos",flag:"🇺🇸",conf:"Sede",group:"D",players:["Matt Freese","Chris Richards","Tim Ream","Mark McKenzie","Alex Freeman","Antonee Robinson","Tyler Adams","Tanner Tessmann","Weston McKennie","Christian Roldan","Timothy Weah","Diego Luna","Malik Tillman","Christian Pulisic","Brenden Aaronson","Ricardo Pepi","Haji Wright","Folarin Balogun"]},
  {code:"PAR",name:"Paraguay",flag:"🇵🇾",conf:"CONMEBOL",group:"D",players:["Roberto Fernandez","Orlando Gill","Gustavo Gomez","Fabián Balbuena","Juan José Cáceres","Omar Alderete","Junior Alonso","Mathías Villasanti","Diego Gomez","Damián Bobadilla","Andres Cubas","Matias Galarza Fonda","Julio Enciso","Alejandro Romero Gamarra","Miguel Almirón","Ramon Sosa","Angel Romero","Antonio Sanabria"]},
  {code:"AUS",name:"Australia",flag:"🇦🇺",conf:"AFC",group:"D",players:["Mathew Ryan","Joe Gauci","Harry Souttar","Alessandro Circati","Jordan Bos","Aziz Behich","Cameron Burgess","Lewis Miller","Milos Degenek","Jackson Irvine","Riley McGree","Aiden O'Neill","Connor Metcalfe","Patrick Yazbek","Craig Goodwin","Kusini Vengi","Nestory Irankunda","Mohamed Touré"]},
  {code:"TUR",name:"Turquía",flag:"🇹🇷",conf:"UEFA",group:"D",players:["Ugurcan Cakir","Mert Muldur","Zeki Celik","Abdulkerim Bardakci","Caglar Soyuncu","Merih Demiral","Ferdi Kadioglu","Kaan Ayhan","Ismail Yuksek","Hakan Calhanoglu","Orkun Kokcu","Arda Guler","Irfan Can Kahveci","Yunus Akgun","Can Uzun","Baris Alper Yilmaz","Kerem Akturkoglu","Kenan Yildiz"]},
  // GRUPO E
  {code:"GER",name:"Alemania",flag:"🇩🇪",conf:"UEFA",group:"E",players:["Marc-André ter Stegen","Jonathan Tah","David Raum","Nico Schlotterbeck","Antonio Rüdiger","Waldemar Anton","Ridle Baku","Maximilian Mittelstadt","Joshua Kimmich","Florian Wirtz","Felix Nmecha","Leon Goretzka","Jamal Musiala","Serge Gnabry","Kai Havertz","Leroy Sane","Karim Adeyemi","Nick Woltemade"]},
  {code:"CUW",name:"Curazao",flag:"🇨🇼",conf:"CONCACAF",group:"E",players:["Eloy Room","Armando Obispo","Sherel Floranus","Jurien Gaari","Joshua Brenet","Roshon Van Eijma","Shurandy Sambo","Livano Comenencia","Godfried Roemeratoe","Juninho Bacuna","Leandro Bacuna","Tahith Chong","Kenji Gorre","Jearl Margaritha","Jurgen Locadia","Jeremy Antonisse","Gervane Kastaneer","Sontje Hansen"]},
  {code:"CIV",name:"Costa de Marfil",flag:"🇨🇮",conf:"CAF",group:"E",players:["Yahia Fofana","Simon Deli","Odilon Kossounou","Wilfried Singo","Ghislain Konan","Jean-Louis Touré","Serge Aurier","Franck Kessié","Ibrahim Sangare","Seko Fofana","Jean Michaël Seri","Oumar Diakité","Nicolas Pépé","Jonathan Bamba","Wilfried Zaha","Sebastien Haller","Simon Adingra","Oumar Diakite"]},
  {code:"ECU",name:"Ecuador",flag:"🇪🇨",conf:"CONMEBOL",group:"E",players:["Hernán Galíndez","Gonzalo Valle","Piero Hincapié","Pervis Estupiñán","Willian Pacho","Ángelo Preciado","Joel Ordóñez","Moises Caicedo","Alan Franco","Kendry Paez","Pedro Vite","John Yeboah","Leonardo Campana","Gonzalo Plata","Nilson Angulo","Alan Minda","Kevin Rodriguez","Enner Valencia"]},
  // GRUPO F
  {code:"NED",name:"Países Bajos",flag:"🇳🇱",conf:"UEFA",group:"F",players:["Bart Verbruggen","Virgil van Dijk","Micky van de Ven","Jurrien Timber","Denzel Dumfries","Nathan Aké","Jeremie Frimpong","Jan Paul van Hecke","Tijjani Reijnders","Ryan Gravenberch","Teun Koopmeiners","Frenkie de Jong","Xavi Simons","Justin Kluivert","Memphis Depay","Donyell Malen","Wout Weghorst","Cody Gakpo"]},
  {code:"JPN",name:"Japón",flag:"🇯🇵",conf:"AFC",group:"F",players:["Zion Suzuki","Henry H. Mochizuki","Ayumu Seko","Junnosuke Suzuki","Shogo Taniguchi","Tsuyoshi Watanabe","Kaishu Sano","Yuki Soma","Ao Tanaka","Daichi Kamada","Takefusa Kubo","Ritsu Doan","Keito Nakamura","Takumi Minamino","Shuto Machino","Junya Ito","Koki Ogawa","Ayase Ueda"]},
  {code:"TUN",name:"Túnez",flag:"🇹🇳",conf:"CAF",group:"F",players:["Bechir Ben Said","Aymen Dahmen","Yan Valery","Montassar Talbi","Yassine Meriah","Ali Abdi","Dylan Bronn","Ellyes Skhiri","Aissa Laidouni","Ferjani Sassi","Mohamed Ali Ben Romdhane","Hannibal Mejbri","Elias Achouri","Elias Saad","Hazem Mastouri","Ismael Gharbi","Sayfallah Ltaief","Naim Sliti"]},
  {code:"SWE",name:"Suecia",flag:"🇸🇪",conf:"UEFA",group:"F",players:["Victor Johansson","Isak Hien","Gabriel Gudmundsson","Emil Holm","Victor N. Lindelöf","Gustaf Lagerbielke","Lucas Bergvall","Hugo Larsson","Jesper Karlström","Yasin Ayari","Mattias Svanberg","Daniel Svensson","Ken Sema","Roony Bardghji","Dejan Kulusevski","Anthony Elanga","Alexander Isak","Viktor Gyökeres"]},
  // GRUPO G
  {code:"BEL",name:"Bélgica",flag:"🇧🇪",conf:"UEFA",group:"G",players:["Thibaut Courtois","Arthur Theate","Timothy Castagne","Zeno Debast","Brandon Mechele","Maxim De Cuyper","Thomas Meunier","Youri Tielemans","Amadou Onana","Nicolas Raskin","Alexis Saelemaekers","Hans Vanaken","Kevin De Bruyne","Jérémy Doku","Charles De Ketelaere","Leandro Trossard","Loïs Openda","Romelu Lukaku"]},
  {code:"EGY",name:"Egipto",flag:"🇪🇬",conf:"CAF",group:"G",players:["Mohamed El Shenawy","Mohamed Hany","Mohamed Hamdy","Yasser Ibrahim","Khaled Sobhi","Ramy Rabia","Hossam Abdelmaguid","Ahmed Fatouh","Marwan Attia","Zizo","Hamdy Fathy","Mohamed Lasheen","Emam Ashour","Osama Faisal","Mohamed Salah","Mostafa Mohamed","Trezeguet","Omar Marmoush"]},
  {code:"IRI",name:"Irán",flag:"🇮🇷",conf:"AFC",group:"G",players:["Alireza Beiranvand","Morteza Pouraliganji","Ehsan Hajsafi","Milad Mohammadi","Shojae Khalilzadeh","Ramin Rezaeian","Hossein Kanaani","Sadegh Moharrami","Saleh Hardani","Saeed Ezatolahi","Saman Ghoddos","Omid Noorafkan","Roozbeh Cheshmi","Mohammad Mohebi","Sardar Azmoun","Mehdi Taremi","Alireza Jahanbakhsh","Ali Gholizadeh"]},
  {code:"NZL",name:"Nueva Zelanda",flag:"🇳🇿",conf:"OFC",group:"G",players:["Max Crocombe","Alex Paulsen","Michael Boxall","Liberato Cacace","Tim Payne","Tyler Bindon","Francis de Vries","Finn Surman","Joe Bell","Sarpreet Singh","Ryan Thomas","Matthew Garbett","Marko Stamenić","Ben Old","Chris Wood","Elijah Just","Callum McCowatt","Kosta Barbarouses"]},
  // GRUPO H
  {code:"ESP",name:"España",flag:"🇪🇸",conf:"UEFA",group:"H",players:["Unai Simon","Robin Le Normand","Aymeric Laporte","Dean Huijsen","Pedro Porro","Dani Carvajal","Marc Cucurella","Martín Zubimendi","Rodri","Pedri","Fabian Ruiz","Mikel Merino","Lamine Yamal","Dani Olmo","Nico Williams","Ferran Torres","Álvaro Morata","Mikel Oyarzabal"]},
  {code:"CPV",name:"Cabo Verde",flag:"🇨🇻",conf:"CAF",group:"H",players:["Vozinha","Logan Costa","Pico","Diney","Steven Moreira","Wagner Pina","Joao Paulo","Yannick Semedo","Kevin Pina","Patrick Andrade","Jamiro Monteiro","Deroy Duarte","Garry Rodrigues","Jovane Cabral","Ryan Mendes","Dailon Livramento","Willy Semedo","Bebe"]},
  {code:"KSA",name:"Arabia Saudita",flag:"🇸🇦",conf:"AFC",group:"H",players:["Nawaf Alaqidi","Abdulrahman Al-Sanbi","Saud Abdulhamid","Nawaf Bouwashl","Jihad Thakri","Moteb Al-Harbi","Hassan Altambakti","Musab Aljuwayr","Ziyad Aljohani","Abdullah Alkhaibari","Nasser Aldawsari","Saleh Abu Alshamat","Marwan Alsahafi","Salem Aldawsari","Abdulrahman Al-Aboud","Feras Akbrikan","Saleh Alshehri","Abdullah Al-Hamdan"]},
  {code:"URU",name:"Uruguay",flag:"🇺🇾",conf:"CONMEBOL",group:"H",players:["Sergio Rochet","Santiago Mele","Ronald Araujo","José María Giménez","Sebastian Caceres","Mathias Olivera","Guillermo Varela","Nahitan Nandez","Federico Valverde","Giorgian De Arrascaeta","Rodrigo Bentancur","Manuel Ugarte","Nicolás de la Cruz","Maxi Araujo","Darwin Núñez","Federico Viñas","Rodrigo Aguirre","Facundo Pellistri"]},
  // GRUPO I
  {code:"FRA",name:"Francia",flag:"🇫🇷",conf:"UEFA",group:"I",players:["Mike Maignan","Alphonse Areola","Jules Koundé","Dayot Upamecano","William Saliba","Theo Hernandez","Lucas Hernandez","Eduardo Camavinga","Aurélien Tchouaméni","Adrien Rabiot","Antoine Griezmann","Ousmane Dembélé","Marcus Thuram","Randal Kolo Muani","Bradley Barcola","Kylian Mbappé","Kingsley Coman","Matteo Guendouzi"]},
  {code:"SEN",name:"Senegal",flag:"🇸🇳",conf:"CAF",group:"I",players:["Edouard Mendy","Yehvann Diouf","Moussa Niakhaté","Abdoulaye Seck","Ismail Jakobs","El Hadji Malick Diouf","Kalidou Koulibaly","Idrissa Gana Gueye","Pape Matar Sarr","Pape Gueye","Habib Diarra","Lamine Camara","Sadio Mane","Ismaïla Sarr","Boulaye Dia","Iliman Ndiaye","Nicolas Jackson","Krepin Diatta"]},
  {code:"NOR",name:"Noruega",flag:"🇳🇴",conf:"UEFA",group:"I",players:["Orjan Nyland","Julian Ryerson","Leo Ostigård","Kristoffer Ajer","Marcus Pedersen","David Wolfe","Torbjørn Heggem","Morten Thorsby","Martin Ødegaard","Sander Berge","Andreas Schjelderup","Patrick Berg","Erling Haaland","Alexander Sørloth","Aron Dønnum","Jorgen Larsen","Antonio Nusa","Oscar Bobb"]},
  {code:"IRQ",name:"Irak",flag:"🇮🇶",conf:"AFC",group:"I",players:["Jalal Hassan","Rebin Sulaka","Hussein Ali","Akam Hashem","Merchas Doski","Zaid Tahseen","Manaf Younis","Zidane Iqbal","Amir Al-Ammari","Ibrahim Bavesh","Ali Jasim","Youssef Amyn","Aimar Sher","Marko Farji","Osama Rashid","Ali Al-Hamadi","Aymen Hussein","Mohanad Ali"]},
  // GRUPO J
  {code:"ARG",name:"Argentina",flag:"🇦🇷",conf:"CONMEBOL",group:"J",players:["Emiliano Martinez","Nahuel Molina","Cristian Romero","Nicolas Otamendi","Nicolas Tagliafico","Leonardo Balerdi","Enzo Fernandez","Alexis Mac Allister","Rodrigo De Paul","Exequiel Palacios","Leandro Paredes","Nico Paz","Franco Mastantuono","Nico Gonzalez","Lionel Messi","Lautaro Martinez","Julian Alvarez","Giuliano Simeone"]},
  {code:"ALG",name:"Argelia",flag:"🇩🇿",conf:"CAF",group:"J",players:["Alexis Guendouz","Ramy Bensebaini","Youcef Atal","Rayan Aït-Nouri","Mohamed Amine Tougai","Aïssa Mandi","Ismael Bennacer","Houssem Aqar","Hicham Boudaoui","Ramiz Zerrouki","Nabil Bentalab","Farés Chaibi","Riyad Mahrez","Said Benrahma","Anis Hadj Moussa","Amine Gouiri","Baghdad Bounedjah","Mohammed Amoura"]},
  {code:"AUT",name:"Austria",flag:"🇦🇹",conf:"UEFA",group:"J",players:["Alexander Schlager","Patrick Pentz","David Alaba","Kevin Danso","Philipp Lienhart","Stefan Posch","Philipp Mwene","Alexander Prass","Xaver Schlager","Marcel Sabitzer","Konrad Laimer","Florian Grillitsch","Nicolas Seiwald","Romano Schmid","Patrick Wimmer","Christoph Baumgartner","Michael Gregoritsch","Marko Arnautović"]},
  {code:"JOR",name:"Jordania",flag:"🇯🇴",conf:"AFC",group:"J",players:["Yazeed Abulaila","Ihsan Haddad","Mohammad Abu Hashish","Yazan Al-Arab","Abdallah Nasib","Saleem Obaid","Mohammad Abualnadi","Ibrahim Saadeh","Nizar Al-Rashdan","Noor Al-Rawabdeh","Mohannad Abu Taha","Amer Jamous","Musa Al-Taamari","Yazan Al-Naimat","Mahmoud Al-Mardi","Ali Olwan","Mohammad Abu Zrayq","Ibrahim Sabra"]},
  // GRUPO K
  {code:"POR",name:"Portugal",flag:"🇵🇹",conf:"UEFA",group:"K",players:["Diogo Costa","Jose Sa","Ruben Dias","João Cancelo","Diogo Dalot","Nuno Mendes","Gonçalo Inácio","Bernardo Silva","Bruno Fernandes","Ruben Neves","Vitinha","João Neves","Cristiano Ronaldo","Francisco Trincao","João Felix","Gonçalo Ramos","Pedro Neto","Rafael Leão"]},
  {code:"COL",name:"Colombia",flag:"🇨🇴",conf:"CONMEBOL",group:"K",players:["Camilo Vargas","Stephenson Maldonado","Dávinson Sánchez","Jhon Lucumí","Carlos Cuesta","Déiver Machado","Daniel Muñoz","Santiago Arias","Richard Ríos","Mateus Uribe","Juan Cuadrado","Jefferson Lerma","Jorge Carrascal","Jhon Arias","Luis Díaz","James Rodríguez","Rafael Santos Borré","Radamel Falcao"]},
  {code:"UZB",name:"Uzbekistán",flag:"🇺🇿",conf:"AFC",group:"K",players:["Eldorbek Suyunov","Jasurbek Yakhshiboev","Sherzod Nishonov","Eldor Shomurodov","Jasur Yakhshiboev","Otabek Shukurov","Khojiakbar Alijonov","Jaloliddin Masharipov","Ulugbek Asrorov","Dostonbek Khamdamov","Oston Urunov","Asilbek Ismatov","Akbar Djuraev","Ikromjon Alibaev","Khurshid Makhmudov","Laziz Karimov","Aziz Hamroyev","Shokhrukh Kholmatov"]},
  {code:"COD",name:"DR Congo",flag:"🇨🇩",conf:"CAF",group:"K",players:["Joël Kiassumbua","Lionel Mpasi","Chancel Mbemba","Issama Mpeko","Marcel Tisserand","Héritier Luvumbu","Yoane Wissa","Paul-José Mpoku","Arthur Masuaku","Glody Lilepo","Cédric Bakambu","Fiston Mayele","Merveille Bope Bokadi","Théo Bongonda","Wilfried Zaha","Silas Wissa","Meschak Elia","Jordan Ikoko"]},
  // GRUPO L
  {code:"ENG",name:"Inglaterra",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",conf:"UEFA",group:"L",players:["Jordan Pickford","Dean Henderson","Kyle Walker","John Stones","Ezri Konsa","Marc Guehi","Luke Shaw","Kobbie Mainoo","Declan Rice","Trent Alexander-Arnold","Phil Foden","Jude Bellingham","Bukayo Saka","Cole Palmer","Marcus Rashford","Harry Kane","Jarrod Bowen","Ollie Watkins"]},
  {code:"CRO",name:"Croacia",flag:"🇭🇷",conf:"UEFA",group:"L",players:["Dominik Livaković","Ivica Ivušić","Josip Juranović","Duje Ćaleta-Car","Joško Gvardiol","Borna Sosa","Martin Erlić","Josip Stanišić","Mateo Kovačić","Marcelo Brozović","Mario Pašalić","Lovro Majer","Luka Modrić","Ante Budimir","Ivan Perišić","Luka Ivanušec","Marko Pjaca","Bruno Petković"]},
  {code:"GHA",name:"Ghana",flag:"🇬🇭",conf:"CAF",group:"L",players:["Lawrence Ati Zigi","Joseph Wollacott","Gideon Mensah","Mohammed Salisu","Alexander Djiku","Andrew Kyeremateng","Tariq Lamptey","Daniel Amartey","Salis Abdul Samed","Thomas Partey","Caleb Yirenkyi","Abdul Issahaku Fatawu","Kamaldeen Sulemana","Mohammed Kudus","Inaki Williams","Jordan Ayew","Andre Ayew","Antoine Semenyo"]},
  {code:"PAN",name:"Panamá",flag:"🇵🇦",conf:"CONCACAF",group:"L",players:["Orlando Mosquera","Luis Mejia","Fidel Escobar","Andres Andrade","Michael Amir Murillo","Eric Davis","Jose Cordoba","Cesar Blackman","Cristian Martinez","Aníbal Godoy","Adalberto Carrasquilla","Édgar Bárcenas","Carlos Harvey","Ismael Díaz","Jose Fajardo","Cecilio Waterman","Jose Luiz Rodriguez","Alberto Quintero"]},
];
// TOP players por país para precio especial
const TOP_KEYS={
  // Argentina — todos los jugadores salen $1900 (TOP), salvo los especiales
  ARG:["ARG_2","ARG_3","ARG_4","ARG_5","ARG_6","ARG_7","ARG_8","ARG_9","ARG_10","ARG_11","ARG_12","ARG_14","ARG_15","ARG_16","ARG_17","ARG_18","ARG_19","ARG_20"],
  BRA:["BRA_14","BRA_15","BRA_19"],
  FRA:["FRA_20","FRA_15","FRA_9"],
  ESP:["ESP_15","ESP_11","ESP_10"],
  POR:["POR_15","POR_9","POR_10"],
  ENG:["ENG_16","ENG_14","ENG_15"],
  GER:["GER_11","GER_15","GER_17"],
  NOR:["NOR_15","NOR_10"],
  EGY:["EGY_17","EGY_20"],
  NED:["NED_3","NED_20","NED_14"],
  URU:["URU_10","URU_17"],
  BEL:["BEL_15","BEL_20"],
  CRO:["CRO_17"],
  SEN:["SEN_15","SEN_16"],
  MAR:["MAR_4","MAR_16"],
};
// Estructura real Panini 2026: #1=FOIL, #2-#12=jugadores, #13=FOTO, #14-#20=jugadores
function buildCountryStickers(c){
  const code=c.code; const pl=c.players||[]; const ss=[];
  ss.push({key:`${code}_1`,num:`${code}1`,name:"Escudo oficial",type:"FOIL"});
  pl.slice(0,11).forEach((name,i)=>{const k=`${code}_${i+2}`;ss.push({key:k,num:`${code}${i+2}`,name,type:TOP_KEYS[code]?.includes(k)?"TOP":"BASE"});});
  ss.push({key:`${code}_13`,num:`${code}13`,name:"Foto grupal",type:"PHOTO"});
  pl.slice(11,18).forEach((name,i)=>{const k=`${code}_${i+14}`;ss.push({key:k,num:`${code}${i+14}`,name,type:TOP_KEYS[code]?.includes(k)?"TOP":"BASE"});});
  return ss;
}
const FWC_STICKERS=[{key:"s00",num:"00",name:"Logo Panini",type:"FWC"},{key:"fwc1",num:"FWC1",name:"Emblema Oficial",type:"FWC"},{key:"fwc2",num:"FWC2",name:"Emblema (var.)",type:"FWC"},{key:"fwc3",num:"FWC3",name:"Mascotas",type:"FWC"},{key:"fwc4",num:"FWC4",name:"Slogan Oficial",type:"FWC"},{key:"fwc5",num:"FWC5",name:"Balón Oficial",type:"FWC"},{key:"fwc6",num:"FWC6",name:"Canadá Sede",type:"FWC"},{key:"fwc7",num:"FWC7",name:"México Sede",type:"FWC"},{key:"fwc8",num:"FWC8",name:"USA Sede",type:"FWC"},{key:"fwc9",num:"FWC9",name:"MetLife Stadium",type:"FWC"},{key:"fwc10",num:"FWC10",name:"Rose Bowl",type:"FWC"},{key:"fwc11",num:"FWC11",name:"Estadio Azteca",type:"FWC"},{key:"fwc12",num:"FWC12",name:"SoFi Stadium",type:"FWC"},{key:"fwc13",num:"FWC13",name:"Estadio Dallas",type:"FWC"},{key:"fwc14",num:"FWC14",name:"Estadio Vancouver",type:"FWC"},{key:"fwc15",num:"FWC15",name:"Estadio Atlanta",type:"FWC"},{key:"fwc16",num:"FWC16",name:"Estadio Seattle",type:"FWC"},{key:"fwc17",num:"FWC17",name:"Estadio Toronto",type:"FWC"}];
const ALL_STICKERS=[...FWC_STICKERS,...COUNTRIES.flatMap(c=>buildCountryStickers(c))];
const DEFAULT_PRODUCTS = [
  // SOBRES
  {id:"p1", name:"Sobre Panini individual",       desc:"1 sobre original cerrado · 7 figuritas al azar",              price:2400,  stock:500, emoji:"📦", category:"sobre"},
  {id:"p2", name:"Pack 50 sobres Panini",         desc:"50 sobres originales · precio especial por pack",             price:23000, stock:50,  emoji:"📦", category:"sobre"},
  {id:"p3", name:"Pack 100 sobres Panini",        desc:"100 sobres · el mejor precio por sobre",                      price:22900, stock:30,  emoji:"📦", category:"sobre"},
  {id:"p4", name:"Pack 500 sobres Panini",        desc:"500 sobres · precio mayorista",                               price:22500, stock:10,  emoji:"📦", category:"sobre"},
  {id:"p5", name:"Pack 1000 sobres + 10 álbumes", desc:"1000 sobres + 10 álbumes Panini Sticker Collection original", price:22000, stock:5,   emoji:"🏆", category:"sobre"},
  // LOTES PARA ARMAR TU ÁLBUM
  {id:"p6", name:"Lote 100 figuritas al azar",    desc:"5 escudos FOIL + 95 jugadores comunes · sin repetir",         price:39000, stock:20,  emoji:"🎴", category:"lote"},
  {id:"p7", name:"Lote 200 figuritas al azar",    desc:"10 escudos FOIL + 190 jugadores comunes · sin repetir",       price:78000, stock:10,  emoji:"🎴", category:"lote"},
  {id:"p8", name:"Lote Argentina completo",        desc:"Las 20 figuritas de Argentina sin pegar · con Messi ARG17",  price:75000, stock:5,   emoji:"🇦🇷", category:"lote"},
  // ÁLBUMES
  {id:"p9", name:"Álbum COMPLETO 980 figuritas",   desc:"980 figuritas para pegar + álbum tapa dura de regalo",       price:590000,stock:2,   emoji:"📖", category:"album"},
  // COCA-COLA
  {id:"p10",name:"Sobre Coca-Cola cerrado",        desc:"Sobre edición especial Coca-Cola · coleccionable",           price:3500,  stock:40,  emoji:"🥤", category:"cocacola"},
];

// ═══════════════════════════════════════════════════════
// EXTRAS PANINI 2026 — 20 jugadores × 4 versiones
// Fuente oficial: paninigroup.com/en/us/ExtraStickers
// Aparecen 1 cada 100 sobres aprox. No van en el álbum.
// ═══════════════════════════════════════════════════════
const EXTRA_PLAYERS = [
  {id:"ext_ARG", player:"Lionel Messi",      country:"Argentina",   flag:"🇦🇷", code:"ARG"},
  {id:"ext_BEL", player:"Jérémy Doku",       country:"Bélgica",     flag:"🇧🇪", code:"BEL"},
  {id:"ext_BRA", player:"Vinícius Júnior",   country:"Brasil",      flag:"🇧🇷", code:"BRA"},
  {id:"ext_CAN", player:"Alphonso Davies",   country:"Canadá",      flag:"🇨🇦", code:"CAN"},
  {id:"ext_COL", player:"Luis Díaz",         country:"Colombia",    flag:"🇨🇴", code:"COL"},
  {id:"ext_CRO", player:"Luka Modrić",       country:"Croacia",     flag:"🇭🇷", code:"CRO"},
  {id:"ext_ECU", player:"Moisés Caicedo",    country:"Ecuador",     flag:"🇪🇨", code:"ECU"},
  {id:"ext_EGY", player:"Mohamed Salah",     country:"Egipto",      flag:"🇪🇬", code:"EGY"},
  {id:"ext_ENG", player:"Jude Bellingham",   country:"Inglaterra",  flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", code:"ENG"},
  {id:"ext_FRA", player:"Kylian Mbappé",     country:"Francia",     flag:"🇫🇷", code:"FRA"},
  {id:"ext_GER", player:"Florian Wirtz",     country:"Alemania",    flag:"🇩🇪", code:"GER"},
  {id:"ext_KOR", player:"Heung-min Son",     country:"Corea del Sur",flag:"🇰🇷",code:"KOR"},
  {id:"ext_MEX", player:"Raúl Jiménez",      country:"México",      flag:"🇲🇽", code:"MEX"},
  {id:"ext_MAR", player:"Achraf Hakimi",     country:"Marruecos",   flag:"🇲🇦", code:"MAR"},
  {id:"ext_NED", player:"Cody Gakpo",        country:"Países Bajos",flag:"🇳🇱", code:"NED"},
  {id:"ext_NOR", player:"Erling Haaland",    country:"Noruega",     flag:"🇳🇴", code:"NOR"},
  {id:"ext_POR", player:"Cristiano Ronaldo", country:"Portugal",    flag:"🇵🇹", code:"POR"},
  {id:"ext_ESP", player:"Lamine Yamal",      country:"España",      flag:"🇪🇸", code:"ESP"},
  {id:"ext_URU", player:"Federico Valverde", country:"Uruguay",     flag:"🇺🇾", code:"URU"},
  {id:"ext_USA", player:"Christian Pulisic", country:"EE.UU.",      flag:"🇺🇸", code:"USA"},
];
const EXTRA_VERSIONS = [
  {key:"base",   label:"Base (Púrpura)", color:"#6d28d9", bg:"#ede9fe", border:"#8b5cf6", rarity:"Común",      price:10000},
  {key:"bronze", label:"Bronce",         color:"#92400e", bg:"#fef3c7", border:"#d97706", rarity:"Poco común", price:19000},
  {key:"silver", label:"Plata",          color:"#475569", bg:"#f1f5f9", border:"#94a3b8", rarity:"Rara",       price:25000},
  {key:"gold",   label:"Oro",            color:"#78350f", bg:"#fef9c3", border:"#eab308", rarity:"Ultra rara", price:35000},
];
// Precios especiales por jugador en Extras
const EXTRA_SPECIAL_PRICES = {
  // Messi
  "ext_ARG_base":25000,"ext_ARG_bronze":40000,"ext_ARG_silver":95000,"ext_ARG_gold":290000,
  // Ronaldo (~$10k menos que Messi en promedio)
  "ext_POR_base":20000,"ext_POR_bronze":32000,"ext_POR_silver":82000,"ext_POR_gold":250000,
  // Mbappé (+$15k a cada versión)
  "ext_FRA_base":25000,"ext_FRA_bronze":34000,"ext_FRA_silver":40000,"ext_FRA_gold":50000,
  // Haaland (+$5k a cada versión)
  "ext_NOR_base":15000,"ext_NOR_bronze":24000,"ext_NOR_silver":30000,"ext_NOR_gold":40000,
};
function getExtraPrice(playerId, versionKey) {
  const k=`${playerId}_${versionKey}`;
  if(EXTRA_SPECIAL_PRICES[k]) return EXTRA_SPECIAL_PRICES[k];
  return EXTRA_VERSIONS.find(v=>v.key===versionKey)?.price||10000;
}

// ═══════════════════════════════════════════════════
// FIXTURE OFICIAL FIFA WORLD CUP 2026
// Fuente: ESPN / FIFA — Horarios en hora ARGENTINA
// ═══════════════════════════════════════════════════
const FIXTURE = [
  // FASE DE GRUPOS
  {date:"11/06",day:"Jue",home:"México",away:"Sudáfrica",hf:"🇲🇽",af:"🇿🇦",time:"16:00",group:"A",venue:"Estadio Azteca, Ciudad de México",hs:null,as:null,status:"programado"},
  {date:"11/06",day:"Jue",home:"Corea del Sur",away:"Rep. Checa",hf:"🇰🇷",af:"🇨🇿",time:"23:00",group:"A",venue:"Estadio Akron, Guadalajara",hs:null,as:null,status:"programado"},
  {date:"12/06",day:"Vie",home:"Canadá",away:"Bosnia y Herz.",hf:"🇨🇦",af:"🇧🇦",time:"16:00",group:"B",venue:"BMO Field, Toronto",hs:null,as:null,status:"programado"},
  {date:"12/06",day:"Vie",home:"Estados Unidos",away:"Paraguay",hf:"🇺🇸",af:"🇵🇾",time:"22:00",group:"D",venue:"SoFi Stadium, Los Ángeles",hs:null,as:null,status:"programado"},
  {date:"13/06",day:"Sáb",home:"Qatar",away:"Suiza",hf:"🇶🇦",af:"🇨🇭",time:"16:00",group:"B",venue:"Levi's Stadium, San Francisco",hs:null,as:null,status:"programado"},
  {date:"13/06",day:"Sáb",home:"Brasil",away:"Marruecos",hf:"🇧🇷",af:"🇲🇦",time:"19:00",group:"C",venue:"MetLife Stadium, Nueva Jersey",hs:null,as:null,status:"programado"},
  {date:"13/06",day:"Sáb",home:"Haití",away:"Escocia",hf:"🇭🇹",af:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",time:"22:00",group:"C",venue:"Gillette Stadium, Boston",hs:null,as:null,status:"programado"},
  {date:"14/06",day:"Dom",home:"Australia",away:"Turquía",hf:"🇦🇺",af:"🇹🇷",time:"01:00",group:"D",venue:"BC Place, Vancouver",hs:null,as:null,status:"programado"},
  {date:"14/06",day:"Dom",home:"Alemania",away:"Curazao",hf:"🇩🇪",af:"🇨🇼",time:"14:00",group:"E",venue:"NRG Stadium, Houston",hs:null,as:null,status:"programado"},
  {date:"14/06",day:"Dom",home:"Países Bajos",away:"Japón",hf:"🇳🇱",af:"🇯🇵",time:"17:00",group:"F",venue:"AT&T Stadium, Dallas",hs:null,as:null,status:"programado"},
  {date:"14/06",day:"Dom",home:"Costa de Marfil",away:"Ecuador",hf:"🇨🇮",af:"🇪🇨",time:"20:00",group:"E",venue:"Lincoln Financial, Philadelphia",hs:null,as:null,status:"programado"},
  {date:"14/06",day:"Dom",home:"Suecia",away:"Túnez",hf:"🇸🇪",af:"🇹🇳",time:"23:00",group:"F",venue:"Estadio BBVA, Monterrey",hs:null,as:null,status:"programado"},
  {date:"15/06",day:"Lun",home:"España",away:"Cabo Verde",hf:"🇪🇸",af:"🇨🇻",time:"13:00",group:"H",venue:"Mercedes-Benz, Atlanta",hs:null,as:null,status:"programado"},
  {date:"15/06",day:"Lun",home:"Bélgica",away:"Egipto",hf:"🇧🇪",af:"🇪🇬",time:"16:00",group:"G",venue:"Lumen Field, Seattle",hs:null,as:null,status:"programado"},
  {date:"15/06",day:"Lun",home:"Arabia Saudita",away:"Uruguay",hf:"🇸🇦",af:"🇺🇾",time:"19:00",group:"H",venue:"Hard Rock Stadium, Miami",hs:null,as:null,status:"programado"},
  {date:"15/06",day:"Lun",home:"Irán",away:"Nueva Zelanda",hf:"🇮🇷",af:"🇳🇿",time:"22:00",group:"G",venue:"Arrowhead Stadium, Kansas City",hs:null,as:null,status:"programado"},
  {date:"16/06",day:"Mar",home:"Argentina",away:"Argelia",hf:"🇦🇷",af:"🇩🇿",time:"22:00",group:"J",venue:"Arrowhead Stadium, Kansas City",hs:null,as:null,status:"programado",highlight:true},
  {date:"16/06",day:"Mar",home:"Senegal",away:"Corea del Sur",hf:"🇸🇳",af:"🇰🇷",time:"16:00",group:"A",venue:"Estadio Akron, Guadalajara",hs:null,as:null,status:"programado"},
  {date:"16/06",day:"Mar",home:"Portugal",away:"Nigeria",hf:"🇵🇹",af:"🇳🇬",time:"19:00",group:"I",venue:"Lumen Field, Seattle",hs:null,as:null,status:"programado"},
  {date:"17/06",day:"Mié",home:"Francia",away:"Malí",hf:"🇫🇷",af:"🇲🇱",time:"19:00",group:"K",venue:"Arrowhead, Kansas City",hs:null,as:null,status:"programado"},
  {date:"17/06",day:"Mié",home:"Croacia",away:"Ghana",hf:"🇭🇷",af:"🇬🇭",time:"22:00",group:"L",venue:"Lincoln Financial, Philadelphia",hs:null,as:null,status:"programado"},
  {date:"18/06",day:"Jue",home:"Noruega",away:"Paraguay",hf:"🇳🇴",af:"🇵🇾",time:"22:00",group:"J",venue:"AT&T Stadium, Dallas",hs:null,as:null,status:"programado"},
  {date:"20/06",day:"Sáb",home:"Colombia",away:"Portugal",hf:"🇨🇴",af:"🇵🇹",time:"19:30",group:"K",venue:"Hard Rock Stadium, Miami",hs:null,as:null,status:"programado"},
  {date:"22/06",day:"Lun",home:"Argentina",away:"Austria",hf:"🇦🇷",af:"🇦🇹",time:"14:00",group:"J",venue:"AT&T Stadium, Dallas",hs:null,as:null,status:"programado",highlight:true},
  {date:"26/06",day:"Vie",home:"Argentina",away:"Jordania",hf:"🇦🇷",af:"🇯🇴",time:"22:00",group:"J",venue:"AT&T Stadium, Dallas",hs:null,as:null,status:"programado",highlight:true},
  // FASES FINALES
  {date:"29/06",day:"Dom",home:"1° Grupo A",away:"2° Grupo B",hf:"🏆",af:"🏆",time:"--:--",group:"R32",venue:"Por confirmar",hs:null,as:null,status:"programado"},
  {date:"19/07",day:"Dom",home:"FINAL",away:"",hf:"🏆",af:"🏆",time:"18:00",group:"Final",venue:"MetLife Stadium, Nueva Jersey",hs:null,as:null,status:"programado"},
];
const WA_NUM="541123592459", IG_HANDLE="@messirve2026", WA_DISPLAY="+54 11 2359-2459", ADMIN_PW="BRUNO2018*MUNDIAL", ADMIN_USER="ADMINFA", CONTACT_EMAIL="delvallefavio2015@gmail.com", RES_MINS=20;
const PRODE_LINK="https://elprodemundial2026.com.ar/unirse/mamonfcporde2026";
const SITE_NAME="MESSIRVE2026";
// Paleta Argentina — azul marino + celeste + blanco
const B={
  dark:"#001f5b",      // Azul marino oscuro
  mid:"#003a8c",       // Azul AFA
  acc:"#0050b3",       // Azul medio
  cel:"#74c0fc",       // Celeste Argentina
  celLight:"#e8f4fd",  // Celeste suave
  white:"#ffffff",
  tf:"'Bebas Neue',cursive"
};
const fmt=(n)=>Number(n).toLocaleString("es-AR");
function fmtDate(ts){const d=new Date(ts);return`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;}
function getWeek(ts){const d=new Date(ts);const s=new Date(d);s.setDate(d.getDate()-d.getDay());return`${s.getDate()}/${s.getMonth()+1}`;}
function getMonthKey(ts){const d=new Date(ts);return`${d.getMonth()+1}/${d.getFullYear()}`;}
function getYearKey(ts){return String(new Date(ts).getFullYear());}
function padOrder(n){return String(n).padStart(4,"0");}
function ChipBtn({active,onClick,children}){return<button style={{padding:"3px 10px",borderRadius:14,border:`1.5px solid ${active?B.dark:"#e2e8f0"}`,background:active?B.dark:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",color:active?"#fff":"#475569",whiteSpace:"nowrap"}} onClick={onClick}>{children}</button>;}
const inp={padding:"9px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:B.dark,background:"#fff",width:"100%"};
const lbl={fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,marginBottom:5,display:"block"};
const aBtn={background:`linear-gradient(135deg,${B.dark},${B.mid})`,color:"#fff",border:"none",borderRadius:25,padding:"9px 20px",fontSize:13,fontWeight:800,cursor:"pointer"};
const bBtn={background:"none",border:"none",color:B.dark,fontSize:12,fontWeight:600,cursor:"pointer",padding:"0 0 10px",display:"block"};
const qBtn={width:22,height:22,borderRadius:4,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:12,fontWeight:800};
const tag=(bg,c)=>({fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:600,background:`#${bg}`,color:`#${c}`});

function GS(){return<style>{`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#f1f5f9}
input,select,textarea{font-family:'Outfit',sans-serif}
.hov:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,31,91,.15)!important;border-color:#74c0fc!important}
.hov{transition:all .18s}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:#74c0fc55;border-radius:4px}
input:focus,select:focus,textarea:focus{outline:2px solid #74c0fc;outline-offset:1px}
`}</style>;}

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

  const sv=async(k,v,set)=>{
    set(v);
    try{
      await window.storage.set("mw26_"+k,JSON.stringify(v),true);
    }catch(e){
      console.error("Error guardando",k,e);
    }
  };
  const saveStockDirect=async(newStock)=>{
    setStock(newStock);
    try{
      const r=await window.storage.set("mw26_stk",JSON.stringify(newStock),true);
      if(!r) throw new Error("storage returned null");
    }catch(e){
      alert("⚠️ Error al guardar stock. Intentá de nuevo.");
      console.error(e);
    }
  };
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
    await saveStockDirect(ns);sv("prods",np,setProducts);
    sv("ord",orders.map(o=>o.id===orderId?{...o,status:"pagado",paidAt:Date.now()}:o),setOrders);
  };

  const p={screen,setScreen,user,setUser,admin,setAdmin,stock,prices,base,
    saveStock:saveStockDirect,
    savePrices:(v)=>sv("prc",v,setPrices),saveBase:(v)=>sv("bprc",v,setBase),
    res,cart,setCart,selC,setSelC,expiry,startRes,releaseRes,placeOrder,confirmOrder,
    users,saveUsers:(v)=>sv("usr",v,setUsers),orders,getP,getAvail,loaded,
    products,saveProducts:(v)=>sv("prods",v,setProducts),tab,setTab};

  if(!loaded)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:B.dark,gap:12}}><GS/><div style={{width:56,height:56,background:B.cel,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>⚽</div><div style={{fontFamily:B.tf,fontSize:26,color:"#fff",letterSpacing:3}}>MESSI<span style={{color:B.cel}}>RVE</span>2026</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",letterSpacing:2}}>CARGANDO...</div></div>;
  if(admin)return<AdminPanel {...p}/>;

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#f1f5f9",minHeight:"100vh",paddingBottom:80}}>
      <GS/>
      {/* TOP BAR */}
      <header style={{background:`linear-gradient(135deg,${B.dark},${B.mid})`,padding:"9px 14px",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(0,31,91,.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:960,margin:"0 auto"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:9,padding:0}} onClick={()=>setScreen("home")}>
            <div style={{width:32,height:32,background:B.cel,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚽</div>
            <div>
              <div style={{fontFamily:B.tf,fontSize:19,color:"#fff",letterSpacing:2,lineHeight:1}}>MESSI<span style={{color:B.cel}}>RVE</span>2026</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.4)",letterSpacing:1}}>Álbum Panini · FIFA World Cup</div>
            </div>
          </button>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <TimerPill expiry={expiry}/>
            {Object.keys(cart).length>0&&<button style={{position:"relative",background:"rgba(116,192,252,.15)",color:"#fff",border:`1px solid ${B.cel}40`,borderRadius:20,padding:"5px 12px",fontSize:16,cursor:"pointer"}} onClick={()=>setScreen("cart")}>🛒<span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",borderRadius:10,fontSize:10,fontWeight:800,padding:"1px 5px",minWidth:17,textAlign:"center"}}>{Object.keys(cart).length}</span></button>}
            {user?<><span style={{color:"rgba(255,255,255,.65)",fontSize:12}}>👋 {user.nombre}</span><button style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>{releaseRes();setCart({});setUser(null);}}>Salir</button></>:<button style={{background:B.cel,color:B.dark,border:"none",borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("figuritas");}}>Ver figuritas</button>}
            <button style={{background:"transparent",color:"rgba(255,255,255,.35)",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>setAdmin(true)}>Admin</button>
          </div>
        </div>
      </header>

      {/* NAV TABS */}
      {screen!=="home"&&screen!=="checkout"&&(
        <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
          {[["figuritas","⚽ Figuritas"],["products","🎴 Lotes"],["extras","✨ Extras"],["buy","💰 Compramos"],["matches","📅 Partidos"]].map(([v,l])=>(
            <button key={v} style={{padding:"10px 14px",border:"none",background:"transparent",fontSize:12,fontWeight:700,cursor:"pointer",color:tab===v?B.dark:"#64748b",borderBottom:tab===v?`2px solid ${B.dark}`:"2px solid transparent",whiteSpace:"nowrap"}} onClick={()=>{setTab(v);setScreen("shop");}}>
              {l}
            </button>
          ))}
        </div>
      )}
      {/* PRICE RIBBON */}
      {tab==="figuritas"&&screen!=="home"&&screen!=="checkout"&&(
        <div style={{display:"flex",gap:5,overflowX:"auto",padding:"5px 10px",background:B.celLight,borderBottom:`1px solid ${B.cel}55`,scrollbarWidth:"none"}}>
          {Object.entries(PRICE_META).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,background:v.bg,color:v.color,border:`1px solid ${v.border}`}}>{v.emoji} {v.label} · <b>${fmt(base[k]||DEFAULT_PRICES[k])}</b></div>)}
        </div>
      )}

      {screen==="home"    &&<HomeScreen    {...p}/>}
      {screen==="shop"    &&tab==="figuritas"&&<ShopScreen    {...p}/>}
      {screen==="shop"    &&tab==="products" &&<ProductsScreen {...p}/>}
      {screen==="shop"    &&tab==="extras"   &&<ExtrasScreen   {...p}/>}
      {screen==="shop"    &&tab==="buy"      &&<BuyScreen/>}
      {screen==="shop"    &&tab==="matches"  &&<MatchesScreen/>}
      {screen==="country" &&<CountryScreen  {...p}/>}
      {screen==="fwc"     &&<FWCScreen      {...p}/>}
      {screen==="cart"    &&<CartScreen     {...p}/>}
      {screen==="checkout"&&<CheckoutScreen {...p}/>}

      <footer style={{background:`linear-gradient(135deg,${B.dark},${B.mid})`,padding:"16px 20px",textAlign:"center",marginTop:20}}>
        <div style={{fontFamily:B.tf,fontSize:18,color:"#fff",letterSpacing:2,marginBottom:8}}>MESSI<span style={{color:B.cel}}>RVE</span>2026</div>
        <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:8}}>
          <a href={`https://instagram.com/${IG_HANDLE.replace("@","")}`} target="_blank" rel="noreferrer" style={{color:"#f472b6",fontWeight:700,fontSize:12,textDecoration:"none"}}>📸 {IG_HANDLE}</a>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{color:"#4ade80",fontWeight:700,fontSize:12,textDecoration:"none"}}>💬 {WA_DISPLAY}</a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{color:B.cel,fontWeight:700,fontSize:12,textDecoration:"none"}}>📧 {CONTACT_EMAIL}</a>
        </div>
        <a href={PRODE_LINK} target="_blank" rel="noreferrer" style={{display:"inline-block",background:B.cel,color:B.dark,borderRadius:20,padding:"7px 18px",fontSize:12,fontWeight:800,textDecoration:"none"}}>🏆 Jugá el prode con nosotros</a>
      </footer>
    </div>
  );
}

function ExtrasScreen({stock,saveStock}){
  // extras stock stored as ext_ARG_gold, ext_ARG_silver, etc.
  const getExtStock=(id,ver)=>stock[`${id}_${ver}`]||0;
  const updExtStock=async(id,ver,val)=>{await saveStock({...stock,[`${id}_${ver}`]:Math.max(0,parseInt(val)||0)});};
  const [filter,setFilter]=useState("todos");
  const fil=filter==="todos"?EXTRA_PLAYERS:EXTRA_PLAYERS.filter(p=>p.code===filter);

  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#6d28d9,#9333ea)",borderRadius:14,padding:"16px 18px",marginBottom:16,color:"#fff"}}>
        <h1 style={{fontFamily:B.tf,fontSize:26,letterSpacing:1,marginBottom:4}}>✨ EXTRAS PANINI 2026</h1>
        <p style={{fontSize:13,opacity:.85,lineHeight:1.5}}>20 jugadores · 4 versiones cada uno · Aparecen 1 cada 100 sobres aprox.<br/>No van en el álbum — son coleccionables ultra raros.</p>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {EXTRA_VERSIONS.map(v=>(
            <div key={v.key} style={{background:"rgba(255,255,255,.15)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700}}>
              {v.label} <span style={{opacity:.7}}>— {v.rarity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de stock */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <h3 style={{fontSize:14,fontWeight:700,color:B.dark}}>Disponibles en stock</h3>
          <div style={{fontSize:12,color:"#64748b"}}>Stock editable desde el panel Admin</div>
        </div>

        {/* Header tabla */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 1fr",padding:"7px 14px",background:B.dark,color:"#fff",fontSize:11,fontWeight:700,gap:8}}>
          <span>Jugador</span><span>País</span>
          {EXTRA_VERSIONS.map(v=><span key={v.key} style={{textAlign:"center"}}>{v.label.split(" ")[0]}</span>)}
        </div>

        {EXTRA_PLAYERS.map(p=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 1fr",padding:"8px 14px",borderBottom:"1px solid #f8fafc",alignItems:"center",gap:8}}>
            <div style={{fontWeight:700,fontSize:13,color:B.dark}}>{p.player}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#475569"}}><span style={{fontSize:16}}>{p.flag}</span>{p.country}</div>
            {EXTRA_VERSIONS.map(v=>{
              const qty=getExtStock(p.id,v.key);
              return(
                <div key={v.key} style={{textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:800,color:qty>0?v.color:"#94a3b8"}}>{qty>0?qty:"—"}</div>
                  {qty>0&&<div style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:v.bg,color:v.color,fontWeight:700,display:"inline-block"}}>{v.label}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* CTA contacto */}
      <div style={{background:"linear-gradient(135deg,#6d28d9,#9333ea)",borderRadius:12,padding:16,marginTop:14,color:"#fff",textAlign:"center"}}>
        <div style={{fontSize:18,marginBottom:6}}>✨</div>
        <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>¿Buscás un Extra específico?</div>
        <p style={{fontSize:13,opacity:.8,marginBottom:12}}>Consultanos por WhatsApp o email — te avisamos si conseguimos el que necesitás</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent("Hola! Estoy buscando una figurita EXTRA de Panini 2026.")}`} target="_blank" rel="noreferrer"
            style={{background:"#25d366",color:"#fff",borderRadius:20,padding:"8px 18px",fontSize:13,fontWeight:700,textDecoration:"none"}}>
            💬 Consultar por WhatsApp
          </a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Consulta Extra Sticker Panini 2026`}
            style={{background:"rgba(255,255,255,.2)",color:"#fff",borderRadius:20,padding:"8px 18px",fontSize:13,fontWeight:700,textDecoration:"none"}}>
            📧 Enviar email
          </a>
        </div>
      </div>
    </div>
  );
}

function BuyScreen(){
  const [nombre,setNombre]=useState("");
  const [tel,setTel]=useState("");
  const [desc,setDesc]=useState("");

  const waMsg=encodeURIComponent(`*🎴 Quiero vender figuritas - MESSIRVE2026*\n\nNombre: ${nombre}\nTeléfono: ${tel}\n\nDetalle del lote:\n${desc}`);

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:14}}>
      <div style={{background:"linear-gradient(135deg,#065f46,#047857)",borderRadius:14,padding:"18px 18px",marginBottom:16,color:"#fff"}}>
        <h1 style={{fontFamily:B.tf,fontSize:26,letterSpacing:1,marginBottom:6}}>💰 COMPRAMOS TUS FIGURITAS</h1>
        <p style={{fontSize:13,opacity:.85,lineHeight:1.6}}>¿Tenés figuritas repetidas o lotes para vender?<br/>Compramos lotes completos de repetidas, escudos, estrellas y más.<br/>Contactanos y te hacemos una oferta en el momento.</p>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginBottom:14}}>
        <h3 style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:12}}>✅ ¿Qué compramos?</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
          {[["🌟","FWC especiales","Logo Panini, estadios"],["⭐","Jugadores estrella","Messi, Ronaldo, Mbappé..."],["🛡️","Escudos FOIL","Cualquier selección"],["✨","Extras Panini","Base, Bronce, Plata, Oro"],["🎴","Lotes repetidas","Cualquier cantidad"],["📦","Sobres sin abrir","Originales cerrados"]].map(([e,t,d])=>(
            <div key={t} style={{background:"#f8fafc",borderRadius:9,padding:"10px 12px",border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:18,marginBottom:3}}>{e}</div>
              <div style={{fontWeight:700,fontSize:12,color:B.dark}}>{t}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginBottom:14}}>
        <h3 style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:12}}>📋 Contanos qué tenés</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Tu nombre</label><input style={{...inp,marginTop:3}} placeholder="Juan Pérez" value={nombre} onChange={e=>setNombre(e.target.value)}/></div>
          <div><label style={{fontSize:12,fontWeight:600,color:"#374151"}}>WhatsApp / Teléfono</label><input style={{...inp,marginTop:3}} placeholder="1123456789" value={tel} onChange={e=>setTel(e.target.value)}/></div>
          <div><label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Describí lo que tenés</label><textarea style={{...inp,marginTop:3,height:90,resize:"vertical"}} placeholder="Ej: 200 figuritas repetidas de Argentina, un Extra Messi Bronce..." value={desc} onChange={e=>setDesc(e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
          <a href={`https://wa.me/${WA_NUM}?text=${waMsg}`} target="_blank" rel="noreferrer" style={{flex:1,display:"block",textAlign:"center",background:"linear-gradient(135deg,#25d366,#128c7e)",color:"#fff",borderRadius:20,padding:"11px 14px",fontSize:13,fontWeight:800,textDecoration:"none"}}>📲 Enviar por WhatsApp</a>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Quiero vender figuritas&body=${encodeURIComponent(`Nombre: ${nombre}\nTel: ${tel}\n\n${desc}`)}`} style={{flex:1,display:"block",textAlign:"center",background:`linear-gradient(135deg,${B.acc},#1d4ed8)`,color:"#fff",borderRadius:20,padding:"11px 14px",fontSize:13,fontWeight:800,textDecoration:"none"}}>📧 Enviar por Email</a>
        </div>
      </div>
      <div style={{background:"#f8fafc",borderRadius:12,padding:14,border:"1px solid #e2e8f0",textAlign:"center"}}>
        <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>O contactanos directamente</div>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{color:"#25d366",fontWeight:700,fontSize:13,textDecoration:"none"}}>💬 {WA_DISPLAY}</a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{color:B.acc,fontWeight:700,fontSize:13,textDecoration:"none"}}>📧 {CONTACT_EMAIL}</a>
        </div>
      </div>
    </div>
  );
}

function TimerPill({expiry}){const[t,setT]=useState("");useEffect(()=>{if(!expiry)return;const iv=setInterval(()=>{const d=expiry-Date.now();if(d<=0){setT("");return;}setT(`⏱ ${Math.floor(d/60000)}:${String(Math.floor((d%60000)/1000)).padStart(2,"0")}`);},1000);return()=>clearInterval(iv);},[expiry]);if(!t)return null;return<div style={{background:"#f59e0b",color:B.dark,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:800}}>{t}</div>;}

function HomeScreen({setScreen,setTab}){
  return(
    <div style={{minHeight:"calc(100vh - 60px)",background:`linear-gradient(160deg,${B.dark} 0%,${B.mid} 55%,${B.acc} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      {/* Rayas albiceleste */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(90deg,transparent 0,transparent 22px,rgba(255,255,255,.03) 22px,rgba(255,255,255,.03) 44px)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",padding:"40px 20px",maxWidth:540,position:"relative"}}>
        {/* Logo */}
        <div style={{width:72,height:72,background:B.cel,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px"}}>⚽</div>
        <h1 style={{fontFamily:B.tf,fontSize:52,color:"#fff",lineHeight:1,letterSpacing:3,margin:"0 0 6px"}}>MESSI<span style={{color:B.cel}}>RVE</span>2026</h1>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:12,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Álbum Panini · FIFA World Cup</p>
        <p style={{color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.7,marginBottom:24}}>980 figuritas · 48 selecciones · Álbum Panini oficial<br/>Lotes armados, sobres y álbumes completos</p>
        {/* Botones principales */}
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
          <button style={{background:"#fff",color:B.dark,border:"none",borderRadius:28,padding:"13px 26px",fontSize:14,fontWeight:800,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("figuritas");}}>⚽ Ver figuritas</button>
          <button style={{background:`rgba(116,192,252,.18)`,color:"#fff",border:`1px solid ${B.cel}`,borderRadius:28,padding:"13px 26px",fontSize:14,fontWeight:700,cursor:"pointer"}} onClick={()=>{setScreen("shop");setTab("products");}}>🎴 Lotes & Sobres</button>
        </div>
        {/* Extras */}
        <button style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.2)",borderRadius:28,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,display:"block",width:"100%",maxWidth:280,margin:"0 auto 8px"}} onClick={()=>{setScreen("shop");setTab("extras");}}>✨ Ver Extras Panini 2026</button>
        {/* Prode */}
        <a href={PRODE_LINK} target="_blank" rel="noreferrer" style={{display:"block",background:`linear-gradient(135deg,${B.cel},#4dabf7)`,color:B.dark,borderRadius:28,padding:"11px 20px",fontSize:13,fontWeight:800,textDecoration:"none",marginBottom:16,maxWidth:280,margin:"0 auto 16px"}}>🏆 Jugá el prode con nosotros</a>
        {/* Partidos */}
        <button style={{background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",border:"1px solid rgba(255,255,255,.15)",borderRadius:28,padding:"7px 18px",fontSize:12,cursor:"pointer",marginBottom:20}} onClick={()=>{setScreen("shop");setTab("matches");}}>📅 Ver partidos del Mundial</button>
        {/* Redes */}
        <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
          <a href={`https://instagram.com/${IG_HANDLE.replace("@","")}`} target="_blank" rel="noreferrer" style={{color:"#f472b6",fontWeight:700,fontSize:12,textDecoration:"none"}}>📸 {IG_HANDLE}</a>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{color:"#4ade80",fontWeight:700,fontSize:12,textDecoration:"none"}}>💬 {WA_DISPLAY}</a>
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
  const [filtro,setFiltro]=useState("todos");
  const fil=useMemo(()=>{
    if(filtro==="argentina")return FIXTURE.filter(m=>m.hf==="🇦🇷"||m.af==="🇦🇷");
    if(filtro==="grupos")return FIXTURE.filter(m=>m.group!=="R32"&&m.group!=="Final");
    if(filtro==="final")return FIXTURE.filter(m=>m.group==="Final"||m.group==="R32");
    return FIXTURE;
  },[filtro]);
  const sc={finalizado:{bg:"#d1fae5",c:"#065f46"},programado:{bg:B.celLight,c:B.dark},"en vivo":{bg:"#fee2e2",c:"#991b1b"}};
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <div style={{background:`linear-gradient(135deg,${B.dark},${B.mid})`,borderRadius:14,padding:"14px 16px",marginBottom:14,color:"#fff"}}>
        <h1 style={{fontFamily:B.tf,fontSize:26,letterSpacing:1,marginBottom:3}}>📅 FIFA WORLD CUP 2026</h1>
        <p style={{fontSize:12,opacity:.7}}>11 jun – 19 jul · EE.UU., México y Canadá · 104 partidos · 48 selecciones</p>
        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
          {[["todos","Todos"],["argentina","🇦🇷 Argentina"],["grupos","Fase de Grupos"],["final","Fases Finales"]].map(([v,l])=>(
            <button key={v} style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${filtro===v?"#fff":B.cel+"66"}`,background:filtro===v?"#fff":"transparent",color:filtro===v?B.dark:"rgba(255,255,255,.7)",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={()=>setFiltro(v)}>{l}</button>
          ))}
        </div>
      </div>
      {/* Info Argentina destacada */}
      <div style={{background:B.celLight,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid ${B.cel}`}}>
        <div style={{fontWeight:800,fontSize:13,color:B.dark,marginBottom:6}}>🇦🇷 Argentina — Grupo J</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <div style={{fontSize:12,color:B.dark}}>📅 <b>16/06 22:00</b> vs Argelia — Arrowhead Stadium, Kansas City</div>
          <div style={{fontSize:12,color:B.dark}}>📅 <b>22/06 14:00</b> vs Austria — AT&T Stadium, Dallas</div>
          <div style={{fontSize:12,color:B.dark}}>📅 <b>26/06 22:00</b> vs Jordania — AT&T Stadium, Dallas</div>
        </div>
      </div>
      {/* Lista de partidos */}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {fil.map((m,i)=>{
          const s=sc[m.status]||sc.programado;
          const hr=m.hs!==null&&m.as!==null;
          const isArg=m.hf==="🇦🇷"||m.af==="🇦🇷";
          return(
            <div key={i} style={{background:"#fff",borderRadius:12,border:`${isArg?2:1}px solid ${isArg?B.cel:"#e2e8f0"}`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:isArg?B.celLight:"#fff"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:180,justifyContent:"center"}}>
                <span style={{fontSize:22}}>{m.hf}</span>
                <div style={{textAlign:"right",flex:1}}><div style={{fontWeight:800,fontSize:12,color:B.dark}}>{m.home}</div></div>
                <div style={{fontFamily:B.tf,fontSize:20,color:B.dark,margin:"0 6px",minWidth:50,textAlign:"center"}}>{hr?`${m.hs}–${m.as}`:"vs"}</div>
                <div style={{textAlign:"left",flex:1}}><div style={{fontWeight:800,fontSize:12,color:B.dark}}>{m.away}</div></div>
                <span style={{fontSize:22}}>{m.af}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,minWidth:130}}>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:7,background:s.bg,color:s.c,border:`1px solid ${isArg?B.cel:"#e2e8f0"}`}}>{m.status==="programado"?"PROGRAMADO":m.status==="en vivo"?"🔴 EN VIVO":"FINALIZADO"}</span>
                <div style={{fontSize:11,color:B.dark,fontWeight:600}}>{m.day} {m.date} · {m.time} ARG</div>
                <div style={{fontSize:10,color:"#64748b"}}>Grupo {m.group}</div>
                <div style={{fontSize:9,color:"#94a3b8",textAlign:"right"}}>{m.venue}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Link prode */}
      <div style={{background:`linear-gradient(135deg,${B.dark},${B.mid})`,borderRadius:12,padding:14,marginTop:14,textAlign:"center",color:"#fff"}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>🏆 ¿Querés predecir los resultados?</div>
        <a href={PRODE_LINK} target="_blank" rel="noreferrer" style={{display:"inline-block",background:B.cel,color:B.dark,borderRadius:20,padding:"9px 20px",fontSize:13,fontWeight:800,textDecoration:"none"}}>Jugá el prode con nosotros</a>
      </div>
    </div>
  );
}

function StickerCard({s,flag,av,sel,qty,pr,onToggle,onRemove,m}){
  const img=getStickerImage(s.key);
  const [imgOk,setImgOk]=useState(true);
  const noStock=av===0&&!sel;
  return(
    <div style={{background:sel?B.celLight:"#fff",border:`2px solid ${sel?B.dark:av>0?m.border:"#e2e8f0"}`,borderRadius:12,padding:6,position:"relative",transition:"all .15s",opacity:noStock?.6:1}}>
      <div style={{width:"100%",aspectRatio:"3/4",borderRadius:7,overflow:"hidden",marginBottom:4,position:"relative",background:`linear-gradient(145deg,${m.bg},#fff)`,border:`1px solid ${m.border}`,cursor:"pointer"}} onClick={()=>onToggle(s)}>
        {imgOk
          ? <img src={img} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}} onError={()=>setImgOk(false)}/>
          : <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
              <span style={{fontSize:20}}>{flag}</span>
              <span style={{fontSize:10,fontWeight:800,color:m.color}}>{s.num}</span>
              <span style={{fontSize:8,color:m.color,textAlign:"center",padding:"0 4px",fontWeight:600,lineHeight:1.2}}>{s.name}</span>
            </div>
        }
        {noStock&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:800,color:"#ef4444",background:"#fff",borderRadius:6,padding:"2px 6px"}}>Sin stock</span></div>}
        {qty>0&&<div style={{position:"absolute",top:4,right:4,background:B.dark,color:"#fff",minWidth:20,height:20,borderRadius:10,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{qty}</div>}
        <div style={{position:"absolute",bottom:3,left:3,fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:4,background:m.bg+"ee",color:m.color}}>{m.emoji} {m.label}</div>
      </div>
      <div style={{fontSize:11,fontWeight:800,color:B.dark,lineHeight:1.2,marginBottom:1}}>{s.num}</div>
      <div style={{fontSize:9,color:"#475569",lineHeight:1.2,marginBottom:3,minHeight:16}}>{s.name}</div>
      {sel
        ? <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
            <button style={{flex:1,height:22,borderRadius:5,border:"1px solid #fee2e2",background:"#fee2e2",color:"#ef4444",fontWeight:800,fontSize:14,cursor:"pointer"}} onClick={()=>onRemove&&onRemove(s)}>−</button>
            <span style={{flex:1,textAlign:"center",fontWeight:800,fontSize:13,color:B.dark}}>{qty}</span>
            <button style={{flex:1,height:22,borderRadius:5,border:"1px solid #d1fae5",background:"#d1fae5",color:"#065f46",fontWeight:800,fontSize:14,cursor:"pointer"}} onClick={()=>onToggle(s)}>+</button>
          </div>
        : <button style={{width:"100%",padding:"4px 0",borderRadius:6,border:`1px solid ${m.border}`,background:av>0?m.bg:"#f1f5f9",color:av>0?m.color:"#94a3b8",fontSize:10,fontWeight:700,cursor:av>0?"pointer":"default",marginBottom:3}} onClick={()=>av>0&&onToggle(s)}>
            {av>0?"+ Agregar":"Sin stock"}
          </button>
      }
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:4,background:av>0?"#d1fae5":sel?"#fef9c3":"#fee2e2",color:av>0?"#065f46":sel?"#92400e":"#991b1b"}}>{av>0?`📦 ${av}`:sel?"en carrito":"❌"}</span>
        <span style={{fontWeight:800,color:m.color,fontSize:11}}>${fmt(pr)}</span>
      </div>
    </div>
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
  const cC=ss.filter(s=>cart[s.key]),cT=cC.reduce((a,s)=>a+(getP(s)*(cart[s.key]?._qty||1)),0);
  const aC=Object.values(cart).reduce((a,s)=>a+(s._qty||1),0),aT=Object.values(cart).reduce((a,s)=>a+(getP(s)*(s._qty||1)),0);
  const tog=(s)=>setCart(p=>{
    const n={...p};
    if(n[s.key]){const q=n[s.key]._qty||1;const av=getAvail(s.key);if(q<av||av===0)n[s.key]={...s,_qty:q+1};}
    else n[s.key]={...s,_qty:1};
    return n;
  });
  const togRemove=(s)=>setCart(p=>{
    const n={...p};
    if(n[s.key]){const q=n[s.key]._qty||1;if(q<=1)delete n[s.key];else n[s.key]={...s,_qty:q-1};}
    return n;
  });
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
        {fd.map(s=><StickerCard key={s.key} s={s} flag={country.flag} av={getAvail(s.key)} sel={!!cart[s.key]} qty={cart[s.key]?._qty||0} pr={getP(s)} onToggle={tog} onRemove={togRemove} m={PRICE_META[s.type]}/>)}
      </div>
      {aC>0&&<StickyCart count={aC} total={aT} onClick={()=>setScreen("cart")}/>}
    </div>
  );
}

function FWCScreen({setScreen,cart,setCart,getP,getAvail}){
  const aC=Object.values(cart).reduce((a,s)=>a+(s._qty||1),0),aT=Object.values(cart).reduce((a,s)=>a+(getP(s)*(s._qty||1)),0);
  const tog=(s)=>setCart(p=>{
    const n={...p};
    if(n[s.key]){const q=n[s.key]._qty||1;const av=getAvail(s.key);if(q<av||av===0)n[s.key]={...s,_qty:q+1};}
    else n[s.key]={...s,_qty:1};
    return n;
  });
  const togRemove=(s)=>setCart(p=>{
    const n={...p};
    if(n[s.key]){const q=n[s.key]._qty||1;if(q<=1)delete n[s.key];else n[s.key]={...s,_qty:q-1};}
    return n;
  });
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:14}}>
      <button style={bBtn} onClick={()=>setScreen("shop")}>← Volver a países</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:44}}>🌟</span><div><h1 style={{fontFamily:B.tf,fontSize:26,color:B.dark,letterSpacing:1}}>Especiales FWC</h1><div style={{fontSize:12,color:"#64748b"}}>FOIL metálico · Precios especiales</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:6}}>
        {FWC_STICKERS.map(s=><StickerCard key={s.key} s={s} flag="🌟" av={getAvail(s.key)} sel={!!cart[s.key]} qty={cart[s.key]?._qty||0} pr={getP(s)} onToggle={tog} onRemove={togRemove} m={PRICE_META.FWC}/>)}
      </div>
      {aC>0&&<StickyCart count={aC} total={aT} onClick={()=>setScreen("cart")}/>}
    </div>
  );
}

function CartScreen({setScreen,cart,setCart,getP,startRes,expiry,setTab}){
  const entries=useMemo(()=>Object.values(cart),[cart]);
  const total=entries.reduce((a,s)=>a+(getP(s)*(s._qty||1)),0);
  const totalItems=entries.reduce((a,s)=>a+(s._qty||1),0);
  const byGroup=useMemo(()=>{const m={};entries.forEach(s=>{if(s._isProduct){if(!m["__p"])m["__p"]={label:"Lotes & Productos",emoji:"🎴",items:[]};m["__p"].items.push(s);}else{const c=COUNTRIES.find(c2=>s.key.startsWith(c2.code+"_"))||{name:"FWC",flag:"🌟",code:"FWC"};if(!m[c.code])m[c.code]={label:c.name,emoji:c.flag,items:[]};m[c.code].items.push(s);}});return Object.values(m);},[entries]);
  const updQty=(s,delta)=>setCart(p=>{
    const n={...p};
    if(!n[s.key||s.id])return n;
    const q=(n[s.key||s.id]._qty||1)+delta;
    if(q<=0)delete n[s.key||s.id];
    else n[s.key||s.id]={...n[s.key||s.id],_qty:q};
    return n;
  });
  // Build WA message with quantities
  const buildWAMsg=()=>entries.map(s=>{
    const qty=s._qty||1;
    const emoji=PRICE_META[s.type]?.emoji||"📦";
    const line=`${emoji} ${s.num||s.id} — ${s.name}`;
    return qty>1?`${line} × ${qty} = $${fmt(getP(s)*qty)}`:` ${line} · $${fmt(getP(s))}`;
  }).join("\n");

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
      <p style={{color:"#64748b",marginBottom:12,fontSize:13}}>{entries.length} tipos · {totalItems} figuritas en total</p>
      {expiry&&<div style={{background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,padding:"7px 13px",marginBottom:10,fontSize:12,fontWeight:700,color:"#92400e"}}><CDown expiry={expiry}/></div>}
      {byGroup.map(g=>{const sub=g.items.reduce((a,s)=>a+(getP(s)*(s._qty||1)),0);return(
        <div key={g.label} style={{background:"#fff",borderRadius:11,marginBottom:9,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:B.celLight,borderBottom:`1px solid ${B.cel}33`}}>
            <span style={{fontSize:20}}>{g.emoji}</span>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:B.dark}}>{g.label}</div><div style={{fontSize:11,color:"#64748b"}}>{g.items.reduce((a,s)=>a+(s._qty||1),0)} figuritas</div></div>
            <div style={{fontWeight:800,color:B.dark,fontSize:14}}>${fmt(sub)}</div>
          </div>
          {g.items.map(s=>{
            const m=s._isProduct?{emoji:"🎴",label:"Producto",bg:"#f8fafc",color:"#475569"}:PRICE_META[s.type];
            const qty=s._qty||1;
            const subtotal=getP(s)*qty;
            return(
            <div key={s.key||s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 13px",borderBottom:"1px solid #f8fafc"}}>
              <div style={{width:26,height:26,borderRadius:6,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{m.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:B.dark}}>{s.num||s.id} — {s.name}</div>
                <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:4,background:m.bg,color:m.color||"#475569"}}>{m.label}</span>
              </div>
              {/* Controles cantidad */}
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <button style={{width:22,height:22,borderRadius:5,border:"1px solid #fee2e2",background:"#fee2e2",color:"#ef4444",fontWeight:800,fontSize:13,cursor:"pointer"}} onClick={()=>updQty(s,-1)}>−</button>
                <span style={{minWidth:18,textAlign:"center",fontWeight:800,fontSize:13}}>{qty}</span>
                <button style={{width:22,height:22,borderRadius:5,border:"1px solid #d1fae5",background:"#d1fae5",color:"#065f46",fontWeight:800,fontSize:13,cursor:"pointer"}} onClick={()=>updQty(s,+1)}>+</button>
              </div>
              <div style={{fontWeight:800,color:B.dark,marginLeft:4,fontSize:12,minWidth:60,textAlign:"right"}}>${fmt(subtotal)}</div>
            </div>
          );})}
        </div>
      );})}
      {/* TOTAL */}
      <div style={{background:"#fff",borderRadius:11,padding:"12px 16px",marginBottom:12,border:`1.5px solid ${B.cel}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:16,fontWeight:700,color:B.dark}}>TOTAL</span>
          <div style={{fontSize:11,color:"#64748b"}}>{totalItems} figuritas</div>
        </div>
        <span style={{fontSize:22,fontWeight:800,color:B.dark}}>${fmt(total)}</span>
      </div>
      {/* BOTONES DE ACCIÓN */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:60}}>
        <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(`*🛒 Pedido MESSIRVE2026*\n\n${buildWAMsg()}\n\n*💰 TOTAL: $${fmt(total)}* (${totalItems} figuritas)\n\n_Quiero coordinar el pago_`)}`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"linear-gradient(135deg,#25d366,#128c7e)",color:"#fff",borderRadius:14,padding:"14px",fontSize:15,fontWeight:800,textDecoration:"none"}}>
          📲 Enviar pedido por WhatsApp
        </a>
        <button style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:B.celLight,color:B.dark,border:`1px solid ${B.cel}`,borderRadius:14,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}
          onClick={()=>{
            const txt=`🛒 Pedido MESSIRVE2026\n\n${buildWAMsg()}\n\n💰 TOTAL: $${fmt(total)} (${totalItems} figuritas)`;
            navigator.clipboard?.writeText(txt).then(()=>alert("✅ ¡Lista copiada!")).catch(()=>alert(txt));
          }}>
          📋 Copiar lista para compartir
        </button>
        <button style={{...aBtn,width:"100%",padding:13,fontSize:14,borderRadius:12}} onClick={async()=>{const sk=entries.filter(s=>!s._isProduct).map(s=>s.key);if(sk.length&&!expiry)await startRes(sk);setScreen("checkout");}}>
          Completar datos del pedido →
        </button>
      </div>
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
  const [authed,setAuthed]=useState(false);const [usr,setUsr]=useState("");const [pw,setPw]=useState("");const [tab,setTab]=useState("dashboard");
  const doLogin=()=>{if(usr===ADMIN_USER&&pw===ADMIN_PW)setAuthed(true);else alert("Usuario o contraseña incorrectos");};
  if(!authed)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:B.dark}}>
      <GS/>
      <div style={{background:"#fff",borderRadius:16,padding:28,width:300,textAlign:"center"}}>
        <div style={{fontSize:36}}>🔐</div>
        <h2 style={{fontFamily:B.tf,fontSize:22,margin:"8px 0 12px"}}>PANEL ADMIN</h2>
        <input type="text" style={{...inp,marginBottom:10}} placeholder="Usuario" value={usr} onChange={e=>setUsr(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        <input type="password" style={{...inp,marginBottom:10}} placeholder="Contraseña" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        <button style={{...aBtn,width:"100%",padding:11}} onClick={doLogin}>Ingresar</button>
        <button style={{...bBtn,color:"#64748b",display:"block",margin:"10px auto 0"}} onClick={()=>setAdmin(false)}>← Volver al sitio</button>
      </div>
    </div>
  );
  const tabs=[["dashboard","📊 Dashboard"],["orders","📋 Pedidos"],["sales","📈 Ventas"],["stock","📦 Stock"],["faltantes","📉 Faltantes"],["extras","✨ Extras"],["prices","💰 Precios"],["products","🎴 Productos"],["users","👥 Usuarios"]];
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
        {tab==="faltantes"&&<AFaltantes stock={stock}/>}
        {tab==="extras"   &&<AExtras stock={stock} saveStock={saveStock}/>}
        {tab==="prices"   &&<APrices prices={prices} savePrices={savePrices} base={base} saveBase={saveBase}/>}
        {tab==="products" &&<AProducts products={products} saveProducts={saveProducts}/>}
        {tab==="users"    &&<AUsers users={users}/>}
      </div>
    </div>
  );
}

function AExtras({stock,saveStock}){
  const get=(id,ver)=>stock[`${id}_${ver}`]||0;
  const upd=async(id,ver,val)=>saveStock({...stock,[`${id}_${ver}`]:Math.max(0,parseInt(val)||0)});
  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>✨ Gestión de Extras</h2>
      <p style={{fontSize:12,color:"#64748b",marginBottom:14}}>20 jugadores × 4 versiones. Aparecen 1 cada 100 sobres. Editá el stock disponible.</p>
      <div style={{background:"linear-gradient(135deg,#6d28d9,#9333ea)",borderRadius:10,padding:"10px 14px",marginBottom:12,color:"#fff",fontSize:12}}>
        <b>Versiones:</b> Base (Púrpura) · Bronce · Plata · Oro — de menos a más raro
      </div>
      <div style={{background:"#fff",borderRadius:11,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 80px 80px 80px 80px",padding:"7px 12px",background:B.dark,color:"#fff",fontSize:10,fontWeight:700,gap:7}}>
          <span>Jugador</span><span>País</span><span style={{textAlign:"center"}}>Base</span><span style={{textAlign:"center"}}>Bronce</span><span style={{textAlign:"center"}}>Plata</span><span style={{textAlign:"center"}}>Oro</span>
        </div>
        {EXTRA_PLAYERS.map(p=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 80px 80px 80px 80px",padding:"6px 12px",borderBottom:"1px solid #f1f5f9",alignItems:"center",gap:7}}>
            <span style={{fontWeight:700,fontSize:12,color:B.dark}}>{p.player}</span>
            <span style={{fontSize:11,color:"#475569"}}>{p.flag} {p.country}</span>
            {EXTRA_VERSIONS.map(v=>(
              <div key={v.key} style={{textAlign:"center"}}>
                <input type="number" style={{width:"100%",textAlign:"center",padding:"3px",border:`1px solid ${v.border}`,borderRadius:5,fontSize:12,fontWeight:700,background:get(p.id,v.key)>0?v.bg:"#fff",color:v.color}}
                  value={get(p.id,v.key)} onChange={e=>upd(p.id,v.key,e.target.value)}/>
              </div>
            ))}
          </div>
        ))}
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

  // Stock por tipo
  const byType={};
  Object.keys(PRICE_META).forEach(t=>{
    byType[t]=ALL_STICKERS.filter(s=>s.type===t).reduce((a,s)=>a+(stock[s.key]||0),0);
  });
  const fwcTotal=FWC_STICKERS.reduce((a,s)=>a+(stock[s.key]||0),0);

  // Stock por país detallado
  const byCountry=COUNTRIES.map(c=>{
    const ss=buildCountryStickers(c);
    const tot=ss.reduce((a,s)=>a+(stock[s.key]||0),0);
    const bt={};
    Object.keys(PRICE_META).forEach(t=>{bt[t]=ss.filter(s=>s.type===t).reduce((a,s)=>a+(stock[s.key]||0),0);});
    const sinStock=ss.filter(s=>(stock[s.key]||0)===0).length;
    return{...c,total:tot,byType:bt,sinStock,totalFigs:ss.length};
  }).sort((a,b)=>b.total-a.total);

  const [vistaStock,setVistaStock]=useState("pais");

  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:11}}>📊 Dashboard</h2>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:7,marginBottom:14}}>
        <SB icon="👥" val={users.length} lbl="Usuarios"/>
        <SB icon="📋" val={orders.length} lbl="Pedidos"/>
        <SB icon="⏳" val={pending.length} lbl="Pendientes" color="#d97706"/>
        <SB icon="✅" val={confirmed.length} lbl="Confirmados" color="#10b981"/>
        <SB icon="⏱" val={activeRes} lbl="Reservas activas"/>
        <SB icon="📦" val={totalStk} lbl="Figuritas en stock"/>
        <SB icon="💰" val={"$"+fmt(totalRev)} lbl="Ingresos" color={B.dark}/>
      </div>

      {/* Stock por etiqueta */}
      <div style={{background:"#fff",borderRadius:10,padding:12,border:"1px solid #e2e8f0",marginBottom:12}}>
        <h3 style={{fontSize:13,fontWeight:700,marginBottom:10}}>📦 Stock total por tipo de figurita</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:7}}>
          {Object.entries(PRICE_META).map(([type,m])=>(
            <div key={type} style={{background:m.bg,borderRadius:8,padding:"10px",border:`1px solid ${m.border}`,textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:3}}>{m.emoji}</div>
              <div style={{fontWeight:800,fontSize:18,color:m.color}}>{byType[type]||0}</div>
              <div style={{fontSize:10,color:m.color,opacity:.8,fontWeight:600}}>{m.label}</div>
            </div>
          ))}
          <div style={{background:"#fef3c7",borderRadius:8,padding:"10px",border:"1px solid #f59e0b",textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:3}}>🌟</div>
            <div style={{fontWeight:800,fontSize:18,color:"#92400e"}}>{fwcTotal}</div>
            <div style={{fontSize:10,color:"#92400e",opacity:.8,fontWeight:600}}>FWC Especiales</div>
          </div>
          <div style={{background:B.celLight,borderRadius:8,padding:"10px",border:`1px solid ${B.cel}`,textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:3}}>📦</div>
            <div style={{fontWeight:800,fontSize:18,color:B.dark}}>{totalStk}</div>
            <div style={{fontSize:10,color:B.dark,opacity:.8,fontWeight:600}}>TOTAL</div>
          </div>
        </div>
      </div>

      {/* Gráfico por país (ilustrativo) */}
      <div style={{background:"#fff",borderRadius:10,padding:12,border:"1px solid #e2e8f0",marginBottom:12}}>
        <h3 style={{fontSize:13,fontWeight:700,marginBottom:10}}>📊 Stock por selección (gráfico)</h3>
        {(()=>{
          const max=Math.max(1,...byCountry.map(c=>c.total));
          const top=byCountry.slice(0,16);
          return(
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {top.map(c=>(
                <div key={c.code} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:118,fontSize:11,color:B.dark,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.flag} {c.name}</span>
                  <div style={{flex:1,height:16,background:"#f1f5f9",borderRadius:8,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(c.total/max)*100}%`,background:c.total===0?"#fecaca":`linear-gradient(90deg,${B.cel},${B.acc})`,borderRadius:8,transition:"width .3s"}}/>
                  </div>
                  <span style={{width:40,textAlign:"right",fontSize:11,fontWeight:800,color:c.total===0?"#ef4444":B.dark}}>{c.total}</span>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{fontSize:10,color:"#94a3b8",marginTop:8}}>Top 16 selecciones con más stock. Barras ilustrativas (proporción sobre la de mayor stock).</div>
      </div>

      {/* Stock por país — detallado */}
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <h3 style={{fontSize:13,fontWeight:700}}>🌍 Stock por selección — detalle completo</h3>
          <div style={{display:"flex",gap:4}}>
            {[["pais","Por país"],["sinstock","Sin stock"]].map(([v,l])=>(
              <ChipBtn key={v} active={vistaStock===v} onClick={()=>setVistaStock(v)}>{l}</ChipBtn>
            ))}
          </div>
        </div>
        {/* Header tabla */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 60px 55px 55px 55px 55px 60px 55px",padding:"6px 14px",background:B.dark,color:"#fff",fontSize:9,fontWeight:700,gap:4,overflowX:"auto"}}>
          <span>País</span>
          <span style={{textAlign:"center"}}>FOIL</span>
          <span style={{textAlign:"center"}}>TOP</span>
          <span style={{textAlign:"center"}}>📸</span>
          <span style={{textAlign:"center"}}>Base</span>
          <span style={{textAlign:"center"}}>Sin stk</span>
          <span style={{textAlign:"center",color:"#74c0fc"}}>TOTAL</span>
          <span style={{textAlign:"center"}}>%</span>
        </div>
        <div style={{maxHeight:400,overflowY:"auto"}}>
          {(vistaStock==="sinstock"?byCountry.filter(c=>c.sinStock>0):byCountry).map(c=>{
            const pct=Math.round(((c.totalFigs-c.sinStock)/c.totalFigs)*100);
            return(
              <div key={c.code} style={{display:"grid",gridTemplateColumns:"2fr 60px 55px 55px 55px 55px 60px 55px",padding:"6px 14px",borderBottom:"1px solid #f8fafc",alignItems:"center",gap:4,fontSize:10,background:c.sinStock===c.totalFigs?"#fff5f5":c.sinStock===0?"#f0fdf4":"#fff"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:14}}>{c.flag}</span>
                  <span style={{fontWeight:600,color:B.dark}}>{c.name}</span>
                </div>
                <span style={{textAlign:"center",fontWeight:700,color:"#1e40af"}}>{c.byType.FOIL||0}</span>
                <span style={{textAlign:"center",fontWeight:700,color:"#6d28d9"}}>{c.byType.TOP||0}</span>
                <span style={{textAlign:"center",fontWeight:700,color:"#065f46"}}>{c.byType.PHOTO||0}</span>
                <span style={{textAlign:"center",color:"#374151"}}>{c.byType.BASE||0}</span>
                <span style={{textAlign:"center",color:c.sinStock>0?"#ef4444":"#10b981",fontWeight:c.sinStock>0?700:400}}>{c.sinStock}</span>
                <span style={{textAlign:"center",fontWeight:800,color:B.dark,fontSize:11}}>{c.total}</span>
                <div style={{textAlign:"center"}}>
                  <div style={{height:4,background:"#e2e8f0",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:pct>50?"#10b981":pct>20?"#f59e0b":"#ef4444",width:`${pct}%`,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:8,color:"#94a3b8"}}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Totales */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 60px 55px 55px 55px 55px 60px 55px",padding:"8px 14px",background:B.celLight,fontSize:11,fontWeight:800,gap:4,borderTop:"2px solid #e2e8f0",color:B.dark}}>
          <span>TOTAL GENERAL</span>
          <span style={{textAlign:"center",color:"#1e40af"}}>{byCountry.reduce((a,c)=>a+(c.byType.FOIL||0),0)}</span>
          <span style={{textAlign:"center",color:"#6d28d9"}}>{byCountry.reduce((a,c)=>a+(c.byType.TOP||0),0)}</span>
          <span style={{textAlign:"center",color:"#065f46"}}>{byCountry.reduce((a,c)=>a+(c.byType.PHOTO||0),0)}</span>
          <span style={{textAlign:"center"}}>{byCountry.reduce((a,c)=>a+(c.byType.BASE||0),0)}</span>
          <span style={{textAlign:"center",color:"#ef4444"}}>{byCountry.reduce((a,c)=>a+c.sinStock,0)}</span>
          <span style={{textAlign:"center",color:B.dark}}>{totalStk}</span>
          <span style={{textAlign:"center"}}>—</span>
        </div>
      </div>

      {/* Advertencia stock cero */}
      {byCountry.filter(c=>c.total===0).length>0&&(
        <div style={{background:"#fff5f5",borderRadius:10,padding:12,border:"1px solid #fecaca"}}>
          <div style={{fontWeight:700,fontSize:12,color:"#991b1b",marginBottom:6}}>⚠️ Selecciones sin ningún stock:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {byCountry.filter(c=>c.total===0).map(c=>(
              <span key={c.code} style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"#fee2e2",color:"#991b1b",fontWeight:600}}>{c.flag} {c.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AFaltantes({stock}){
  const [umbral,setUmbral]=useState(0);   // 0 = solo sin stock; o "≤N"
  const [incFwc,setIncFwc]=useState(true);
  const [copiado,setCopiado]=useState(false);

  // Armar faltantes agrupados por selección
  const grupos=[];
  if(incFwc){
    const fs=FWC_STICKERS.filter(s=>(stock[s.key]||0)<=umbral).map(s=>({num:s.num,name:s.name,stk:stock[s.key]||0}));
    if(fs.length)grupos.push({code:"FWC",name:"FWC Especiales",flag:"🌟",items:fs});
  }
  COUNTRIES.forEach(c=>{
    const ss=buildCountryStickers(c).filter(s=>(stock[s.key]||0)<=umbral).map(s=>({num:s.num,name:s.name,stk:stock[s.key]||0}));
    if(ss.length)grupos.push({code:c.code,name:c.name,flag:c.flag,items:ss});
  });
  const totalFalt=grupos.reduce((a,g)=>a+g.items.length,0);

  // Texto para copiar y pegar (se regenera solo con el stock)
  let texto=`📋 FALTANTES DE STOCK — ${fmtDate(Date.now())}\n`;
  texto+=umbral===0?"(figuritas con 0 unidades)\n":`(figuritas con ${umbral} o menos)\n`;
  texto+=`Total: ${totalFalt} figuritas · ${grupos.length} selecciones\n`;
  grupos.forEach(g=>{
    texto+=`\n${g.flag} ${g.name} (${g.items.length}):\n`;
    g.items.forEach(it=>{texto+=`  ${it.num} — ${it.name}${umbral>0?` · stock ${it.stk}`:""}\n`;});
  });

  const copiar=async()=>{
    try{await navigator.clipboard.writeText(texto);setCopiado(true);setTimeout(()=>setCopiado(false),1800);}
    catch{const ta=document.getElementById("faltTxt");if(ta){ta.select();document.execCommand("copy");setCopiado(true);setTimeout(()=>setCopiado(false),1800);}}
  };

  return(
    <div>
      <h2 style={{fontSize:17,fontWeight:800,color:B.dark,marginBottom:4}}>📉 Faltantes de stock</h2>
      <p style={{fontSize:12,color:"#64748b",marginBottom:12}}>Resumen siempre actualizado de las figuritas que faltan, agrupadas por selección. Se actualiza solo según el stock. Copialo y pegalo donde lo necesites.</p>

      {/* Filtros */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:11,color:"#64748b",fontWeight:600}}>Mostrar:</span>
        {[[0,"Sin stock (0)"],[2,"≤ 2"],[5,"≤ 5"]].map(([v,l])=>(
          <ChipBtn key={v} active={umbral===v} onClick={()=>setUmbral(v)}>{l}</ChipBtn>
        ))}
        <ChipBtn active={incFwc} onClick={()=>setIncFwc(!incFwc)}>{incFwc?"✓ ":""}Incluir FWC</ChipBtn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:7,marginBottom:12}}>
        <SB icon="📉" val={totalFalt} lbl="Figuritas faltantes" color="#ef4444"/>
        <SB icon="🌍" val={grupos.length} lbl="Selecciones afectadas"/>
      </div>

      {/* Resumen copiable */}
      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",padding:12,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
          <h3 style={{fontSize:13,fontWeight:700}}>📋 Resumen para copiar y pegar</h3>
          <button onClick={copiar} style={{...aBtn,padding:"7px 14px",background:copiado?"#10b981":B.acc}}>
            {copiado?"✓ Copiado":"📋 Copiar todo"}
          </button>
        </div>
        <textarea id="faltTxt" readOnly value={texto}
          style={{width:"100%",boxSizing:"border-box",minHeight:200,padding:10,borderRadius:8,border:"1px solid #cbd5e1",fontSize:12,fontFamily:"monospace",resize:"vertical",color:"#1e293b",background:"#f8fafc"}}/>
      </div>

      {/* Listado visual por selección */}
      {totalFalt===0?(
        <div style={{background:"#f0fdf4",borderRadius:10,padding:16,border:"1px solid #bbf7d0",textAlign:"center",color:"#15803d",fontWeight:700,fontSize:13}}>
          ✅ No hay faltantes con este filtro. ¡Todo con stock!
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {grupos.map(g=>(
            <div key={g.code} style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
              <div style={{padding:"8px 12px",background:"#fff5f5",borderBottom:"1px solid #fee2e2",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:13,color:B.dark}}>{g.flag} {g.name}</span>
                <span style={{fontSize:11,fontWeight:700,color:"#ef4444",background:"#fee2e2",borderRadius:12,padding:"2px 9px"}}>{g.items.length} faltan</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 12px"}}>
                {g.items.map(it=>(
                  <span key={it.num} style={{fontSize:11,padding:"3px 9px",borderRadius:6,background:"#f1f5f9",color:"#475569",border:"1px solid #e2e8f0"}}>
                    <b style={{color:B.dark}}>{it.num}</b> {it.name}{umbral>0&&<span style={{color:"#ef4444"}}> · {it.stk}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [srch,setSrch]=useState("");
  const [cf,setCf]=useState("Todos");
  const [bulk,setBulk]=useState("");
  const [saving,setSaving]=useState(false);
  const [localStock,setLocalStock]=useState({...stock});
  const [dirty,setDirty]=useState({});
  // Paste-to-update stock
  const [pasteTexto,setPasteTexto]=useState("");
  const [pasteResult,setPasteResult]=useState(null);
  const [modoVista,setModoVista]=useState("tabla"); // "tabla" | "paste"

  useEffect(()=>{ setLocalStock({...stock}); },[stock]);

  const all=useMemo(()=>ALL_STICKERS.map(s=>{
    const c=COUNTRIES.find(cx=>s.key.startsWith(cx.code+"_"));
    return{...s,cN:c?.name||"FWC",cF:c?.flag||"🌟",cC:c?.conf||"FWC"};
  }),[]);

  const fil=useMemo(()=>all.filter(s=>(
    (!srch||s.num.toLowerCase().includes(srch.toLowerCase())||s.name.toLowerCase().includes(srch.toLowerCase())||s.cN.toLowerCase().includes(srch.toLowerCase()))&&
    (cf==="Todos"||s.cC===cf)
  )),[all,srch,cf]);

  const updLocal=(key,val)=>{
    const v=Math.max(0,parseInt(val)||0);
    setLocalStock(p=>({...p,[key]:v}));
    setDirty(p=>({...p,[key]:true}));
  };

  const saveAll=async()=>{
    setSaving(true);
    try{
      await saveStock({...localStock});
      setDirty({});
      alert("✅ Stock guardado correctamente");
    }catch(e){
      alert("❌ Error al guardar. Intentá de nuevo.");
    }
    setSaving(false);
  };

  const applyBulk=async()=>{
    if(!bulk)return;
    const v=parseInt(bulk);
    if(isNaN(v)||v<0){alert("Ingresá un número válido");return;}
    if(!window.confirm(`¿Poner ${v} unidades a TODAS las figuritas (${all.length} figuritas)?`))return;
    setSaving(true);
    const n={};
    all.forEach(s=>n[s.key]=v);
    setLocalStock(n);
    try{
      await saveStock(n);
      setBulk("");
      alert(`✅ Stock masivo aplicado: ${v} unidades × ${all.length} figuritas`);
    }catch(e){alert("❌ Error al guardar");}
    setSaving(false);
  };

  // Paste-to-update: extrae códigos tipo MEX17, ARG_17, ARG17 del texto pegado
  const extraerCodigos=(t)=>{
    const encontrados=[];
    t.split("\n").forEach(linea=>{
      // Busca patrones como MEX17, ARG17, KOR_5, fwc1, s00
      const m=linea.match(/\b([A-Za-z]{2,4}[_]?\d{1,3})\b/g);
      if(m) m.forEach(cod=>encontrados.push(cod.toUpperCase().replace("_","")));
    });
    return [...new Set(encontrados)];
  };

  // Convierte código legible (MEX17) a key interna (MEX_17)
  const codToKey=(cod)=>{
    // Intentar match directo en all
    const direct=all.find(s=>s.num.toUpperCase()===cod||s.key.toUpperCase()===cod||s.key.toUpperCase().replace("_","")===cod);
    return direct?.key||null;
  };

  const aplicarPaste=async(signo)=>{
    const codigos=extraerCodigos(pasteTexto);
    if(codigos.length===0){setPasteResult({vacio:true});return;}
    const newLocal={...localStock};
    const ok=[];const noEncontrados=[];
    codigos.forEach(cod=>{
      const key=codToKey(cod);
      if(key){
        newLocal[key]=Math.max(0,(newLocal[key]||0)+signo);
        ok.push(cod);
        setDirty(p=>({...p,[key]:true}));
      }else{
        noEncontrados.push(cod);
      }
    });
    setLocalStock(newLocal);
    setPasteResult({ok,noEncontrados,signo});
    setSaving(true);
    try{
      await saveStock(newLocal);
      setDirty({});
    }catch(e){alert("❌ Error al guardar");}
    setSaving(false);
  };

  const totalDirty=Object.keys(dirty).length;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <h2 style={{fontSize:17,fontWeight:800,color:B.dark}}>📦 Gestión de Stock</h2>
        <div style={{display:"flex",gap:5}}>
          <ChipBtn active={modoVista==="tabla"} onClick={()=>setModoVista("tabla")}>📋 Tabla</ChipBtn>
          <ChipBtn active={modoVista==="paste"} onClick={()=>setModoVista("paste")}>📥 Pegar lista</ChipBtn>
          {totalDirty>0&&(
            <button style={{...aBtn,padding:"7px 14px",fontSize:11,background:"linear-gradient(135deg,#10b981,#059669)"}} onClick={saveAll} disabled={saving}>
              {saving?"Guardando...":"💾 Guardar "+totalDirty}
            </button>
          )}
        </div>
      </div>

      {/* MODO PASTE */}
      {modoVista==="paste"&&(
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginBottom:12}}>
          <h3 style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:6}}>📥 Actualizar stock por lista</h3>
          <p style={{fontSize:12,color:"#64748b",marginBottom:12,lineHeight:1.6}}>
            Pegá la lista de figuritas tal cual la tenés (ej: del carrito de WhatsApp).
            El sistema detecta automáticamente los códigos como <b>MEX17</b>, <b>ARG5</b>, <b>KOR3</b>, etc.
            y suma o resta 1 al stock de cada una.
          </p>
          <textarea
            style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:10,border:"1px solid #cbd5e1",fontSize:13,fontFamily:"monospace",resize:"vertical",minHeight:110,marginBottom:10}}
            placeholder={"👕 MEX17 — Raúl Jiménez · $475\n⭐ ARG17 — Lionel Messi · $39000\n🛡️ KOR1 — Escudo · $1300"}
            value={pasteTexto}
            onChange={e=>{setPasteTexto(e.target.value);setPasteResult(null);}}
          />
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <button style={{flex:1,padding:"11px 0",border:"none",borderRadius:10,background:"#16a34a",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}} onClick={()=>aplicarPaste(+1)} disabled={saving}>
              ➕ Sumar stock
            </button>
            <button style={{flex:1,padding:"11px 0",border:"none",borderRadius:10,background:"#dc2626",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}} onClick={()=>aplicarPaste(-1)} disabled={saving}>
              ➖ Restar stock
            </button>
          </div>
          {pasteResult&&(
            <div style={{padding:12,borderRadius:10,background:"#f1f5f9",fontSize:13}}>
              {pasteResult.vacio
                ? <span style={{color:"#b91c1c"}}>⚠️ No encontré ningún código. Revisá que el texto tenga algo como MEX17 o ARG5.</span>
                : <>
                    <div style={{color:"#15803d",marginBottom:4}}>
                      ✅ {pasteResult.signo>0?"Sumado":"Restado"} a {pasteResult.ok.length} figuritas: <b>{pasteResult.ok.join(", ")}</b>
                    </div>
                    {pasteResult.noEncontrados.length>0&&(
                      <div style={{color:"#b91c1c"}}>
                        ⚠️ No encontrados: {pasteResult.noEncontrados.join(", ")}
                      </div>
                    )}
                    <div style={{color:"#0369a1",marginTop:4,fontWeight:700}}>💾 Guardado automáticamente</div>
                  </>
              }
            </div>
          )}
        </div>
      )}

      {/* MODO TABLA */}
      {modoVista==="tabla"&&(<>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <input style={{...inp,flex:2,minWidth:150}} placeholder="🔍 Buscar figurita, jugador o país..." value={srch} onChange={e=>setSrch(e.target.value)}/>
          <input style={{...inp,width:80}} type="number" min="0" placeholder="Cant." value={bulk} onChange={e=>setBulk(e.target.value)}/>
          <button style={{...aBtn,padding:"8px 12px",fontSize:11,whiteSpace:"nowrap"}} onClick={applyBulk} disabled={saving}>Aplicar a todas</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
          {["Todos","Sede","CONMEBOL","UEFA","CAF","AFC","CONCACAF","OFC","FWC"].map(c=>(
            <ChipBtn key={c} active={cf===c} onClick={()=>setCf(c)}>{c}</ChipBtn>
          ))}
        </div>
        <p style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>{fil.length} figuritas · <b style={{color:totalDirty>0?"#f59e0b":"#10b981"}}>{totalDirty>0?`${totalDirty} sin guardar`:"Todo guardado ✓"}</b></p>
        <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 2fr 1fr 110px",padding:"6px 12px",background:B.dark,color:"#fff",fontSize:10,fontWeight:700,gap:6}}>
            <span>Número</span><span>Figurita</span><span>Tipo</span><span>Stock</span>
          </div>
          <div style={{maxHeight:500,overflowY:"auto"}}>
            {fil.map(s=>{
              const m=PRICE_META[s.type];
              const qty=localStock[s.key]??0;
              const isDirty=dirty[s.key];
              return(
                <div key={s.key} style={{display:"grid",gridTemplateColumns:"1.5fr 2fr 1fr 110px",padding:"5px 12px",borderBottom:"1px solid #f1f5f9",alignItems:"center",gap:6,fontSize:10,background:isDirty?"#fffbeb":"#fff"}}>
                  <span style={{fontWeight:700,color:B.dark}}>{s.cF} {s.num}</span>
                  <span style={{color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4,background:m.bg,color:m.color,display:"inline-block"}}>{m.emoji}</span>
                  <div style={{display:"flex",gap:3,alignItems:"center"}}>
                    <button style={{...qBtn,background:qty>0?"#fee2e2":"#f1f5f9",color:qty>0?"#ef4444":"#94a3b8"}} onClick={()=>updLocal(s.key,qty-1)}>−</button>
                    <input type="number" min="0"
                      style={{width:38,textAlign:"center",padding:"3px 2px",border:`1px solid ${isDirty?"#f59e0b":"#e2e8f0"}`,borderRadius:4,fontSize:11,fontWeight:800,background:isDirty?"#fef9c3":"#fff"}}
                      value={qty} onChange={e=>updLocal(s.key,e.target.value)}/>
                    <button style={{...qBtn,background:"#d1fae5",color:"#065f46"}} onClick={()=>updLocal(s.key,qty+1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {totalDirty>0&&(
          <button style={{...aBtn,width:"100%",marginTop:10,padding:12,fontSize:13,background:"linear-gradient(135deg,#10b981,#059669)"}} onClick={saveAll} disabled={saving}>
            {saving?"⏳ Guardando...":"💾 Guardar todos los cambios ("+totalDirty+")"}
          </button>
        )}
      </>)}
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
