/* Teo — modelo de lenguaje pequeño de AulaYa.
   Funciona 100 % en el dispositivo, sin descargas ni internet.
   Conoce los 25 temas de primaria de la app, resuelve y explica
   operaciones paso a paso, crea ejercicios y revisa respuestas. */
(function (root) {
'use strict';

/* ───────────── utilidades ───────────── */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const fmt = n => { if (!Number.isFinite(n)) return String(n); const r = Math.round(n * 1000) / 1000; return String(r).replace('.', ','); };
const big = n => Math.abs(n) >= 10000 ? n.toLocaleString('es-CO') : String(n);

function norm(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ñ/g, '\u0001')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\u0001/g, 'ñ')
    .replace(/[\p{Extended_Pictographic}\u200d\ufe0f\u20e3]/gu, ' ')
    .replace(/[¿?¡!.,;"“”'’()\[\]{}…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
/* coincidencia por inicio de palabra (sirve como "raíz") */
function has(q, stem) {
  if (!stem) return false;
  const s = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|\\s)' + s).test(q);
}
function hasWord(q, w) {
  const s = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|\\s)' + s + '($|\\s)').test(q);
}
const any = (q, list) => list.some(s => has(q, s));

/* ───────────── números escritos en palabras ───────────── */
const UNITS = { cero: 0, uno: 1, una: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiun: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29 };
const TENS = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
const HUND = { cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900 };
const isNumWord = w => w in UNITS || w in TENS || w in HUND || w === 'mil' || w === 'y';

/* convierte "treinta y dos mas cinco" en "32 mas 5". "un/una" solo cuenta si va junto a una operación */
function wordsToDigits(q) {
  const toks = q.split(' ');
  const out = [];
  let i = 0;
  while (i < toks.length) {
    const w = toks[i];
    if (isNumWord(w) && w !== 'y') {
      let j = i, total = 0, cur = 0, used = false;
      while (j < toks.length && isNumWord(toks[j])) {
        const t = toks[j];
        if (t === 'y') { if (!(j + 1 < toks.length && toks[j + 1] in UNITS && cur >= 20)) break; j++; continue; }
        if (t in UNITS) cur += UNITS[t];
        else if (t in TENS) cur += TENS[t];
        else if (t in HUND) cur += HUND[t];
        else if (t === 'mil') { total += (cur || 1) * 1000; cur = 0; }
        used = true; j++;
      }
      const val = total + cur;
      const isArticle = (w === 'un' || w === 'una' || w === 'uno') && j === i + 1;
      if (isArticle) {
        const prev = toks[i - 1] || '', next = toks[j] || '';
        const opNear = /^(mas|menos|por|entre|x|\+|-|\*|\/|=|es|igual|dividido|multiplicado|veces)$/;
        if (!(opNear.test(prev) || opNear.test(next) || /^\d/.test(next))) { out.push(w); i++; continue; }
      }
      if (used) { out.push(String(val)); i = j; continue; }
    }
    out.push(w); i++;
  }
  return out.join(' ');
}

const FRAC_NAMES = { medio: 2, medios: 2, tercio: 3, tercios: 3, cuarto: 4, cuartos: 4, quinto: 5, quintos: 5, sexto: 6, sextos: 6, septimo: 7, septimos: 7, octavo: 8, octavos: 8, noveno: 9, novenos: 9, decimo: 10, decimos: 10 };
const FRAC_READ = { 2: ['medio', 'medios'], 3: ['tercio', 'tercios'], 4: ['cuarto', 'cuartos'], 5: ['quinto', 'quintos'], 6: ['sexto', 'sextos'], 7: ['séptimo', 'séptimos'], 8: ['octavo', 'octavos'], 9: ['noveno', 'novenos'], 10: ['décimo', 'décimos'] };
const NUM_ES = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
function readFraction(n, d) {
  const num = n <= 20 ? (n === 1 ? 'un' : NUM_ES[n]) : String(n);
  let den;
  if (FRAC_READ[d]) den = FRAC_READ[d][n === 1 ? 0 : 1];
  else den = (d <= 20 ? NUM_ES[d].replace(/e$/, '') + 'avo' : d + 'avo') + (n === 1 ? '' : 's');
  return num + ' ' + den;
}

/* texto preparado para matemáticas: palabras → símbolos */
function mathText(q) {
  let m = wordsToDigits(q);
  m = m.replace(/(\d+)\s+(medios?|tercios?|cuartos?|quintos?|sextos?|septimos?|octavos?|novenos?|decimos?)\b/g, (_, n, w) => `${n}/${FRAC_NAMES[w]}`);
  m = m.replace(/[×·]/g, '*').replace(/÷/g, ':');
  m = m.replace(/(\d)\s*(?:multiplicado por|veces|por|x)\s*(?=\d)/g, '$1 * ');
  m = m.replace(/(\d)\s*(?:dividido entre|dividido por|dividido en|dividido|entre|:)\s*(?=\d)/g, '$1 : ');
  m = m.replace(/(\d)\s*(?:mas|\+)\s*(?=\d)/g, '$1 + ');
  m = m.replace(/(\d)\s*(?:menos|−|–|-)\s*(?=\d)/g, '$1 - ');
  m = m.replace(/(\d)\s+\/\s+(?=\d)/g, '$1 : ');           /* "12 / 3" con espacios = división */
  m = m.replace(/\s*(?:es igual a|igual a|es|da|=)\s*(?=\d+\s*$|\d+\/\d+\s*$|\d+[.,]\d+\s*$)/g, ' = ');
  return m.replace(/\s+/g, ' ').trim();
}

/* ───────────── fracciones ───────────── */
class Fr {
  constructor(n, d = 1) { if (d < 0) { n = -n; d = -d; } this.n = n; this.d = d; }
  get simple() { const g = gcd(this.n, this.d); return new Fr(this.n / g, this.d / g); }
  get value() { return this.n / this.d; }
  get isInt() { return this.simple.d === 1; }
  eq(o) { return this.n * o.d === o.n * this.d; }
  toString() { const s = this.simple; return s.d === 1 ? String(s.n) : `${s.n}/${s.d}`; }
  raw() { return `${this.n}/${this.d}`; }
}
const parseFr = s => { const m = String(s).match(/^(\d+)\/(\d+)$/); return m ? new Fr(+m[1], +m[2]) : null; };
function mixed(f) { const s = f.simple; if (s.d === 1 || Math.abs(s.n) < s.d) return ''; const w = Math.trunc(s.n / s.d), r = Math.abs(s.n % s.d); return r ? `${w} entero${w === 1 ? '' : 's'} y ${r}/${s.d}` : ''; }

/* ───────────── explicaciones de operaciones ───────────── */
const DOT = '🍎';
function digitsOf(n) { return String(n).split('').reverse().map(Number); }
const PLACE = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil', 'millones'];

function explainSum(a, b) {
  const r = a + b;
  if (a <= 10 && b <= 10) {
    const count = []; for (let i = 1; i <= b; i++) count.push(a + i);
    return `${a} + ${b} = ${r} ✅\n\n${DOT.repeat(a)} + ${DOT.repeat(b)}\n\nEmpezamos en ${a} y contamos ${b} más: ${count.join(', ')}. ¡Llegamos a ${r}!`;
  }
  if (a < 10 || b < 10 || r < 20) {
    const big1 = Math.max(a, b), small = Math.min(a, b);
    return `${a} + ${b} = ${r} ✅\n\nTruco: empieza en el número grande (${big1}) y cuenta ${small} más hacia adelante. Llegas a ${r}.`;
  }
  const da = digitsOf(a), db = digitsOf(b), len = Math.max(da.length, db.length);
  let carry = 0; const steps = [];
  for (let i = 0; i < len; i++) {
    const x = da[i] || 0, y = db[i] || 0, s = x + y + carry;
    const extra = carry ? ` + ${carry} (que llevábamos)` : '';
    if (s >= 10) steps.push(`• ${cap(PLACE[i])}: ${x} + ${y}${extra} = ${s} → escribimos ${s % 10} y llevamos 1.`);
    else steps.push(`• ${cap(PLACE[i])}: ${x} + ${y}${extra} = ${s} → escribimos ${s}.`);
    carry = s >= 10 ? 1 : 0;
  }
  if (carry) steps.push(`• Al final bajamos el 1 que llevábamos.`);
  return `${big(a)} + ${big(b)} = ${big(r)} ✅\n\nLo hacemos en columnas, de derecha a izquierda:\n${steps.join('\n')}\n\nResultado: ${big(r)}.`;
}
function explainSub(a, b) {
  if (b > a) return `Con los números que usamos en primaria no podemos quitar ${b} si solo tenemos ${a}. 🤔\n¿Quizás querías ${b} − ${a}? Eso da ${b - a}.`;
  const r = a - b;
  if (a <= 20) {
    const back = []; for (let i = 1; i <= Math.min(b, 12); i++) back.push(a - i);
    return `${a} − ${b} = ${r} ✅\n\nTenemos ${a} y quitamos ${b}. Contamos hacia atrás desde ${a}: ${back.join(', ')}${b > 12 ? '…' : ''}.\n\n✔ Comprobamos: ${r} + ${b} = ${a}.`;
  }
  const da = digitsOf(a), db = digitsOf(b), steps = [];
  let borrow = 0;
  for (let i = 0; i < da.length; i++) {
    let x = da[i] - borrow; const y = db[i] || 0;
    if (i >= db.length && borrow === 0) { steps.push(`• ${cap(PLACE[i])}: bajamos el ${x}.`); continue; }
    if (i >= db.length && x >= 0) { if (x > 0 || i < da.length - 1) steps.push(`• ${cap(PLACE[i])}: después de prestar queda ${x}.`); borrow = 0; continue; }
    if (x < 0) {
      steps.push(`• ${cap(PLACE[i])}: aquí había un 0 que ya prestó, así que pedimos 1 a las ${PLACE[i + 1]}: queda 9. Ahora 9 − ${y} = ${9 - y}.`);
      borrow = 1; continue;
    }
    if (x < y) {
      steps.push(`• ${cap(PLACE[i])}: ${x} − ${y} no se puede, pedimos prestada 1 de las ${PLACE[i + 1]}: ${x + 10} − ${y} = ${x + 10 - y}.`);
      borrow = 1;
    } else {
      steps.push(`• ${cap(PLACE[i])}: ${x} − ${y} = ${x - y}${borrow ? ' (ya le quitamos el 1 que prestamos)' : ''}.`);
      borrow = 0;
    }
  }
  return `${big(a)} − ${big(b)} = ${big(r)} ✅\n\nEn columnas, de derecha a izquierda:\n${steps.join('\n')}\n\n✔ Comprobamos con una suma: ${big(r)} + ${big(b)} = ${big(a)}.`;
}
function explainMul(a, b) {
  const r = a * b;
  if (a === 0 || b === 0) return `${a} × ${b} = 0 ✅\n\nCualquier número multiplicado por 0 da 0: si tienes ${Math.max(a, b)} cajas vacías, ¡no tienes nada! 📦`;
  if (a === 1 || b === 1) return `${a} × ${b} = ${r} ✅\n\nMultiplicar por 1 deja el número igual.`;
  if (b <= 10 && a <= 12) {
    const rep = Array(b).fill(a).join(' + ');
    return `${a} × ${b} = ${r} ✅\n\nMultiplicar es sumar el mismo número varias veces:\n${rep} = ${r}\n\n(${b} grupos de ${a}). 💡 ${a} × ${b} es lo mismo que ${b} × ${a}.`;
  }
  if (a <= 10 && b <= 12) return explainMul(b, a);
  const [x, y] = a >= b ? [a, b] : [b, a];
  if (y < 10) {
    const parts = digitsOf(x).map((d, i) => d * 10 ** i).filter(Boolean).reverse();
    const prods = parts.map(p => p * y);
    return `${big(x)} × ${y} = ${big(r)} ✅\n\nSeparamos ${big(x)} en ${parts.map(big).join(' + ')} y multiplicamos cada parte por ${y}:\n${parts.map((p, i) => `• ${big(p)} × ${y} = ${big(prods[i])}`).join('\n')}\n\nSumamos: ${prods.map(big).join(' + ')} = ${big(r)}.`;
  }
  const parts = digitsOf(y).map((d, i) => d * 10 ** i).filter(Boolean).reverse();
  const prods = parts.map(p => p * x);
  return `${big(x)} × ${big(y)} = ${big(r)} ✅\n\nSeparamos ${big(y)} en ${parts.map(big).join(' + ')}:\n${parts.map((p, i) => `• ${big(x)} × ${big(p)} = ${big(prods[i])}`).join('\n')}\n\nSumamos los resultados: ${prods.map(big).join(' + ')} = ${big(r)}.`;
}
function explainDiv(a, b) {
  if (b === 0) return 'No se puede dividir entre 0. 🙅 Si repartes entre 0 amigos… ¡no hay a quién darle! Prueba con otro número.';
  const q = Math.floor(a / b), r = a % b;
  const head = r ? `${big(a)} ÷ ${b} = ${big(q)} y ${r === 1 ? 'sobra' : 'sobran'} ${r} ✅` : `${big(a)} ÷ ${b} = ${big(q)} ✅`;
  if (a <= 100 && b <= 10) {
    const body = r
      ? `Repartimos ${a} en ${b} grupos iguales: a cada grupo le tocan ${q} y ${r === 1 ? 'sobra' : 'sobran'} ${r}.\n\n✔ Comprobamos: ${b} × ${q} + ${r} = ${a}.`
      : `Repartimos ${a} en ${b} grupos iguales: a cada grupo le tocan ${q}.\n\n✔ Comprobamos: ${q} × ${b} = ${a}. ¡La división es lo contrario de la multiplicación!`;
    return `${head}\n\n${body}`;
  }
  /* división larga */
  const ds = String(a).split('').map(Number), steps = [];
  let cur = 0, started = false;
  for (let i = 0; i < ds.length; i++) {
    cur = cur * 10 + ds[i];
    if (!started && cur < b && i < ds.length - 1) continue;
    const qq = Math.floor(cur / b), rest = cur - qq * b;
    steps.push(`• ${started ? `Bajamos el ${ds[i]}: tenemos ${cur}. ` : `Tomamos ${cur}. `}${cur} ÷ ${b} = ${qq} (porque ${qq} × ${b} = ${qq * b}), sobran ${rest}.`);
    started = true; cur = rest;
  }
  return `${head}\n\nDivisión paso a paso:\n${steps.join('\n')}\n\n✔ Comprobamos: ${b} × ${big(q)}${r ? ` + ${r}` : ''} = ${big(a)}.`;
}
function explainFrac(x, op, y) {
  const show = f => f.raw();
  if (op === '+' || op === '-') {
    const sign = op === '+' ? '+' : '−', word = op === '+' ? 'Sumamos' : 'Restamos';
    let res;
    if (x.d === y.d) {
      res = new Fr(op === '+' ? x.n + y.n : x.n - y.n, x.d);
      if (res.n < 0) return `${show(x)} − ${show(y)} da un número negativo. En primaria restamos la fracción menor de la mayor: ${show(y)} − ${show(x)} = ${new Fr(y.n - x.n, x.d)}.`;
      const simp = res.simple, extra = (simp.n !== res.n ? `\nSimplificamos: ${res.raw()} = ${simp}.` : '') + (mixed(res) ? `\nEso es ${mixed(res)}.` : '');
      return `${show(x)} ${sign} ${show(y)} = ${simp} ✅\n\nTienen el mismo denominador (${x.d}), así que:\n• ${word} los numeradores: ${x.n} ${sign} ${y.n} = ${res.n}.\n• El denominador se queda igual: ${x.d}.${extra}`;
    }
    const m = lcm(x.d, y.d), xn = x.n * (m / x.d), yn = y.n * (m / y.d);
    res = new Fr(op === '+' ? xn + yn : xn - yn, m);
    if (res.n < 0) return `${show(x)} − ${show(y)} da un número negativo. En primaria restamos la fracción menor de la mayor.`;
    const simp = res.simple, extra = (simp.n !== res.n ? `\n• Simplificamos: ${res.raw()} = ${simp}.` : '') + (mixed(res) ? `\nEso es ${mixed(res)}.` : '');
    return `${show(x)} ${sign} ${show(y)} = ${simp} ✅\n\nLos denominadores son distintos, primero los igualamos:\n• Buscamos un denominador común: ${m}.\n• ${show(x)} = ${xn}/${m}   y   ${show(y)} = ${yn}/${m}\n• ${word} numeradores: ${xn} ${sign} ${yn} = ${res.n} → ${res.raw()}${extra}`;
  }
  if (op === '*') {
    const res = new Fr(x.n * y.n, x.d * y.d), simp = res.simple;
    return `${show(x)} × ${show(y)} = ${simp} ✅\n\n• Multiplicamos numeradores: ${x.n} × ${y.n} = ${res.n}.\n• Multiplicamos denominadores: ${x.d} × ${y.d} = ${res.d}.${simp.n !== res.n ? `\n• Simplificamos: ${res.raw()} = ${simp}.` : ''}`;
  }
  if (op === ':') {
    if (y.n === 0) return 'No se puede dividir entre 0. 🙅';
    const res = new Fr(x.n * y.d, x.d * y.n), simp = res.simple;
    return `${show(x)} ÷ ${show(y)} = ${simp} ✅\n\nPara dividir fracciones multiplicamos por la fracción "volteada" (${y.d}/${y.n}):\n• ${show(x)} × ${y.d}/${y.n} = ${res.raw()}${simp.n !== res.n ? ` = ${simp}` : ''}.${mixed(res) ? `\nEso es ${mixed(res)}.` : ''}`;
  }
  return '';
}
function explainFracOfNumber(f, n) {
  const r = n * f.n / f.d;
  return `${f.raw()} de ${n} = ${fmt(r)} ✅\n\n• Dividimos ${n} en ${f.d} partes iguales: ${n} ÷ ${f.d} = ${fmt(n / f.d)}.\n• Tomamos ${f.n} de esas partes: ${fmt(n / f.d)} × ${f.n} = ${fmt(r)}.`;
}

/* ───────────── evaluador de expresiones ───────────── */
function tokenize(m) {
  const re = /(\d+\/\d+|\d+(?:[.,]\d+)?|[+\-*:])/g, out = [];
  let t;
  while ((t = re.exec(m))) out.push(t[1]);
  return out;
}
function toFr(tok) { const f = parseFr(tok); if (f) return f; const v = parseFloat(tok.replace(',', '.')); if (Number.isInteger(v)) return new Fr(v, 1); const p = 1000; return new Fr(Math.round(v * p), p); }
function evalTokens(tokens) {
  /* precedencia: primero × y ÷, luego + y − */
  const vals = [toFr(tokens[0])], ops = [];
  for (let i = 1; i < tokens.length; i += 2) { ops.push(tokens[i]); vals.push(toFr(tokens[i + 1])); }
  const steps = [];
  let v = vals.slice(), o = ops.slice();
  for (let i = 0; i < o.length;) {
    if (o[i] === '*' || o[i] === ':') {
      const a = v[i], b = v[i + 1];
      if (o[i] === ':' && b.n === 0) return { error: 'div0' };
      const r = o[i] === '*' ? new Fr(a.n * b.n, a.d * b.d) : new Fr(a.n * b.d, a.d * b.n);
      steps.push(`${a} ${o[i] === '*' ? '×' : '÷'} ${b} = ${r}`);
      v.splice(i, 2, r); o.splice(i, 1);
    } else i++;
  }
  let acc = v[0];
  for (let i = 0; i < o.length; i++) {
    const b = v[i + 1], r = o[i] === '+' ? new Fr(acc.n * b.d + b.n * acc.d, acc.d * b.d) : new Fr(acc.n * b.d - b.n * acc.d, acc.d * b.d);
    steps.push(`${acc} ${o[i] === '+' ? '+' : '−'} ${b} = ${r}`);
    acc = r;
  }
  return { value: acc.simple, steps, hadMulDiv: ops.some(x => x === '*' || x === ':') && ops.some(x => x === '+' || x === '-') };
}
/* devuelve {expr, tokens, claimed} o null */
function findExpression(q) {
  const m = mathText(q);
  const re = /(\d+\/\d+|\d+(?:[.,]\d+)?)(\s*[+\-*:]\s*(\d+\/\d+|\d+(?:[.,]\d+)?))+(\s*=\s*(\d+\/\d+|\d+(?:[.,]\d+)?))?/;
  const hit = m.match(re);
  if (!hit) return null;
  const [lhs, rhs] = hit[0].split('=');
  return { tokens: tokenize(lhs), claimed: rhs ? rhs.trim() : null, text: m };
}
function explainExpression(tokens) {
  const hasFrac = tokens.some(t => t.includes('/'));
  const nums = tokens.filter((_, i) => i % 2 === 0), ops = tokens.filter((_, i) => i % 2 === 1);
  const allInt = nums.every(t => /^\d+$/.test(t));
  if (tokens.length === 3) {
    const op = ops[0];
    if (hasFrac) { const x = toFr(nums[0]), y = toFr(nums[1]); return { text: explainFrac(x, op, y), topic: 'fracciones' }; }
    if (allInt) {
      const a = +nums[0], b = +nums[1];
      if (op === '+') return { text: explainSum(a, b), topic: 'suma' };
      if (op === '-') return { text: explainSub(a, b), topic: 'resta' };
      if (op === '*') return { text: explainMul(a, b), topic: 'multiplicacion' };
      if (op === ':') return { text: explainDiv(a, b), topic: 'division' };
    }
  }
  const res = evalTokens(tokens);
  if (res.error) return { text: 'No se puede dividir entre 0. 🙅', topic: 'division' };
  const pretty = tokens.map(t => t === '*' ? '×' : t === ':' ? '÷' : t === '-' ? '−' : t).join(' ');
  const v = res.value;
  const tip = res.hadMulDiv ? '\n\n💡 Regla: primero se hacen las multiplicaciones y divisiones, después las sumas y restas.' : '';
  return { text: `${pretty} = ${v.d === 1 ? big(v.n) : v} ✅\n\nPaso a paso:\n${res.steps.map(s => '• ' + s).join('\n')}${tip}`, topic: ops.includes(':') ? 'division' : ops.includes('*') ? 'multiplicacion' : ops.includes('-') ? 'resta' : 'suma', value: v };
}
function valueOf(tokens) { const r = evalTokens(tokens); return r.error ? null : r.value; }
function parseAnswerNumber(raw) {
  const q = mathText(norm(raw));
  const f = q.match(/(\d+)\s*\/\s*(\d+)/); if (f) return new Fr(+f[1], +f[2]);
  const mx = q.match(/(\d+)\s+(?:enteros?\s+)?(?:y\s+)?(\d+)\/(\d+)/); if (mx) return new Fr(+mx[1] * +mx[3] + +mx[2], +mx[3]);
  const n = q.match(/-?\d+(?:[.,]\d+)?/); if (n) return toFr(n[0].replace('-', '')) && new Fr(Math.round(parseFloat(n[0].replace(',', '.')) * 1000), 1000).simple;
  return null;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const Core = { rnd, pick, shuffle, gcd, lcm, fmt, big, norm, has, hasWord, any, wordsToDigits, mathText, Fr, parseFr, mixed, readFraction,
  explainSum, explainSub, explainMul, explainDiv, explainFrac, explainFracOfNumber, findExpression, explainExpression, evalTokens, valueOf, tokenize, parseAnswerNumber, cap };
root.__TeoCore = Core;
})(typeof window !== 'undefined' ? window : globalThis);
/* Base de conocimiento de Teo — parte A (Primero y Segundo) */
(function (root) {
'use strict';
const T = root.__TeoTopics = root.__TeoTopics || [];

T.push({
  id: 'seres-vivos', grade: 'Primero', subject: 'Ciencias', topic: 'Los seres vivos',
  keys: ['ser vivo', 'seres vivos', 'vivo', 'vivos', 'no vivo', 'inerte', 'nace', 'crece', 'reproduc', 'muere', 'ciclo de vida', 'oviparo', 'viviparo', 'herbivor', 'carnivor', 'omnivor', 'hongo', 'respir', 'alimenta'],
  intro: 'Los seres vivos son los que nacen, crecen, se alimentan, respiran, se reproducen (tienen hijitos) y mueren. 🌱🐶\nLas personas, los animales, las plantas y los hongos son seres vivos. Una piedra, una silla o el agua NO son seres vivos: no nacen ni crecen.',
  simple: 'Fácil: si nace, come y crece → es un ser vivo. 🐥 Si no hace nada de eso (como una piedra 🪨) → no es un ser vivo.',
  points: ['Nacen, crecen, se reproducen y mueren.', 'Necesitan agua, aire, alimento y luz.', 'Grupos: animales, plantas, hongos y seres muy pequeñitos (microorganismos).'],
  facts: [
    { k: ['que es un ser vivo', 'que son los seres vivos', 'ser vivo es', 'que significa ser vivo'], a: 'Un ser vivo es todo lo que nace, crece, se alimenta, respira, se reproduce y muere. 🌱\nEjemplos: tú, un perro 🐶, un árbol 🌳, una flor 🌻 y un hongo 🍄.' },
    { k: ['caracteristic', 'que hacen los seres vivos', 'funciones', 'que tienen los seres vivos'], a: 'Los seres vivos hacen 5 cosas importantes:\n1. Nacen 🐣\n2. Crecen 📏\n3. Se alimentan 🍎\n4. Se reproducen (tienen crías o semillas) 👶\n5. Mueren.\nTambién respiran y sienten lo que pasa a su alrededor.' },
    { k: ['no vivo', 'no vivos', 'inerte', 'seres inertes', 'cosas sin vida'], a: 'Los seres no vivos (o inertes) no nacen, no crecen y no se alimentan. 🪨\nEjemplos: una piedra, el agua, el aire, una silla, un carro o un juguete.' },
    { k: ['que necesitan', 'necesitan', 'necesitan para vivir', 'necesita para vivir', 'para vivir'], a: 'Todos los seres vivos necesitan:\n💧 agua\n🌬️ aire\n🍎 alimento\n☀️ luz y calor del sol\nY un lugar adecuado para vivir.' },
    { k: ['grupos', 'clasific', 'tipos de seres vivos', 'reinos'], a: 'Los seres vivos se agrupan así:\n🐾 Animales: se mueven y comen otros seres.\n🌿 Plantas: fabrican su propio alimento con la luz del sol.\n🍄 Hongos: como los champiñones y el moho.\n🔬 Microorganismos: tan pequeñitos que solo se ven con microscopio.' },
    { k: ['herbivor', 'carnivor', 'omnivor', 'que comen los animales', 'segun lo que comen'], a: 'Según lo que comen, los animales son:\n🥬 Herbívoros: comen plantas (vaca, conejo, caballo).\n🥩 Carnívoros: comen otros animales (león, tigre, tiburón).\n🍽️ Omnívoros: comen plantas y animales (oso, cerdo, gallina y… ¡las personas!).' },
    { k: ['oviparo', 'viviparo', 'nacen de huevo', 'como nacen'], a: '🥚 Ovíparos: nacen de un huevo (gallina, tortuga, cocodrilo, peces).\n🤰 Vivíparos: crecen dentro de la barriga de su mamá (perro, vaca, ballena, personas).' },
    { k: ['como se mueven', 'desplaz', 'vuelan', 'nadan', 'se arrastran'], a: 'Los animales se mueven de muchas formas:\n🕊️ Vuelan: aves, mariposas.\n🐟 Nadan: peces, delfines.\n🐕 Caminan o corren: perro, caballo.\n🐍 Se arrastran: serpientes, gusanos.\n🐸 Saltan: ranas, canguros.' },
    { k: ['ciclo de vida'], a: 'El ciclo de vida es el camino de un ser vivo: nace 🐣 → crece 🐥 → se reproduce 🐔🥚 → muere. Luego sus crías empiezan otra vez el ciclo. 🔄' },
    { k: ['las plantas son seres vivos', 'planta es un ser vivo', 'plantas estan vivas', 'planta esta viva'], a: '¡Sí! 🌱 Las plantas son seres vivos: nacen de una semilla, crecen, se alimentan con la luz del sol, respiran, dan semillas para nuevas plantas y mueren.' },
    { k: ['respiran', 'respirar'], a: 'Todos los seres vivos respiran. 🌬️ Nosotros con los pulmones, los peces con las branquias y las plantas por sus hojas.' }
  ],
  examples: ['Un perro 🐶 nace, crece, come y tiene cachorros: es un ser vivo.', 'Un girasol 🌻 nace de una semilla y crece con el sol: es un ser vivo.', 'Una piedra 🪨 no nace ni crece: NO es un ser vivo.', 'Un hongo 🍄 crece en lugares húmedos: es un ser vivo.']
});

T.push({
  id: 'suma', grade: 'Primero', subject: 'Matemáticas', topic: 'Suma',
  keys: ['suma', 'sumar', 'sumas', 'sumo', 'sumando', 'adicion', 'agregar', 'juntar', 'en total', 'llevar', 'llevando', 'llevadas', 'signo mas', 'signo +'],
  intro: 'Sumar es juntar cantidades para saber cuánto hay en total. ➕\nEjemplo: si tienes 3 🍎 y te dan 2 🍎 más, ahora tienes 5 🍎. Se escribe 3 + 2 = 5.',
  simple: 'Sumar = juntar. 🤝 Pones todo en un solo grupo y cuentas cuántos hay.',
  points: ['El signo de la suma es +.', 'Los números que se suman se llaman sumandos y la respuesta se llama suma o total.', 'El orden no cambia el resultado: 2 + 5 = 5 + 2.'],
  facts: [
    { k: ['que es sumar', 'que es la suma', 'que es una suma', 'que significa sumar', 'para que sirve sumar', 'que es adicion'], a: 'Sumar es juntar dos o más cantidades para saber cuánto hay en total. ➕\nPor ejemplo: 4 🐟 + 3 🐟 = 7 🐟.\nUsamos la suma cuando agregamos, juntamos o nos regalan cosas.' },
    { k: ['partes de la suma', 'sumandos', 'como se llaman los numeros de la suma', 'terminos de la suma'], a: 'En 4 + 3 = 7:\n• 4 y 3 son los sumandos (los números que juntamos).\n• + es el signo de sumar.\n• 7 es el resultado, que se llama suma o total.' },
    { k: ['como se suma', 'como sumo', 'como sumar', 'como hago una suma', 'enseñame a sumar', 'ensename a sumar', 'como se hace una suma'], a: 'Para sumar números pequeños:\n1. Empieza en el número más grande.\n2. Cuenta hacia adelante la otra cantidad (puedes usar los dedos ✋).\nEj: 6 + 3 → 6… 7, 8, 9. ¡Da 9!\n\nPara números grandes, súmalos en columnas: primero las unidades, luego las decenas. Si en una columna pasas de 9, escribes las unidades y "llevas" 1 a la siguiente columna.' },
    { k: ['llevar', 'llevando', 'llevadas', 'me llevo', 'reagrup', 'suma llevando', 'sumar llevando', 'sumas llevando', 'como se suma llevando'], a: 'Sumar "llevando" pasa cuando una columna da 10 o más. 🧮\nEj: 27 + 15\n• Unidades: 7 + 5 = 12 → escribo 2 y llevo 1.\n• Decenas: 2 + 1 + 1 (el que llevaba) = 4.\nResultado: 42.' },
    { k: ['orden', 'conmutativ', 'cambiar el orden'], a: 'En la suma, el orden de los sumandos no cambia el resultado. 🔄\n3 + 5 = 8 y 5 + 3 = 8. A eso se le llama propiedad conmutativa.' },
    { k: ['sumar cero', 'mas cero', 'mas 0', '+ 0'], a: 'Si le sumas 0 a un número, el número queda igual. 0️⃣\n7 + 0 = 7.' },
    { k: ['signo de la suma', 'signo mas', 'simbolo de la suma'], a: 'El signo de la suma es +. Se lee "más". ➕' },
    { k: ['palabras', 'problemas de suma', 'cuando se suma', 'cuando uso la suma', 'cuando debo sumar'], a: 'En un problema, sumas cuando lees palabras como: en total, juntos, más, le regalan, compra, llegan, agrega. 🧩\nEj: "Ana tiene 5 lápices y compra 4. ¿Cuántos tiene en total?" → 5 + 4 = 9.' },
    { k: ['doble'], a: 'El doble de un número es sumarlo consigo mismo. ✌️ El doble de 6 es 6 + 6 = 12.' }
  ],
  examples: ['3 🐶 + 2 🐶 = 5 🐶', 'Tienes 6 canicas y te regalan 4: 6 + 4 = 10 canicas. 🔵', 'En el bus van 12 niños y suben 5: 12 + 5 = 17 niños. 🚌', '25 + 13 = 38 (unidades: 5 + 3 = 8; decenas: 2 + 1 = 3).']
});

T.push({
  id: 'abecedario', grade: 'Primero', subject: 'Lengua', topic: 'El abecedario',
  keys: ['abecedario', 'alfabeto', 'letra', 'letras', 'vocal', 'vocales', 'consonante', 'orden alfabetico', 'alfabeticamente', 'mayuscula', 'minuscula', 'abc'],
  intro: 'El abecedario es el conjunto ordenado de las letras que usamos para escribir. 🔤\nEn español tiene 27 letras: A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z.',
  simple: 'El abecedario son todas las letras en orden, desde la A hasta la Z. 🅰️➡️🆉 ¡La Ñ es nuestra letra especial!',
  points: ['Tiene 27 letras.', 'Hay 5 vocales: a, e, i, o, u.', 'Las otras 22 son consonantes.', 'Cada letra tiene mayúscula (A) y minúscula (a).'],
  facts: [
    { k: ['que es el abecedario', 'que es el alfabeto', 'que es abecedario'], a: 'El abecedario (o alfabeto) es el conjunto de letras que usamos para escribir, en un orden especial. 🔤\nEn español son 27 letras, de la A a la Z, ¡y tenemos la Ñ!' },
    { k: ['cuantas letras'], a: 'El abecedario español tiene 27 letras. 🔤\nA B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z' },
    { k: ['vocales', 'vocal'], a: 'Las vocales son 5: A, E, I, O, U. 🗣️\nSe pronuncian con la boca abierta, sin que la lengua o los labios cierren el paso del aire. Todas las palabras en español tienen al menos una vocal.' },
    { k: ['consonante'], a: 'Las consonantes son las letras que no son vocales: son 22. 🔡\nB C D F G H J K L M N Ñ P Q R S T V W X Y Z.\nCasi siempre necesitan una vocal para sonar: ma, pe, so.' },
    { k: ['mayuscula', 'minuscula'], a: 'Cada letra tiene dos formas:\n🔠 Mayúscula: A, B, C (grande).\n🔡 Minúscula: a, b, c (pequeña).\nUsamos mayúscula al empezar una oración y en los nombres propios: Sofía, Colombia, Cali.' },
    { k: ['orden alfabetico', 'ordenar alfabetic', 'para que sirve el abecedario'], a: 'El orden alfabético es ordenar palabras según su primera letra, siguiendo el abecedario. 📚\nEj: árbol, casa, mango, sol.\nSi empiezan igual, miramos la segunda letra: mamá, mesa, mono.\nTambién puedes escribirme "ordena: perro, gato, ardilla" y lo hago contigo.' },
    { k: ['ñ', 'letra especial', 'enie', 'eñe'], a: 'La Ñ es una letra que casi solo existe en español. 🇨🇴 Está entre la N y la O.\nPalabras con ñ: niño, piña, araña, sueño, montaña.' },
    { k: ['cancion', 'como aprender el abecedario', 'aprenderme el abecedario'], a: 'Un truco: canta el abecedario en grupitos 🎶\nA B C D E F G – H I J K L M N – Ñ O P – Q R S T – U V W X Y Z.\nY practica diciendo una palabra por cada letra: A de árbol, B de barco, C de casa…' }
  ],
  examples: ['A de avión ✈️', 'B de ballena 🐋', 'M de mariposa 🦋', 'Ñ de ñandú', 'S de sol ☀️', 'Z de zapato 👟']
});

T.push({
  id: 'colores', grade: 'Primero', subject: 'Inglés', topic: 'Los colores',
  keys: ['color', 'colores', 'colour', 'colors', 'rainbow', 'arcoiris', 'arco iris', 'primarios', 'secundarios', 'mezclar'],
  english: true,
  intro: 'Los colores en inglés 🌈\n🔴 red = rojo\n🔵 blue = azul\n🟡 yellow = amarillo\n🟢 green = verde\n🟠 orange = naranja\n🟣 purple = morado\n🩷 pink = rosado\n⚫ black = negro\n⚪ white = blanco\n🟤 brown = café\n🩶 gray = gris',
  simple: 'Cada color tiene su nombre en inglés: rojo es red 🔴, azul es blue 🔵, amarillo es yellow 🟡. ¡Pregúntame cualquiera!',
  points: ['Para preguntar el color: What color is it? (¿De qué color es?)', 'Respuesta: It is red. (Es rojo.)', 'En inglés el color va antes de la cosa: a red apple (una manzana roja).'],
  facts: [
    { k: ['primarios'], a: 'Los colores primarios son 3: 🔴 rojo (red), 🟡 amarillo (yellow) y 🔵 azul (blue).\nSe llaman así porque con ellos podemos formar muchos otros colores.' },
    { k: ['secundarios', 'mezcl'], a: 'Mezclando colores primarios salen los secundarios: 🎨\n🔴 + 🟡 = 🟠 naranja (orange)\n🔵 + 🟡 = 🟢 verde (green)\n🔴 + 🔵 = 🟣 morado (purple)\nY también: 🔴 + ⚪ = 🩷 rosado (pink), ⚫ + ⚪ = 🩶 gris (gray).' },
    { k: ['what color', 'como pregunto el color', 'como se pregunta', 'de que color es'], a: 'Para preguntar el color decimos: What color is it? 🎨 (¿De qué color es?)\nY respondemos: It is blue. (Es azul.)\nEj: What color is the sun? → It is yellow. ☀️' },
    { k: ['arcoiris', 'arco iris', 'rainbow'], a: 'El arcoíris (rainbow 🌈) tiene 7 colores: red, orange, yellow, green, blue, indigo (añil) y violet (violeta).' },
    { k: ['orden', 'manzana roja', 'red apple', 'antes'], a: 'En inglés el color va ANTES de la cosa: 🍎 a red apple = una manzana roja; 🚗 a blue car = un carro azul.' },
    { k: ['pronunc', 'como se lee', 'como se dice'], a: 'Así se pronuncian (más o menos) 🗣️:\nred → "red" · blue → "blu" · yellow → "iélou" · green → "grin" · orange → "órinch" · purple → "pérpol" · pink → "pink" · black → "blak" · white → "uáit" · brown → "bráun" · gray → "gréi".' }
  ],
  examples: ['The apple is red. 🍎 = La manzana es roja.', 'The sky is blue. 🌤️ = El cielo es azul.', 'The banana is yellow. 🍌 = El banano es amarillo.', 'The frog is green. 🐸 = La rana es verde.']
});

T.push({
  id: 'familia', grade: 'Primero', subject: 'Ciencias Sociales', topic: 'La familia',
  keys: ['familia', 'familias', 'mama', 'papa', 'hermano', 'hermana', 'abuel', 'tio', 'tia', 'primo', 'prima', 'sobrin', 'nieto', 'parentesco', 'arbol genealogico', 'padres', 'hijos', 'en casa', 'colaborar', 'hogar'],
  intro: 'La familia es el grupo de personas que nos quiere, nos cuida y vive o comparte con nosotros. 👨‍👩‍👧‍👦\nPuede estar formada por papá, mamá, hermanos, abuelos, tíos, primos… ¡Hay muchas clases de familias y todas son importantes!',
  simple: 'Tu familia son las personas que te cuidan y te quieren. 💛 Puede ser grande o pequeña.',
  points: ['Hay familias de muchas formas.', 'En la familia aprendemos valores: amor, respeto, ayuda.', 'Todos colaboramos con tareas en casa.'],
  facts: [
    { k: ['que es la familia', 'que es una familia', 'que es familia'], a: 'La familia es el grupo de personas que nos cuida, nos quiere y nos enseña. 👨‍👩‍👧\nEs el primer lugar donde aprendemos a compartir, a respetar y a ayudar.' },
    { k: ['tipos de familia', 'clases de familia', 'como son las familias', 'todas las familias'], a: 'Hay muchas clases de familias 💛\n• Con mamá, papá e hijos.\n• Con abuelos, tíos y primos viviendo juntos (familia extensa).\n• Con solo mamá o solo papá.\n• Con hijos de parejas anteriores.\n• Con abuelos que crían a los nietos.\nLo importante es el amor y el cuidado.' },
    { k: ['miembros', 'quienes forman', 'integrantes'], a: 'Los miembros de la familia pueden ser: papá, mamá, hijos (hermanos), abuelos, tíos, primos, sobrinos… 👵👴👨‍👩‍👧‍👦' },
    { k: ['arbol genealogico'], a: 'El árbol genealógico es un dibujo en forma de árbol 🌳 que muestra a los miembros de una familia: arriba los abuelos, en el medio los papás y tíos, y abajo los hijos y primos.' },
    { k: ['valores', 'deberes', 'tareas en casa', 'como ayudo', 'responsabilidad'], a: 'En la familia todos ayudamos 🧹🍽️: tender la cama, recoger los juguetes, poner la mesa, cuidar las mascotas.\nY practicamos valores: amor, respeto, honestidad y colaboración.' },
    { k: ['papa de mi papa', 'papa de mi mama', 'mama de mi papa', 'mama de mi mama'], a: 'El papá de tu papá o de tu mamá es tu abuelo 👴, y su mamá es tu abuela 👵.' },
    { k: ['hermano de mi papa', 'hermano de mi mama', 'hermana de mi papa', 'hermana de mi mama'], a: 'El hermano de tu papá o de tu mamá es tu tío 🧔, y la hermana es tu tía 👩.' },
    { k: ['hijo de mi tio', 'hija de mi tio', 'hijo de mi tia', 'hija de mi tia'], a: 'Los hijos de tus tíos son tus primos y primas. 🧒👧' },
    { k: ['hijo de mi hermano', 'hija de mi hermano', 'hijo de mi hermana', 'hija de mi hermana'], a: 'El hijo de tu hermano o hermana es tu sobrino 👶, y la hija es tu sobrina.' },
    { k: ['hijo de mi hijo', 'nieto', 'nieta'], a: 'Los hijos de los hijos son los nietos. 👵❤️👦 Tú eres nieto o nieta de tus abuelos.' }
  ],
  examples: ['La familia de Juan: su mamá, su abuela y su hermanita. 👩👵👧', 'La familia de Sara: papá, mamá, Sara y su perrito Max. 🐶', 'Todos ayudan: papá cocina, mamá lava, los niños recogen sus juguetes. 🧸']
});

/* ───────────── SEGUNDO ───────────── */
T.push({
  id: 'planta', grade: 'Segundo', subject: 'Ciencias', topic: 'Las partes de la planta',
  keys: ['planta', 'plantas', 'raiz', 'raices', 'tallo', 'hoja', 'hojas', 'flor', 'flores', 'fruto', 'frutos', 'semilla', 'semillas', 'fotosintesis', 'germin', 'polen', 'savia', 'clorofila'],
  intro: 'Las plantas tienen 6 partes 🌱:\n🟫 Raíz: la sostiene y toma agua del suelo.\n🟩 Tallo: la sostiene y lleva el agua a toda la planta.\n🍃 Hojas: fabrican el alimento con la luz del sol.\n🌸 Flor: sirve para que nazcan nuevas plantas.\n🍎 Fruto: protege las semillas.\n🌰 Semilla: de ella nace una planta nueva.',
  simple: 'Raíz abajo (toma agua) 🟫, tallo en el medio (sostiene) 🟩, hojas (hacen comida con el sol) 🍃, flor 🌸, fruto 🍎 y semilla 🌰.',
  points: ['Raíz: absorbe agua y sales minerales.', 'Tallo: transporta la savia.', 'Hojas: fotosíntesis.', 'Flor, fruto y semilla: reproducción.'],
  facts: [
    { k: ['partes de la planta', 'partes de una planta', 'partes tiene la planta'], a: 'Las partes de la planta son: raíz, tallo, hojas, flor, fruto y semilla. 🌱\nAbajo la raíz, luego el tallo, arriba las hojas y las flores; de la flor sale el fruto y dentro del fruto están las semillas.' },
    { k: ['raiz', 'raices'], a: 'La raíz 🟫 está bajo la tierra. Sirve para:\n• Sostener la planta para que no se caiga.\n• Absorber el agua y los minerales del suelo.\nAlgunas raíces nos las comemos: zanahoria 🥕, yuca, remolacha.' },
    { k: ['tallo'], a: 'El tallo 🟩 sostiene las hojas, flores y frutos, y lleva el agua y los alimentos (la savia) por toda la planta, como si fuera un tubo.\nEl tronco de un árbol es un tallo grande y duro. La caña de azúcar y el apio son tallos que comemos.' },
    { k: ['hoja', 'hojas', 'para que sirven las hojas'], a: 'Las hojas 🍃 son la "cocina" de la planta: con la luz del sol, el agua y el aire fabrican su alimento. Eso se llama fotosíntesis.\nTambién respiran y sueltan oxígeno, ¡el aire que nosotros respiramos!' },
    { k: ['fotosintesis', 'como se alimentan las plantas', 'como comen las plantas', 'que comen las plantas', 'clorofila'], a: 'La fotosíntesis es cómo las plantas fabrican su alimento ☀️🍃\nUsan: luz del sol + agua (que sube por la raíz) + aire (dióxido de carbono).\nLas hojas son verdes por la clorofila, que atrapa la luz. Y al final sueltan oxígeno, que nosotros respiramos. 😮‍💨' },
    { k: ['flor', 'flores', 'polen', 'polinizacion', 'abejas'], a: 'La flor 🌸 sirve para la reproducción: para que nazcan nuevas plantas.\nLas abejas y mariposas llevan el polen de una flor a otra (polinización) 🐝, y así se forman el fruto y las semillas.' },
    { k: ['fruto', 'frutos'], a: 'El fruto 🍎 se forma de la flor y protege a las semillas que tiene adentro.\nEjemplos: mango, naranja, tomate, aguacate, maracuyá.' },
    { k: ['semilla', 'germin', 'como nace una planta'], a: 'La semilla 🌰 guarda una plantita bebé. Cuando tiene agua, aire y calor, germina: se abre, sale la raíz, luego el tallito y las primeras hojas. 🌱\nEjemplos: frijol, maíz, semilla de girasol.' },
    { k: ['que necesitan las plantas', 'necesita una planta', 'cuidar una planta', 'cuidar las plantas'], a: 'Las plantas necesitan: 💧 agua, ☀️ luz del sol, 🌬️ aire y 🟫 tierra con nutrientes.\nPara cuidarlas: riégalas sin ahogarlas, ponlas donde les dé luz y no las arranques.' },
    { k: ['savia'], a: 'La savia es el líquido que corre por dentro del tallo llevando agua y alimento a toda la planta, como la sangre en nuestro cuerpo. 🩸🌿' }
  ],
  examples: ['🥕 La zanahoria es una raíz.', '🥬 La lechuga es hojas.', '🥦 El brócoli es flor.', '🍅 El tomate es un fruto.', '🫘 El frijol es una semilla.', '🥔 La papa es un tallo que crece bajo la tierra (tubérculo).']
});

T.push({
  id: 'resta', grade: 'Segundo', subject: 'Matemáticas', topic: 'Resta',
  keys: ['resta', 'restar', 'restas', 'resto', 'sustraccion', 'quitar', 'minuendo', 'sustraendo', 'diferencia', 'prestar', 'prestando', 'prestamos', 'signo menos', 'cuantos quedan', 'cuantas quedan'],
  intro: 'Restar es quitar una cantidad a otra para saber cuánto queda. ➖\nEj: tienes 7 🍪 y te comes 3: 7 − 3 = 4. ¡Te quedan 4 galletas!',
  simple: 'Restar = quitar. ✋ Tenías algo, quitas una parte y cuentas lo que queda.',
  points: ['El signo es − (menos).', 'Partes: minuendo − sustraendo = diferencia.', 'Para comprobar una resta, sumamos: diferencia + sustraendo = minuendo.'],
  facts: [
    { k: ['que es restar', 'que es la resta', 'que es una resta', 'que significa restar', 'que es sustraccion'], a: 'Restar es quitar una cantidad de otra para saber cuánto queda. ➖\nEj: 9 globos 🎈, se revientan 4 → 9 − 4 = 5 globos.\nTambién sirve para saber cuánto falta o cuál es la diferencia entre dos números.' },
    { k: ['partes de la resta', 'minuendo', 'sustraendo', 'terminos de la resta', 'diferencia'], a: 'En 9 − 4 = 5:\n• 9 es el minuendo (lo que tenía).\n• 4 es el sustraendo (lo que quito).\n• 5 es la diferencia (lo que queda).' },
    { k: ['como se resta', 'como resto', 'como restar', 'como hago una resta', 'enseñame a restar', 'ensename a restar', 'como se hace una resta'], a: 'Para restar números pequeños, empieza en el número grande y cuenta hacia atrás. 👇\nEj: 8 − 3 → 7, 6, 5. ¡Da 5!\n\nPara números grandes, resta en columnas desde las unidades. Si arriba hay un número más pequeño que abajo, pides prestada 1 decena (el número de arriba aumenta 10).' },
    { k: ['prestar', 'prestando', 'prestamos', 'pedir prestado', 'desagrup', 'resta prestando', 'restar prestando', 'como se presta', 'resta llevando', 'restas prestando'], a: 'Restar "prestando" pasa cuando el número de arriba es más pequeño. 🤝\nEj: 42 − 17\n• Unidades: 2 − 7 no se puede → pedimos 1 decena: 12 − 7 = 5.\n• Decenas: al 4 le quedó 3 → 3 − 1 = 2.\nResultado: 25. ✔ Comprobamos: 25 + 17 = 42.' },
    { k: ['comprobar', 'comprobacion', 'prueba de la resta'], a: 'Para comprobar una resta, sumamos la diferencia con el sustraendo y debe dar el minuendo. ✔\nEj: 15 − 6 = 9 → 9 + 6 = 15. ¡Está bien!' },
    { k: ['cuando se resta', 'cuando uso la resta', 'problemas de resta', 'palabras'], a: 'En un problema restas cuando lees: quedan, quitó, perdió, regaló, se comió, gastó, cuántos faltan o cuántos más. 🧩\nEj: "Había 10 pájaros y se fueron 4. ¿Cuántos quedan?" → 10 − 4 = 6.' },
    { k: ['restar cero', 'menos cero', 'menos 0'], a: 'Si a un número le restas 0, queda igual: 8 − 0 = 8. Y si restas un número a sí mismo da 0: 8 − 8 = 0. 0️⃣' },
    { k: ['signo de la resta', 'signo menos'], a: 'El signo de la resta es − y se lee "menos". ➖' }
  ],
  examples: ['10 🎈 − 3 🎈 = 7 🎈', 'Tenías 15 dulces y regalaste 6: 15 − 6 = 9 dulces. 🍬', 'Sofía tiene 9 años y Juan 6: la diferencia es 9 − 6 = 3 años.', '54 − 21 = 33 (unidades: 4 − 1 = 3; decenas: 5 − 2 = 3).']
});

T.push({
  id: 'sustantivos', grade: 'Segundo', subject: 'Lengua', topic: 'Sustantivos',
  keys: ['sustantivo', 'sustantivos', 'nombre comun', 'nombres comunes', 'nombre propio', 'nombres propios', 'comun', 'propio', 'propios', 'colectivo', 'colectivos', 'singular', 'plural', 'masculino', 'femenino', 'genero', 'numero gramatical'],
  intro: 'Los sustantivos son las palabras que sirven para nombrar personas, animales, cosas, lugares y sentimientos. 🏷️\nEj: niña, perro, mesa, parque, alegría.',
  simple: 'Sustantivo = la palabra que le pone nombre a algo. 🏷️ Si puedes decir "el" o "la" antes, ¡seguro es un sustantivo! (el perro, la casa).',
  points: ['Comunes (perro, ciudad) y propios (Max, Bogotá, con mayúscula).', 'Tienen género: masculino (el gato) o femenino (la gata).', 'Tienen número: singular (flor) o plural (flores).', 'Colectivos: nombran un grupo (rebaño, enjambre).'],
  facts: [
    { k: ['que es un sustantivo', 'que son los sustantivos', 'que es sustantivo', 'para que sirven los sustantivos'], a: 'Un sustantivo es una palabra que nombra personas, animales, cosas, lugares o sentimientos. 🏷️\n👧 niña · 🐶 perro · 🪑 silla · 🏞️ río · 😊 alegría' },
    { k: ['comun', 'comunes', 'propio', 'propios'], a: 'Hay dos clases principales:\n🔹 Comunes: nombran cualquier cosa de un grupo, en minúscula: perro, niño, ciudad, río.\n🔸 Propios: nombran a uno en especial y van con MAYÚSCULA: Max, Valentina, Bogotá, Río Magdalena.' },
    { k: ['genero', 'masculino', 'femenino'], a: 'Los sustantivos tienen género:\n♂️ Masculino: usan "el" o "un" → el niño, el gato.\n♀️ Femenino: usan "la" o "una" → la niña, la gata.\nAlgunos cambian toda la palabra: caballo → yegua, toro → vaca.' },
    { k: ['singular', 'plural', 'numero'], a: 'Los sustantivos tienen número:\n1️⃣ Singular: uno solo → flor, lápiz, casa.\n🔢 Plural: varios → flores, lápices, casas.\nRegla: si termina en vocal, agregas -s (casa → casas); en consonante, -es (flor → flores); si termina en z, cambia a -ces (lápiz → lápices).\nTambién puedes preguntarme "¿cuál es el plural de pez?"' },
    { k: ['colectivo', 'colectivos'], a: 'Los sustantivos colectivos nombran a un grupo en singular 👥\n🐑 rebaño (ovejas) · 🐝 enjambre (abejas) · 🐟 cardumen (peces) · 🐺 jauría (perros) · 🌳 bosque (árboles) · 📚 biblioteca (libros) · 🎻 orquesta (músicos) · 🐘 manada (elefantes).' },
    { k: ['como se si es sustantivo', 'como saber si es sustantivo', 'como reconocer'], a: 'Truco 🕵️: ponle "el", "la", "un" o "una" adelante. Si suena bien, es un sustantivo.\n"el perro" ✅ · "la mesa" ✅ · "el correr"… ese es un verbo usado como nombre. "el bonito" ❌ (bonito es adjetivo).' }
  ],
  examples: ['Persona: maestra 👩‍🏫', 'Animal: tortuga 🐢', 'Cosa: cuaderno 📒', 'Lugar: Cartagena 🏖️ (propio)', 'Sentimiento: amistad 🤝']
});

T.push({
  id: 'animales-en', grade: 'Segundo', subject: 'Inglés', topic: 'Los animales',
  keys: ['animal', 'animales', 'animals', 'pet', 'pets', 'mascota', 'mascotas', 'farm', 'granja', 'salvaje', 'wild'],
  english: true,
  intro: 'Los animales en inglés 🐾\n🐶 dog = perro · 🐱 cat = gato · 🐦 bird = pájaro · 🐟 fish = pez · 🐮 cow = vaca · 🐴 horse = caballo · 🐷 pig = cerdo · 🐔 hen = gallina · 🦆 duck = pato · 🐑 sheep = oveja · 🐰 rabbit = conejo · 🐭 mouse = ratón · 🦁 lion = león · 🐯 tiger = tigre · 🐘 elephant = elefante · 🐒 monkey = mono · 🦒 giraffe = jirafa · 🐻 bear = oso · 🐍 snake = serpiente · 🐸 frog = rana · 🐢 turtle = tortuga · 🦋 butterfly = mariposa',
  simple: 'Cada animal tiene su nombre en inglés: perro es dog 🐶, gato es cat 🐱. ¡Pregúntame por cualquier animal!',
  points: ['Farm animals (de granja): cow, horse, pig, hen, sheep.', 'Wild animals (salvajes): lion, tiger, elephant, monkey.', 'Pets (mascotas): dog, cat, fish, rabbit.'],
  facts: [
    { k: ['granja', 'farm'], a: 'Animales de granja (farm animals) 🚜\n🐮 cow · 🐴 horse · 🐷 pig · 🐔 hen · 🐓 rooster (gallo) · 🦆 duck · 🐑 sheep · 🐐 goat (cabra) · 🫏 donkey (burro)' },
    { k: ['salvaje', 'wild', 'selva', 'jungle'], a: 'Animales salvajes (wild animals) 🌴\n🦁 lion · 🐯 tiger · 🐘 elephant · 🐒 monkey · 🦒 giraffe · 🦓 zebra · 🐻 bear · 🐍 snake · 🐊 crocodile · 🦜 parrot (loro) · 🐆 jaguar' },
    { k: ['mascota', 'pet'], a: 'Mascotas (pets) 🏠\n🐶 dog · 🐱 cat · 🐟 fish · 🐰 rabbit · 🐹 hamster · 🐢 turtle · 🦜 parrot' },
    { k: ['mar', 'sea', 'acuatic'], a: 'Animales del mar (sea animals) 🌊\n🐬 dolphin (delfín) · 🐋 whale (ballena) · 🦈 shark (tiburón) · 🐙 octopus (pulpo) · 🦀 crab (cangrejo) · ⭐ starfish (estrella de mar) · 🐢 sea turtle' },
    { k: ['sonido', 'hacen', 'says', 'dice el'], a: 'Los sonidos de los animales en inglés 🔊\n🐶 The dog says "woof!" · 🐱 The cat says "meow!" · 🐮 The cow says "moo!" · 🦆 The duck says "quack!" · 🐷 The pig says "oink!" · 🐑 The sheep says "baa!"' },
    { k: ['i have a', 'como digo tengo', 'oracion'], a: 'Puedes decir 🗣️:\nI have a dog. = Tengo un perro.\nI like cats. = Me gustan los gatos.\nThe lion is big. = El león es grande.\nThe mouse is small. = El ratón es pequeño.' }
  ],
  examples: ['I have a cat. 🐱 = Tengo un gato.', 'The elephant is big. 🐘 = El elefante es grande.', 'The bird can fly. 🐦 = El pájaro puede volar.', 'The fish can swim. 🐟 = El pez puede nadar.']
});

T.push({
  id: 'comunidad', grade: 'Segundo', subject: 'Ciencias Sociales', topic: 'La comunidad',
  keys: ['comunidad', 'comunidades', 'barrio', 'vecino', 'vecinos', 'vereda', 'oficio', 'oficios', 'profesion', 'profesiones', 'trabajador', 'convivencia', 'normas', 'servidor', 'bombero', 'policia', 'medico', 'enfermer', 'panadero', 'cartero', 'campesino', 'agricultor', 'recolector', 'carpintero', 'profesor', 'maestro', 'veterinario', 'odontologo', 'conductor', 'pescador', 'enfermo', 'cultiva', 'campo', 'estudiar', 'escuela', 'colegio', 'hospital', 'parque'],
  intro: 'Una comunidad es un grupo de personas que viven en el mismo lugar o comparten algo, y se ayudan entre sí. 🏘️\nTu familia, tu colegio y tu barrio o vereda son comunidades.',
  simple: 'Comunidad = personas que viven cerca o comparten algo y se ayudan. 🤝',
  points: ['Tipos: familiar, escolar, barrio o vereda.', 'En la comunidad hay personas con distintos oficios que nos ayudan.', 'Las normas de convivencia nos ayudan a vivir en paz.'],
  facts: [
    { k: ['que es una comunidad', 'que es la comunidad', 'que es comunidad'], a: 'Una comunidad es un grupo de personas que viven en un mismo lugar o comparten intereses, y se ayudan entre sí. 🏘️🤝\nEjemplos: tu familia, tu escuela, tu barrio o tu vereda.' },
    { k: ['tipos de comunidad', 'clases de comunidad', 'comunidades hay'], a: 'Algunas comunidades son 🏡🏫🏘️\n• Familiar: tu familia.\n• Escolar: estudiantes, profes y directivos del colegio.\n• Barrio o vereda: los vecinos.\n• Urbana (en la ciudad) y rural (en el campo).' },
    { k: ['normas', 'convivencia', 'reglas'], a: 'Las normas de convivencia son acuerdos para vivir en paz 🕊️\n• Saludar y pedir el favor.\n• Respetar el turno.\n• Botar la basura en su lugar.\n• Cuidar los parques y lugares de todos.\n• Escuchar y no pelear.' },
    { k: ['lugares de la comunidad', 'lugares del barrio', 'sitios'], a: 'Lugares de la comunidad 🏥🏫🌳\nHospital o puesto de salud, escuela, parque, estación de policía, estación de bomberos, tienda, plaza de mercado, iglesia, biblioteca.' },
    { k: ['oficio', 'oficios', 'profesion', 'trabajadores', 'servidores'], a: 'En la comunidad hay personas que nos ayudan con su trabajo 👷\n👩‍⚕️ médicos · 👮 policías · 🧑‍🚒 bomberos · 👩‍🏫 profesores · 🧑‍🌾 campesinos · 🧑‍🍳 panaderos · 📮 carteros · 🚛 recolectores de basura.\nPregúntame "¿qué hace un bombero?" y te cuento.' }
  ],
  examples: ['El barrio donde vives es una comunidad. 🏘️', 'Tu salón de clase es una comunidad escolar. 🏫', 'En la vereda, los vecinos se ayudan a recoger la cosecha. 🌽']
});
})(typeof window !== 'undefined' ? window : globalThis);
/* Base de conocimiento de Teo — parte B (Tercero, Cuarto y Quinto) */
(function (root) {
'use strict';
const T = root.__TeoTopics = root.__TeoTopics || [];

/* ───────────── TERCERO ───────────── */
T.push({
  id: 'ecosistemas', grade: 'Tercero', subject: 'Ciencias', topic: 'Los ecosistemas',
  keys: ['ecosistema', 'ecosistemas', 'cadena alimenticia', 'cadena alimentaria', 'red alimentaria', 'productor', 'productores', 'consumidor', 'consumidores', 'descomponedor', 'biotico', 'abiotico', 'habitat', 'paramo', 'selva', 'desierto', 'manglar', 'humedal', 'bosque', 'sabana', 'frailejon', 'adaptacion', 'medio ambiente', 'biodiversidad'],
  intro: 'Un ecosistema es un lugar donde viven juntos seres vivos (plantas, animales, hongos) y cosas sin vida (agua, suelo, aire, luz), y todos se relacionan. 🌳🐸💧\nEj: un río, un bosque, un páramo o el mar.',
  simple: 'Ecosistema = un lugar + los seres vivos que viven ahí + el agua, el aire y el suelo. Todos se necesitan. 🌍',
  points: ['Factores bióticos: los seres vivos.', 'Factores abióticos: agua, aire, luz, suelo, temperatura.', 'Terrestres (bosque, desierto, páramo) y acuáticos (río, mar, lago).', 'Cadena alimentaria: productores → consumidores → descomponedores.'],
  facts: [
    { k: ['que es un ecosistema', 'que son los ecosistemas', 'que es ecosistema'], a: 'Un ecosistema es un lugar donde los seres vivos y las cosas sin vida (agua, suelo, aire, luz) viven juntos y se relacionan. 🌳💧☀️\nEj: en una laguna viven peces, ranas y plantas, que necesitan el agua, el sol y el barro.' },
    { k: ['biotico', 'abiotico', 'factores', 'elementos de un ecosistema', 'componentes'], a: 'Un ecosistema tiene dos tipos de factores:\n🐸 Bióticos: todo lo que tiene vida (plantas, animales, hongos, bacterias).\n🪨 Abióticos: lo que no tiene vida (agua, aire, suelo, luz del sol, temperatura).' },
    { k: ['tipos de ecosistema', 'clases de ecosistema', 'terrestre', 'acuatico'], a: 'Hay dos grandes tipos de ecosistemas:\n🌲 Terrestres: bosque, selva, desierto, páramo, sabana.\n🌊 Acuáticos: de agua dulce (ríos, lagos, lagunas) y de agua salada (mares, océanos). Los manglares mezclan agua dulce y salada.' },
    { k: ['cadena alimenticia', 'cadena alimentaria', 'red alimentaria', 'quien se come'], a: 'La cadena alimentaria muestra quién se come a quién 🔗\n🌿 Productores: las plantas, hacen su propio alimento con el sol.\n🐛 Consumidores primarios: herbívoros que comen plantas.\n🐦 Consumidores secundarios: comen a los herbívoros.\n🍄 Descomponedores: hongos y bacterias que transforman los restos en abono.\nEj: pasto → saltamontes → rana → serpiente → águila.' },
    { k: ['productor', 'productores'], a: 'Los productores son los seres que fabrican su propio alimento con la luz del sol: las plantas y las algas. 🌿☀️ Son el comienzo de toda cadena alimentaria.' },
    { k: ['consumidor', 'consumidores'], a: 'Los consumidores no fabrican su alimento, se lo comen 🍽️\n• Primarios: comen plantas (conejo, vaca).\n• Secundarios: comen herbívoros (zorro, rana).\n• Terciarios: comen a otros carnívoros (águila, jaguar).' },
    { k: ['descomponedor'], a: 'Los descomponedores (hongos 🍄 y bacterias) se alimentan de restos de seres muertos y los convierten en abono para el suelo. ¡Son los recicladores de la naturaleza! ♻️' },
    { k: ['paramo', 'frailejon'], a: 'El páramo es un ecosistema frío de las montañas altas de Colombia 🏔️. Allí viven los frailejones, plantas peludas que guardan el agua como esponjas. Los páramos son "fábricas de agua": de ellos nacen muchos ríos que llevan agua a las ciudades. 💧' },
    { k: ['selva', 'amazon'], a: 'La selva 🌴 es un ecosistema caliente y lluvioso, con muchísimos árboles y animales: monos, jaguares, guacamayas, ranas de colores. La selva amazónica es la más grande del mundo y una parte está en Colombia.' },
    { k: ['desierto'], a: 'El desierto 🏜️ es muy seco: casi no llueve. Sus plantas, como los cactus, guardan agua. En Colombia está el desierto de La Guajira y el desierto de la Tatacoa (Huila).' },
    { k: ['manglar'], a: 'El manglar 🌿🌊 es un ecosistema en las costas, donde el agua del río se mezcla con la del mar. Los mangles tienen raíces largas fuera del agua, y allí nacen y se protegen muchos peces, cangrejos y aves.' },
    { k: ['cuidar', 'proteger', 'contamina', 'como ayudo al medio ambiente'], a: 'Podemos cuidar los ecosistemas 🌍💚\n• No botar basura en ríos ni bosques.\n• Ahorrar agua y energía.\n• Reciclar y reutilizar.\n• Sembrar árboles.\n• No cazar ni comprar animales silvestres.' },
    { k: ['adaptacion', 'se adaptan'], a: 'La adaptación es cómo los seres vivos tienen características para vivir en su ecosistema 🐫\nEj: el cactus guarda agua en el desierto; el pez tiene branquias para respirar en el agua; el oso polar tiene pelo grueso para el frío.' }
  ],
  examples: ['Un río: peces, ranas, plantas acuáticas, agua y piedras. 🏞️', 'Cadena: pasto 🌱 → vaca 🐄 → personas 🧑', 'Un páramo: frailejones, osos de anteojos, frío y neblina. 🏔️']
});

T.push({
  id: 'multiplicacion', grade: 'Tercero', subject: 'Matemáticas', topic: 'Multiplicación',
  keys: ['multiplic', 'tabla del', 'tablas de multiplicar', 'tablas', 'factores', 'producto', 'veces', 'por cuanto', 'doble', 'triple'],
  intro: 'Multiplicar es una forma rápida de sumar el mismo número varias veces. ✖️\nEj: 3 bolsas con 4 dulces cada una → 4 + 4 + 4 = 12, o sea 3 × 4 = 12. 🍬',
  simple: 'Multiplicar = sumar grupos iguales. 3 × 4 son 3 grupos de 4. 🧺🧺🧺',
  points: ['El signo es × (por).', 'Los números se llaman factores; el resultado, producto.', 'El orden no cambia el producto: 3 × 4 = 4 × 3.', 'Todo número por 0 da 0 y por 1 da el mismo número.'],
  facts: [
    { k: ['que es multiplicar', 'que es la multiplicacion', 'que es una multiplicacion', 'que significa multiplicar', 'para que sirve multiplicar'], a: 'Multiplicar es sumar el mismo número varias veces, ¡pero más rápido! ✖️\n5 × 3 = 5 + 5 + 5 = 15.\nLa usamos cuando hay grupos iguales: 4 mesas con 6 sillas cada una → 4 × 6 = 24 sillas.' },
    { k: ['partes de la multiplicacion', 'factores', 'producto', 'terminos de la multiplicacion'], a: 'En 6 × 4 = 24:\n• 6 y 4 son los factores.\n• × es el signo "por".\n• 24 es el producto (el resultado).' },
    { k: ['como se multiplica', 'como multiplico', 'como multiplicar', 'enseñame a multiplicar', 'ensename a multiplicar', 'como se hace una multiplicacion'], a: 'Para multiplicar:\n1. Si son números pequeños, usa la tabla de multiplicar o suma el número varias veces.\n2. Si un número es grande, sepáralo: 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.\nEscríbeme cualquier multiplicación y la resolvemos juntos paso a paso. 💪' },
    { k: ['conmutativ', 'orden'], a: 'En la multiplicación el orden de los factores no cambia el producto 🔄: 3 × 7 = 21 y 7 × 3 = 21. ¡Así solo tienes que aprenderte la mitad de las tablas!' },
    { k: ['por cero', 'por 0', 'x 0'], a: 'Todo número multiplicado por 0 da 0. 0️⃣ 9 × 0 = 0 (9 grupos vacíos no tienen nada).' },
    { k: ['por uno', 'por 1'], a: 'Todo número multiplicado por 1 da el mismo número: 9 × 1 = 9. 1️⃣' },
    { k: ['por 10', 'por diez', 'por 100', 'por cien'], a: 'Multiplicar por 10 es muy fácil: le agregas un 0 al número. 23 × 10 = 230. 🔟\nPor 100 le agregas dos ceros: 23 × 100 = 2.300.' },
    { k: ['truco', 'aprender las tablas', 'aprenderme las tablas', 'memorizar'], a: 'Trucos para las tablas 🧠\n• Tabla del 2: es el doble.\n• Tabla del 5: termina en 0 o 5.\n• Tabla del 10: agrega un 0.\n• Tabla del 9: con los dedos ✋✋: baja el dedo del número y cuenta los de la izquierda (decenas) y la derecha (unidades). 9 × 3 → 2 y 7 = 27.\n• Practica un poquito cada día. Escríbeme "tabla del 7" y te la muestro.' },
    { k: ['doble'], a: 'El doble es multiplicar por 2: el doble de 8 es 8 × 2 = 16. ✌️' },
    { k: ['triple'], a: 'El triple es multiplicar por 3: el triple de 5 es 5 × 3 = 15. 🔺' },
    { k: ['problemas de multiplicacion', 'cuando se multiplica', 'cuando uso la multiplicacion'], a: 'Multiplicas cuando hay grupos iguales: "cada caja tiene…", "cada niño recibe… y son…", "veces". 🧩\nEj: "Hay 5 cajas con 8 lápices cada una. ¿Cuántos lápices hay?" → 5 × 8 = 40.' }
  ],
  examples: ['4 × 3 = 12 → 4 + 4 + 4 🍪', '6 bolsas con 5 canicas: 6 × 5 = 30 canicas.', 'Una araña tiene 8 patas; 3 arañas: 3 × 8 = 24 patas 🕷️', '12 × 3 = 36 (10 × 3 = 30 y 2 × 3 = 6)']
});

T.push({
  id: 'cuento', grade: 'Tercero', subject: 'Lengua', topic: 'El cuento',
  keys: ['cuento', 'cuentos', 'historia', 'narracion', 'inicio', 'nudo', 'desenlace', 'personaje', 'personajes', 'narrador', 'fabula', 'moraleja', 'habia una vez', 'inventa', 'escribir un cuento'],
  intro: 'El cuento es una historia corta e imaginaria contada por un narrador, con personajes que viven aventuras. 📖✨\nTiene 3 partes: inicio, nudo y desenlace.',
  simple: 'Un cuento es una historia corta: empieza (inicio), pasa un problema (nudo) y se soluciona (desenlace). 📚',
  points: ['Partes: inicio, nudo, desenlace.', 'Elementos: personajes, lugar, tiempo y narrador.', 'Suele empezar con "Había una vez…".'],
  facts: [
    { k: ['que es un cuento', 'que es el cuento', 'que son los cuentos'], a: 'Un cuento es una narración corta, casi siempre imaginaria, donde unos personajes viven una aventura o un problema. 📖\nLo cuenta un narrador y tiene inicio, nudo y desenlace.' },
    { k: ['partes del cuento', 'partes de un cuento', 'estructura', 'inicio', 'nudo', 'desenlace'], a: 'Las partes del cuento son 3 📚\n1️⃣ Inicio: presenta a los personajes, el lugar y el tiempo. ("Había una vez…")\n2️⃣ Nudo: aparece el problema o la aventura. ("Un día…")\n3️⃣ Desenlace: el problema se resuelve y termina la historia. ("Y desde entonces…")' },
    { k: ['elementos', 'personaje', 'personajes', 'narrador', 'ambiente', 'lugar'], a: 'Elementos del cuento 🎭\n• Personajes: quienes viven la historia (principal y secundarios).\n• Lugar: dónde pasa (un bosque, un castillo, una vereda).\n• Tiempo: cuándo pasa (hace mucho, un día de lluvia).\n• Narrador: quien cuenta la historia.' },
    { k: ['tipos de cuento', 'clases de cuento'], a: 'Algunos tipos de cuento 📚\n🧚 De hadas: con magia, princesas, dragones.\n🦊 Fábulas: los animales hablan y dejan una enseñanza (moraleja).\n🚀 De aventuras o de ciencia ficción.\n👻 De misterio o de miedo.' },
    { k: ['fabula', 'moraleja'], a: 'La fábula es un cuento corto con animales que hablan y que deja una enseñanza llamada moraleja. 🐢🐇\nEj: "La liebre y la tortuga": la liebre se confió y la tortuga, paso a paso, ganó la carrera. Moraleja: la constancia vale más que la rapidez.' },
    { k: ['como escribir', 'como hago un cuento', 'como se escribe un cuento', 'pasos'], a: 'Para escribir tu cuento ✍️\n1. Elige un personaje (¿un jaguar? ¿una niña?).\n2. Decide dónde y cuándo pasa.\n3. Inicio: preséntalo.\n4. Nudo: inventa un problema.\n5. Desenlace: cuenta cómo lo resuelve.\n6. Ponle un título bonito.\n¿Quieres que inventemos uno? Escríbeme "inventa un cuento".' },
    { k: ['conectores', 'palabras para contar'], a: 'Palabras para unir las partes del cuento 🔗\nInicio: Había una vez, Hace mucho tiempo…\nNudo: Un día, De repente, Entonces…\nDesenlace: Finalmente, Al final, Desde aquel día…' }
  ],
  examples: ['Inicio: Había una vez un jaguar llamado Teo que vivía en la selva. 🐆', 'Nudo: Un día, el río se secó y los animales no tenían agua.', 'Desenlace: Teo guió a todos hasta una cascada escondida y desde entonces compartieron el agua. 💧']
});

T.push({
  id: 'numeros-en', grade: 'Tercero', subject: 'Inglés', topic: 'Los números',
  keys: ['numeros en ingles', 'number', 'numbers', 'contar en ingles', 'one', 'two', 'three', 'twenty', 'hundred', 'how many'],
  english: true,
  intro: 'Los números en inglés 🔢\n1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten\n11 eleven · 12 twelve · 13 thirteen · 14 fourteen · 15 fifteen · 16 sixteen · 17 seventeen · 18 eighteen · 19 nineteen · 20 twenty',
  simple: 'Pregúntame "¿cómo se dice 37 en inglés?" y te lo digo. 🔢 Del 13 al 19 terminan en -teen; las decenas (20, 30…) en -ty.',
  points: ['13–19 terminan en -teen.', 'Decenas: twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety.', 'Se unen con guion: 21 = twenty-one.', 'How many? = ¿Cuántos?'],
  facts: [
    { k: ['decenas', 'twenty', 'thirty', 'de diez en diez'], a: 'Las decenas en inglés 🔟\n10 ten · 20 twenty · 30 thirty · 40 forty · 50 fifty · 60 sixty · 70 seventy · 80 eighty · 90 ninety · 100 one hundred' },
    { k: ['teen', 'trece', 'del 13'], a: 'Del 13 al 19 terminan en -teen 🧒\n13 thirteen · 14 fourteen · 15 fifteen · 16 sixteen · 17 seventeen · 18 eighteen · 19 nineteen' },
    { k: ['how many', 'cuantos en ingles', 'como pregunto cuantos'], a: 'Para preguntar la cantidad decimos How many…? (¿Cuántos?) ❓\nHow many apples? → Five apples. 🍎🍎🍎🍎🍎\nHow old are you? → I am eight. (Tengo 8 años.)' },
    { k: ['guion', 'como se forman', 'veintiuno'], a: 'Para los números entre decenas usamos guion: decena-unidad.\n21 twenty-one · 35 thirty-five · 48 forty-eight · 99 ninety-nine.' },
    { k: ['how old', 'edad', 'años'], a: 'Para decir tu edad: I am nine years old. 🎂 (Tengo nueve años.) Y para preguntar: How old are you?' }
  ],
  examples: ['I have three cats. 🐱🐱🐱 = Tengo tres gatos.', 'I am eight years old. 🎂 = Tengo ocho años.', 'There are twelve months in a year. 📅']
});

T.push({
  id: 'municipio', grade: 'Tercero', subject: 'Ciencias Sociales', topic: 'El municipio',
  keys: ['municipio', 'municipios', 'alcalde', 'alcaldia', 'concejo', 'concejal', 'personero', 'cabecera', 'vereda', 'veredas', 'corregimiento', 'zona urbana', 'zona rural', 'simbolos', 'escudo', 'bandera', 'himno', 'departamento', 'gobernador', 'servicios publicos'],
  intro: 'El municipio es un territorio donde vive una comunidad, con su propio gobierno, dentro de un departamento. 🏛️\nTiene una zona urbana (el pueblo o la ciudad) y una zona rural (el campo, con veredas y corregimientos). Lo gobierna el alcalde junto con el concejo municipal.',
  simple: 'Tu municipio es tu pueblo o ciudad y el campo que lo rodea. 🏘️🌾 El alcalde es quien lo dirige.',
  points: ['Colombia tiene 32 departamentos y más de 1.100 municipios.', 'Gobierno: alcalde (elegido cada 4 años) y concejo municipal.', 'Zona urbana (cabecera) y rural (veredas, corregimientos).', 'Símbolos: bandera, escudo e himno.'],
  facts: [
    { k: ['que es un municipio', 'que es el municipio', 'que es municipio'], a: 'Un municipio es un territorio con su propio gobierno, donde vive una comunidad. 🏛️\nForma parte de un departamento. Tiene una cabecera (zona urbana) y un campo (zona rural).' },
    { k: ['alcalde', 'alcaldia', 'quien gobierna'], a: 'El alcalde o la alcaldesa es quien dirige el municipio 🏛️. Lo eligen los ciudadanos con su voto cada 4 años. Se encarga de que haya escuelas, vías, agua y salud para todos.' },
    { k: ['concejo', 'concejal'], a: 'El concejo municipal es un grupo de personas (concejales) elegidas por la comunidad. Hacen las normas del municipio (acuerdos) y vigilan que el alcalde trabaje bien. 🗳️' },
    { k: ['personero'], a: 'El personero municipal defiende los derechos de las personas del municipio. 🛡️ ¡En tu colegio también eligen un personero estudiantil!' },
    { k: ['zona urbana', 'zona rural', 'cabecera', 'vereda', 'corregimiento', 'urbano', 'rural'], a: 'El municipio tiene dos zonas:\n🏙️ Urbana (cabecera municipal): calles, casas juntas, comercio, alcaldía.\n🌾 Rural: el campo, dividido en veredas y corregimientos, con fincas, cultivos y animales.' },
    { k: ['simbolos', 'escudo', 'bandera', 'himno'], a: 'Cada municipio tiene sus símbolos: 🏳️ bandera, 🛡️ escudo e 🎶 himno. Representan su historia y lo que lo hace especial. ¡Pregúntale a tu profe cómo son los de tu municipio!' },
    { k: ['departamento', 'gobernador', 'cuantos departamentos', 'cuantos municipios'], a: 'Colombia está dividida en 32 departamentos y un Distrito Capital (Bogotá). 🇨🇴 Cada departamento tiene varios municipios —en total son más de 1.100— y lo dirige un gobernador.' },
    { k: ['servicios publicos'], a: 'Los servicios públicos son los que todos necesitamos en casa 💡💧\nAgua, luz (energía), gas, alcantarillado, recolección de basuras e internet. El municipio vigila que lleguen a la comunidad.' },
    { k: ['derechos', 'deberes', 'ciudadano'], a: 'Como ciudadanos del municipio tenemos derechos y deberes ⚖️\nDerechos: estudiar, tener salud, jugar, ser protegidos.\nDeberes: respetar a los demás, cuidar lo público, cumplir las normas y no botar basura.' }
  ],
  examples: ['Ejemplo: Zipaquirá es un municipio del departamento de Cundinamarca.', 'En la zona rural de un municipio hay veredas con fincas de café. ☕', 'El alcalde inauguró una nueva escuela en la vereda. 🏫']
});

/* ───────────── CUARTO ───────────── */
T.push({
  id: 'materia', grade: 'Cuarto', subject: 'Ciencias', topic: 'Los estados de la materia',
  keys: ['materia', 'estado', 'estados', 'solido', 'liquido', 'gaseoso', 'gas', 'fusion', 'solidificacion', 'evaporacion', 'ebullicion', 'condensacion', 'sublimacion', 'derretir', 'congelar', 'hielo', 'vapor', 'masa', 'volumen', 'plasma'],
  intro: 'Materia es todo lo que ocupa un lugar y tiene masa (peso). 🧊💧💨\nLa materia se presenta en 3 estados principales: sólido, líquido y gaseoso.',
  simple: 'Sólido 🧊 tiene forma fija. Líquido 💧 toma la forma del recipiente. Gas 💨 se esparce por todas partes.',
  points: ['Sólido: forma y volumen fijos.', 'Líquido: volumen fijo, forma del recipiente.', 'Gaseoso: sin forma ni volumen fijos.', 'Cambios: fusión, solidificación, evaporación, condensación y sublimación.'],
  facts: [
    { k: ['que es la materia', 'que es materia'], a: 'La materia es todo lo que tiene masa y ocupa un espacio. 🌍 Tu cuaderno, el agua, el aire, ¡tú también eres materia!' },
    { k: ['estados de la materia', 'cuales son los estados', 'estados tiene'], a: 'La materia tiene 3 estados principales:\n🧊 Sólido: tiene forma propia y no se derrama (hielo, piedra, madera).\n💧 Líquido: se derrama y toma la forma del recipiente (agua, leche, aceite).\n💨 Gaseoso: se esparce y ocupa todo el espacio (aire, vapor, humo).' },
    { k: ['solido'], a: 'Los sólidos 🧊 tienen forma y volumen fijos: sus partículas están muy juntitas y casi no se mueven.\nEj: hielo, piedra, lápiz, mesa.' },
    { k: ['liquido'], a: 'Los líquidos 💧 tienen volumen fijo pero toman la forma del recipiente: sus partículas están juntas pero se deslizan.\nEj: agua, jugo, leche, aceite.' },
    { k: ['gaseoso', 'gas', 'gases'], a: 'Los gases 💨 no tienen forma ni volumen fijos: sus partículas están muy separadas y se mueven rápido, por eso llenan todo el espacio.\nEj: el aire, el vapor de agua, el gas de la estufa.' },
    { k: ['cambios de estado', 'cambio de estado', 'cambios de la materia'], a: 'Cambios de estado 🔄\n🧊➡️💧 Fusión: sólido a líquido (el hielo se derrite).\n💧➡️🧊 Solidificación: líquido a sólido (el agua se congela).\n💧➡️💨 Evaporación/ebullición: líquido a gas (el agua hierve).\n💨➡️💧 Condensación: gas a líquido (gotitas en un vaso frío).\n🧊➡️💨 Sublimación: sólido a gas sin pasar por líquido (el hielo seco).' },
    { k: ['fusion', 'derretir', 'se derrite'], a: 'La fusión es el paso de sólido a líquido con calor 🔥: el hielo se derrite y se vuelve agua; la mantequilla en la sartén se derrite.' },
    { k: ['solidificacion', 'congelar', 'se congela'], a: 'La solidificación es el paso de líquido a sólido al enfriarse ❄️: el agua en el congelador se vuelve hielo.' },
    { k: ['evaporacion', 'ebullicion', 'hierve', 'hervir'], a: 'La evaporación es el paso de líquido a gas ☀️: la ropa mojada se seca al sol. Si calentamos mucho el agua hasta que burbujea (a 100 °C), se llama ebullición.' },
    { k: ['condensacion', 'gotitas', 'empañ'], a: 'La condensación es el paso de gas a líquido al enfriarse 🌫️➡️💧: el vapor forma gotitas en el espejo del baño o en un vaso con hielo. ¡Así se forman las nubes!' },
    { k: ['sublimacion'], a: 'La sublimación es cuando un sólido pasa directo a gas, sin volverse líquido. Ej: el hielo seco o las bolitas de naftalina. 💨' },
    { k: ['ciclo del agua'], a: 'El ciclo del agua usa los cambios de estado 🔄\n☀️ El sol evapora el agua del mar → 💨 el vapor sube y se condensa en nubes ☁️ → 🌧️ llueve → el agua corre por ríos hasta el mar → ¡y vuelve a empezar!' }
  ],
  examples: ['🧊 Hielo (sólido) → 💧 agua (líquido) → 💨 vapor (gas)', 'Un helado al sol se derrite: fusión. 🍦', 'La olla con agua hirviendo suelta vapor: ebullición. ♨️']
});

T.push({
  id: 'division', grade: 'Cuarto', subject: 'Matemáticas', topic: 'División',
  keys: ['division', 'dividir', 'divisiones', 'divido', 'repartir', 'reparto', 'dividendo', 'divisor', 'cociente', 'residuo', 'exacta', 'inexacta', 'partes iguales', 'mitad'],
  intro: 'Dividir es repartir una cantidad en partes iguales. ➗\nEj: 12 galletas 🍪 entre 3 amigos → a cada uno le tocan 4. Se escribe 12 ÷ 3 = 4.',
  simple: 'Dividir = repartir en partes iguales, que a nadie le toque más. 🍕',
  points: ['Signos: ÷ o una rayita /.', 'Partes: dividendo ÷ divisor = cociente, y lo que sobra es el residuo.', 'Es lo contrario de multiplicar.', 'No se puede dividir entre 0.'],
  facts: [
    { k: ['que es dividir', 'que es la division', 'que es una division', 'que significa dividir', 'para que sirve dividir'], a: 'Dividir es repartir una cantidad en grupos iguales. ➗\n15 caramelos entre 5 niños → 15 ÷ 5 = 3 caramelos para cada uno. 🍬\nTambién sirve para saber cuántos grupos se pueden formar.' },
    { k: ['partes de la division', 'dividendo', 'divisor', 'cociente', 'residuo', 'terminos de la division'], a: 'En 17 ÷ 5 = 3 y sobran 2:\n• 17 es el dividendo (lo que se reparte).\n• 5 es el divisor (entre cuántos se reparte).\n• 3 es el cociente (cuánto le toca a cada uno).\n• 2 es el residuo (lo que sobra).' },
    { k: ['como se divide', 'como divido', 'como dividir', 'enseñame a dividir', 'ensename a dividir', 'como se hace una division'], a: 'Para dividir, piensa en la tabla de multiplicar al revés 🔁\n24 ÷ 6 = ? → ¿qué número por 6 da 24? → 4.\nCon números grandes, divide de izquierda a derecha: tomas la primera cifra (o dos), divides, multiplicas, restas y bajas la siguiente cifra.\nEscríbeme una división (como 856 ÷ 4) y la hacemos paso a paso.' },
    { k: ['exacta', 'inexacta'], a: 'Una división es:\n✅ Exacta: cuando el residuo es 0 (20 ÷ 4 = 5).\n➕ Inexacta: cuando sobra algo (22 ÷ 4 = 5 y sobran 2).' },
    { k: ['comprobar', 'prueba de la division'], a: 'Para comprobar una división: divisor × cociente + residuo = dividendo. ✔\nEj: 22 ÷ 4 = 5 y sobran 2 → 4 × 5 + 2 = 22. ¡Correcto!' },
    { k: ['entre cero', 'entre 0', 'dividir por cero'], a: 'No se puede dividir entre 0 🙅. Si repartes entre 0 personas… ¡no hay a quién darle!' },
    { k: ['mitad'], a: 'La mitad es dividir entre 2: la mitad de 18 es 18 ÷ 2 = 9. ✂️' },
    { k: ['problemas de division', 'cuando se divide', 'cuando uso la division'], a: 'Divides cuando lees: repartir, partes iguales, entre, cada uno recibe, cuántos le tocan, cuántos grupos. 🧩\nEj: "Se reparten 32 lápices entre 8 niños. ¿Cuántos recibe cada uno?" → 32 ÷ 8 = 4.' }
  ],
  examples: ['12 🍪 ÷ 4 niños = 3 galletas para cada uno.', '20 ÷ 5 = 4, porque 4 × 5 = 20.', '25 ÷ 4 = 6 y sobra 1.', '84 ÷ 4 = 21 (8 ÷ 4 = 2 y 4 ÷ 4 = 1).']
});

T.push({
  id: 'adjetivo', grade: 'Cuarto', subject: 'Lengua', topic: 'El adjetivo',
  keys: ['adjetivo', 'adjetivos', 'calificativo', 'describe', 'describir', 'cualidad', 'cualidades', 'comparativo', 'superlativo', 'grados del adjetivo', 'antonimo', 'contrario'],
  intro: 'El adjetivo es la palabra que dice cómo es un sustantivo: describe sus cualidades. 🎨\nEj: perro grande, flor roja, niña alegre.',
  simple: 'El adjetivo dice cómo es algo. 🐘 elefante GRANDE · 🐭 ratón PEQUEÑO.',
  points: ['Acompaña al sustantivo y concuerda con él en género y número.', 'Grados: positivo (alto), comparativo (más alto que), superlativo (altísimo).'],
  facts: [
    { k: ['que es un adjetivo', 'que son los adjetivos', 'que es adjetivo', 'para que sirven los adjetivos'], a: 'El adjetivo es la palabra que describe cómo es un sustantivo (una persona, animal o cosa). 🎨\n🐱 gato negro · 🏠 casa grande · 😊 niño feliz\nPregunta "¿cómo es?" y la respuesta es el adjetivo.' },
    { k: ['concordancia', 'genero y numero', 'concuerda'], a: 'El adjetivo concuerda con el sustantivo en género y número 🤝\nel gato blanco · la gata blanca · los gatos blancos · las gatas blancas.' },
    { k: ['grados', 'comparativo', 'superlativo', 'positivo'], a: 'Grados del adjetivo 📶\n1️⃣ Positivo: dice la cualidad → Juan es alto.\n2️⃣ Comparativo: compara → Juan es más alto que Pedro / tan alto como / menos alto que.\n3️⃣ Superlativo: la cualidad al máximo → Juan es altísimo / el más alto de la clase.' },
    { k: ['antonimo', 'contrario', 'opuesto'], a: 'Adjetivos contrarios (antónimos) 🔁\ngrande ↔ pequeño · alto ↔ bajo · rápido ↔ lento · feliz ↔ triste · limpio ↔ sucio · caliente ↔ frío · nuevo ↔ viejo · fuerte ↔ débil' },
    { k: ['como encuentro', 'encontrar el adjetivo', 'identificar', 'cual es el adjetivo'], a: 'Para encontrar el adjetivo, busca el sustantivo y pregúntale "¿cómo es?" 🔍\n"El perro peludo ladra" → ¿cómo es el perro? → peludo. ¡Ese es el adjetivo!\nTambién puedes escribirme una oración y te digo cuál es el adjetivo.' }
  ],
  examples: ['La jirafa alta come hojas. 🦒 (alta)', 'Tengo un lápiz amarillo. ✏️ (amarillo)', 'El café colombiano es delicioso. ☕ (colombiano, delicioso)']
});

T.push({
  id: 'cuerpo-en', grade: 'Cuarto', subject: 'Inglés', topic: 'Las partes del cuerpo',
  keys: ['cuerpo', 'body', 'partes del cuerpo', 'head', 'shoulders', 'knees', 'toes', 'cabeza', 'brazo', 'pierna', 'ojo', 'oreja', 'nariz', 'boca', 'mano', 'pie'],
  english: true,
  intro: 'Las partes del cuerpo en inglés 🧍\n🗣️ head = cabeza · 👁️ eyes = ojos · 👂 ears = orejas · 👃 nose = nariz · 👄 mouth = boca · 🦷 teeth = dientes · 💇 hair = cabello · neck = cuello · shoulders = hombros · 💪 arms = brazos · ✋ hands = manos · fingers = dedos · 🦵 legs = piernas · knees = rodillas · 🦶 feet = pies · toes = dedos del pie',
  simple: 'Canta conmigo: 🎶 Head, shoulders, knees and toes! (cabeza, hombros, rodillas y dedos de los pies).',
  points: ['Singular y plural: eye → eyes, hand → hands.', 'Plurales especiales: foot → feet, tooth → teeth.', 'I have two eyes. = Tengo dos ojos.'],
  facts: [
    { k: ['cara', 'face', 'rostro'], a: 'Partes de la cara (face) 🙂\n👁️ eye(s) = ojo(s) · 👃 nose = nariz · 👄 mouth = boca · 👂 ear(s) = oreja(s) · 💇 hair = cabello · 🦷 teeth = dientes · 👅 tongue = lengua · lips = labios · eyebrows = cejas' },
    { k: ['plural', 'feet', 'teeth', 'irregular'], a: 'Plurales especiales en inglés 👀\nfoot → feet (pie → pies)\ntooth → teeth (diente → dientes)\nLos demás solo agregan -s: hand → hands, eye → eyes.' },
    { k: ['cancion', 'head shoulders'], a: '🎶 Head, shoulders, knees and toes, knees and toes!\nAnd eyes and ears and mouth and nose…\n(cabeza, hombros, rodillas y dedos, ojos, orejas, boca y nariz) — tócate cada parte mientras cantas. 🤸' },
    { k: ['i have', 'oraciones', 'como digo'], a: 'Oraciones útiles 🗣️\nI have two hands. ✋✋ = Tengo dos manos.\nMy hair is black. = Mi cabello es negro.\nI see with my eyes. 👁️ = Veo con mis ojos.\nMy head hurts. 🤕 = Me duele la cabeza.' }
  ],
  examples: ['I have ten fingers. 🖐️🖐️', 'My eyes are brown. 👁️', 'I walk with my feet. 🦶', 'I listen with my ears. 👂']
});

T.push({
  id: 'regiones', grade: 'Cuarto', subject: 'Ciencias Sociales', topic: 'Las regiones naturales de Colombia',
  keys: ['region', 'regiones', 'andina', 'caribe', 'pacifica', 'pacifico', 'orinoquia', 'llanos', 'llanera', 'amazonia', 'amazonica', 'insular', 'san andres', 'cordillera', 'cordilleras', 'relieve'],
  intro: 'Colombia tiene 6 regiones naturales 🇨🇴\n⛰️ Andina · 🏖️ Caribe · 🌧️ Pacífica · 🐎 Orinoquía · 🌳 Amazonía · 🏝️ Insular\nCada una tiene su paisaje, clima, comidas, música y costumbres.',
  simple: 'Colombia se divide en 6 regiones: montañas (Andina), playas del norte (Caribe), costa lluviosa (Pacífica), llanos (Orinoquía), selva (Amazonía) e islas (Insular). 🗺️',
  points: ['Andina: montañas, la más poblada.', 'Caribe: norte, playas.', 'Pacífica: occidente, muy lluviosa.', 'Orinoquía: llanos del oriente.', 'Amazonía: selva del sur.', 'Insular: islas.'],
  facts: [
    { k: ['cuales son las regiones', 'regiones naturales', 'cuantas regiones', 'regiones de colombia'], a: 'Colombia tiene 6 regiones naturales 🗺️\n1. Andina ⛰️ (centro, montañas)\n2. Caribe 🏖️ (norte)\n3. Pacífica 🌧️ (occidente)\n4. Orinoquía 🐎 (oriente, llanos)\n5. Amazonía 🌳 (sur, selva)\n6. Insular 🏝️ (islas)' },
    { k: ['andina', 'cordillera', 'cordilleras', 'region andina'], a: '⛰️ Región Andina\n• En el centro, la atraviesan 3 cordilleras: Occidental, Central y Oriental.\n• Tiene todos los climas: calientes en los valles y fríos en los páramos.\n• Es la más poblada: Bogotá, Medellín, Cali, Bucaramanga.\n• Produce café, papa, flores.\n• Música: bambuco, pasillo. Comidas: ajiaco, bandeja paisa, tamal.' },
    { k: ['caribe', 'region caribe', 'costa atlantica'], a: '🏖️ Región Caribe\n• Al norte, a orillas del mar Caribe.\n• Clima caliente.\n• Ciudades: Barranquilla, Cartagena, Santa Marta, Montería, Valledupar.\n• Tiene la Sierra Nevada de Santa Marta, la montaña costera más alta del mundo.\n• Música: vallenato y cumbia. Comida: arepa de huevo, arroz con coco, sancocho.\n• ¡El Carnaval de Barranquilla! 🎭' },
    { k: ['pacifica', 'pacifico', 'region pacifica', 'choco'], a: '🌧️ Región Pacífica\n• Al occidente, junto al océano Pacífico.\n• Es de las zonas más lluviosas del mundo y tiene selvas muy húmedas.\n• Departamentos: Chocó, y la costa de Valle, Cauca y Nariño. Ciudades: Quibdó, Buenaventura, Tumaco.\n• Gran riqueza de cultura afrocolombiana: música de marimba y currulao.\n• Llegan ballenas jorobadas cada año. 🐋' },
    { k: ['orinoquia', 'llanos', 'llanera', 'region orinoquia'], a: '🐎 Región de la Orinoquía (Llanos Orientales)\n• Al oriente, grandes llanuras planas y ríos que van al Orinoco.\n• Departamentos: Meta, Casanare, Arauca y Vichada.\n• Se dedican a la ganadería y hay petróleo.\n• Música: joropo con arpa, cuatro y maracas. Comida: carne a la llanera (mamona). 🥩' },
    { k: ['amazonia', 'amazonica', 'region amazonica', 'amazonas'], a: '🌳 Región de la Amazonía\n• Al sur, cubierta por la selva amazónica, el bosque tropical más grande del planeta.\n• Departamentos: Amazonas, Caquetá, Putumayo, Guaviare, Vaupés y Guainía. Ciudad: Leticia.\n• Muchísima biodiversidad: delfines rosados, jaguares, guacamayas.\n• Viven muchos pueblos indígenas que la cuidan. 💚' },
    { k: ['insular', 'san andres', 'providencia', 'islas', 'region insular'], a: '🏝️ Región Insular\n• Son las islas de Colombia.\n• En el Caribe: San Andrés, Providencia y Santa Catalina, con su "mar de siete colores".\n• En el Pacífico: Gorgona y Malpelo, reservas naturales.\n• En San Andrés se habla español, inglés y creole. Comida: el rondón. 🐟' },
    { k: ['clima', 'pisos termicos'], a: 'Colombia tiene muchos climas por sus montañas: los pisos térmicos 🌡️\n☀️ Cálido (abajo, cerca al mar) · 🌤️ Templado · 🧥 Frío · 🏔️ Páramo · ❄️ Nieves perpetuas (los picos más altos).' }
  ],
  examples: ['Bogotá está en la región Andina. ⛰️', 'Cartagena está en la región Caribe. 🏖️', 'Leticia está en la Amazonía. 🌳', 'San Andrés pertenece a la región Insular. 🏝️']
});

/* ───────────── QUINTO ───────────── */
T.push({
  id: 'digestivo', grade: 'Quinto', subject: 'Ciencias', topic: 'El sistema digestivo',
  keys: ['digestivo', 'digestion', 'digerir', 'estomago', 'intestino', 'esofago', 'boca', 'saliva', 'higado', 'pancreas', 'vesicula', 'faringe', 'nutrientes', 'heces', 'jugos gastricos', 'bilis', 'masticar', 'recto', 'ano', 'alimentacion saludable', 'nutricion'],
  intro: 'El sistema digestivo transforma los alimentos en nutrientes que el cuerpo usa para crecer, moverse y tener energía. 🍎➡️⚡\nEl camino es: boca → faringe → esófago → estómago → intestino delgado → intestino grueso → recto → ano.',
  simple: 'Comes 🍽️ → lo masticas en la boca → baja por el esófago → el estómago lo mezcla → el intestino toma lo bueno → lo que no sirve sale como popó. 🚽',
  points: ['Etapas: ingestión, digestión, absorción y eliminación.', 'Órganos: boca, faringe, esófago, estómago, intestinos, recto y ano.', 'Glándulas que ayudan: glándulas salivales, hígado y páncreas.'],
  facts: [
    { k: ['que es el sistema digestivo', 'que es la digestion', 'para que sirve el sistema digestivo', 'funcion del sistema digestivo'], a: 'El sistema digestivo es el conjunto de órganos que transforma la comida en nutrientes para el cuerpo. 🍽️⚡\nLos nutrientes pasan a la sangre y llegan a todas partes; lo que no sirve se elimina.' },
    { k: ['organos', 'partes del sistema digestivo', 'partes del aparato', 'recorrido', 'camino de los alimentos'], a: 'El recorrido de los alimentos 🛤️\n1. 👄 Boca: dientes y lengua trituran; la saliva ablanda.\n2. Faringe: un tubo en la garganta.\n3. Esófago: lleva el bolo al estómago.\n4. Estómago: lo mezcla con jugos gástricos.\n5. Intestino delgado: absorbe los nutrientes.\n6. Intestino grueso: absorbe el agua y forma las heces.\n7. Recto y ano: eliminan los desechos.' },
    { k: ['boca', 'dientes', 'saliva', 'masticar', 'bolo'], a: 'En la boca 👄 empieza la digestión: los dientes cortan y trituran, la lengua mueve la comida y la saliva la humedece. Así se forma el bolo alimenticio, una bolita fácil de tragar. ¡Por eso hay que masticar bien!' },
    { k: ['esofago'], a: 'El esófago es un tubo que une la faringe con el estómago. Sus músculos se mueven como una ola para empujar el bolo hacia abajo. 🌊' },
    { k: ['estomago', 'jugos gastricos', 'quimo'], a: 'El estómago es como una bolsa elástica de músculo 💪. Mezcla y revuelve la comida con jugos gástricos que la deshacen, y la convierte en una pasta llamada quimo.' },
    { k: ['intestino delgado', 'absorcion', 'vellosidades'], a: 'El intestino delgado es un tubo muy largo y enrollado (¡de unos 6 o 7 metros!). Allí la comida termina de digerirse y los nutrientes pasan a la sangre. Esa es la absorción. 🩸' },
    { k: ['intestino grueso', 'heces', 'popo'], a: 'El intestino grueso recibe lo que el cuerpo no usó, absorbe el agua y forma las heces (la popó), que salen por el recto y el ano. 🚽' },
    { k: ['higado', 'bilis', 'vesicula'], a: 'El hígado es una glándula grande que produce la bilis, un líquido que ayuda a digerir las grasas. La bilis se guarda en la vesícula biliar. 🟤' },
    { k: ['pancreas'], a: 'El páncreas fabrica el jugo pancreático, que va al intestino delgado y ayuda a descomponer los alimentos. 🧪' },
    { k: ['etapas', 'fases', 'procesos'], a: 'Las etapas de la digestión 🔄\n1. Ingestión: meter la comida a la boca.\n2. Digestión: deshacerla en partes muy pequeñas.\n3. Absorción: los nutrientes pasan a la sangre.\n4. Eliminación (egestión): sacar los desechos.' },
    { k: ['cuidar', 'cuidados', 'saludable', 'enfermedad', 'habitos'], a: 'Para cuidar tu sistema digestivo 💚\n• Come frutas, verduras y alimentos con fibra.\n• Toma suficiente agua 💧.\n• Mastica despacio.\n• Lávate las manos antes de comer 🧼.\n• Evita el exceso de dulces, frituras y gaseosas.\n• Haz ejercicio.' }
  ],
  examples: ['Comes una arepa: la masticas (boca), la tragas (esófago), se mezcla (estómago) y sus nutrientes te dan energía (intestino delgado). 🫓', 'La saliva empieza a deshacer el pan apenas lo muerdes. 🍞']
});

T.push({
  id: 'fracciones', grade: 'Quinto', subject: 'Matemáticas', topic: 'Fracciones',
  keys: ['fraccion', 'fracciones', 'numerador', 'denominador', 'equivalente', 'equivalentes', 'simplific', 'amplific', 'propia', 'impropia', 'mixto', 'mixta', 'medio', 'medios', 'tercio', 'cuarto', 'cuartos', 'quinto', 'octavo', 'parte de', 'partes de un entero'],
  intro: 'Una fracción representa partes iguales de un entero. 🍕\nEn 3/4: el 4 (denominador) dice en cuántas partes iguales se divide el entero, y el 3 (numerador) cuántas partes tomamos.',
  simple: 'Una pizza 🍕 cortada en 4 pedazos iguales: si te comes 3, te comiste 3/4 (tres cuartos).',
  points: ['Numerador (arriba): partes que tomo.', 'Denominador (abajo): partes en que se divide.', 'Propias (menores que 1), impropias (mayores que 1), números mixtos.', 'Equivalentes: valen lo mismo (1/2 = 2/4).'],
  facts: [
    { k: ['que es una fraccion', 'que son las fracciones', 'que es fraccion', 'que son fracciones'], a: 'Una fracción es una parte de un entero dividido en partes iguales. 🍫\nSi una chocolatina tiene 5 cuadritos y te comes 2, te comiste 2/5 (dos quintos).' },
    { k: ['numerador', 'denominador', 'partes de una fraccion', 'terminos de la fraccion'], a: 'Una fracción tiene dos términos:\n⬆️ Numerador (arriba): cuántas partes tomamos.\n⬇️ Denominador (abajo): en cuántas partes iguales se dividió el entero.\nEn 3/8: dividimos en 8 y tomamos 3.' },
    { k: ['como se lee', 'como se leen', 'leer fracciones'], a: 'Cómo se leen las fracciones 🗣️\nEl numerador se lee normal y el denominador así: 2 medios, 3 tercios, 4 cuartos, 5 quintos, 6 sextos, 7 séptimos, 8 octavos, 9 novenos, 10 décimos. Desde 11 se agrega -avo: 11 onceavos, 12 doceavos.\nEj: 3/4 = tres cuartos; 5/12 = cinco doceavos.' },
    { k: ['propia', 'impropia', 'mixto', 'mixta'], a: 'Tipos de fracciones:\n🔹 Propia: numerador menor que el denominador (3/5), vale menos que 1.\n🔸 Impropia: numerador mayor (7/4), vale más que 1.\n🔶 Número mixto: entero + fracción, por ejemplo 7/4 = 1 3/4 (un entero y tres cuartos).' },
    { k: ['equivalente', 'equivalentes'], a: 'Las fracciones equivalentes valen lo mismo aunque se escriban distinto 🟰\n1/2 = 2/4 = 3/6 = 4/8\nSe obtienen multiplicando (o dividiendo) el numerador y el denominador por el mismo número.' },
    { k: ['simplific', 'reducir'], a: 'Simplificar es escribir la fracción con números más pequeños, dividiendo arriba y abajo por el mismo número ✂️\n6/8 → ÷2 → 3/4.\nEscríbeme "simplifica 12/18" y lo hacemos juntos.' },
    { k: ['sumar fracciones', 'suma de fracciones', 'como se suman', 'restar fracciones', 'resta de fracciones', 'como se restan'], a: 'Sumar o restar fracciones ➕➖\n• Con el mismo denominador: sumas (o restas) los numeradores y dejas el denominador: 2/7 + 3/7 = 5/7.\n• Con distinto denominador: primero busca un denominador común: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.' },
    { k: ['multiplicar fracciones', 'multiplicacion de fracciones', 'como se multiplican'], a: 'Para multiplicar fracciones: numerador × numerador y denominador × denominador ✖️\n2/3 × 4/5 = 8/15.' },
    { k: ['dividir fracciones', 'division de fracciones', 'como se dividen'], a: 'Para dividir fracciones multiplicas por la segunda "volteada" (inversa) 🔄\n2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.' },
    { k: ['comparar', 'cual es mayor', 'cual es menor', 'mas grande'], a: 'Para comparar fracciones ⚖️\n• Mismo denominador: la de mayor numerador es mayor (5/8 > 3/8).\n• Mismo numerador: la de menor denominador es mayor (1/3 > 1/5).\n• Si no, búscales un denominador común.\nPregúntame por ejemplo: "¿qué es mayor, 2/3 o 3/4?"' },
    { k: ['fraccion de un numero', 'de un numero', 'parte de una cantidad'], a: 'Para hallar la fracción de un número: divides por el denominador y multiplicas por el numerador 🧮\n3/4 de 20 → 20 ÷ 4 = 5 → 5 × 3 = 15.' }
  ],
  examples: ['🍕 Una pizza en 8 pedazos; te comes 3 → 3/8.', '1/2 de una naranja es la mitad. 🍊', '2/4 = 1/2 (son equivalentes).', '3/5 + 1/5 = 4/5']
});

T.push({
  id: 'argumentativo', grade: 'Quinto', subject: 'Lengua', topic: 'El texto argumentativo',
  keys: ['argumentativo', 'argumento', 'argumentos', 'argumentar', 'opinion', 'tesis', 'convencer', 'persuadir', 'conectores', 'hecho y opinion', 'conclusion', 'introduccion', 'debate', 'postura', 'punto de vista'],
  intro: 'El texto argumentativo busca convencer al lector de una opinión dando razones (argumentos). 🗣️💬\nTiene 3 partes: introducción (la opinión o tesis), desarrollo (los argumentos) y conclusión.',
  simple: 'Un texto argumentativo es cuando das tu opinión y explicas POR QUÉ, con buenas razones, para convencer a otros. 💡',
  points: ['Tesis: la opinión que defiendes.', 'Argumentos: razones, ejemplos, datos.', 'Conclusión: repite la idea y cierra.', 'Conectores: porque, además, por lo tanto, sin embargo, en conclusión.'],
  facts: [
    { k: ['que es un texto argumentativo', 'que es el texto argumentativo', 'texto argumentativo es', 'que es argumentar'], a: 'Un texto argumentativo es un escrito donde defendemos una opinión con razones para convencer a otros. 💬\nEj: "Los colegios deberían tener huertas porque los niños aprenden de dónde viene la comida".' },
    { k: ['partes', 'estructura', 'introduccion', 'desarrollo', 'conclusion'], a: 'Estructura del texto argumentativo 🏗️\n1️⃣ Introducción: presentas el tema y tu opinión (tesis).\n2️⃣ Desarrollo: das los argumentos (razones, ejemplos, datos).\n3️⃣ Conclusión: recuerdas tu opinión y cierras con una idea fuerte.' },
    { k: ['tesis'], a: 'La tesis es la opinión principal que quieres defender. 🎯 Debe ser clara: "Es importante reciclar en el colegio".' },
    { k: ['argumento', 'argumentos', 'tipos de argumentos'], a: 'Los argumentos son las razones que apoyan tu opinión 🧱\n• De ejemplo: "En mi barrio, cuando reciclamos, las calles quedaron más limpias".\n• De datos: usan números o estudios.\n• De autoridad: citan a un experto.\n• De causa y efecto: "si…, entonces…".' },
    { k: ['conectores', 'palabras para argumentar'], a: 'Conectores para argumentar 🔗\nPara empezar: En primer lugar, Considero que…\nPara añadir: Además, También, Por otra parte…\nPara explicar: porque, ya que, puesto que…\nPara oponer: sin embargo, pero, aunque…\nPara concluir: En conclusión, Por lo tanto, En resumen…' },
    { k: ['hecho y opinion', 'hecho', 'diferencia entre hecho'], a: 'Hecho vs. opinión ⚖️\n📌 Hecho: se puede comprobar. "El agua hierve a 100 °C."\n💭 Opinión: es lo que alguien piensa o siente. "El agua fría es más rica."\nEn un buen texto argumentativo, las opiniones se apoyan en hechos.' },
    { k: ['como escribir', 'como hago', 'ayudame a escribir', 'escribir un texto'], a: 'Para escribir tu texto argumentativo ✍️\n1. Elige un tema y decide tu opinión.\n2. Escribe 2 o 3 razones con ejemplos.\n3. Ordena: introducción → argumentos → conclusión.\n4. Usa conectores (además, porque, por lo tanto).\n5. Revisa la ortografía.\nEscríbeme "texto argumentativo sobre los animales" (o tu tema) y te armo un modelo.' }
  ],
  examples: ['Tesis: "Debemos cuidar el agua."\nArgumento: "Porque sin agua no podemos vivir y muchos ríos se están secando."\nConclusión: "Por lo tanto, cerremos la llave al cepillarnos los dientes." 💧']
});

T.push({
  id: 'presente-simple', grade: 'Quinto', subject: 'Inglés', topic: 'Presente simple (Simple Present)',
  keys: ['presente simple', 'simple present', 'present simple', 'verbo', 'verbos', 'conjug', 'rutina', 'routine', 'does', 'doesnt', 'dont', 'he she it', 'tercera persona', 'always', 'usually', 'sometimes', 'never', 'adverbios de frecuencia'],
  english: true,
  intro: 'El presente simple (Simple Present) sirve para hablar de rutinas, gustos y cosas que siempre son verdad. ⏰\nI play soccer. · She plays soccer. · They like pizza.\n⭐ Regla de oro: con he, she, it el verbo lleva -s.',
  simple: 'Con I, you, we, they el verbo queda igual (I eat). Con he, she, it le pones -s (she eats). 🍎',
  points: ['Afirmativa: I/You/We/They play · He/She/It plays.', 'Negativa: don\'t / doesn\'t + verbo.', 'Pregunta: Do / Does + sujeto + verbo?', 'Verbos en -o, -s, -sh, -ch, -x → -es (goes, watches). Consonante + y → -ies (studies). have → has.'],
  facts: [
    { k: ['que es el presente simple', 'que es simple present', 'para que sirve', 'cuando se usa', 'que es presente simple'], a: 'El presente simple se usa para hablar de 🔁\n• Rutinas: I wake up at 6. (Me levanto a las 6.)\n• Gustos: She likes mangoes. (A ella le gustan los mangos.)\n• Verdades: The sun rises in the east. (El sol sale por el este.)' },
    { k: ['tercera persona', 'he she it', 'cuando lleva s', 'regla de la s', 'le pongo s'], a: 'Con he, she, it el verbo lleva -s ⭐\nplay → she plays · eat → he eats · run → it runs\nCasos especiales:\n• -o, -s, -sh, -ch, -x → -es: go → goes, watch → watches.\n• consonante + y → -ies: study → studies, cry → cries.\n• have → has.' },
    { k: ['negativa', 'negativo', 'dont', 'doesnt', 'don t', 'doesn t'], a: 'Para negar usamos don\'t o doesn\'t + verbo (¡sin -s!) 🚫\nI don\'t like onions. (No me gusta la cebolla.)\nShe doesn\'t play tennis. (Ella no juega tenis.)\nCon he/she/it → doesn\'t; con los demás → don\'t.' },
    { k: ['pregunta', 'interrogativa', 'do you', 'does she', 'does he'], a: 'Para preguntar empezamos con Do o Does ❓\nDo you like pizza? → Yes, I do. / No, I don\'t.\nDoes he play soccer? → Yes, he does. / No, he doesn\'t.\nCon Does el verbo NO lleva -s.' },
    { k: ['adverbios de frecuencia', 'always', 'usually', 'sometimes', 'never', 'often'], a: 'Adverbios de frecuencia 📅\nalways (siempre) 100% · usually (normalmente) · often (a menudo) · sometimes (a veces) · never (nunca) 0%\nVan antes del verbo: I always brush my teeth. 🪥 She never eats meat.' },
    { k: ['rutina', 'routine', 'daily'], a: 'Mi rutina (my routine) en inglés ⏰\nI wake up at 6. · I take a shower. · I eat breakfast. · I go to school. · I do my homework. · I go to bed at 8.\n(Me levanto, me baño, desayuno, voy al colegio, hago tareas, me acuesto.)' }
  ],
  examples: ['I play soccer every day. ⚽', 'She reads books. 📚', 'He watches TV. 📺', 'We don\'t eat in class. 🚫🍔', 'Does your dog bark? 🐶']
});

T.push({
  id: 'independencia', grade: 'Quinto', subject: 'Ciencias Sociales', topic: 'La Independencia de Colombia',
  keys: ['independencia', 'independiz', 'nueva granada', 'grito', '20 de julio', '7 de agosto', 'boyaca', 'bolivar', 'santander', 'nariño', 'policarpa', 'la pola', 'florero', 'llorente', 'proceres', 'heroes', 'criollos', 'españoles', 'colonia', 'virreinato', 'patria boba', 'reconquista', 'morillo', 'campaña libertadora', 'pantano de vargas', 'libertador', 'gran colombia', 'comuneros', 'antonia santos', 'camilo torres', 'galan'],
  intro: 'La Independencia de Colombia fue el proceso por el que dejamos de ser una colonia de España y nos convertimos en un país libre. 🇨🇴\n📅 20 de julio de 1810: el Grito de Independencia en Santa Fe (Bogotá).\n📅 7 de agosto de 1819: la Batalla de Boyacá, que aseguró la libertad.',
  simple: 'Hace más de 200 años, España mandaba en nuestro territorio. 🇪🇸 El 20 de julio de 1810 la gente se reunió para gobernarse sola y en 1819 ganamos la Batalla de Boyacá. ¡Así nació nuestra libertad! 🇨🇴',
  points: ['20 de julio de 1810: Grito de Independencia (el florero de Llorente).', '7 de agosto de 1819: Batalla de Boyacá.', 'Próceres: Simón Bolívar, Francisco de Paula Santander, Antonio Nariño, Policarpa Salavarrieta.'],
  facts: [
    { k: ['que es la independencia', 'que fue la independencia', 'que significa independencia'], a: 'La Independencia fue cuando el territorio que hoy es Colombia dejó de depender de España y empezó a gobernarse solo. 🇨🇴 Empezó el 20 de julio de 1810 y se consolidó con la Batalla de Boyacá, el 7 de agosto de 1819.' },
    { k: ['20 de julio', 'grito', 'florero', 'llorente'], a: '📅 El 20 de julio de 1810 pasó el Grito de Independencia en Santa Fe (hoy Bogotá).\nUnos criollos fueron a pedir prestado un florero al comerciante español José González Llorente para una visita importante. Él se negó, hubo una pelea y la gente se reunió en la plaza. Esa misma noche se formó una Junta de Gobierno. 🏺\nPor eso el 20 de julio es la fiesta nacional de Colombia.' },
    { k: ['7 de agosto', 'batalla de boyaca', 'boyaca', 'puente de boyaca'], a: '⚔️ La Batalla de Boyacá fue el 7 de agosto de 1819, en el Puente de Boyacá. El ejército patriota, dirigido por Simón Bolívar y Francisco de Paula Santander, venció al ejército español. Con esta victoria se aseguró la independencia. 🇨🇴' },
    { k: ['bolivar', 'libertador'], a: '🗡️ Simón Bolívar, "el Libertador", nació en Caracas (Venezuela) en 1783. Dirigió la Campaña Libertadora y ayudó a liberar a Colombia, Venezuela, Ecuador, Perú y Bolivia. Fue el primer presidente de la Gran Colombia.' },
    { k: ['santander'], a: '⚖️ Francisco de Paula Santander, "el Hombre de las Leyes", nació en Villa del Rosario (Norte de Santander). Luchó junto a Bolívar en la Batalla de Boyacá y después organizó el gobierno, las leyes y las escuelas del nuevo país.' },
    { k: ['nariño', 'derechos del hombre'], a: '📜 Antonio Nariño, "el Precursor", tradujo e imprimió en secreto los Derechos del Hombre y del Ciudadano (1793–1794), ideas de libertad que llegaron desde Francia. Por eso fue encarcelado. Luego fue presidente de Cundinamarca.' },
    { k: ['policarpa', 'la pola'], a: '🌸 Policarpa Salavarrieta, "La Pola", fue una heroína que espiaba a los españoles y llevaba información a los patriotas. La capturaron y fue fusilada en Bogotá el 14 de noviembre de 1817. Ese día es el Día de la Mujer Colombiana.' },
    { k: ['proceres', 'heroes', 'personajes'], a: 'Algunos próceres de la Independencia 🇨🇴\n• Simón Bolívar: el Libertador.\n• Francisco de Paula Santander: el Hombre de las Leyes.\n• Antonio Nariño: el Precursor.\n• Policarpa Salavarrieta: heroína espía.\n• Antonia Santos: lideró guerrillas patriotas en Santander.\n• Camilo Torres: escribió el Memorial de Agravios (1809).' },
    { k: ['causas', 'por que', 'porque nos independizamos', 'razones'], a: 'Causas de la Independencia 🔎\n• Los criollos (hijos de españoles nacidos aquí) no podían tener los cargos más importantes.\n• Los impuestos eran muy altos.\n• Llegaron ideas de libertad de la Revolución Francesa y de la independencia de Estados Unidos.\n• En 1808 Napoleón invadió España y el rey quedó preso: las colonias aprovecharon para gobernarse.' },
    { k: ['patria boba'], a: 'La Patria Boba (1810–1816) fue la época en que, después del Grito, los criollos pelearon entre ellos: unos querían un gobierno central y otros, provincias independientes (federalistas). Esa desunión facilitó que España volviera. 😕' },
    { k: ['reconquista', 'morillo'], a: 'La Reconquista (1815–1816): España envió al general Pablo Morillo, "el Pacificador", que volvió a tomar el control y castigó a muchos patriotas. 😢 Pero los patriotas se reorganizaron en los Llanos.' },
    { k: ['campaña libertadora', 'pisba', 'pantano de vargas'], a: '🏔️ La Campaña Libertadora de 1819: Bolívar y Santander salieron de los Llanos, cruzaron la cordillera por el páramo de Pisba con mucho frío, ganaron la Batalla del Pantano de Vargas (25 de julio) y luego la Batalla de Boyacá (7 de agosto).' },
    { k: ['gran colombia'], a: 'La Gran Colombia (1819–1831) fue un país que unía a lo que hoy son Colombia, Venezuela, Ecuador y Panamá. Su presidente fue Simón Bolívar. Después se separó. 🗺️' },
    { k: ['comuneros', 'galan'], a: 'La Revolución de los Comuneros (1781), en El Socorro (Santander), fue una protesta contra los impuestos españoles, liderada por Manuela Beltrán y José Antonio Galán. Fue un antecedente de la Independencia. ✊' }
  ],
  examples: ['Línea de tiempo: 1781 Comuneros → 1810 Grito de Independencia → 1816 Reconquista → 1819 Batalla de Boyacá 🇨🇴']
});
})(typeof window !== 'undefined' ? window : globalThis);
/* Herramientas de Teo: clasificadores, diccionario de inglés, conjugador, generadores */
(function (root) {
'use strict';
const C = root.__TeoCore;
const { norm, has, any, pick, rnd, Fr, gcd, lcm, readFraction, mathText } = C;

/* ───────── diccionario inglés ⇄ español ───────── */
const EN = [
  /* colores */
  ['red', 'rojo', 'color', '🔴', ['roja', 'rojos', 'rojas']], ['blue', 'azul', 'color', '🔵', ['azules']], ['yellow', 'amarillo', 'color', '🟡', ['amarilla', 'amarillos']], ['green', 'verde', 'color', '🟢', ['verdes']],
  ['orange', 'naranja', 'color', '🟠', ['anaranjado', 'anaranjada']], ['purple', 'morado', 'color', '🟣', ['morada', 'violeta', 'lila', 'purpura']], ['pink', 'rosado', 'color', '🩷', ['rosa', 'rosada', 'fucsia']], ['black', 'negro', 'color', '⚫', ['negra', 'negros']],
  ['white', 'blanco', 'color', '⚪', ['blanca', 'blancos']], ['brown', 'cafe', 'color', '🟤', ['marron', 'cafes']], ['gray', 'gris', 'color', '🩶', ['grey', 'grises']], ['gold', 'dorado', 'color', '🟨', []], ['silver', 'plateado', 'color', '⬜', []],
  /* animales */
  ['dog', 'perro', 'animal', '🐶', ['perra', 'perrito']], ['cat', 'gato', 'animal', '🐱', ['gata', 'gatito']], ['bird', 'pajaro', 'animal', '🐦', ['ave', 'pajarito']], ['fish', 'pez', 'animal', '🐟', ['pescado', 'peces']],
  ['cow', 'vaca', 'animal', '🐮', []], ['horse', 'caballo', 'animal', '🐴', ['yegua']], ['pig', 'cerdo', 'animal', '🐷', ['marrano', 'chancho', 'puerco', 'cerdito']], ['hen', 'gallina', 'animal', '🐔', []], ['chicken', 'pollo', 'animal', '🐥', ['pollito']],
  ['rooster', 'gallo', 'animal', '🐓', []], ['duck', 'pato', 'animal', '🦆', []], ['sheep', 'oveja', 'animal', '🐑', []], ['goat', 'cabra', 'animal', '🐐', ['chivo']], ['donkey', 'burro', 'animal', '🫏', []],
  ['rabbit', 'conejo', 'animal', '🐰', []], ['mouse', 'raton', 'animal', '🐭', []], ['lion', 'leon', 'animal', '🦁', ['leona']], ['tiger', 'tigre', 'animal', '🐯', []], ['elephant', 'elefante', 'animal', '🐘', []],
  ['monkey', 'mono', 'animal', '🐒', ['mico']], ['giraffe', 'jirafa', 'animal', '🦒', []], ['zebra', 'cebra', 'animal', '🦓', []], ['bear', 'oso', 'animal', '🐻', []], ['snake', 'serpiente', 'animal', '🐍', ['culebra']],
  ['frog', 'rana', 'animal', '🐸', ['sapo']], ['turtle', 'tortuga', 'animal', '🐢', []], ['butterfly', 'mariposa', 'animal', '🦋', []], ['bee', 'abeja', 'animal', '🐝', []], ['ant', 'hormiga', 'animal', '🐜', []],
  ['spider', 'araña', 'animal', '🕷️', []], ['owl', 'buho', 'animal', '🦉', ['lechuza']], ['wolf', 'lobo', 'animal', '🐺', []], ['fox', 'zorro', 'animal', '🦊', []], ['dolphin', 'delfin', 'animal', '🐬', []],
  ['whale', 'ballena', 'animal', '🐋', []], ['shark', 'tiburon', 'animal', '🦈', []], ['crocodile', 'cocodrilo', 'animal', '🐊', ['caiman']], ['parrot', 'loro', 'animal', '🦜', ['guacamaya', 'perico']], ['jaguar', 'jaguar', 'animal', '🐆', []],
  ['eagle', 'aguila', 'animal', '🦅', []], ['penguin', 'pinguino', 'animal', '🐧', []], ['octopus', 'pulpo', 'animal', '🐙', []], ['crab', 'cangrejo', 'animal', '🦀', []], ['hamster', 'hamster', 'animal', '🐹', []], ['kangaroo', 'canguro', 'animal', '🦘', []],
  /* cuerpo */
  ['head', 'cabeza', 'body', '🗣️', []], ['eye', 'ojo', 'body', '👁️', []], ['eyes', 'ojos', 'body', '👀', []], ['ear', 'oreja', 'body', '👂', ['oido']], ['ears', 'orejas', 'body', '👂', []], ['nose', 'nariz', 'body', '👃', []],
  ['mouth', 'boca', 'body', '👄', []], ['tooth', 'diente', 'body', '🦷', []], ['teeth', 'dientes', 'body', '🦷', []], ['hair', 'cabello', 'body', '💇', ['pelo']], ['face', 'cara', 'body', '🙂', ['rostro']],
  ['neck', 'cuello', 'body', '🧣', []], ['shoulder', 'hombro', 'body', '🤷', []], ['shoulders', 'hombros', 'body', '🤷', []], ['arm', 'brazo', 'body', '💪', []], ['arms', 'brazos', 'body', '💪', []],
  ['hand', 'mano', 'body', '✋', []], ['hands', 'manos', 'body', '🙌', []], ['finger', 'dedo', 'body', '☝️', []], ['fingers', 'dedos', 'body', '🖐️', []], ['leg', 'pierna', 'body', '🦵', []], ['legs', 'piernas', 'body', '🦵', []],
  ['knee', 'rodilla', 'body', '🦵', []], ['knees', 'rodillas', 'body', '🦵', []], ['foot', 'pie', 'body', '🦶', []], ['feet', 'pies', 'body', '🦶', []], ['toes', 'dedos del pie', 'body', '🦶', []],
  ['back', 'espalda', 'body', '🔙', []], ['stomach', 'estomago', 'body', '🫃', ['barriga', 'panza']], ['chest', 'pecho', 'body', '🫁', []], ['elbow', 'codo', 'body', '💪', []], ['tongue', 'lengua', 'body', '👅', []],
  ['lips', 'labios', 'body', '👄', []], ['eyebrows', 'cejas', 'body', '🤨', []], ['heart', 'corazon', 'body', '❤️', []], ['brain', 'cerebro', 'body', '🧠', []],
  /* familia y escuela (vocabulario útil) */
  ['mother', 'mama', 'family', '👩', ['madre', 'mom']], ['father', 'papa', 'family', '👨', ['padre', 'dad']], ['brother', 'hermano', 'family', '👦', []], ['sister', 'hermana', 'family', '👧', []],
  ['grandmother', 'abuela', 'family', '👵', []], ['grandfather', 'abuelo', 'family', '👴', []], ['family', 'familia', 'family', '👨‍👩‍👧', []], ['friend', 'amigo', 'family', '🧑‍🤝‍🧑', ['amiga']],
  ['teacher', 'profesor', 'school', '👩‍🏫', ['profesora', 'maestro', 'maestra', 'profe']], ['book', 'libro', 'school', '📕', []], ['pencil', 'lapiz', 'school', '✏️', []], ['school', 'escuela', 'school', '🏫', ['colegio']],
  ['house', 'casa', 'school', '🏠', []], ['water', 'agua', 'school', '💧', []], ['sun', 'sol', 'school', '☀️', []], ['tree', 'arbol', 'school', '🌳', []], ['flower', 'flor', 'school', '🌸', []], ['apple', 'manzana', 'school', '🍎', []],
  ['big', 'grande', 'adj', '🐘', []], ['small', 'pequeño', 'adj', '🐭', ['pequeña', 'chiquito']], ['happy', 'feliz', 'adj', '😊', ['contento']], ['sad', 'triste', 'adj', '😢', []], ['hello', 'hola', 'school', '👋', []], ['thank you', 'gracias', 'school', '🙏', []],
  ['good morning', 'buenos dias', 'school', '🌅', []], ['goodbye', 'adios', 'school', '👋', ['chao']], ['please', 'por favor', 'school', '🙏', []]
];
/* verbos para el presente simple: [inglés, español] */
const VERBS = [['play', 'jugar'], ['eat', 'comer'], ['drink', 'beber'], ['run', 'correr'], ['read', 'leer'], ['write', 'escribir'], ['swim', 'nadar'], ['sing', 'cantar'], ['dance', 'bailar'], ['go', 'ir'], ['do', 'hacer'], ['have', 'tener'],
  ['watch', 'mirar'], ['study', 'estudiar'], ['cry', 'llorar'], ['fly', 'volar'], ['like', 'gustar'], ['love', 'amar'], ['live', 'vivir'], ['work', 'trabajar'], ['walk', 'caminar'], ['talk', 'hablar'], ['sleep', 'dormir'],
  ['wash', 'lavar'], ['brush', 'cepillar'], ['fix', 'arreglar'], ['catch', 'atrapar'], ['teach', 'enseñar'], ['cook', 'cocinar'], ['clean', 'limpiar'], ['open', 'abrir'], ['close', 'cerrar'], ['help', 'ayudar'], ['jump', 'saltar'],
  ['draw', 'dibujar'], ['speak', 'hablar'], ['listen', 'escuchar'], ['ride', 'montar'], ['need', 'necesitar'], ['want', 'querer'], ['know', 'saber'], ['see', 'ver'], ['come', 'venir'], ['buy', 'comprar'], ['try', 'intentar'],
  ['carry', 'cargar'], ['finish', 'terminar'], ['miss', 'extrañar'], ['wake up', 'despertarse'], ['get up', 'levantarse'], ['climb', 'escalar'], ['paint', 'pintar'], ['learn', 'aprender'], ['use', 'usar'], ['make', 'hacer'], ['take', 'tomar']];
const ES_SHOW = { cafe: 'café', pajaro: 'pájaro', raton: 'ratón', leon: 'león', delfin: 'delfín', tiburon: 'tiburón', buho: 'búho', aguila: 'águila', pinguino: 'pingüino', estomago: 'estómago', corazon: 'corazón', lapiz: 'lápiz', arbol: 'árbol', mama: 'mamá', papa: 'papá', adios: 'adiós', 'buenos dias': 'buenos días', hamster: 'hámster', profesor: 'profesor(a)' };
for (const e of EN) e[1] = ES_SHOW[e[1]] || e[1];
const VERB_BY_ES = Object.fromEntries(VERBS.map(([e, s]) => [s, e]));
const VERB_SET = new Set(VERBS.map(v => v[0]));

function thirdPerson(v) {
  if (v === 'have') return 'has';
  if (v === 'go') return 'goes';
  if (v === 'do') return 'does';
  const parts = v.split(' '); const w = parts[0], rest = parts.slice(1).join(' ');
  let r;
  if (/(s|sh|ch|x|z|o)$/.test(w)) r = w + 'es';
  else if (/[^aeiou]y$/.test(w)) r = w.slice(0, -1) + 'ies';
  else r = w + 's';
  return rest ? r + ' ' + rest : r;
}
function conjugate(v) {
  const es = (VERBS.find(x => x[0] === v) || [])[1];
  const t = thirdPerson(v);
  return `Verbo ${v}${es ? ` (${es})` : ''} en presente simple ✏️\nI ${v}\nYou ${v}\nHe ${t} ⭐\nShe ${t} ⭐\nIt ${t} ⭐\nWe ${v}\nThey ${v}\n\n🚫 Negativa: I don't ${v} · She doesn't ${v}\n❓ Pregunta: Do you ${v}? · Does he ${v}?`;
}
/* revisa oraciones tipo "she play soccer" */
function checkSimplePresent(raw) {
  const q = ' ' + norm(raw).replace(/’/g, "'") + ' ';
  const m = q.match(/\s(he|she|it|my (?:mom|dad|mother|father|brother|sister|dog|cat|friend|teacher)|[a-z]+ (?:boy|girl))\s+(doesn t |doesnt |don t |dont )?([a-z]+)(\s|$)/);
  if (!m) return null;
  const subj = m[1], neg = m[2], verb = m[3];
  const base = VERB_SET.has(verb) ? verb : null;
  const conj = VERBS.map(v => v[0]).find(v => thirdPerson(v) === verb);
  const sentence = raw.trim();
  if (neg) {
    if (/don/.test(neg)) return { ok: false, text: `Casi 💪 Con "${subj}" usamos doesn't, no don't.\n✅ ${cap(subj)} doesn't ${base || conj || verb}…` };
    if (conj) return { ok: false, text: `¡Ojo! 👀 Después de doesn't el verbo va sin -s.\n✅ ${cap(subj)} doesn't ${conj}…` };
    if (base) return { ok: true, text: `¡Muy bien! 🎉 "${sentence}" está correcta: doesn't + verbo sin -s.` };
    return null;
  }
  if (base) return { ok: false, text: `¡Casi! 💪 Con ${subj} el verbo lleva -s.\n❌ ${subj} ${verb}\n✅ ${subj} ${thirdPerson(verb)}` };
  if (conj) return { ok: true, text: `¡Excelente! 🌟 "${sentence}" está muy bien escrita: con ${subj} el verbo lleva -s (${verb}).` };
  return null;
}
function checkPluralSubject(raw) {
  const q = ' ' + norm(raw) + ' ';
  const m = q.match(/\s(i|you|we|they)\s+([a-z]+)(\s|$)/);
  if (!m) return null;
  const conj = VERBS.map(v => v[0]).find(v => thirdPerson(v) === m[2] && v !== m[2]);
  if (conj) return { ok: false, text: `¡Casi! 💪 Con "${m[1]}" el verbo NO lleva -s.\n❌ ${m[1]} ${m[2]}\n✅ ${m[1]} ${conj}` };
  if (VERB_SET.has(m[2])) return { ok: true, text: `¡Muy bien! 🎉 "${raw.trim()}" está correcta: con ${m[1]} el verbo va sin -s.` };
  return null;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numberToEnglish(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS_EN[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberToEnglish(n % 100) : '');
  if (n < 1000000) return numberToEnglish(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + numberToEnglish(n % 1000) : '');
  return String(n);
}
function englishToNumber(text) {
  const t = norm(text).replace(/-/g, ' ').replace(/\band\b/g, ' ').split(' ').filter(Boolean);
  let total = 0, cur = 0, seen = false;
  for (const w of t) {
    const o = ONES.indexOf(w), d = TENS_EN.indexOf(w);
    if (o >= 0) { cur += o; seen = true; }
    else if (d >= 2) { cur += d * 10; seen = true; }
    else if (w === 'hundred') { cur *= 100; seen = true; }
    else if (w === 'thousand') { total += cur * 1000; cur = 0; seen = true; }
    else if (seen) break;
  }
  return seen ? total + cur : null;
}
function findEnglishWord(q) {
  /* busca la palabra en inglés dentro de la pregunta */
  let best = null;
  for (const e of EN) { if (has(q, e[0]) && (!best || e[0].length > best[0].length)) best = e; }
  return best;
}
function findSpanishWord(q) {
  let best = null;
  for (const e of EN) {
    const forms = [e[1], ...e[4]].map(norm);
    for (const f of forms) if (new RegExp('(^|\\s)' + f + '(es|s)?($|\\s)').test(q) && (!best || f.length > best.len)) best = { e, len: f.length };
  }
  return best && best.e;
}

/* ───────── clasificadores de ciencias ───────── */
const LIVING = ['perro', 'gato', 'vaca', 'caballo', 'pajaro', 'pez', 'arbol', 'flor', 'planta', 'hongo', 'champiñon', 'persona', 'niño', 'niña', 'bebe', 'mariposa', 'abeja', 'hormiga', 'rosa', 'girasol', 'pasto', 'cesped', 'bacteria', 'gusano', 'rana', 'serpiente', 'leon', 'tigre', 'elefante', 'gallina', 'pollito', 'semilla', 'moho', 'alga', 'cactus', 'mono', 'oso', 'ballena', 'tiburon', 'delfin', 'araña', 'mosquito', 'lombriz', 'tortuga', 'conejo', 'raton', 'jaguar', 'loro', 'helecho', 'musgo', 'humano', 'mama', 'papa', 'yo'];
const NONLIVING = ['piedra', 'roca', 'agua', 'aire', 'silla', 'mesa', 'carro', 'juguete', 'lapiz', 'libro', 'sol', 'luna', 'nube', 'fuego', 'arena', 'tierra', 'casa', 'celular', 'computador', 'robot', 'muñeca', 'pelota', 'balon', 'estrella', 'montaña', 'rio', 'mar', 'lluvia', 'hielo', 'vidrio', 'plastico', 'metal', 'ropa', 'zapato', 'televisor', 'reloj', 'cuaderno', 'bicicleta', 'avion', 'nevera'];
const SPECIAL_LIVING = { semilla: 'Una semilla está viva aunque parezca dormida 😴🌰: si tiene agua, aire y calor, germina y crece una planta.', fuego: 'El fuego 🔥 se mueve y "crece", pero NO es un ser vivo: no nace, no se alimenta ni tiene hijitos.', robot: 'Un robot 🤖 se mueve, pero no es un ser vivo: lo fabrican las personas y no nace ni crece.', sol: 'El sol ☀️ no es un ser vivo: es una estrella, una bola gigante de gas muy caliente. ¡Pero sin él los seres vivos no podrían vivir!', nube: 'Una nube ☁️ no es un ser vivo: es agua en gotitas flotando en el aire.' };
function classifyLiving(q) {
  if (!/(ser vivo|seres vivos|esta viv|estan viv|es vivo|tiene vida|no vivo|inerte)/.test(q)) return null;
  const words = q.split(' ');
  const found = [];
  for (const w of words) { const b0 = w.replace(/(es|s)$/, ''); const k = LIVING.includes(w) || NONLIVING.includes(w) ? w : LIVING.includes(b0) || NONLIVING.includes(b0) ? b0 : null; if (k && !found.includes(k)) found.push(k); }
  if (found.length > 1) return found.map(k => LIVING.includes(k) ? `✅ ${cap(art(k))} SÍ es un ser vivo.` : `❌ ${cap(art(k))} NO es un ser vivo.`).join('\n') + '\n\n💡 Los seres vivos nacen, crecen, se alimentan y se reproducen.';
  for (const w of words) {
    const base = w.replace(/(es|s)$/, '');
    for (const cand of [w, base]) {
      if (SPECIAL_LIVING[cand]) return SPECIAL_LIVING[cand];
      if (LIVING.includes(cand)) return `¡Sí! ✅ ${cap(art(cand))} es un ser vivo: nace, crece, se alimenta, respira y se reproduce. 🌱`;
      if (NONLIVING.includes(cand)) return `No ❌ ${cap(art(cand))} NO es un ser vivo: no nace, no crece ni se alimenta. Es un ser inerte. 🪨`;
    }
  }
  return null;
}
function art(w) { const fem = /a$|ion$|ad$|^nube$|^lluvia$|^flor$|^tierra$|^nevera$/.test(w) && !['mapa', 'planeta', 'dia', 'papa'].includes(w); return (fem ? 'la ' : 'el ') + w; }

const STATE_OF = { hielo: 'sólido 🧊', piedra: 'sólido 🪨', madera: 'sólido 🪵', lapiz: 'sólido ✏️', mesa: 'sólido', hierro: 'sólido', sal: 'sólido 🧂', azucar: 'sólido', arena: 'sólido', vidrio: 'sólido', agua: 'líquido 💧 (a temperatura normal)', leche: 'líquido 🥛', jugo: 'líquido 🧃', aceite: 'líquido', miel: 'líquido 🍯 (muy espeso)', sangre: 'líquido 🩸', gaseosa: 'líquido 🥤 (con gas por dentro)', lluvia: 'líquido 🌧️', aire: 'gaseoso 💨', vapor: 'gaseoso ♨️', humo: 'gaseoso 🌫️', oxigeno: 'gaseoso 🫧', helio: 'gaseoso 🎈', nube: 'pequeñas gotitas de agua líquida y hielo flotando ☁️', nieve: 'sólido ❄️', mantequilla: 'sólido 🧈 (se derrite con calor)', chocolate: 'sólido 🍫 (se derrite con calor)', helado: 'sólido 🍦 (se derrite rápido)', gas: 'gaseoso 💨' };
function classifyState(q) {
  if (!/(estado|solido|liquido|gaseoso|gas\b)/.test(q)) return null;
  for (const w of q.split(' ')) if (STATE_OF[w] && !/^(estado|gas)$/.test(w)) return `${cap(art(w))} está en estado ${STATE_OF[w]}.`;
  return null;
}
const PLANT_PART = { zanahoria: 'raíz 🥕', yuca: 'raíz', remolacha: 'raíz', rabano: 'raíz', papa: 'tallo (un tallo subterráneo llamado tubérculo) 🥔', cebolla: 'bulbo (un tallo con hojas gruesas) 🧅', apio: 'tallo', caña: 'tallo 🎋', esparrago: 'tallo', jengibre: 'tallo subterráneo', lechuga: 'hojas 🥬', espinaca: 'hojas', repollo: 'hojas', cilantro: 'hojas', acelga: 'hojas', te: 'hojas 🍵', brocoli: 'flor 🥦', coliflor: 'flor', alcachofa: 'flor', manzana: 'fruto 🍎', tomate: 'fruto 🍅', mango: 'fruto 🥭', naranja: 'fruto 🍊', aguacate: 'fruto 🥑', pepino: 'fruto 🥒', platano: 'fruto 🍌', banano: 'fruto 🍌', maracuya: 'fruto', fresa: 'fruto 🍓', uva: 'fruto 🍇', frijol: 'semilla 🫘', maiz: 'semilla 🌽', arroz: 'semilla 🍚', lenteja: 'semilla', cafe: 'semilla ☕ (el grano)', mani: 'semilla 🥜', garbanzo: 'semilla', arveja: 'semilla' };
function classifyPlantPart(q) {
  if (!/(parte|que es la|que es el|es raiz|es tallo|es hoja|es fruto|es flor|es semilla)/.test(q) || !/(planta|raiz|tallo|hoja|flor|fruto|semilla|parte|comemos)/.test(q)) return null;
  for (const w of q.split(' ')) { const b = w.replace(/s$/, ''); if (PLANT_PART[w] || PLANT_PART[b]) { const k = PLANT_PART[w] ? w : b; return `De ${art(k).replace(/^el /, 'el ')} nos comemos: ${PLANT_PART[k]}.`.replace('De el', 'Del'); } }
  return null;
}
const JOBS = { bombero: 'apaga incendios 🔥, rescata personas y animales y nos ayuda en emergencias. 🧑‍🚒', policia: 'cuida la seguridad de la comunidad, ayuda a las personas y hace cumplir las normas. 👮', medico: 'cuida nuestra salud: nos revisa, nos dice qué tenemos y nos receta medicinas. 👩‍⚕️', doctor: 'cuida nuestra salud: nos revisa y nos ayuda a sanar. 👩‍⚕️', enfermero: 'cuida a los enfermos, pone vacunas y ayuda a los médicos. 💉', enfermera: 'cuida a los enfermos, pone vacunas y ayuda a los médicos. 💉', profesor: 'enseña a los niños a leer, escribir, contar y muchas cosas más. 👩‍🏫', maestro: 'enseña a los niños a leer, escribir, contar y muchas cosas más. 👩‍🏫', panadero: 'hace el pan, los pandebonos y las tortas que comemos. 🧑‍🍳', cartero: 'lleva las cartas y los paquetes a las casas. 📮', campesino: 'cultiva la tierra y cría animales: gracias a él tenemos frutas, verduras, leche y huevos. 🧑‍🌾', agricultor: 'siembra y cosecha los alimentos. 🌽', recolector: 'recoge la basura de las casas y las calles para mantener limpia la comunidad. 🚛', carpintero: 'hace muebles y cosas de madera, como mesas, sillas y puertas. 🪚', veterinario: 'cuida la salud de los animales. 🐾', odontologo: 'cuida nuestros dientes. 🦷', conductor: 'maneja buses, taxis o camiones para llevar personas o cosas. 🚌', pescador: 'pesca en ríos y mares para que tengamos pescado. 🎣', albañil: 'construye casas, paredes y edificios. 🧱', mecanico: 'arregla carros y motos. 🔧', zapatero: 'arregla y fabrica zapatos. 👞', costurera: 'hace y arregla la ropa. 🧵', sastre: 'hace y arregla la ropa. 🧵', tendero: 'vende en la tienda del barrio los productos que necesitamos. 🏪', vendedor: 'vende productos a las personas. 🛍️', bibliotecario: 'cuida los libros de la biblioteca y nos ayuda a encontrarlos. 📚', cocinero: 'prepara comidas deliciosas. 🍲', piloto: 'maneja aviones. ✈️', electricista: 'arregla la luz y los cables. 💡', jardinero: 'cuida las plantas y los jardines. 🌷' };
function jobAnswer(q) {
  if (!/(que hace|para que sirve|trabajo de|oficio de|en que trabaja|quien es el|quien es la|que hacen)/.test(q)) return null;
  for (const w of q.split(' ')) { const b = w.replace(/(es|s)$/, ''); const k = JOBS[w] ? w : JOBS[b] ? b : null; if (k) return `El ${k} ${JOBS[k]}`.replace(/^El (enfermera|costurera)/, 'La $1'); }
  return null;
}
const COLLECTIVE = { oveja: 'rebaño 🐑', abeja: 'enjambre 🐝', pez: 'cardumen 🐟', peces: 'cardumen 🐟', perro: 'jauría 🐕', lobo: 'manada 🐺', elefante: 'manada 🐘', arbol: 'bosque o arboleda 🌳', libro: 'biblioteca 📚', musico: 'orquesta o banda 🎻', estrella: 'constelación ✨', isla: 'archipiélago 🏝️', soldado: 'ejército 💂', ave: 'bandada 🕊️', pajaro: 'bandada 🐦', vaca: 'vacada o ganado 🐄', cerdo: 'piara 🐖', jugador: 'equipo ⚽', alumno: 'alumnado 🎒', estudiante: 'estudiantado 🎒', diente: 'dentadura 🦷', hoja: 'follaje 🍃', mueble: 'mobiliario 🪑', pino: 'pinar 🌲', palabra: 'vocabulario 📖', barco: 'flota ⛵', caballo: 'manada o caballada 🐎', persona: 'gente o multitud 👥', cancion: 'cancionero 🎶' };
function collectiveAnswer(q) {
  if (!/colectiv|grupo de|conjunto de/.test(q)) return null;
  for (const w of q.split(' ')) { const b = w.replace(/(es|s)$/, ''); const k = COLLECTIVE[w] ? w : COLLECTIVE[b] ? b : null; if (k) return `Un grupo de ${k}s se llama ${COLLECTIVE[k]}.`.replace('pezs', 'peces').replace('pecess', 'peces').replace(/ons /, 'ones ').replace('arbols', 'árboles').replace('musicos', 'músicos').replace('aves', 'aves').replace('cancions', 'canciones').replace('jugadors', 'jugadores'); }
  return null;
}
function pluralOf(word) {
  const w = word.toLowerCase();
  if (/z$/.test(w)) return w.slice(0, -1) + 'ces';
  if (/[aeiouáéó]$/.test(w)) return w + 's';
  if (/[íú]$/.test(w)) return w + 'es';
  if (/(s|x)$/.test(w) && !/[aeiou]s$/.test(w.slice(-2)) ) return w + 'es';
  if (/ión$/.test(w)) return w.replace(/ión$/, 'iones');
  if (/(lunes|martes|miercoles|jueves|viernes|crisis|virus|torax|lapsus)$/.test(w)) return w;
  return w + 'es';
}
function pluralAnswer(raw, q) {
  const m = q.match(/plural de (?:la palabra )?([a-zñ]+)/) || q.match(/([a-zñ]+) en plural/);
  if (!m) return null;
  const rawWord = (raw.match(new RegExp(m[1].split('').join('[\\u0300-\\u036f]?'), 'i')) || [m[1]])[0];
  const word = rawWord.toLowerCase();
  const irregular = { pez: 'peces', lapiz: 'lápices', lápiz: 'lápices', luz: 'luces', voz: 'voces', raiz: 'raíces', raíz: 'raíces', cancion: 'canciones', canción: 'canciones', camion: 'camiones', camión: 'camiones', avion: 'aviones', avión: 'aviones', raton: 'ratones', ratón: 'ratones', leon: 'leones', león: 'leones', jabali: 'jabalíes', papel: 'papeles', reloj: 'relojes', virus: 'virus', lunes: 'lunes', examen: 'exámenes', joven: 'jóvenes', origen: 'orígenes' };
  const pl = irregular[word] || pluralOf(word);
  let rule = /z$/.test(word) ? 'Termina en z, así que cambiamos la z por c y agregamos -es.' : /[aeiouáéó]$/.test(word) ? 'Termina en vocal, así que solo agregamos -s.' : pl === word ? 'Esta palabra se queda igual en plural.' : 'Termina en consonante, así que agregamos -es.';
  return `El plural de "${word}" es "${pl}". ✅\n${rule}`;
}

/* ───────── abecedario ───────── */
const ABC = 'abcdefghijklmnñopqrstuvwxyz'.split('');
const WORD_FOR = { a: 'avión ✈️', b: 'barco ⛵', c: 'casa 🏠', d: 'dado 🎲', e: 'elefante 🐘', f: 'flor 🌸', g: 'gato 🐱', h: 'helado 🍦', i: 'iguana 🦎', j: 'jirafa 🦒', k: 'kiwi 🥝', l: 'luna 🌙', m: 'mariposa 🦋', n: 'nube ☁️', ñ: 'ñandú', o: 'oso 🐻', p: 'perro 🐶', q: 'queso 🧀', r: 'ratón 🐭', s: 'sol ☀️', t: 'tortuga 🐢', u: 'uvas 🍇', v: 'vaca 🐮', w: 'wafle 🧇', x: 'xilófono 🎶', y: 'yoyo 🪀', z: 'zapato 👟' };
function letterAnswer(q) {
  let m = q.match(/(?:despues de la|despues de|sigue de la|sigue a la|va despues de la|viene despues de la) (?:letra )?([a-zñ])\b/);
  if (m) { const i = ABC.indexOf(m[1]); if (i >= 0 && i < 26) return `Después de la ${m[1].toUpperCase()} va la ${ABC[i + 1].toUpperCase()}. 🔤 (${ABC[i + 1].toUpperCase()} de ${WORD_FOR[ABC[i + 1]]})`; if (i === 26) return '¡La Z es la última letra del abecedario! 🏁'; }
  m = q.match(/(?:antes de la|antes de|va antes de la) (?:letra )?([a-zñ])\b/);
  if (m) { const i = ABC.indexOf(m[1]); if (i > 0) return `Antes de la ${m[1].toUpperCase()} va la ${ABC[i - 1].toUpperCase()}. 🔤`; if (i === 0) return '¡La A es la primera letra! No hay ninguna antes. 🥇'; }
  m = q.match(/(?:palabra|palabras|algo) (?:que empiec\w* |que comienc\w* |con )(?:con |por )?(?:la )?(?:letra )?([a-zñ])\b/) || q.match(/^([a-zñ]) de\b/);
  if (m && WORD_FOR[m[1]]) return `Con la ${m[1].toUpperCase()}: ${WORD_FOR[m[1]]}. 🔤`;
  m = q.match(/(?:que numero|que lugar|posicion|cuantas letras hay antes).*?letra ([a-zñ])\b/);
  if (m) { const i = ABC.indexOf(m[1]); return `La ${m[1].toUpperCase()} es la letra número ${i + 1} del abecedario. 🔢`; }
  return null;
}
function sortAnswer(raw, q) {
  if (!/(ordena|orden alfabetico|alfabeticamente)/.test(q)) return null;
  const after = raw.split(/[:]/).slice(1).join(':') || raw.replace(/^.*?(alfab[ée]ticamente|alfab[ée]tico|ordena)/i, '');
  const words = after.split(/[,;\s]+y\s+|[,;]|\s+/).map(w => w.trim().replace(/[^\p{L}]/gu, '')).filter(w => w.length > 1 && !/^(las|los|estas|estos|palabras|por|orden|en|de|y)$/i.test(w));
  if (words.length < 2) return null;
  const sorted = words.slice().sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  return `En orden alfabético 🔤:\n${sorted.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\n💡 Miramos la primera letra; si es igual, miramos la segunda.`;
}
function vowelAnswer(raw, q) {
  const m = q.match(/(?:cuantas (vocales|consonantes|letras|silabas) tiene (?:la palabra )?)([a-zñ]+)/);
  if (!m) return null;
  const w = m[2], vow = w.replace(/[^aeiou]/g, ''), letters = w.length;
  if (m[1] === 'vocales') return `"${w}" tiene ${vow.length} vocal${vow.length === 1 ? '' : 'es'}: ${vow.split('').join(', ')}. 🔤`;
  if (m[1] === 'consonantes') { const c = w.replace(/[aeiou]/g, ''); return `"${w}" tiene ${c.length} consonante${c.length === 1 ? '' : 's'}: ${c.split('').join(', ')}.`; }
  if (m[1] === 'letras') return `"${w}" tiene ${letters} letras: ${w.split('').join(' - ')}. 🔤`;
  return null;
}

/* ───────── adjetivos ───────── */
const ADJ = ['grande', 'pequeño', 'pequeña', 'alto', 'alta', 'bajo', 'baja', 'bonito', 'bonita', 'feo', 'fea', 'rapido', 'rapida', 'lento', 'lenta', 'feliz', 'triste', 'alegre', 'rojo', 'roja', 'azul', 'verde', 'amarillo', 'amarilla', 'negro', 'negra', 'blanco', 'blanca', 'gordo', 'gorda', 'flaco', 'flaca', 'fuerte', 'debil', 'nuevo', 'nueva', 'viejo', 'vieja', 'limpio', 'limpia', 'sucio', 'sucia', 'caliente', 'frio', 'fria', 'dulce', 'salado', 'salada', 'delicioso', 'deliciosa', 'peludo', 'peluda', 'suave', 'duro', 'dura', 'inteligente', 'valiente', 'amable', 'generoso', 'generosa', 'travieso', 'traviesa', 'hermoso', 'hermosa', 'largo', 'larga', 'corto', 'corta', 'ancho', 'ancha', 'redondo', 'redonda', 'brillante', 'oscuro', 'oscura', 'claro', 'clara', 'colombiano', 'colombiana', 'juguetón', 'jugueton', 'dormilon', 'cansado', 'cansada', 'enorme', 'diminuto', 'diminuta', 'tranquilo', 'tranquila', 'ruidoso', 'ruidosa', 'mojado', 'mojada', 'seco', 'seca', 'gris', 'morado', 'morada', 'rosado', 'rosada', 'veloz', 'perezoso', 'perezosa', 'curioso', 'curiosa', 'simpatico', 'simpatica', 'gracioso', 'graciosa', 'pesado', 'pesada', 'liviano', 'liviana', 'facil', 'dificil', 'blandito', 'calientito', 'lindo', 'linda', 'bueno', 'buena', 'malo', 'mala'];
const ANTON = { grande: 'pequeño', alto: 'bajo', rapido: 'lento', feliz: 'triste', alegre: 'triste', limpio: 'sucio', caliente: 'frío', nuevo: 'viejo', fuerte: 'débil', gordo: 'flaco', bonito: 'feo', largo: 'corto', claro: 'oscuro', dulce: 'salado', duro: 'blando', mojado: 'seco', facil: 'difícil', bueno: 'malo', ruidoso: 'silencioso', pesado: 'liviano', ancho: 'angosto', valiente: 'miedoso' };
function adjectiveFinder(raw, q) {
  if (!/adjetiv/.test(q)) return null;
  const quoted = raw.match(/[“"']([^“"']+)[”"']/) || raw.match(/:\s*(.+)$/) || raw.match(/(?:oraci[oó]n|frase)\s+(.+)$/i);
  if (!quoted) return null;
  const sent = norm(quoted[1]);
  const found = sent.split(' ').filter(w => ADJ.includes(w));
  if (!found.length) return `Busqué en "${quoted[1].trim()}" y no encontré un adjetivo que yo conozca 🤔. Pregúntale a cada sustantivo "¿cómo es?": la respuesta es el adjetivo.`;
  return `En "${quoted[1].trim()}" ${found.length === 1 ? `el adjetivo es: ${found[0]}` : `los adjetivos son: ${found.join(', ')}`} ✅\n💡 Dicen cómo es el sustantivo.`;
}
function antonymAnswer(q) {
  const m = q.match(/(?:contrario|antonimo|opuesto) de (?:la palabra )?([a-zñ]+)/);
  if (!m) return null;
  const w = m[1].replace(/a$/, 'o'), inv = Object.entries(ANTON).find(([, v]) => norm(v) === m[1]);
  if (ANTON[m[1]] || ANTON[w]) return `Lo contrario de "${m[1]}" es "${ANTON[m[1]] || ANTON[w]}". 🔁`;
  if (inv) return `Lo contrario de "${m[1]}" es "${inv[0]}". 🔁`;
  return null;
}

/* ───────── regiones: ciudad / departamento → región ───────── */
const REGION_OF = { bogota: 'Andina', medellin: 'Andina', cali: 'Andina', bucaramanga: 'Andina', manizales: 'Andina', pereira: 'Andina', armenia: 'Andina', ibague: 'Andina', neiva: 'Andina', tunja: 'Andina', pasto: 'Andina', popayan: 'Andina', cucuta: 'Andina', antioquia: 'Andina', boyaca: 'Andina', cundinamarca: 'Andina', santander: 'Andina', huila: 'Andina', tolima: 'Andina', caldas: 'Andina', risaralda: 'Andina', quindio: 'Andina',
  barranquilla: 'Caribe', cartagena: 'Caribe', 'santa marta': 'Caribe', monteria: 'Caribe', valledupar: 'Caribe', sincelejo: 'Caribe', riohacha: 'Caribe', atlantico: 'Caribe', bolivar: 'Caribe', magdalena: 'Caribe', cordoba: 'Caribe', sucre: 'Caribe', cesar: 'Caribe', guajira: 'Caribe',
  quibdo: 'Pacífica', buenaventura: 'Pacífica', tumaco: 'Pacífica', choco: 'Pacífica', guapi: 'Pacífica',
  villavicencio: 'Orinoquía', yopal: 'Orinoquía', arauca: 'Orinoquía', 'puerto carreño': 'Orinoquía', meta: 'Orinoquía', casanare: 'Orinoquía', vichada: 'Orinoquía',
  leticia: 'Amazonía', florencia: 'Amazonía', mocoa: 'Amazonía', amazonas: 'Amazonía', caqueta: 'Amazonía', putumayo: 'Amazonía', guaviare: 'Amazonía', vaupes: 'Amazonía', guainia: 'Amazonía',
  'san andres': 'Insular', providencia: 'Insular', gorgona: 'Insular', malpelo: 'Insular' };
function regionAnswer(q) {
  if (!/(region|donde queda|donde esta|en que parte)/.test(q)) return null;
  const keys = Object.keys(REGION_OF).sort((a, b) => b.length - a.length);
  for (const k of keys) if (has(q, k)) { const r = REGION_OF[k]; return `${cap(k.replace(/\b\w/g, c => c))} está en la región ${r}. ${{ Andina: '⛰️', Caribe: '🏖️', 'Pacífica': '🌧️', 'Orinoquía': '🐎', 'Amazonía': '🌳', Insular: '🏝️' }[r]}`.replace(/^./, c => c.toUpperCase()); }
  return null;
}

const COLOR_OF = { sol: ['amarillo', 'yellow', '🟡'], cielo: ['azul', 'blue', '🔵'], mar: ['azul', 'blue', '🔵'], pasto: ['verde', 'green', '🟢'], cesped: ['verde', 'green', '🟢'], hoja: ['verde', 'green', '🟢'], rana: ['verde', 'green', '🐸'], nube: ['blanca', 'white', '⚪'], nieve: ['blanca', 'white', '⚪'], leche: ['blanca', 'white', '🥛'], banano: ['amarillo', 'yellow', '🍌'], limon: ['verde', 'green', '🍋'], fresa: ['roja', 'red', '🍓'], tomate: ['rojo', 'red', '🍅'], sangre: ['roja', 'red', '🩸'], carbon: ['negro', 'black', '⚫'], noche: ['negra (oscura)', 'black', '🌙'], naranja: ['naranja', 'orange', '🍊'], zanahoria: ['naranja', 'orange', '🥕'], uva: ['morada', 'purple', '🍇'], berenjena: ['morada', 'purple', '🍆'], chocolate: ['café', 'brown', '🍫'], tierra: ['café', 'brown', '🟤'], elefante: ['gris', 'gray', '🐘'], raton: ['gris', 'gray', '🐭'], cerdo: ['rosado', 'pink', '🐷'], flamenco: ['rosado', 'pink', '🦩'], oso: ['café', 'brown', '🐻'], cuervo: ['negro', 'black', '🐦‍⬛'] };
function colorOf(q) {
  if (!/(de que color|que color|color de|color tiene)/.test(q)) return null;
  for (const w of q.split(' ')) { const b = w.replace(/s$/, ''); const k = COLOR_OF[w] ? w : COLOR_OF[b] ? b : null; if (k) { const [es, en, em] = COLOR_OF[k]; return `${cap(art(k))} es de color ${es} ${em}\nEn inglés: ${en}. 🗣️ "The ${k === 'sol' ? 'sun' : k === 'cielo' ? 'sky' : k === 'pasto' || k === 'cesped' ? 'grass' : k === 'nube' ? 'cloud' : k === 'mar' ? 'sea' : 'thing'} is ${en}."`.replace(/"The thing is (\w+)\."/, 'It is $1.'); } }
  return null;
}

/* ───────── matemáticas extra ───────── */
function tableAnswer(q) {
  const m = mathText(q).match(/tabla (?:de multiplicar )?del? (\d+)/);
  if (!m) return null;
  const n = +m[1];
  if (n > 20) return `La tabla del ${n} es muy grande 😅. Mejor escríbeme la multiplicación exacta, por ejemplo ${n} × 7.`;
  return `Tabla del ${n} ✖️\n${Array.from({ length: 10 }, (_, i) => `${n} × ${i + 1} = ${n * (i + 1)}`).join('\n')}\n\n💡 Cada resultado es el anterior + ${n}.`;
}
function fracCompare(q) {
  const t = mathText(q);
  if (!/(mayor|menor|mas grande|mas pequeñ|compar|cual es mas)/.test(t)) return null;
  const fs = t.match(/\d+\/\d+/g);
  if (fs && fs.length >= 2) {
    const [a, b] = fs.map(C.parseFr);
    const m = lcm(a.d, b.d), an = a.n * m / a.d, bn = b.n * m / b.d;
    const verdict = an === bn ? `${a.raw()} y ${b.raw()} son iguales (equivalentes) 🟰` : an > bn ? `${a.raw()} es mayor que ${b.raw()} ✅` : `${b.raw()} es mayor que ${a.raw()} ✅`;
    return `${verdict}\n\nLas pasamos al mismo denominador (${m}):\n• ${a.raw()} = ${an}/${m}\n• ${b.raw()} = ${bn}/${m}\nComparamos numeradores: ${an} ${an > bn ? '>' : an < bn ? '<' : '='} ${bn}.`;
  }
  const ns = (t.match(/\b\d+\b/g) || []).map(Number);
  if (ns.length === 2 && /(mayor|menor|mas grande)/.test(t)) {
    const [x, y] = ns; if (x === y) return `${x} y ${y} son iguales. 🟰`;
    return `${Math.max(x, y)} es mayor que ${Math.min(x, y)} ✅ (${Math.max(x, y)} > ${Math.min(x, y)})\n💡 Compara primero cuántas cifras tienen; si tienen las mismas, compara de izquierda a derecha.`;
  }
  return null;
}
function fracSimplify(q) {
  const t = mathText(q);
  const m = t.match(/(simplific\w*|reduc\w*|equivalent\w*|como se lee|lee|leer|que es|amplific\w*)\D*(\d+)\/(\d+)/);
  if (!m) return null;
  const f = new Fr(+m[2], +m[3]);
  if (f.d === 0) return 'Una fracción no puede tener 0 abajo (en el denominador). 🙅';
  if (/simplific|reduc/.test(m[1])) {
    const g = gcd(f.n, f.d);
    if (g === 1) return `${f.raw()} ya está simplificada ✅: no hay un número (aparte del 1) que divida a ${f.n} y a ${f.d} a la vez.`;
    const s = f.simple;
    return `${f.raw()} = ${s.raw ? s.raw() : s} ✅\n\nDividimos arriba y abajo entre ${g} (el número más grande que divide a los dos):\n• ${f.n} ÷ ${g} = ${s.n}\n• ${f.d} ÷ ${g} = ${s.d}${s.d === 1 ? `\n¡Es un número entero: ${s.n}!` : ''}`;
  }
  if (/equivalent|amplific/.test(m[1])) {
    return `Fracciones equivalentes a ${f.raw()} 🟰\n${[2, 3, 4, 5].map(k => `• ${f.raw()} = ${f.n * k}/${f.d * k} (× ${k} arriba y abajo)`).join('\n')}${gcd(f.n, f.d) > 1 ? `\n• Y simplificada: ${f.simple}` : ''}`;
  }
  const typeTxt = f.n < f.d ? 'Es propia (vale menos que 1 entero).' : f.n === f.d ? 'Vale exactamente 1 entero.' : `Es impropia (vale más que 1 entero)${C.mixed(f) ? `: ${C.mixed(f)}` : ''}.`;
  return `${f.raw()} se lee "${readFraction(f.n, f.d)}". 🗣️\nSignifica que dividimos el entero en ${f.d} partes iguales y tomamos ${f.n}.\n${typeTxt}`;
}
function fracOfNumber(q) {
  const t = mathText(q);
  const m = t.match(/(\d+)\/(\d+)\s+de\s+(\d+)/);
  if (!m) return null;
  return C.explainFracOfNumber(new Fr(+m[1], +m[2]), +m[3]);
}

/* ───────── problemas con palabras ───────── */
function wordProblem(raw, q) {
  const t = C.wordsToDigits(q);
  const nums = (t.match(/\b\d+\b/g) || []).map(Number);
  if (nums.length < 2 || nums.length > 3) return null;
  if (!/(cuant|cuanto|total|quedan|queda|tiene|recibe|toca|faltan|hay|sobran|diferencia|reparte|cada|juntos)/.test(t)) return null;
  const rawUnit = String(raw).match(/\d+\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]{3,})/), unitMatch = t.match(/\d+\s+([a-zñ]{3,})/);
  const askUnit = String(raw).match(/cu[aá]nt[oa]s\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]{3,})/i);
  const unit = askUnit && !/^(hay|tiene|tienes|tengo|tenemos|tienen|quedan|queda|quedaron|le|les|me|te|nos|son|recibe|recibio|reciben|faltan|falta|sobran|necesita|necesitas)$/i.test(askUnit[1]) ? askUnit[1].toLowerCase() : rawUnit ? rawUnit[1].toLowerCase() : unitMatch ? unitMatch[1] : '';
  let op = null;
  if (/(reparte|repartir|repartimos|reparten|partes iguales|entre \d+ (amig|niñ|person|compañer|caja|bolsa|grupo|herman|estudiant)|cada uno recibe|a cada uno|le toca|les toca|cuantos le toca|cuantas le toca)/.test(t)) op = ':';
  else if (/(cada (caja|bolsa|paquete|mesa|fila|grupo|niño|niña|carro|plato|canasta|semana|dia|equipo|hoja|arbol|perro|araña|gato|mano|libro)\w* (tiene|trae|lleva|hay|con)|por cada|veces|docenas?|con \d+ [a-zñ]+ cada (uno|una)|con \d+ [a-zñ]+ cada|grupos de|filas de|cajas de|bolsas de|paquetes de)/.test(t)) op = '*';
  else if (/(quedan|queda|quedo|perdi|perdio|regale|regalo a|se comio|se comieron|me comi|gaste|gasto|vendio|vendi|se fueron|se rompi|se volaron|se escaparon|faltan|falta|cuantos mas|cuantas mas|diferencia|quito|presto|se llevo|dio|di |restan|se cayeron|se murieron|uso|usaron|devolvio)/.test(t)) op = '-';
  else if (/(en total|total|juntos|entre los dos|entre todos|le dan|me dan|te dan|le regalan|me regalan|te regalan|regalan|regalaron|compra|compro|compre|llegan|llegaron|agrega|agrego|sumar|mas|recoge|recogio|gano|encontro|encontre|ahorro|suben|subieron)/.test(t)) op = '+';
  if (!op) return null;
  const [a, b] = nums.length === 3 && op === '+' ? [nums[0] + nums[1], nums[2]] : nums;
  let res, opTxt, why;
  if (op === '+') { res = nums.reduce((s, n) => s + n, 0); opTxt = nums.join(' + '); why = 'juntamos o agregamos cantidades → sumamos ➕'; }
  else if (op === '-') { const x = Math.max(nums[0], nums[1]), y = Math.min(nums[0], nums[1]); res = x - y; opTxt = `${x} − ${y}`; why = /(faltan|falta|cuantos mas|cuantas mas|diferencia)/.test(t) ? 'queremos saber cuánto falta o la diferencia → restamos ➖' : 'nos quitan o se van cosas → restamos ➖'; }
  else if (op === '*') { res = nums.reduce((s, n) => s * n, 1); opTxt = nums.join(' × '); why = 'hay grupos iguales → multiplicamos ✖️'; }
  else { const x = nums[0], y = nums[1]; if (!y) return null; const qq = Math.floor(x / y), r = x % y; res = r ? `${qq} y ${r === 1 ? 'sobra' : 'sobran'} ${r}` : qq; opTxt = `${x} ÷ ${y}`; why = 'repartimos en partes iguales → dividimos ➗'; }
  void a; void b;
  return `¡Resolvamos el problema! 🧩\n📌 Datos: ${nums.join(' y ')}${unit ? ` (${unit})` : ''}.\n🤔 Operación: ${why}.\n🧮 ${opTxt} = ${res}\n✅ Respuesta: ${res}${unit && typeof res === 'number' ? ' ' + unit : ''}.`;
}

/* ───────── generadores creativos ───────── */
function storyGen(q) {
  const heroes = [['un jaguar llamado Teo', 'Teo'], ['una tortuga muy curiosa llamada Lupe', 'Lupe'], ['un niño llamado Mateo', 'Mateo'], ['una niña inventora llamada Sofía', 'Sofía'], ['un colibrí llamado Pico', 'Pico'], ['una ranita dorada llamada Lía', 'Lía']];
  const places = ['en la selva del Amazonas', 'en un pueblito entre montañas', 'a orillas del mar Caribe', 'en un páramo lleno de frailejones', 'en una escuela de la vereda'];
  const problems = [['el río se quedó sin agua', 'siguió las huellas de las nubes hasta encontrar una cascada escondida y abrió un camino para que el agua volviera'], ['una fuerte tormenta dejó a sus amigos perdidos', 'encendió una luciérnaga-linterna y los guió a todos de regreso a casa'], ['alguien botó basura en el bosque y los animales se enfermaron', 'organizó a todos para recoger la basura y sembrar árboles nuevos'], ['desapareció el libro mágico de la escuela', 'buscó pistas letra por letra, siguiendo el abecedario, hasta encontrarlo en la biblioteca']];
  let hero = pick(heroes), place = pick(places), prob = pick(problems);
  const custom = q.match(/(?:cuento|historia) (?:de|sobre) (?:un |una )?([a-zñ ]{3,30})/);
  if (custom) hero = [`${/a$/.test(custom[1].trim()) ? 'una' : 'un'} ${custom[1].trim()} muy valiente`, cap(custom[1].trim().split(' ')[0])];
  return `📖 Te invento un cuento:\n\n✨ Inicio: Había una vez ${hero[0]} que vivía ${place}. Todos los días jugaba y ayudaba a sus amigos.\n\n⚡ Nudo: Un día, ${prob[0]}. ¡Todos estaban muy preocupados!\n\n🌈 Desenlace: Entonces ${hero[1]} ${prob[1]}. Desde aquel día, todos aprendieron que juntos pueden resolver cualquier problema.\n\nFIN 🎉\n\n¿Te atreves a escribir tú otro final? ✍️`;
}
function argumentGen(raw, q) {
  const m = q.match(/(?:argumentativo|argumento|argumentos|opinion|convencer) (?:sobre|acerca de|para) (.+)$/) || q.match(/(?:argumentativo|argumentos) de (.+)$/);
  if (!m) return null;
  const topic = m[1].trim();
  return `📝 Modelo de texto argumentativo sobre ${topic}:\n\n1️⃣ Introducción (tesis): Considero que ${/^(el|la|los|las|que|por que|si) /.test(topic) ? topic : 'el tema de ' + topic} es muy importante para nuestra comunidad.\n\n2️⃣ Desarrollo (argumentos):\n• En primer lugar, porque… (escribe una razón).\n• Además, … (otra razón con un ejemplo de tu vida).\n• Por otra parte, según … (un dato o lo que dice un experto).\n\n3️⃣ Conclusión: Por lo tanto, … (repite tu opinión y propón algo que podamos hacer).\n\n✍️ Ahora complétalo con tus palabras y mándamelo; te digo si tiene las 3 partes.`;
}
function checkArgumentText(raw) {
  if (raw.length < 160) return null;
  const q = norm(raw);
  const hasThesis = /(considero|creo que|pienso que|opino|en mi opinion|debemos|deberia|es importante)/.test(q);
  const hasArgs = /(porque|ya que|puesto que|en primer lugar|ademas|por ejemplo|tambien)/.test(q);
  const hasConcl = /(en conclusion|por lo tanto|en resumen|finalmente|para terminar|por eso)/.test(q);
  if (!(hasThesis || hasArgs || hasConcl)) return null;
  const ok = [hasThesis, hasArgs, hasConcl].filter(Boolean).length;
  const praise = ok === 3 ? '¡Excelente texto! 🏆 Tiene las 3 partes.' : ok === 2 ? '¡Muy buen trabajo! 🌟 Ya casi está completo.' : '¡Buen comienzo! 💪';
  return `${praise}\n${hasThesis ? '✅' : '⬜'} Tesis u opinión clara\n${hasArgs ? '✅' : '⬜'} Argumentos con conectores (porque, además…)\n${hasConcl ? '✅' : '⬜'} Conclusión (en conclusión, por lo tanto…)${ok < 3 ? `\n\n💡 Te falta: ${[!hasThesis && 'decir tu opinión al inicio ("Considero que…")', !hasArgs && 'dar razones ("porque…", "además…")', !hasConcl && 'cerrar con "En conclusión…"'].filter(Boolean).join('; ')}.` : ''}`;
}

root.__TeoTools = { EN, VERBS, VERB_BY_ES, VERB_SET, thirdPerson, conjugate, checkSimplePresent, checkPluralSubject, numberToEnglish, englishToNumber, findEnglishWord, findSpanishWord,
  classifyLiving, classifyState, classifyPlantPart, jobAnswer, collectiveAnswer, pluralAnswer, pluralOf, letterAnswer, sortAnswer, vowelAnswer, adjectiveFinder, antonymAnswer, ADJ, ANTON,
  regionAnswer, colorOf, tableAnswer, fracCompare, fracSimplify, fracOfNumber, wordProblem, storyGen, argumentGen, checkArgumentText, ABC, WORD_FOR, LIVING, NONLIVING, STATE_OF, PLANT_PART, JOBS, COLLECTIVE };
})(typeof window !== 'undefined' ? window : globalThis);
/* Motor de conversación de Teo: entiende la intención, elige el tema,
   responde, crea ejercicios y revisa respuestas. */
(function (root) {
'use strict';
const C = root.__TeoCore, X = root.__TeoTools, TOPICS = root.__TeoTopics;
const { norm, has, any, pick, rnd, shuffle, Fr } = C;
const GRADES = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto'];
const byId = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const ICON = { 'Matemáticas': '🧮', 'Ciencias': '🔬', 'Lengua': '📖', 'Inglés': '🗣️', 'Ciencias Sociales': '🌎' };
const MATH = ['suma', 'resta', 'multiplicacion', 'division', 'fracciones'];

/* ───────── frases de Teo ───────── */
const PRAISE = ['¡Excelente{n}! 🎉', '¡Muy bien{n}! ⭐', '¡Eso es{n}! 🙌', '¡Lo lograste{n}! 🌟', '¡Súper respuesta{n}! 💪', '¡Bravo{n}! 👏', '¡Eres un crack{n}! 🚀', '¡Perfecto{n}! 🏆', '¡Qué cerebro tan poderoso{n}! 🧠✨'];
const CHEER = ['¡Casi{n}! 💛 No pasa nada, así se aprende.', '¡Uy, por poquito{n}! 💪', '¡Buen intento{n}! 🌱 Pensemos juntos.', 'Mmm, no es esa{n}, ¡pero vas muy bien! 🔎'];
const name = ctx => ctx && ctx.name ? ', ' + String(ctx.name).split(/\s+/)[0] : '';
const say = (list, ctx) => pick(list).replace('{n}', name(ctx));
const streakMsg = s => s >= 10 ? `\n🔥🔥🔥 ¡${s} seguidas! ¡Eres imparable!` : s >= 5 ? `\n🔥🔥 ¡${s} respuestas seguidas! ¡Increíble!` : s >= 3 ? `\n🔥 ¡${s} seguidas!` : '';

/* ───────── detección de temas ───────── */
const ENGLISH_HINT = /(ingles|english|como se dice|como se escribe .* en|que significa|traduc|in english|what is|what color|how do you say)/;
function topicScores(q, ctx) {
  const eng = ENGLISH_HINT.test(q);
  return TOPICS.map(t => {
    let s = 0;
    for (const k of t.keys) if (has(q, norm(k))) s += k.includes(' ') ? 3 : 2;
    let best = null, bestScore = 0;
    for (const f of t.facts) {
      let fs = 0;
      for (const k of f.k) if (has(q, norm(k))) fs += 1 + norm(k).split(' ').length * 0.6;
      if (fs > bestScore) { bestScore = fs; best = f; }
    }
    s += bestScore * 1.5;
    if (t.english) s += eng ? 4 : -0.5; else if (eng && s > 0) s -= 2;
    if (s > 0 && ctx && t.grade === ctx.grade) s += 1.2;
    if (s > 0 && ctx && t.id === ctx.lastTopic) s += 0.6;
    return { t, s, fact: best, factScore: bestScore };
  }).sort((a, b) => b.s - a.s);
}
function detectTopic(q, ctx) { const r = topicScores(q, ctx)[0]; return r && r.s >= 2 ? r : null; }
function gradeTopics(grade) { return TOPICS.filter(t => t.grade === (grade || 'Primero')); }
function topicLabel(t) { return `${ICON[t.subject] || '📚'} ${t.topic}${t.english ? ' (inglés)' : ''}`; }

/* ───────── ejercicios ───────── */
function bankFor(t) { try { return (root.AULAYA_QUESTION_BANK || {})[t.grade][t.subject][t.topic] || []; } catch (_) { return []; } }
function choiceEx(t, item) {
  const order = shuffle(item.answers.map((a, i) => i));
  const answers = order.map(i => item.answers[i]);
  return { topic: t.id, kind: 'choice', prompt: item.question, options: answers, answer: order.indexOf(item.correct), hint: item.hint || 'Lee con calma cada opción y descarta las que seguro no son.', explain: item.why || '' };
}
const EX = {
  suma(level) { const hard = level >= 2; const a = hard ? rnd(15, 89) : rnd(2, 9), b = hard ? rnd(11, 59) : rnd(1, 9); return { kind: 'num', prompt: `¿Cuánto es ${a} + ${b}? ➕`, answer: new Fr(a + b), hint: hard ? `Suma primero las unidades: ${a % 10} + ${b % 10}. Si pasas de 9, llevas 1 a las decenas.` : `Empieza en ${Math.max(a, b)} y cuenta ${Math.min(a, b)} más con los dedos ✋.`, explain: C.explainSum(a, b) }; },
  resta(level) { const hard = level >= 2; let a = hard ? rnd(30, 99) : rnd(6, 18), b = hard ? rnd(11, a - 5) : rnd(1, a - 1); return { kind: 'num', prompt: `¿Cuánto es ${a} − ${b}? ➖`, answer: new Fr(a - b), hint: hard ? `Resta primero las unidades. Si arriba hay menos, pide prestada una decena.` : `Empieza en ${a} y cuenta ${b} hacia atrás.`, explain: C.explainSub(a, b) }; },
  multiplicacion(level) { const a = rnd(2, 9), b = level >= 2 ? rnd(11, 25) : rnd(2, 10); return { kind: 'num', prompt: `¿Cuánto es ${b} × ${a}? ✖️`, answer: new Fr(a * b), hint: level >= 2 ? `Separa ${b} en ${b - (b % 10)} + ${b % 10} y multiplica cada parte por ${a}.` : `Piensa en la tabla del ${a}, o suma ${b} veces el ${a}.`, explain: C.explainMul(b, a) }; },
  division(level) { const b = rnd(2, 9), q = level >= 2 ? rnd(11, 30) : rnd(2, 10); return { kind: 'num', prompt: `¿Cuánto es ${b * q} ÷ ${b}? ➗`, answer: new Fr(q), hint: `¿Qué número multiplicado por ${b} da ${b * q}? Usa la tabla del ${b}.`, explain: C.explainDiv(b * q, b) }; },
  fracciones() {
    const type = rnd(1, 4);
    if (type === 1) { const d = rnd(3, 9), a = rnd(1, d - 2), b = rnd(1, d - a - 1 || 1); return { kind: 'frac', prompt: `¿Cuánto es ${a}/${d} + ${b}/${d}? 🍕`, answer: new Fr(a + b, d), hint: 'Tienen el mismo denominador: suma solo los de arriba (numeradores).', explain: C.explainFrac(new Fr(a, d), '+', new Fr(b, d)) }; }
    if (type === 2) { const s = pick([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5]]), k = rnd(2, 4); return { kind: 'frac', strict: true, prompt: `Simplifica la fracción ${s[0] * k}/${s[1] * k} ✂️`, answer: new Fr(s[0], s[1]), hint: `Divide arriba y abajo entre ${k}.`, explain: `${s[0] * k}/${s[1] * k} ÷ ${k} → ${s[0]}/${s[1]}` }; }
    if (type === 3) { const d = pick([2, 3, 4, 5]), n = rnd(1, d - 1), whole = d * rnd(2, 6); return { kind: 'num', prompt: `¿Cuánto es ${n}/${d} de ${whole}? 🧮`, answer: new Fr(whole * n / d), hint: `Primero divide ${whole} entre ${d}, luego multiplica por ${n}.`, explain: C.explainFracOfNumber(new Fr(n, d), whole) }; }
    const d = rnd(5, 9), a = rnd(1, d - 1); let b = rnd(1, d - 1); if (b === a) b = a === 1 ? 2 : a - 1;
    return { kind: 'choice', prompt: `¿Cuál fracción es mayor? ⚖️`, options: [`${a}/${d}`, `${b}/${d}`], answer: a > b ? 0 : 1, hint: 'Tienen el mismo denominador: gana la que tiene el numerador más grande.', explain: `${Math.max(a, b)}/${d} es mayor porque tiene más partes del mismo tamaño.` };
  },
  abecedario() {
    if (Math.random() < 0.6) { const i = rnd(0, 25), l = X.ABC[i]; return { kind: 'text', prompt: `¿Qué letra va después de la ${l.toUpperCase()}? 🔤`, accept: [X.ABC[i + 1]], letter: true, answer: X.ABC[i + 1].toUpperCase(), hint: `Canta el abecedario despacito hasta llegar a la ${l.toUpperCase()}…`, explain: `Después de la ${l.toUpperCase()} va la ${X.ABC[i + 1].toUpperCase()}.` }; }
    const w = pick(['mariposa', 'elefante', 'casa', 'tortuga', 'colombia', 'abecedario', 'sol', 'murcielago']), v = w.replace(/[^aeiou]/g, '').length;
    return { kind: 'num', prompt: `¿Cuántas vocales tiene la palabra "${w}"? 🗣️`, answer: new Fr(v), hint: 'Las vocales son a, e, i, o, u. Búscalas letra por letra.', explain: `"${w}" tiene ${v} vocales: ${w.replace(/[^aeiou]/g, '').split('').join(', ')}.` };
  },
  sustantivos() {
    if (Math.random() < 0.5) { const w = pick(['flor', 'lápiz', 'casa', 'pez', 'árbol', 'luz', 'niño', 'ratón', 'mesa', 'camión']); const irr = { 'lápiz': 'lápices', pez: 'peces', luz: 'luces', 'árbol': 'árboles', 'ratón': 'ratones', 'camión': 'camiones' }; const p = irr[w] || X.pluralOf(w); return { kind: 'text', prompt: `¿Cuál es el plural de "${w}"? 🔢`, accept: [norm(p)], answer: p, hint: 'Si termina en vocal agrega -s; en consonante, -es; si termina en z, cambia a -ces.', explain: `El plural de ${w} es ${p}.` }; }
    const set = pick([['Bogotá', 1], ['perro', 0], ['Valentina', 1], ['ciudad', 0], ['río Magdalena', 1], ['montaña', 0]]);
    return { kind: 'choice', prompt: `"${set[0]}" es un sustantivo… 🏷️`, options: ['común', 'propio'], answer: set[1], hint: 'Los propios nombran a uno en especial y van con mayúscula.', explain: set[1] ? `"${set[0]}" es propio: nombra a uno en especial y lleva mayúscula.` : `"${set[0]}" es común: nombra a cualquiera de su grupo.` };
  },
  adjetivo() {
    const s = pick([['El gato negro duerme.', 'negro'], ['La niña alegre canta.', 'alegre'], ['Tengo un balón nuevo.', 'nuevo'], ['El elefante enorme camina.', 'enorme'], ['La sopa caliente huele rico.', 'caliente'], ['Mi perro peludo ladra.', 'peludo']]);
    return { kind: 'text', prompt: `¿Cuál es el adjetivo en: "${s[0]}"? 🎨`, accept: [s[1]], answer: s[1], hint: 'Busca la palabra que dice cómo es el sustantivo.', explain: `"${s[1]}" dice cómo es: es el adjetivo.` };
  },
  vocab(cat, t) {
    const items = X.EN.filter(e => e[2] === cat);
    const e = pick(items);
    if (Math.random() < 0.6) return { topic: t, kind: 'text', prompt: `¿Cómo se dice "${e[1]}" en inglés? ${e[3]}`, accept: [e[0]], answer: e[0], hint: `Empieza con la letra "${e[0][0].toUpperCase()}" y tiene ${e[0].length} letras.`, explain: `${e[1]} = ${e[0]} ${e[3]}` };
    const opts = shuffle([e, ...shuffle(items.filter(x => x !== e && x[1] !== e[1])).slice(0, 2)]);
    return { topic: t, kind: 'choice', prompt: `¿Qué significa "${e[0]}"? ${cat === 'color' ? '' : e[3]}`, options: opts.map(o => o[1]), answer: opts.indexOf(e), hint: 'Piensa en el dibujo o en una canción en inglés que conozcas.', explain: `${e[0]} = ${e[1]} ${e[3]}` };
  },
  'numeros-en'() {
    const n = pick([rnd(1, 20), rnd(21, 99), rnd(11, 19)]);
    if (Math.random() < 0.5) return { kind: 'text', prompt: `Escribe en inglés el número ${n} 🔢`, accept: [norm(X.numberToEnglish(n)).replace(/-/g, ' ')], answer: X.numberToEnglish(n), hint: n > 20 ? 'Primero la decena (twenty, thirty, forty…) y luego la unidad, unidas con guion.' : n > 12 ? 'Del 13 al 19 terminan en -teen.' : 'Recuerda: one, two, three…', explain: `${n} = ${X.numberToEnglish(n)}` };
    return { kind: 'num', prompt: `¿Qué número es "${X.numberToEnglish(n)}"? 🔢`, answer: new Fr(n), hint: 'Lee la decena primero y luego la unidad.', explain: `${X.numberToEnglish(n)} = ${n}` };
  },
  'presente-simple'() {
    const subj = pick(['She', 'He', 'My mom', 'The dog', 'I', 'They', 'We', 'Sofía']);
    const v = pick(['play', 'eat', 'watch', 'study', 'go', 'read', 'have', 'brush', 'sing', 'fly']);
    const third = /^(she|he|my mom|the dog|sofía)$/i.test(subj);
    const tail = { play: 'soccer', eat: 'mangoes', watch: 'TV', study: 'English', go: 'to school', read: 'books', have: 'a cat', brush: 'my teeth', sing: 'songs', fly: 'kites' }[v];
    const ans = third ? X.thirdPerson(v) : v;
    return { kind: 'text', prompt: `Completa: ${subj} ___ (${v}) ${v === 'brush' && third ? 'her teeth' : tail}. ✏️`, accept: [ans], answer: ans, hint: third ? 'Con he, she, it el verbo lleva -s (o -es / -ies).' : 'Con I, you, we, they el verbo queda igual.', explain: `${subj} ${ans}… ${third ? '(tercera persona → lleva -s)' : '(sin -s)'}` };
  },
  'seres-vivos'() { if (Math.random() < 0.5) { const living = Math.random() < 0.5, w = living ? pick(['perro', 'girasol', 'hongo', 'mariposa', 'árbol', 'rana']) : pick(['piedra', 'silla', 'carro', 'pelota', 'agua', 'lápiz']); return { kind: 'choice', prompt: `¿${w.charAt(0).toUpperCase() + w.slice(1)} es un ser vivo? 🌱`, options: ['Sí', 'No'], answer: living ? 0 : 1, hint: 'Pregúntate: ¿nace, crece y se alimenta?', explain: living ? `Sí: ${w} nace, crece y se alimenta.` : `No: ${w} no nace ni crece.` }; } return null; },
  materia() { if (Math.random() < 0.5) { const e = pick([['hielo', 0], ['leche', 1], ['vapor', 2], ['piedra', 0], ['jugo', 1], ['aire', 2]]); return { kind: 'choice', prompt: `¿En qué estado está ${e[0] === 'aire' || e[0] === 'hielo' || e[0] === 'vapor' || e[0] === 'jugo' ? 'el' : 'la'} ${e[0]}? 🧪`, options: ['Sólido', 'Líquido', 'Gaseoso'], answer: e[1], hint: '¿Tiene forma fija? ¿Se derrama? ¿Se esparce por el aire?', explain: `${e[0]} → ${['sólido', 'líquido', 'gaseoso'][e[1]]}.` }; } return null; },
  planta() { if (Math.random() < 0.5) { const e = pick([['la zanahoria', 0], ['la lechuga', 2], ['el tomate', 4], ['el frijol', 5], ['el brócoli', 3], ['la caña de azúcar', 1]]); return { kind: 'choice', prompt: `¿Qué parte de la planta es ${e[0]}? 🌱`, options: ['Raíz', 'Tallo', 'Hoja', 'Flor', 'Fruto', 'Semilla'], answer: e[1], hint: '¿Crece bajo la tierra? ¿Es verde y plana? ¿Tiene semillas adentro?', explain: `${e[0]} es ${['raíz', 'tallo', 'hoja', 'flor', 'fruto', 'semilla'][e[1]]}.` }; } return null; }
};
function makeExercise(t, ctx) {
  const level = (ctx && ctx.level) || (['Primero', 'Segundo'].includes(t.grade) ? 1 : 2);
  let ex = null;
  if (EX[t.id]) ex = EX[t.id](level);
  else if (t.id === 'colores') ex = EX.vocab('color', t.id);
  else if (t.id === 'animales-en') ex = EX.vocab('animal', t.id);
  else if (t.id === 'cuerpo-en') ex = EX.vocab('body', t.id);
  if (!ex) { const bank = bankFor(t); if (bank.length) ex = choiceEx(t, pick(bank)); }
  if (!ex) return null;
  ex.topic = t.id;
  return ex;
}
function exerciseText(ex, n) {
  let s = (n ? `Reto #${n} 🎯\n` : '') + ex.prompt;
  if (ex.kind === 'choice') s += '\n' + ex.options.map((o, i) => `${'ABCDEF'[i]}) ${o}`).join('\n') + '\n\nResponde con la letra o la respuesta. ✍️';
  else s += '\n\nEscribe tu respuesta. ✍️';
  return s;
}
/* revisa la respuesta del estudiante. Devuelve null si el mensaje no parece una respuesta */
function judge(ex, raw) {
  const q = norm(raw);
  if (ex.kind === 'num' || ex.kind === 'frac') {
    const v = C.parseAnswerNumber(raw);
    if (!v) return null;
    if (ex.kind === 'frac' && ex.strict) { const ok = v.n === ex.answer.n && v.d === ex.answer.d; const eq = v.eq(ex.answer); return { ok, near: !ok && eq, given: `${v.n}/${v.d}` }; }
    return { ok: v.eq(ex.answer), given: v.toString() };
  }
  if (ex.kind === 'choice') {
    let idx = -1;
    const letter = q.match(/^(?:la |opcion |es la |respuesta )?([a-f])$/) || q.match(/^(?:la|opcion|es la|respuesta) ([a-f])\b/);
    if (letter) idx = 'abcdef'.indexOf(letter[1]);
    if (idx < 0) ex.options.forEach((o, i) => { if (q === norm(o)) idx = i; });
    if (idx < 0) { const lp = q.match(/^([a-f])\s/); if (lp && ex.options['abcdef'.indexOf(lp[1])] && q.includes(norm(ex.options['abcdef'.indexOf(lp[1])]))) idx = 'abcdef'.indexOf(lp[1]); }
    if (idx < 0) { const num = q.match(/^(\d)$/); if (num) idx = +num[1] - 1; }
    if (idx < 0) ex.options.forEach((o, i) => { const on = norm(o); if (q === on || (on.length > 2 && (q.includes(on) || (q.length > 2 && on.includes(q) && q.length >= on.length * 0.6)))) idx = i; });
    if (idx < 0 && /^(si|sí|no)$/.test(q)) idx = ex.options.findIndex(o => norm(o) === q);
    if (idx < 0 || idx >= ex.options.length) return null;
    return { ok: idx === ex.answer, given: ex.options[idx] };
  }
  if (ex.kind === 'text') {
    const clean = q.replace(/^(es |la |el |se dice |respuesta |mi respuesta es |the )/, '').replace(/-/g, ' ').trim();
    if (!clean) return null;
    if (ex.letter) { const l = clean.match(/^(?:la )?(?:letra )?([a-zñ])$/); if (!l) return clean.length <= 12 ? { ok: false, given: clean } : null; return { ok: ex.accept.includes(l[1]), given: l[1].toUpperCase() }; }
    const ok = ex.accept.some(a => clean === norm(a) || clean.split(' ').includes(norm(a)) || clean.replace(/\s/g, '') === norm(a).replace(/\s/g, ''));
    if (!ok && clean.split(' ').length > 6) return null;
    return { ok, given: clean };
  }
  return null;
}

/* ───────── seguridad ───────── */
const DANGER = /(me pegan|me pega|me golpea|me toca|me tocan|abus|me quiero morir|quiero morir|matarme|suicid|me hago daño|cortarme|nadie me quiere|me amenaz|tengo miedo de mi|me maltrat|acoso|me hacen bullying|bullying)/;
const RUDE = /(estupid|idiota|tonto|bobo|imbecil|malparid|hijueputa|gonorrea|marica|mierda|puta|pendej)/;
const OFF = /(futbol|partido|messi|ronaldo|james rodriguez|millonarios|nacional|america de cali|real madrid|barcelona|videojuego|fortnite|minecraft|free fire|roblox|tiktok|youtube|youtuber|instagram|novio|novia|chiste|cuentame un chiste|reggaeton|cancion de|cantante|pelicula|serie|netflix|anime|celular|precio|dolar|politic|presidente|vicepresidente|ministro|alcalde de bogota|elecciones|religion|dios|horoscopo|signo zodiacal|receta|clima de hoy|que hora es|apuesta|loteria|hackear|contraseña|whatsapp|como ganar dinero|bitcoin)/;

/* ───────── respuesta principal ───────── */
function reply(raw, ctxIn) {
  const ctx = Object.assign({ grade: 'Primero', name: '', lastTopic: null, pending: null, streak: 0, exCount: 0, offer: null, solved: 0 }, ctxIn || {});
  const text = String(raw || '').trim();
  const q = norm(text);
  const out = (t, extra = {}) => ({ text: t, ctx, mood: 'normal', chips: chipsFor(ctx), ...extra });
  if (!q) return out('¡Escríbeme tu pregunta! ✍️');

  if (DANGER.test(q)) { ctx.pending = null; return out('Lo que me cuentas es muy importante 💛. Tú mereces estar seguro y que te cuiden.\nPor favor cuéntaselo ahora mismo a un adulto de confianza: tu profe, tu mamá, tu papá, un familiar o el orientador del colegio.\nSi estás en peligro, pide a un adulto que llame al 123, o llama gratis a la Línea 141 del ICBF. 📞\nNo estás solo.', { mood: 'care', chips: [] }); }
  if (RUDE.test(q)) return out('Usemos palabras amables 😊🤝. Estoy aquí para ayudarte a aprender. ¿Qué tema quieres repasar?');

  /* 1. hay un ejercicio esperando respuesta */
  if (ctx.pending) {
    const ex = ctx.pending;
    if (/^(me rindo|no se|no lo se|dime la respuesta|cual es la respuesta|respuesta|la respuesta|ni idea|no puedo|ayuda no)$/.test(q) || /(me rindo|dime la respuesta|cual es la respuesta)/.test(q)) {
      ctx.pending = null; ctx.streak = 0; ctx.offer = 'exercise';
      return out(`¡No pasa nada! 💛 Aprender también es esto.\nLa respuesta es: ${answerText(ex)}.\n\n${ex.explain || ''}\n\n¿Probamos con otro? Escribe "otro". 💪`, { mood: 'normal' });
    }
    if (/^(pista|una pista|dame una pista|ayuda|ayudame|no entiendo|no entendi|como se hace)$/.test(q) || /(dame una pista|una ayudita)/.test(q)) {
      ex.hinted = true;
      return out(`💡 Pista: ${ex.hint}\n\nInténtalo otra vez, ¡tú puedes!`);
    }
    if (/^(otro|otra|otro reto|siguiente|cambia|otro ejercicio|otra pregunta|paso|saltar)$/.test(q) || /(dame|ponme|hazme|quiero) (un |una |otro |otra )?(reto|ejercicio|pregunta)/.test(q)) { ctx.pending = null; }
    else if (/^(ok|listo|si|no|vale|bueno|hola|espera|ya)$/.test(q) && !(ex.kind === 'choice' && ex.options.some(o => norm(o) === q))) return out('¡Te espero! Escribe tu respuesta al reto. ✍️ (o "pista" si necesitas ayuda)');
    else {
      const looksQuestion = (/\?|¿/.test(text) && q.split(' ').length > 3) || (/^(que|como|cual|cuales|por que|porque|quien|quienes|donde|cuando|para que|explica|explicame|dime|cuentame|ensename|hablame|traduce|conjuga|inventa|tabla)\b/.test(q) && q.split(' ').length > 2);
      const exact = ex.kind === 'choice' && ex.options.some(o => norm(o) === q);
      const j = looksQuestion && !exact ? null : judge(ex, text);
      if (j) {
        ctx.exCount = (ctx.exCount || 0);
        if (j.ok) {
          ctx.pending = null; ctx.streak = (ctx.streak || 0) + 1; ctx.solved = (ctx.solved || 0) + 1; ctx.offer = 'exercise';
          if (ctx.streak >= 3) ctx.level = 2;
          return out(`${say(PRAISE, ctx)}${streakMsg(ctx.streak)}\n${j.given} es la respuesta correcta. ✅${ex.kind === 'num' || ex.kind === 'frac' ? '' : ex.explain ? '\n' + ex.explain : ''}\n\n¿Otro reto? Escribe "otro". 🚀`, { mood: 'celebrate' });
        }
        if (j.near) return out(`¡Muy cerca! 👀 ${j.given} vale lo mismo, pero todavía se puede simplificar más. ¡Inténtalo otra vez!`);
        ex.tries = (ex.tries || 0) + 1; ctx.streak = 0;
        if (ex.tries >= 2) {
          ctx.pending = null; ctx.offer = 'exercise';
          return out(`${say(CHEER, ctx)}\nLa respuesta correcta es ${answerText(ex)}.\n\n${ex.explain || ''}\n\n¿Lo intentamos con otro parecido? Escribe "otro". 💪`, { mood: 'tryagain' });
        }
        return out(`${say(CHEER, ctx)}\n${j.given} no es la respuesta.\n💡 Pista: ${ex.hint}\n\n¡Inténtalo una vez más!`, { mood: 'tryagain' });
      }
      if (!looksQuestion && q.split(' ').length <= 1 && !/^(hola|gracias|ok|listo|si|no)$/.test(q)) return out(`Mmm, no entendí tu respuesta 🤔. ${ex.kind === 'choice' ? 'Escribe la letra (A, B, C…) o la opción.' : 'Escribe solo tu respuesta.'}\nSi quieres una ayudita escribe "pista". 💡`);
      if (!looksQuestion && /^(ok|listo|si|no)$/.test(q)) return out('¡Te espero! Escribe tu respuesta al reto. ✍️ (o "pista" si necesitas ayuda)');
      ctx.pending = null; /* era una pregunta nueva: seguimos */
    }
  }

  if (q.length <= 2 && !/^\d+$/.test(q)) return out('Mmm, no te entendí 🤔. Escríbeme tu pregunta completa, por ejemplo: "¿qué es sumar?" o "dame un reto".');

  /* 2. saludos y conversación básica */
  if (/^(hola|holi|hello|hi|buenas|buenos dias|buenas tardes|buenas noches|hey|que mas|q mas|ola)\b/.test(q) && q.split(' ').length <= 4) {
    return out(`¡Hola${name(ctx)}! 🐯 Soy Teo, tu compañero para aprender.\nPuedo explicarte tus temas, darte ejemplos, ponerte retos y revisar tus respuestas.\n\nEn ${ctx.grade} estás viendo:\n${gradeTopics(ctx.grade).map(t => '• ' + topicLabel(t)).join('\n')}\n\n¿Con cuál empezamos?`);
  }
  if (/^(gracias|muchas gracias|thank you|thanks|grax|te quiero|eres genial|eres el mejor)/.test(q)) return out(`¡Con mucho gusto${name(ctx)}! 💛 Me encanta aprender contigo. ¿Seguimos con otro reto?`);
  if (/^(chao|adios|bye|hasta luego|nos vemos|me voy)/.test(q)) return out(`¡Chao${name(ctx)}! 👋 Hoy aprendiste mucho. ¡Vuelve pronto!`);
  if (/(quien eres|como te llamas|que eres|eres un robot|eres una ia|eres real)/.test(q)) return out('Soy Teo 🐯, un tutor que vive dentro de AulaYa. Funciono en tu dispositivo, incluso sin internet. Solo sé de los temas de tus clases, ¡pero de esos sé muchísimo! 📚');
  if (/(que sabes|que puedes hacer|en que me ayudas|como funcionas|que temas|^ayuda$|^ayudame$|^menu$|^que hago$)/.test(q)) return out(helpText(ctx));

  /* 3. seguimientos: otro, ejemplo, no entendí */
  const last = ctx.lastTopic && byId[ctx.lastTopic];
  if (/^(otro|otra|otro reto|otro mas|uno mas|otra vez|siguiente|dale|si|sí|bueno|ok|listo|vamos|de una|claro|quiero)$/.test(q) && (ctx.offer === 'exercise' || /^(otro|otra|otro reto|otro mas|uno mas|siguiente)$/.test(q))) {
    const t = last || pick(gradeTopics(ctx.grade).filter(x => MATH.includes(x.id)));
    return giveExercise(t, ctx, out);
  }
  if (/^(otro ejemplo|mas ejemplos|otro ejemplito|dame otro ejemplo)$/.test(q) && last) return out(exampleText(last, ctx), { topic: last.id });
  if (/(no entiendo|no entendi|no le entiendo|explicame mejor|mas facil|no comprendo|explicame otra vez|explicamelo)/.test(q) && q.split(' ').length <= 6 && !detectTopic(q, ctx) && last) return out(`¡Te lo explico más fácil! 🧸\n${last.simple}\n\nEjemplo: ${pick(last.examples)}`, { topic: last.id });
  if (/^(si|sí|bueno|ok|dale)$/.test(q) && ctx.offer === 'example' && last) return out(exampleText(last, ctx), { topic: last.id });

  /* 3b. temas que claramente no son de clase */
  if (OFF.test(q)) { const d0 = detectTopic(q, ctx); if (!d0 || d0.s < 6) return out(`Uy, eso no está en los temas de tus clases 🙈, así que no te puedo ayudar con eso.\nPero sí puedo ayudarte con:\n${gradeTopics(ctx.grade).map(t => '• ' + topicLabel(t)).join('\n')}\n\n¿Qué quieres aprender? 📚`, { offTopic: true }); }

  /* 4. pedir un ejercicio */
  if (/(ejercicio|ejercicios|reto|retos|practicar|practica|preguntame|hazme una pregunta|hazme preguntas|ponme|evaluame|examiname|quiz|ponme a prueba|tomame|problema para resolver|quiero jugar)/.test(q) && !C.findExpression(q)) {
    const d = detectTopic(q.replace(/(ejercicio|reto|practicar|practica)s?/g, ''), ctx);
    let t = d ? d.t : null;
    if (!t && /(suma|sumar)/.test(q)) t = byId.suma;
    if (!t) t = last || pick(gradeTopics(ctx.grade).filter(x => MATH.includes(x.id) || bankFor(x).length));
    return giveExercise(t, ctx, out);
  }

  /* 5. pedir ejemplo */
  if (/(ejemplo|ejemplos|ejemplifica|muestrame como)/.test(q)) {
    const d = detectTopic(q, ctx) || (last ? { t: last } : null);
    if (d) { ctx.lastTopic = d.t.id; return out(exampleText(d.t, ctx), { topic: d.t.id }); }
  }

  /* 6. revisar algo que el estudiante escribió */
  const expr = C.findExpression(q);
  if (expr && expr.claimed !== null) {
    const real = C.valueOf(expr.tokens), given = C.parseFr(expr.claimed) || new Fr(Math.round(parseFloat(expr.claimed.replace(',', '.')) * 1000), 1000).simple;
    const e = C.explainExpression(expr.tokens); ctx.lastTopic = e.topic; ctx.offer = 'exercise';
    if (real && given && real.eq(given)) { ctx.streak = (ctx.streak || 0) + 1; return out(`${say(PRAISE, ctx)} Tu respuesta está bien: ${expr.claimed} ✅${streakMsg(ctx.streak)}\n\nAsí se comprueba:\n${e.text.split('\n').slice(1).join('\n').trim()}\n\n¿Quieres un reto parecido? Escribe "otro". 🚀`, { mood: 'celebrate', topic: e.topic }); }
    ctx.streak = 0;
    return out(`${say(CHEER, ctx)}\n${expr.claimed} no es el resultado. Revisemos juntos:\n\n${e.text}\n\n¿Lo intentas con otro? Escribe "otro". 💪`, { mood: 'tryagain', topic: e.topic });
  }
  if (/^(she|he|it|i|you|we|they|my|the)\s/.test(q) || /(esta bien|revisa|corrige|correcto).*(she|he|it|they|we)\s/.test(q)) {
    const sentence = text.replace(/^.*?:\s*/, '').replace(/[“”"]/g, '');
    const r = X.checkSimplePresent(sentence) || X.checkPluralSubject(sentence);
    if (r) { ctx.lastTopic = 'presente-simple'; if (r.ok) ctx.streak = (ctx.streak || 0) + 1; return out(r.text, { mood: r.ok ? 'celebrate' : 'tryagain', topic: 'presente-simple' }); }
  }
  const argCheck = X.checkArgumentText(text);
  if (argCheck) { ctx.lastTopic = 'argumentativo'; return out(argCheck, { mood: /Excelente/.test(argCheck) ? 'celebrate' : 'normal', topic: 'argumentativo' }); }

  /* 7. herramientas especializadas */
  const tools = [
    ['multiplicacion', () => X.tableAnswer(q)],
    ['fracciones', () => X.fracOfNumber(q)],
    ['fracciones', () => X.fracCompare(q)],
    ['fracciones', () => X.fracSimplify(q)],
    ['abecedario', () => X.sortAnswer(text, q)],
    ['abecedario', () => X.letterAnswer(q)],
    ['abecedario', () => X.vowelAnswer(text, q)],
    ['sustantivos', () => X.pluralAnswer(text, q)],
    ['sustantivos', () => X.collectiveAnswer(q)],
    ['adjetivo', () => X.antonymAnswer(q)],
    ['adjetivo', () => X.adjectiveFinder(text, q)],
    ['seres-vivos', () => X.classifyLiving(q)],
    ['materia', () => X.classifyState(q)],
    ['planta', () => X.classifyPlantPart(q)],
    ['comunidad', () => X.jobAnswer(q)],
    ['regiones', () => X.regionAnswer(q)],
    ['colores', () => X.colorOf(q)],
    ['cuento', () => /(inventa|invent|crea|escribe|cuentame|hazme|narra)\w* (un |una |me un )?(cuento|historia)/.test(q) ? X.storyGen(q) : null],
    ['argumentativo', () => X.argumentGen(text, q)],
    ['presente-simple', () => conjugateAnswer(q)],
    [null, () => englishAnswer(q, ctx)]
  ];
  for (const [tid, fn] of tools) {
    const r = fn();
    if (r) { const res = typeof r === 'string' ? { text: r, topic: tid } : r; if (res.topic) ctx.lastTopic = res.topic; ctx.offer = 'exercise'; return out(res.text + suggestionTail(res.topic), { topic: res.topic }); }
  }

  /* 8. operaciones matemáticas */
  if (expr) { const e = C.explainExpression(expr.tokens); ctx.lastTopic = e.topic; ctx.offer = 'exercise'; return out(e.text + '\n\n¿Quieres que te ponga uno parecido? Escribe "dame un ejercicio". 🎯', { topic: e.topic }); }
  const wp = X.wordProblem(text, q);
  if (wp) { const tid = /÷/.test(wp) ? 'division' : /×/.test(wp) ? 'multiplicacion' : /−/.test(wp) ? 'resta' : 'suma'; ctx.lastTopic = tid; ctx.offer = 'exercise'; return out(wp, { topic: tid }); }

  /* 9a. preguntas parecidas a las del banco de la clase */
  const pre = topicScores(q, ctx)[0];
  const bq = pre && pre.fact && pre.factScore >= 1.5 ? null : bankLookup(q, ctx);
  if (bq) { ctx.lastTopic = bq.t.id; ctx.offer = 'exercise'; return out(`${bq.item.answers[bq.item.correct]} ✅\n${bq.item.why || ''}\n\n¿Quieres un reto de ${bq.t.topic.replace(/^(El|La|Los|Las) /, m => m.toLowerCase())}? Escribe "dame un reto". 🎯`, { topic: bq.t.id }); }

  /* 9. preguntas sobre los temas */
  const scores = topicScores(q, ctx);
  const top = scores[0];
  const offTopic = OFF.test(q);
  if (top && top.s >= 2 && !(offTopic && top.s < 6)) {
    const t = top.t;
    ctx.lastTopic = t.id;
    if (top.fact && top.factScore >= 1) { ctx.offer = 'exercise'; return out(top.fact.a + suggestionTail(t.id), { topic: t.id }); }
    ctx.offer = 'example';
    return out(`${t.intro}\n\n${t.points ? '📌 Lo más importante:\n' + t.points.map(p => '• ' + p).join('\n') : ''}\n\n¿Quieres un ejemplo o un reto? 😊`, { topic: t.id, generic: true });
  }

  /* 10. fuera de los temas */
  return out(`Uy, eso no está en los temas de tus clases 🙈, así que no te puedo ayudar con eso.\nPero sí puedo ayudarte con:\n${gradeTopics(ctx.grade).map(t => '• ' + topicLabel(t)).join('\n')}\n\n¿Qué quieres aprender? 📚`, { offTopic: true });
}

const STOPW = new Set('el la los las un una unos unas de del a al y o en con por para que cual cuales es son se su sus como quien donde cuando cuanto cuantos cuantas lo le les mi tu me te esta este estos estas hay muy mas tiene tienen'.split(' '));
const toks = s => norm(s).split(' ').filter(w => w.length > 2 && !STOPW.has(w));
function bankLookup(q, ctx) {
  const qt = new Set(toks(q)); if (qt.size < 2) return null;
  let best = null;
  for (const t of TOPICS) for (const item of bankFor(t)) {
    const it = new Set(toks(item.question)); let inter = 0; qt.forEach(w => { if (it.has(w)) inter++; });
    const score = inter / Math.max(qt.size, it.size) + (t.grade === ctx.grade ? 0.05 : 0);
    if (!best || score > best.score) best = { t, item, score };
  }
  return best && best.score >= 0.75 ? best : null;
}
function answerText(ex) { if (ex.kind === 'choice') return `${'ABCDEF'[ex.answer]}) ${ex.options[ex.answer]}`; if (ex.kind === 'num' || ex.kind === 'frac') return ex.answer.toString(); return ex.answer; }
function giveExercise(t, ctx, out) {
  let ex = makeExercise(t, ctx);
  if (!ex) { const alt = gradeTopics(t.grade).find(x => MATH.includes(x.id)); ex = alt && makeExercise(alt, ctx); if (!ex) return out(`Todavía no tengo retos de ${t.topic}, ¡pero pregúntame lo que quieras sobre el tema! 📚`); t = alt; }
  ctx.pending = ex; ctx.lastTopic = t.id; ctx.exCount = (ctx.exCount || 0) + 1; ctx.offer = null;
  return out(exerciseText(ex, ctx.exCount), { topic: t.id, exercise: true });
}
function exampleText(t, ctx) { ctx.offer = 'exercise'; const ex = shuffle(t.examples).slice(0, 2); return `Ejemplos de ${t.topic.replace(/^(El|La|Los|Las) /, m => m.toLowerCase())} ✨\n${ex.map(e => '• ' + e).join('\n')}\n\n¿Te pongo un reto? 🎯`; }
function suggestionTail(tid) { return ''; }
function helpText(ctx) {
  return `¡Esto es lo que puedo hacer contigo! 🐯\n\n📖 Explicarte tus temas: "¿qué es sumar?", "¿cuáles son las partes de la planta?"\n🧮 Resolver operaciones paso a paso: "245 + 378", "84 ÷ 4", "1/2 + 1/3"\n🧩 Resolver problemas: "Tengo 12 dulces y regalo 5, ¿cuántos me quedan?"\n🎯 Ponerte retos: "dame un ejercicio de resta"\n✅ Revisar tus respuestas: "7 × 8 = 56"\n🗣️ Inglés: "¿cómo se dice perro en inglés?", "conjuga play"\n📝 Inventar un cuento o ayudarte con un texto argumentativo.\n\nTus temas de ${ctx.grade}:\n${gradeTopics(ctx.grade).map(t => '• ' + topicLabel(t)).join('\n')}`;
}
function conjugateAnswer(q) {
  let m = q.match(/conjug\w* (?:el verbo )?(?:to )?([a-z]+(?: up)?)/) || q.match(/(?:verbo )?([a-z]+) (?:en|con) (?:tercera persona|presente simple|he|she|it)\b/);
  if (!m) return null;
  let v = m[1];
  if (X.VERB_BY_ES[v]) v = X.VERB_BY_ES[v];
  if (!X.VERB_SET.has(v) && !/^[a-z]+$/.test(v)) return null;
  if (!X.VERB_SET.has(v) && v.length < 2) return null;
  return { text: X.conjugate(v), topic: 'presente-simple' };
}
function englishAnswer(q, ctx) {
  const toEn = /(como se dice|como digo|como se escribe|en ingles|traduce|traduccion|traducir|in english)/.test(q);
  const toEs = /(que significa|que quiere decir|en español|en espanol|que es)/.test(q);
  /* números */
  const numEn = q.match(/(?:como se (?:dice|escribe)|como digo|escribe) (?:el (?:numero )?)?(\d+|[a-z ]+?) en ingles/);
  if (numEn) { const n = /^\d+$/.test(numEn[1]) ? +numEn[1] : +C.wordsToDigits(numEn[1]); if (Number.isFinite(n) && n >= 0 && n < 1000000) return { text: `${n} en inglés se dice: ${X.numberToEnglish(n)} 🔢`, topic: 'numeros-en' }; }
  if (/(numeros|contar) (?:del|de) (\d+) (?:al|a) (\d+) en ingles/.test(C.wordsToDigits(q))) { const m = C.wordsToDigits(q).match(/(\d+) (?:al|a) (\d+)/); const a = +m[1], b = Math.min(+m[2], a + 30); return { text: `Números del ${a} al ${b} en inglés 🔢\n${Array.from({ length: b - a + 1 }, (_, i) => `${a + i} ${X.numberToEnglish(a + i)}`).join('\n')}`, topic: 'numeros-en' }; }
  if (/(que numero|cual numero|what number|que numero es|significa|quiere decir)/.test(q) || /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)/.test(q)) { const n = X.englishToNumber(q.replace(/.*?(significa|decir|que es|numero es|numero)/, '')); if (n !== null && /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|teen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)/.test(q)) return { text: `"${X.numberToEnglish(n)}" es el número ${n} 🔢`, topic: 'numeros-en' }; }
  if (toEs) { const n = X.englishToNumber(q.replace(/.*(significa|decir|que es)/, '')); if (n !== null && /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|teen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)/.test(q)) return { text: `Ese número es el ${n} 🔢 (${X.numberToEnglish(n)}).`, topic: 'numeros-en' }; }
  /* listas */
  if (/(colores|los colores) en ingles/.test(q) || /^colors?$/.test(q)) return { text: byId.colores.intro, topic: 'colores' };
  if (/(animales|los animales) en ingles/.test(q)) return { text: byId['animales-en'].intro, topic: 'animales-en' };
  if (/(partes del cuerpo|el cuerpo) en ingles/.test(q)) return { text: byId['cuerpo-en'].intro, topic: 'cuerpo-en' };
  if (/(numeros|los numeros) en ingles/.test(q)) return { text: byId['numeros-en'].intro, topic: 'numeros-en' };
  /* palabras */
  const catTopic = c => ({ color: 'colores', animal: 'animales-en', body: 'cuerpo-en' })[c] || ctx.lastTopic || 'colores';
  if (toEn) {
    const verbM = q.match(/(?:como se dice|traduce) (?:el verbo )?([a-zñ]+r)\b/);
    if (verbM && X.VERB_BY_ES[verbM[1]]) return { text: `"${verbM[1]}" en inglés es "${X.VERB_BY_ES[verbM[1]]}". ✏️\nEj: I ${X.VERB_BY_ES[verbM[1]]} · She ${X.thirdPerson(X.VERB_BY_ES[verbM[1]])}`, topic: 'presente-simple' };
    const e = X.findSpanishWord(q.replace(/(como se dice|como digo|en ingles|traduce)/g, ' '));
    if (e) return { text: `"${e[1]}" en inglés se dice: ${e[0]} ${e[3]}\n🗣️ Ejemplo: ${sample(e)}`, topic: catTopic(e[2]) };
    if (/en ingles/.test(q)) return { text: 'Esa palabra todavía no la tengo en mi diccionario 📖. Te sé los colores, los animales, los números, las partes del cuerpo, la familia y muchos verbos. ¡Prueba con una de esas!', topic: ctx.lastTopic };
  }
  if (toEs || /^(what is|what s)/.test(q)) {
    const e = X.findEnglishWord(q.replace(/(que significa|que quiere decir|en español|en espanol|que es)/g, ' '));
    if (e) return { text: `"${e[0]}" significa: ${e[1]} ${e[3]}`, topic: catTopic(e[2]) };
    const v = X.VERBS.find(([en]) => has(q, en) && en.length > 2);
    if (v && /(significa|quiere decir)/.test(q)) return { text: `"${v[0]}" significa ${v[1]}. ✏️`, topic: 'presente-simple' };
  }
  return null;
}
function sample(e) { if (e[2] === 'color') return `The car is ${e[0]}. (El carro es ${e[1]}.)`; if (e[2] === 'animal') return `Look! A ${e[0]}! (¡Mira, ${/a$/.test(e[1]) ? 'una' : 'un'} ${e[1]}!)`; if (e[2] === 'body') { const pl = /s$/.test(e[0]) || e[0] === 'feet' || e[0] === 'teeth'; const fem = /as?$/.test(e[1]) || /(nariz|boca)$/.test(e[1]); return `${pl ? 'These are' : 'This is'} my ${e[0]}. (${pl ? (fem ? 'Estas son mis' : 'Estos son mis') : (fem ? 'Esta es mi' : 'Este es mi')} ${e[1]}.)`; } return `${cap(e[0])}!`; }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function chipsFor(ctx) {
  if (ctx.pending) return ctx.pending.kind === 'choice' ? ctx.pending.options.slice(0, 4).map((o, i) => `${'ABCDEF'[i]}) ${o}`).concat(['💡 Pista']) : ['💡 Pista', '🙋 Me rindo', '⏭️ Otro'];
  const t = ctx.lastTopic && byId[ctx.lastTopic];
  if (t) return ['🎯 Dame un ejercicio', '✨ Otro ejemplo', '🧸 Explícamelo más fácil'];
  return starterChips(ctx.grade);
}
function starterChips(grade) {
  const S = { Primero: ['¿Qué es sumar?', '🎯 Reto de suma', '¿Qué es un ser vivo?', '¿Cómo se dice rojo en inglés?'], Segundo: ['¿Cómo se resta prestando?', '🎯 Reto de resta', '¿Cuáles son las partes de la planta?', '¿Qué es un sustantivo?'], Tercero: ['Tabla del 7', '🎯 Reto de multiplicación', '¿Qué es un ecosistema?', 'Inventa un cuento'], Cuarto: ['84 ÷ 4', '🎯 Reto de división', '¿Cuáles son los estados de la materia?', '¿Cuáles son las regiones de Colombia?'], Quinto: ['1/2 + 1/3', '🎯 Reto de fracciones', '¿Qué es el sistema digestivo?', '¿Qué pasó el 20 de julio?'] };
  return S[grade] || S.Primero;
}

root.TeoBrain = { reply, topics: TOPICS, gradeTopics, starterChips, detectTopic, makeExercise, version: '1.0' };
if (typeof module !== 'undefined') module.exports = root.TeoBrain;
})(typeof window !== 'undefined' ? window : globalThis);
/* Puente entre el motor y la app (misma interfaz que usa app.js) */
(function (root) {
'use strict';
const B = root.TeoBrain, TOPICS = B.topics;
TOPICS.forEach(t => { t.title = t.topic; });
const KIND = { celebrate: 'celebrate', tryagain: 'retry', care: '' };
function topicFromFocus(f) { if (!f) return null; const t = TOPICS.find(x => x.subject === f.subject && (x.topic === f.topic || !f.topic)); return t ? t.id : null; }
function reply(question, appCtx) {
  appCtx = appCtx || {};
  const mem = appCtx.memory || {};
  const c = Object.assign({}, mem, { grade: appCtx.grade || mem.grade || 'Primero', name: appCtx.name || '' });
  if (!c.lastTopic) c.lastTopic = topicFromFocus(appCtx.focusTopic);
  const Fr = root.__TeoCore.Fr;
  if (c.pending && c.pending.answer && typeof c.pending.answer === 'object' && !(c.pending.answer instanceof Fr)) c.pending.answer = new Fr(c.pending.answer.n, c.pending.answer.d);
  const r = B.reply(question, c);
  const keep = ['lastTopic', 'pending', 'streak', 'exCount', 'offer', 'solved', 'level'];
  keep.forEach(k => { mem[k] = r.ctx[k]; });
  let kind = r.offTopic ? 'offtopic' : r.exercise ? 'exercise' : (KIND[r.mood] ?? '');
  if (kind === 'celebrate') mem.correct = (mem.correct || 0) + 1;
  const t = r.topic && TOPICS.find(x => x.id === r.topic);
  return { text: r.text, kind, chips: r.chips || [], topic: r.topic || null, llm: !!r.generic, context: t ? `${t.topic}. ${t.intro} ${(t.points || []).join(' ')}` : '' };
}
function suggestions(ctx) { return B.starterChips((ctx && ctx.grade) || 'Primero'); }
function systemPrompt(ctx, context) {
  return `Eres Teo, un jaguar amable que ayuda a niños de ${ctx.grade || 'primaria'} en Colombia. Responde SOLO sobre este tema escolar, en español sencillo, con máximo 4 frases cortas y un emoji. Si la pregunta no es del tema, di que solo ayudas con temas de clase. Información del tema: ${context}`;
}
root.TeoBrain = Object.assign({}, B, { reply, core: B.reply, suggestions, systemPrompt, gradeTopics: B.gradeTopics });
if (typeof module !== 'undefined') module.exports = root.TeoBrain;
})(typeof window !== 'undefined' ? window : globalThis);
