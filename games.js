/* Aula ya! — Minijuegos por tema. Livianos, sin internet y sin librerías externas. */
(() => {
  const ART_BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
  const ART = {"🐯": "Tiger%20face/3D/tiger_face_3d.png", "🐶": "Dog%20face/3D/dog_face_3d.png", "📱": "Mobile%20phone/3D/mobile_phone_3d.png", "👟": "Running%20shoe/3D/running_shoe_3d.png", "🏠": "House/3D/house_3d.png", "🌰": "Chestnut/3D/chestnut_3d.png", "🚒": "Fire%20engine/3D/fire_engine_3d.png", "⛰️": "Mountain/3D/mountain_3d.png", "📌": "Pushpin/3D/pushpin_3d.png", "🐱": "Cat%20face/3D/cat_face_3d.png", "🪨": "Rock/3D/rock_3d.png", "🐦": "Bird/3D/bird_3d.png", "🌻": "Sunflower/3D/sunflower_3d.png", "🌵": "Cactus/3D/cactus_3d.png", "🚗": "Automobile/3D/automobile_3d.png", "🟫": "Brown%20square/3D/brown_square_3d.png", "⚽": "Soccer%20ball/3D/soccer_ball_3d.png", "🔑": "Key/3D/key_3d.png", "🌾": "Sheaf%20of%20rice/3D/sheaf_of_rice_3d.png", "🦒": "Giraffe/3D/giraffe_3d.png", "🧸": "Teddy%20bear/3D/teddy_bear_3d.png", "🏥": "Hospital/3D/hospital_3d.png", "⏰": "Alarm%20clock/3D/alarm_clock_3d.png", "🚓": "Police%20car/3D/police_car_3d.png", "💨": "Dashing%20away/3D/dashing_away_3d.png", "🦈": "Shark/3D/shark_3d.png", "🌞": "Sun%20with%20face/3D/sun_with_face_3d.png", "🐍": "Snake/3D/snake_3d.png", "🌙": "Crescent%20moon/3D/crescent_moon_3d.png", "🏙️": "Cityscape/3D/cityscape_3d.png", "🍊": "Tangerine/3D/tangerine_3d.png", "🌿": "Herb/3D/herb_3d.png", "🍃": "Leaf%20fluttering%20in%20wind/3D/leaf_fluttering_in_wind_3d.png", "🌊": "Water%20wave/3D/water_wave_3d.png", "🐘": "Elephant/3D/elephant_3d.png", "🐬": "Dolphin/3D/dolphin_3d.png", "👄": "Mouth/3D/mouth_3d.png", "💧": "Droplet/3D/droplet_3d.png", "✅": "Check%20mark%20button/3D/check_mark_button_3d.png", "👁️": "Eye/3D/eye_3d.png", "❌": "Cross%20mark/3D/cross_mark_3d.png", "🌱": "Seedling/3D/seedling_3d.png", "🌀": "Cyclone/3D/cyclone_3d.png", "✨": "Sparkles/3D/sparkles_3d.png", "💭": "Thought%20balloon/3D/thought_balloon_3d.png", "🐟": "Fish/3D/fish_3d.png", "🟨": "Yellow%20square/3D/yellow_square_3d.png", "🥖": "Baguette%20bread/3D/baguette_bread_3d.png", "🌽": "Ear%20of%20corn/3D/ear_of_corn_3d.png", "🐞": "Lady%20beetle/3D/lady_beetle_3d.png", "🌸": "Cherry%20blossom/3D/cherry_blossom_3d.png", "🏫": "School/3D/school_3d.png", "🪑": "Chair/3D/chair_3d.png", "🧊": "Ice/3D/ice_3d.png", "🐙": "Octopus/3D/octopus_3d.png", "🟪": "Purple%20square/3D/purple_square_3d.png", "🏝️": "Desert%20island/3D/desert_island_3d.png", "🍎": "Red%20apple/3D/red_apple_3d.png", "🔽": "Downwards%20button/3D/downwards_button_3d.png", "🟦": "Blue%20square/3D/blue_square_3d.png", "🌧️": "Cloud%20with%20rain/3D/cloud_with_rain_3d.png", "🐜": "Ant/3D/ant_3d.png", "🦁": "Lion/3D/lion_3d.png", "🐸": "Frog/3D/frog_3d.png", "🌳": "Deciduous%20tree/3D/deciduous_tree_3d.png", "🐵": "Monkey%20face/3D/monkey_face_3d.png", "🏖️": "Beach%20with%20umbrella/3D/beach_with_umbrella_3d.png", "🐄": "Cow/3D/cow_3d.png", "✏️": "Pencil/3D/pencil_3d.png", "🐻": "Bear/3D/bear_3d.png", "🟧": "Orange%20square/3D/orange_square_3d.png", "🐋": "Whale/3D/whale_3d.png", "🦆": "Duck/3D/duck_3d.png", "🟩": "Green%20square/3D/green_square_3d.png", "🟥": "Red%20square/3D/red_square_3d.png", "🦓": "Zebra/3D/zebra_3d.png", "👨‍🍳": "Man%20cook/Default/3D/man_cook_3d_default.png", "👩": "Woman/Default/3D/woman_3d_default.png", "👩‍⚕️": "Woman%20health%20worker/Default/3D/woman_health_worker_3d_default.png", "👮": "Police%20officer/Default/3D/police_officer_3d_default.png", "✋": "Raised%20hand/Default/3D/raised_hand_3d_default.png", "👵": "Old%20woman/Default/3D/old_woman_3d_default.png", "👂": "Ear/Default/3D/ear_3d_default.png", "👃": "Nose/Default/3D/nose_3d_default.png", "🦶": "Foot/Default/3D/foot_3d_default.png", "🫃": "Pregnant%20man/Default/3D/pregnant_man_3d_default.png", "👴": "Old%20man/Default/3D/old_man_3d_default.png", "👩‍🌾": "Woman%20farmer/Default/3D/woman_farmer_3d_default.png", "👨‍🏫": "Man%20teacher/Default/3D/man_teacher_3d_default.png", "👧": "Girl/Default/3D/girl_3d_default.png", "👨": "Man/Default/3D/man_3d_default.png", "👦": "Boy/Default/3D/boy_3d_default.png", "👩‍🚒": "Woman%20firefighter/Default/3D/woman_firefighter_3d_default.png", "😅": "Grinning%20face%20with%20sweat/3D/grinning_face_with_sweat_3d.png"};
  const ART_KEYS = Object.keys(ART).sort((a, b) => b.length - a.length);
  const ART_RE = new RegExp(ART_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');
  function artImg(e, cls) { return `<img class="ag-art ${cls || ''}" src="${ART_BASE + ART[e]}" alt="" draggable="false" onerror="this.replaceWith(document.createTextNode('${e}'))">`; }
  function art(text, cls) { return esc(text).replace(ART_RE, (m) => artImg(m, cls)); }
  function preload(game) { if (!game) return; const txt = JSON.stringify(game); (txt.match(ART_RE) || []).forEach((e) => { const i = new Image(); i.src = ART_BASE + ART[e]; }); }
    const CONTENT = {
    'Primero|Ciencias': { type: 'catch', title: 'Atrapa los seres vivos', prompt: 'Toca solo los SERES VIVOS 🌱', good: ['🐶','🌻','🐦','🐟','🌳','🐱','🐞','🐄','🌵','🐸'], bad: ['🪨','🚗','🪑','✏️','⚽','📱','🧸','👟','🔑','⏰'] },
    'Primero|Matemáticas': { type: 'speed', title: 'Carrera de sumas', gen: 'add' },
    'Primero|Lengua': { type: 'spell', title: 'Arma la palabra', words: [['🌞','SOL'],['🏠','CASA'],['🦆','PATO'],['🌙','LUNA'],['🐸','RANA'],['🍎','MANZANA']] },
    'Primero|Inglés': { type: 'memory', title: 'Colors memory', pairs: [['🟥','RED'],['🟦','BLUE'],['🟨','YELLOW'],['🟩','GREEN'],['🟧','ORANGE'],['🟪','PURPLE']] },
    'Primero|Ciencias Sociales': { type: 'memory', title: 'Memoria de la familia', pairs: [['👵','Abuela'],['👴','Abuelo'],['👩','Mamá'],['👨','Papá'],['👧','Hermana'],['👦','Hermano']] },

    'Segundo|Ciencias': { type: 'memory', title: 'Partes de la planta', pairs: [['🟫 Raíz','Toma agua del suelo'],['🌿 Tallo','Sostiene la planta'],['🍃 Hoja','Hace alimento con el sol'],['🌸 Flor','De ella sale el fruto'],['🍊 Fruto','Guarda las semillas'],['🌰 Semilla','De ella nace una planta']] },
    'Segundo|Matemáticas': { type: 'speed', title: 'Carrera de restas', gen: 'sub' },
    'Segundo|Lengua': { type: 'sort', title: '¿Propio o común?', bins: ['Sustantivo propio','Sustantivo común'], items: [['Bogotá',0],['perro',1],['Ana',0],['casa',1],['Colombia',0],['árbol',1],['Luis',0],['ciudad',1],['Magdalena',0],['escuela',1]] },
    'Segundo|Inglés': { type: 'memory', title: 'Animals memory', pairs: [['🦁','LION'],['🐘','ELEPHANT'],['🦒','GIRAFFE'],['🐵','MONKEY'],['🐯','TIGER'],['🦓','ZEBRA']] },
    'Segundo|Ciencias Sociales': { type: 'memory', title: '¿Quién trabaja aquí?', pairs: [['👩‍⚕️ Médica','🏥 Hospital'],['👨‍🏫 Profesor','🏫 Escuela'],['👩‍🚒 Bombera','🚒 Estación de bomberos'],['👨‍🍳 Panadero','🥖 Panadería'],['👮 Policía','🚓 Estación de policía'],['👩‍🌾 Campesina','🌽 Finca']] },

    'Tercero|Ciencias': { type: 'sort', title: '¿Dónde vive?', bins: ['🌊 Acuático','🌳 Terrestre'], items: [['🐟 Pez',0],['🐙 Pulpo',0],['🐬 Delfín',0],['🦈 Tiburón',0],['🐋 Ballena',0],['🦁 León',1],['🐄 Vaca',1],['🐍 Serpiente',1],['🐜 Hormiga',1],['🐻 Oso',1]] },
    'Tercero|Matemáticas': { type: 'speed', title: 'Carrera de multiplicar', gen: 'mul' },
    'Tercero|Lengua': { type: 'order', title: 'Ordena el cuento', hint: 'Toca las partes en orden: inicio, nudo y desenlace.', items: ['Inicio: Había una vez una tortuga que quería ver el mar.','Nudo: En el camino se perdió y empezó a llover.','Nudo: Un pájaro amigo le mostró el río.','Desenlace: Siguió el río y por fin llegó al mar.'] },
    'Tercero|Inglés': { type: 'spell', title: 'Spell the number', words: [['1','ONE'],['2','TWO'],['3','THREE'],['5','FIVE'],['7','SEVEN'],['10','TEN']] },
    'Tercero|Ciencias Sociales': { type: 'sort', title: '¿Urbano o rural?', bins: ['🏙️ Zona urbana','🌾 Zona rural'], items: [['Edificios altos',0],['Semáforos',0],['Centro comercial',0],['Calles pavimentadas',0],['Muchos buses',0],['Fincas',1],['Cultivos de café',1],['Ganado',1],['Veredas',1],['Potreros y ríos',1]] },

    'Cuarto|Ciencias': { type: 'sort', title: 'Estados de la materia', bins: ['🧊 Sólido','💧 Líquido','💨 Gaseoso'], items: [['Piedra',0],['Hielo',0],['Lápiz',0],['Agua',1],['Leche',1],['Jugo',1],['Vapor de agua',2],['Aire',2],['Oxígeno',2]] },
    'Cuarto|Matemáticas': { type: 'speed', title: 'Carrera de divisiones', gen: 'div' },
    'Cuarto|Lengua': { type: 'catch', title: 'Caza adjetivos', prompt: 'Toca solo los ADJETIVOS ✨', good: ['grande','feliz','rojo','alto','suave','valiente','rápido','bonito','frío','dulce'], bad: ['correr','mesa','perro','saltar','casa','comer','libro','niño','jugar','río'] },
    'Cuarto|Inglés': { type: 'memory', title: 'Body memory', pairs: [['👁️','EYE'],['👂','EAR'],['👃','NOSE'],['👄','MOUTH'],['✋','HAND'],['🦶','FOOT']] },
    'Cuarto|Ciencias Sociales': { type: 'memory', title: 'Regiones de Colombia', pairs: [['⛰️ Andina','Cordilleras y montañas'],['🏖️ Caribe','Costa del mar Caribe'],['🌧️ Pacífica','Selva húmeda y mucha lluvia'],['🐄 Orinoquía','Llanos y sabanas'],['🌳 Amazonía','Gran selva amazónica'],['🏝️ Insular','Islas como San Andrés']] },

    'Quinto|Ciencias': { type: 'order', title: 'El viaje de la comida', hint: 'Toca los órganos en el orden en que pasa la comida.', items: ['👄 Boca','🔽 Esófago','🫃 Estómago','〰️ Intestino delgado','🌀 Intestino grueso'] },
    'Quinto|Matemáticas': { type: 'speed', title: 'Carrera de fracciones', gen: 'frac' },
    'Quinto|Lengua': { type: 'sort', title: '¿Hecho u opinión?', bins: ['📌 Hecho','💭 Opinión'], items: [['El agua hierve a 100 °C',0],['Bogotá es la capital de Colombia',0],['La semana tiene 7 días',0],['Las plantas necesitan agua',0],['El fútbol es el mejor deporte',1],['Las matemáticas son aburridas',1],['El azul es el color más bonito',1],['La pizza es la comida más rica',1]] },
    'Quinto|Inglés': { type: 'sort', title: 'Right or wrong?', bins: ['✅ Correct','❌ Wrong'], items: [['She plays soccer.',0],['I eat breakfast.',0],['He reads books.',0],['They live in Cali.',0],['She play soccer.',1],['He read books.',1],['I eats breakfast.',1],['They lives in Cali.',1]] },
    'Quinto|Ciencias Sociales': { type: 'order', title: 'Línea del tiempo', hint: 'Toca los hechos del más antiguo al más reciente.', items: ['1810 · Grito de Independencia (20 de julio)','1810–1816 · Patria Boba','1816 · Reconquista española','1819 · Batalla de Boyacá (7 de agosto)'] }
  };

  const ICONS = { memory: '<img class="ag-icon-img" src="assets/game-memoria.png" alt="Memoria">', catch: '<img class="ag-icon-img" src="assets/game-atrapa.png" alt="Atrapa">', speed: '<img class="ag-icon-img" src="assets/game-carrera.png" alt="Carrera">', sort: '<img class="ag-icon-img" src="assets/game-clasifica.png" alt="Clasifica">', order: '<img class="ag-icon-img" src="assets/game-ordena.png" alt="Ordena">', spell: '<img class="ag-icon-img" src="assets/game-palabra.png" alt="Arma la palabra">' };
  const KIND = { memory: 'Memoria', catch: 'Atrapa', speed: 'Carrera', sort: 'Clasifica', order: 'Ordena', spell: 'Arma la palabra' };

  const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const starsFor = (mistakes) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);

  function injectStyles() {
    if (document.getElementById('ag-styles')) return;
    const style = document.createElement('style');
    style.id = 'ag-styles';
    style.textContent = `
.ag{font-family:Fredoka,system-ui,sans-serif;color:#173b31;user-select:none;-webkit-user-select:none}
.ag-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.ag-head b{font-size:15px}.ag-pill{background:#eef7ea;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:800;color:#1f6b3b;white-space:nowrap}
.ag-prompt{background:#fff8df;border:1px solid #f5e2a6;border-radius:12px;padding:9px 12px;font-size:12px;font-weight:700;margin-bottom:10px;text-align:center}
.ag-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ag-card{aspect-ratio:1/1;border:0;border-radius:14px;background:linear-gradient(145deg,#2f8a4f,#1f6b3b);color:#fff;font:800 13px Fredoka,system-ui;display:grid;place-items:center;padding:6px;cursor:pointer;transition:transform .25s,background .25s;box-shadow:0 3px 0 #17542e;text-align:center;line-height:1.15}
.ag-card.open{background:#fff;color:#173b31;border:2px solid #cfe7c9;box-shadow:none;transform:rotateY(0)}
.ag-card.big{font-size:30px}.ag-card.done{background:#e3f6dc;color:#1f6b3b;border:2px solid #9fd8a8;box-shadow:none;transform:scale(.96)}
.ag-arena{position:relative;height:330px;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#d9f1ff,#effae9);border:1px solid #d5ead0}
.ag-drop{position:absolute;top:-60px;border:0;background:#fff;border-radius:14px;padding:8px 10px;font:800 15px Fredoka,system-ui;box-shadow:0 3px 8px #1d3a2a26;cursor:pointer;animation:ag-fall linear forwards}
.ag-drop.emoji{font-size:30px;padding:4px 8px;background:#ffffffd9}
@keyframes ag-fall{to{transform:translateY(410px)}}
.ag-pop{position:absolute;font-size:22px;pointer-events:none;animation:ag-up .7s ease-out forwards}
@keyframes ag-up{to{transform:translateY(-40px);opacity:0}}
.ag-lives{letter-spacing:2px}
.ag-q{background:#fff;border:1px solid #e3ece0;border-radius:16px;padding:18px;text-align:center;margin-bottom:10px}
.ag-q .big{font-size:34px;font-weight:900;letter-spacing:1px}
.ag-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ag-opt{border:0;border-radius:14px;background:#fff;border:2px solid #d8e9d3;padding:14px 4px;font:900 20px Fredoka,system-ui;color:#173b31;cursor:pointer;box-shadow:0 3px 0 #cfe0ca}
.ag-opt.small{font-size:13px}
.ag-opt.ok{background:#d9f5d2;border-color:#7cc98a}.ag-opt.bad{background:#ffe1df;border-color:#f29a93}
.ag-bar{display:flex;height:34px;border-radius:8px;overflow:hidden;border:2px solid #173b31;margin:6px auto 0;max-width:260px}
.ag-bar i{flex:1;border-right:2px solid #173b31;background:#fff}.ag-bar i:last-child{border-right:0}.ag-bar i.on{background:#ffb51b}
.ag-time{height:8px;border-radius:9px;background:#e7efe4;overflow:hidden;margin-bottom:10px}.ag-time i{display:block;height:100%;background:linear-gradient(90deg,#ffb51b,#ee6b3b);transition:width 1s linear}
.ag-item{background:#fff;border:2px solid #d8e9d3;border-radius:16px;padding:22px 12px;text-align:center;font-size:20px;font-weight:900;margin-bottom:10px;min-height:76px;display:grid;place-items:center}
.ag-bins{display:grid;gap:8px}.ag-bins.two{grid-template-columns:1fr 1fr}.ag-bins.three{grid-template-columns:1fr 1fr 1fr}
.ag-bin{border:0;border-radius:14px;padding:16px 6px;font:900 13px Fredoka,system-ui;color:#fff;background:#2f8a4f;box-shadow:0 3px 0 #17542e;cursor:pointer}
.ag-bin:nth-child(2){background:#3783d2;box-shadow:0 3px 0 #23578d}.ag-bin:nth-child(3){background:#8654c6;box-shadow:0 3px 0 #5b3590}
.ag-list{display:grid;gap:7px}
.ag-chip{border:2px solid #d8e9d3;background:#fff;border-radius:12px;padding:11px;font:800 12.5px Fredoka,system-ui;color:#173b31;text-align:left;cursor:pointer}
.ag-chip.done{background:#e3f6dc;border-color:#9fd8a8;cursor:default}
.ag-chip .n{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#2f8a4f;color:#fff;font-size:11px;margin-right:7px}
.ag-slots{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin:10px 0}
.ag-slot{width:34px;height:40px;border-bottom:3px solid #173b31;display:grid;place-items:center;font:900 22px Fredoka,system-ui}
.ag-letters{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.ag-letter{width:42px;height:46px;border:0;border-radius:12px;background:#ffb51b;color:#3b2a00;font:900 20px Fredoka,system-ui;box-shadow:0 3px 0 #c98400;cursor:pointer}
.ag-letter:disabled{opacity:.25;box-shadow:none}
.ag-shake{animation:ag-shake .35s}@keyframes ag-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.ag-win{text-align:center;padding:14px 6px}
.ag-win img{width:120px;height:120px;object-fit:contain}
.ag-win h3{margin:6px 0 2px;font-size:20px}.ag-stars{font-size:34px;letter-spacing:4px;margin:6px 0}
.ag-stars .off{filter:grayscale(1);opacity:.35}
.ag-actions{display:grid;gap:8px;margin-top:12px}
.ag-btn{border:0;border-radius:12px;padding:13px;font:900 13px Fredoka,system-ui;cursor:pointer;background:#2f8a4f;color:#fff}
.ag-btn.alt{background:#fff;color:#1f6b3b;border:2px solid #d8e9d3}
.ag-head .ag-icon-img{width:30px;height:30px;vertical-align:middle;margin-right:4px}.ag-head b{display:flex;align-items:center;gap:4px}.ag-art{width:1.5em;height:1.5em;object-fit:contain;vertical-align:-.35em;display:inline-block;filter:drop-shadow(0 2px 2px #0002)}.ag-art.ag-xl{width:72px;height:72px;vertical-align:middle}.ag-art.ag-dropart{width:66px;height:66px}.ag-art.ag-itemart{width:104px;height:104px;display:block;margin:0 auto 6px}.ag-art.ag-clue{width:120px;height:120px}.ag-back{width:70%;height:70%;object-fit:contain;opacity:.95}.ag-drop:has(.ag-dropart){background:transparent;box-shadow:none;padding:0}
.ag-start{text-align:center;padding:10px 4px}.ag-start .icon{font-size:52px}.ag-start .icon .ag-icon-img{width:96px;height:96px;object-fit:contain}.ag-icon-img{width:100%;height:100%;object-fit:contain}.ag-start p{font-size:12px;color:#5f7468;margin:6px 0 14px}
`;
    document.head.appendChild(style);
  }

  function speedQuestion(gen) {
    if (gen === 'add') { const a = rand(1, 9), b = rand(1, 10 - a); return { text: `${a} + ${b}`, answer: a + b }; }
    if (gen === 'sub') { const a = rand(5, 20), b = rand(1, a); return { text: `${a} − ${b}`, answer: a - b }; }
    if (gen === 'mul') { const a = rand(2, 9), b = rand(1, 10); return { text: `${a} × ${b}`, answer: a * b }; }
    if (gen === 'div') { const b = rand(2, 9), q = rand(1, 10); return { text: `${b * q} ÷ ${b}`, answer: q }; }
    const n = [2, 3, 4, 5, 6, 8][rand(0, 5)], k = rand(1, n - 1);
    return { frac: true, n, k, answer: `${k}/${n}` };
  }
  function speedOptions(q) {
    if (q.frac) {
      const set = new Set([q.answer]);
      while (set.size < 3) { const n = q.n + [0, 0, 1, -1, 2][rand(0, 4)]; const k = rand(1, Math.max(1, n - 1)); if (n > 1 && k < n) set.add(`${k}/${n}`); }
      return shuffle([...set]);
    }
    const set = new Set([q.answer]);
    while (set.size < 3) { const v = q.answer + rand(-4, 4); if (v >= 0) set.add(v); }
    return shuffle([...set]);
  }

  function mount(root, game, { onWin, onExit } = {}) {
    injectStyles(); preload(game);
    let timers = [], alive = true;
    const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timers.push(t); return t; };
    const stopAll = () => { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; };
    const shake = (el) => { el.classList.remove('ag-shake'); void el.offsetWidth; el.classList.add('ag-shake'); };

    function win(mistakes) {
      stopAll();
      const stars = starsFor(mistakes);
      root.innerHTML = `<div class="ag ag-win"><img src="assets/aulaya-mascot.png" alt=""><h3>¡Lo lograste! 🎉</h3><div class="ag-stars">${[1, 2, 3].map((n) => `<span class="${n <= stars ? '' : 'off'}">⭐</span>`).join('')}</div><small>${stars === 3 ? '¡Perfecto! Teo está muy orgulloso.' : stars === 2 ? '¡Muy bien! Juega otra vez para ganar 3 estrellas.' : '¡Sigue practicando, vas muy bien!'}</small><div class="ag-actions"><button class="ag-btn" data-ag="again">Jugar otra vez 🔁</button><button class="ag-btn alt" data-ag="exit">Volver al tema</button></div></div>`;
      root.querySelector('[data-ag="again"]').onclick = () => start();
      root.querySelector('[data-ag="exit"]').onclick = () => { destroy(); onExit && onExit(); };
      onWin && onWin({ stars, mistakes });
    }

    function header(right) { return `<div class="ag-head"><b>${ICONS[game.type]} ${esc(game.title)}</b><span class="ag-pill">${right}</span></div>`; }

    function playMemory() {
      const cards = shuffle(game.pairs.flatMap(([a, b], i) => [{ id: i, label: a }, { id: i, label: b }]));
      let open = [], found = 0, misses = 0, lock = false;
      const isEmoji = (t) => /^\p{Extended_Pictographic}/u.test(t) && t.length <= 4;
      const draw = () => {
        root.innerHTML = `<div class="ag">${header(`Parejas ${found}/${game.pairs.length}`)}<div class="ag-prompt">Encuentra las parejas que van juntas 🧠</div><div class="ag-grid">${cards.map((c, i) => `<button class="ag-card ${c.done ? 'done' : c.open ? 'open' : ''} ${(c.open || c.done) && isEmoji(c.label) ? 'big' : ''}" data-i="${i}">${c.open || c.done ? art(c.label, isEmoji(c.label) ? 'ag-xl' : '') : '<img class="ag-back" src="assets/aulaya-mascot.png" alt="">'}</button>`).join('')}</div></div>`;
        root.querySelectorAll('.ag-card').forEach((b) => b.onclick = () => flip(Number(b.dataset.i)));
      };
      const flip = (i) => {
        const c = cards[i];
        if (lock || c.open || c.done) return;
        c.open = true; open.push(c); draw();
        if (open.length < 2) return;
        lock = true;
        const [x, y] = open;
        if (x.id === y.id) { x.done = y.done = true; found++; open = []; lock = false; draw(); if (found === game.pairs.length) later(() => win(Math.max(0, misses - 2)), 450); }
        else { misses++; later(() => { x.open = y.open = false; open = []; lock = false; draw(); }, 850); }
      };
      draw();
    }

    function playCatch() {
      let score = 0, lives = 3, missesBad = 0;
      const goal = 10;
      root.innerHTML = `<div class="ag">${header(`<span id="ag-score">0/${goal}</span> · <span class="ag-lives" id="ag-lives">❤️❤️❤️</span>`)}<div class="ag-prompt">${art(game.prompt)}</div><div class="ag-arena" id="ag-arena"></div></div>`;
      const arena = root.querySelector('#ag-arena');
      const update = () => { root.querySelector('#ag-score').textContent = `${score}/${goal}`; root.querySelector('#ag-lives').textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives); };
      const pop = (x, y, txt) => { const p = document.createElement('span'); p.className = 'ag-pop'; p.textContent = txt; p.style.left = x + 'px'; p.style.top = y + 'px'; arena.appendChild(p); later(() => p.remove(), 700); };
      const spawn = () => {
        if (!alive || score >= goal || lives <= 0) return;
        const good = Math.random() < 0.55;
        const label = good ? game.good[rand(0, game.good.length - 1)] : game.bad[rand(0, game.bad.length - 1)];
        const b = document.createElement('button');
        b.className = 'ag-drop' + (/^\p{Extended_Pictographic}/u.test(label) ? ' emoji' : '');
        b.innerHTML = art(label, 'ag-dropart');
        b.style.left = rand(4, Math.max(8, arena.clientWidth - 90)) + 'px';
        b.style.animationDuration = (4.2 - Math.min(1.6, score * 0.12)) + 's';
        b.onclick = (e) => {
          const r = arena.getBoundingClientRect();
          if (good) { score++; pop(e.clientX - r.left, e.clientY - r.top, '⭐'); }
          else { lives--; missesBad++; pop(e.clientX - r.left, e.clientY - r.top, '💥'); shake(arena); }
          b.remove(); update();
          if (score >= goal) later(() => win(missesBad), 300);
          else if (lives <= 0) later(lose, 300);
        };
        b.addEventListener('animationend', () => b.remove());
        arena.appendChild(b);
        later(spawn, Math.max(520, 950 - score * 35));
      };
      const lose = () => { stopAll(); root.innerHTML = `<div class="ag ag-win"><div style="font-size:54px">${artImg('😅', 'ag-xl')}</div><h3>¡Casi!</h3><small>Tocaste algunas que no eran. ¡Inténtalo otra vez!</small><div class="ag-actions"><button class="ag-btn" data-ag="again">Intentar de nuevo 🔁</button><button class="ag-btn alt" data-ag="exit">Volver al tema</button></div></div>`; root.querySelector('[data-ag="again"]').onclick = () => start(); root.querySelector('[data-ag="exit"]').onclick = () => { destroy(); onExit && onExit(); }; };
      spawn();
    }

    function playSpeed() {
      const goal = 8, total = 60;
      let score = 0, mistakes = 0, left = total, q;
      root.innerHTML = `<div class="ag">${header(`<span id="ag-score">0/${goal}</span> · ⏱ <span id="ag-left">${total}</span>s`)}<div class="ag-time"><i id="ag-bar" style="width:100%"></i></div><div id="ag-body"></div></div>`;
      const body = root.querySelector('#ag-body');
      const next = () => {
        q = speedQuestion(game.gen);
        const opts = speedOptions(q);
        body.innerHTML = `<div class="ag-q">${q.frac ? `<small>¿Qué fracción está pintada?</small><div class="ag-bar">${Array.from({ length: q.n }, (_, i) => `<i class="${i < q.k ? 'on' : ''}"></i>`).join('')}</div>` : `<div class="big">${q.text} = ?</div>`}</div><div class="ag-opts">${opts.map((o) => `<button class="ag-opt">${o}</button>`).join('')}</div>`;
        body.querySelectorAll('.ag-opt').forEach((b) => b.onclick = () => {
          if (String(b.textContent) === String(q.answer)) { b.classList.add('ok'); score++; root.querySelector('#ag-score').textContent = `${score}/${goal}`; if (score >= goal) return later(() => win(mistakes), 350); later(next, 280); }
          else { b.classList.add('bad'); mistakes++; shake(b); }
        });
      };
      const tick = setInterval(() => {
        if (!alive) return;
        left--; const l = root.querySelector('#ag-left'), bar = root.querySelector('#ag-bar');
        if (l) l.textContent = left; if (bar) bar.style.width = (left / total * 100) + '%';
        if (left <= 0) { stopAll(); root.innerHTML = `<div class="ag ag-win"><div style="font-size:54px">${artImg('⏰', 'ag-xl')}</div><h3>¡Se acabó el tiempo!</h3><small>Lograste ${score} de ${goal}. ¡Tú puedes, inténtalo otra vez!</small><div class="ag-actions"><button class="ag-btn" data-ag="again">Intentar de nuevo 🔁</button><button class="ag-btn alt" data-ag="exit">Volver al tema</button></div></div>`; root.querySelector('[data-ag="again"]').onclick = () => start(); root.querySelector('[data-ag="exit"]').onclick = () => { destroy(); onExit && onExit(); }; }
      }, 1000);
      timers.push(tick);
      next();
    }

    function playSort() {
      const items = shuffle(game.items);
      let i = 0, mistakes = 0;
      const draw = () => {
        root.innerHTML = `<div class="ag">${header(`${i}/${items.length}`)}<div class="ag-prompt">¿En qué grupo va? Toca el grupo correcto 🧺</div><div class="ag-item" id="ag-item">${art(items[i][0], 'ag-itemart')}</div><div class="ag-bins ${game.bins.length === 3 ? 'three' : 'two'}">${game.bins.map((b, k) => `<button class="ag-bin" data-k="${k}">${art(b)}</button>`).join('')}</div></div>`;
        root.querySelectorAll('.ag-bin').forEach((b) => b.onclick = () => {
          if (Number(b.dataset.k) === items[i][1]) { i++; if (i >= items.length) return win(mistakes); draw(); }
          else { mistakes++; shake(root.querySelector('#ag-item')); }
        });
      };
      draw();
    }

    function playOrder() {
      const shuffled = shuffle(game.items.map((t, k) => ({ t, k })));
      let step = 0, mistakes = 0;
      const draw = () => {
        root.innerHTML = `<div class="ag">${header(`${step}/${game.items.length}`)}<div class="ag-prompt">${esc(game.hint || 'Toca en el orden correcto')}</div><div class="ag-list">${shuffled.map((c, i) => `<button class="ag-chip ${c.k < step ? 'done' : ''}" data-i="${i}">${c.k < step ? `<span class="n">${c.k + 1}</span>` : ''}${art(c.t)}</button>`).join('')}</div></div>`;
        root.querySelectorAll('.ag-chip').forEach((b) => b.onclick = () => {
          const c = shuffled[Number(b.dataset.i)];
          if (c.k < step) return;
          if (c.k === step) { step++; if (step >= game.items.length) { draw(); return later(() => win(mistakes), 450); } draw(); }
          else { mistakes++; shake(b); }
        });
      };
      draw();
    }

    function playSpell() {
      const words = shuffle(game.words).slice(0, 5);
      let w = 0, typed = '', mistakes = 0;
      const draw = () => {
        const [clue, word] = words[w];
        const extra = shuffle('ABCDEFGILMNOPRSTU'.split('').filter((c) => !word.includes(c))).slice(0, 2);
        const tiles = shuffle([...word.split(''), ...extra]);
        root.innerHTML = `<div class="ag">${header(`Palabra ${w + 1}/${words.length}`)}<div class="ag-q"><div class="big" style="font-size:44px">${art(clue, 'ag-clue')}</div></div><div class="ag-slots" id="ag-slots">${word.split('').map((c, i) => `<span class="ag-slot">${typed[i] || ''}</span>`).join('')}</div><div class="ag-letters">${tiles.map((c, i) => `<button class="ag-letter" data-i="${i}">${c}</button>`).join('')}</div></div>`;
        root.querySelectorAll('.ag-letter').forEach((b) => b.onclick = () => {
          const need = word[typed.length];
          if (b.textContent === need) {
            typed += need; b.disabled = true;
            root.querySelectorAll('.ag-slot')[typed.length - 1].textContent = need;
            if (typed.length === word.length) { typed = ''; w++; if (w >= words.length) return later(() => win(mistakes), 400); later(draw, 450); }
          } else { mistakes++; shake(root.querySelector('#ag-slots')); }
        });
      };
      draw();
    }

    function start() {
      stopAll();
      const run = { memory: playMemory, catch: playCatch, speed: playSpeed, sort: playSort, order: playOrder, spell: playSpell }[game.type];
      run && run();
    }

    function intro() {
      root.innerHTML = `<div class="ag ag-start"><div class="icon">${ICONS[game.type]}</div><h3 style="margin:4px 0">${esc(game.title)}</h3><p>${esc(KIND[game.type])} · ${game.type === 'speed' ? 'Responde 8 antes de que se acabe el tiempo.' : game.type === 'catch' ? 'Atrapa 10 sin perder tus 3 vidas.' : 'Termina el reto para ganar estrellas.'}</p><button class="ag-btn" data-ag="go" style="width:100%">¡Jugar! ▶</button></div>`;
      root.querySelector('[data-ag="go"]').onclick = start;
    }

    function destroy() { alive = false; stopAll(); }
    intro();
    return { destroy };
  }

  function get(grade, subject) { const g = CONTENT[`${grade}|${subject}`]; return g ? { ...g, kind: KIND[g.type], icon: ICONS[g.type] } : null; }

  window.AulaGames = { get, mount, preload: (grade, subject) => preload(CONTENT[`${grade}|${subject}`]) };
})();
