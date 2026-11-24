/**
 * Карта блока «Контакты» — своя SVG-картинка вместо виджета Яндекс Карт
 * (в виджет Яндекс подставляет рекламу, в том числе других вездеходов).
 *
 *   node scripts/build-contact-map.mjs            — скачать данные OSM и нарисовать
 *   node scripts/build-contact-map.mjs osm.json   — нарисовать из сохранённого ответа Overpass
 *
 * Результат: public/images/map/contacts.svg. Метку и подпись рисует сам
 * компонент (src/components/mapYandex.tsx) поверх картинки — точка цеха
 * ровно в центре кадра. Данные © участники OpenStreetMap (ODbL) — подпись
 * об этом обязательна и стоит в компоненте.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/images/map/contacts.svg');

/** Метка цеха — та же точка, что стояла в конструкторе Яндекс Карт */
export const PIN = { lat: 62.06665, lon: 129.729977 };
const ZOOM = 16;
const W = 1200;
const H = 800;

// Палитра сайта (src/index.css)
const C = {
	bg: '#0d1010',
	block: '#111514',
	green: '#0f1a14',
	water: '#13252b',
	waterLine: '#1b3340',
	building: '#1c2221',
	buildingLine: '#252d2b',
	minor: '#2a3231',
	road: '#3a4442',
	major: '#56625f',
	label: '#98a4a1',
	halo: '#0d1010',
};

// --- проекция Web Mercator, центр кадра = метка ---
const scale = 256 * 2 ** ZOOM;
const mx = (lon) => ((lon + 180) / 360) * scale;
const my = (lat) => {
	const s = Math.sin((lat * Math.PI) / 180);
	return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale;
};
const cx = mx(PIN.lon) - W / 2;
const cy = my(PIN.lat) - H / 2;
const px = (p) => [mx(p.lon) - cx, my(p.lat) - cy];

// Запас за краем кадра — чтобы линии не обрывались у рамки
const PAD = 80;
const unproject = (x, y) => {
	const lon = ((x + cx) / scale) * 360 - 180;
	const n = Math.PI - (2 * Math.PI * (y + cy)) / scale;
	return { lon, lat: (180 / Math.PI) * Math.atan(Math.sinh(n)) };
};

async function loadOsm(file) {
	if (file) return JSON.parse(await readFile(file, 'utf8'));
	const sw = unproject(-PAD, H + PAD);
	const ne = unproject(W + PAD, -PAD);
	const bb = [sw.lat, sw.lon, ne.lat, ne.lon].map((v) => v.toFixed(5)).join(',');
	const sel = [
		'way["highway"]',
		'way["building"]',
		'way["natural"="water"]',
		'relation["natural"="water"]',
		'way["waterway"]',
		'way["landuse"]',
		'way["natural"~"wood|scrub|wetland|grassland"]',
		'way["leisure"]',
	];
	const query = `[out:json][timeout:60];(${sel.map((s) => `${s}(${bb});`).join('')});out geom;`;
	const res = await fetch('https://overpass-api.de/api/interpreter', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'map-render-script/1.0' },
		body: new URLSearchParams({ data: query }),
	});
	if (!res.ok) throw new Error(`Overpass: HTTP ${res.status}`);
	return res.json();
}

const r1 = (n) => Math.round(n * 10) / 10;
const inView = (pts) =>
	pts.some(([x, y]) => x > -PAD && x < W + PAD && y > -PAD && y < H + PAD);
const pathD = (pts, close) =>
	'M' + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + (close ? 'Z' : '');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const ROAD = {
	motorway: ['major', 9],
	trunk: ['major', 9],
	primary: ['major', 8],
	secondary: ['major', 7],
	tertiary: ['road', 6],
	unclassified: ['road', 4.5],
	residential: ['road', 4.5],
	living_street: ['road', 4],
	service: ['minor', 2.5],
	track: ['minor', 2],
};

function render(osm) {
	const layers = { green: [], block: [], water: [], waterway: [], building: [], minor: [], road: [], major: [] };
	const named = new Map();

	for (const el of osm.elements) {
		const t = el.tags ?? {};
		const rings =
			el.type === 'way'
				? [el.geometry]
				: (el.members ?? []).filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry);
		for (const ring of rings) {
			if (!ring?.length) continue;
			const pts = ring.map(px);
			if (!inView(pts)) continue;

			if (t.building) layers.building.push(pathD(pts, true));
			else if (t.natural === 'water') layers.water.push(pathD(pts, true));
			else if (t.waterway) layers.waterway.push(pathD(pts, false));
			else if (t.highway && ROAD[t.highway]) {
				const [cls, w] = ROAD[t.highway];
				layers[cls].push([pathD(pts, false), w]);
				if (t.name && cls !== 'minor') {
					const list = named.get(t.name) ?? [];
					list.push({ pts, w });
					named.set(t.name, list);
				}
			} else if (
				['grass', 'meadow', 'forest'].includes(t.landuse) ||
				['wood', 'scrub', 'wetland', 'grassland'].includes(t.natural) ||
				['park', 'garden'].includes(t.leisure)
			)
				layers.green.push(pathD(pts, true));
			else if (t.landuse) layers.block.push(pathD(pts, true));
		}
	}

	const strokes = (list, color, extra = 0) =>
		list.map(([d, w]) => `<path d="${d}" stroke="${color}" stroke-width="${w + extra}"/>`).join('');

	// Подписи улиц: на самом длинном почти прямом участке в кадре, текст слева направо,
	// без наложений друг на друга и на метку цеха в центре
	const defs = [];
	const labels = [];
	// Метка цеха и её подпись над центром кадра
	const PIN_BOX = { x0: W / 2 - 110, y0: H / 2 - 60, x1: W / 2 + 110, y1: H / 2 + 40 };
	const underPin = ([x, y]) => x > PIN_BOX.x0 && x < PIN_BOX.x1 && y > PIN_BOX.y0 && y < PIN_BOX.y1;
	// Занятые подписями точки: подпись — цепочка точек через 8 px по средней части участка
	const taken = [];
	const clash = (samples) => samples.some(([x, y]) => taken.some(([a, b]) => Math.hypot(x - a, y - b) < 22));
	const sample = (r, need) => {
		const total = len(r);
		const from = (total - need) / 2;
		const out = [];
		let acc = 0;
		for (let i = 1; i < r.length; i++) {
			const [x0, y0] = r[i - 1];
			const [x1, y1] = r[i];
			const seg = Math.hypot(x1 - x0, y1 - y0);
			for (let d = 0; d < seg; d += 8) {
				const at = acc + d;
				if (at >= from && at <= from + need) out.push([x0 + ((x1 - x0) * d) / seg, y0 + ((y1 - y0) * d) / seg]);
			}
			acc += seg;
		}
		return out;
	};
	const len = (r) => r.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - r[i][0], p[1] - r[i][1]), 0);
	const order = [...named].sort((a, b) => Math.max(...b[1].map((w) => w.w)) - Math.max(...a[1].map((w) => w.w)));
	let id = 0;
	for (const [name, ways] of order) {
		const short = name.replace(/^улица /, 'ул. ').replace(/ улица$/, ' ул.').replace(/^переулок /, 'пер. ');
		const need = short.length * 8.5 + 30;
		const runs = [];
		// Видимые куски улицы: в кадре и не под меткой цеха
		const free = (p) => p[0] > 30 && p[0] < W - 30 && p[1] > 30 && p[1] < H - 30 && !underPin(p);
		const pieces = [];
		for (const { pts } of ways) {
			let cur = [];
			for (const p of pts) {
				if (free(p)) cur.push(p);
				else {
					if (cur.length >= 2) pieces.push(cur);
					cur = [];
				}
			}
			if (cur.length >= 2) pieces.push(cur);
		}
		for (const vis of pieces) {
			// Режем на прямые участки: поворот больше 20° — новый участок
			let run = vis.slice(0, 2);
			const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
			for (let i = 2; i <= vis.length; i++) {
				const turn = i < vis.length ? Math.abs(ang(vis[i - 2], vis[i - 1]) - ang(vis[i - 1], vis[i])) : Infinity;
				const t = Math.min(turn, 2 * Math.PI - turn);
				if (i < vis.length && t < (20 * Math.PI) / 180) run.push(vis[i]);
				else {
					if (run.length >= 2) runs.push(run);
					run = vis.slice(i - 1, i + 1);
				}
			}
		}
		runs.sort((a, b) => len(b) - len(a));
		for (const r of runs) {
			if (len(r) < need) break;
			const samples = sample(r, need);
			if (clash(samples)) continue;
			taken.push(...samples);
			const v = r[0][0] <= r.at(-1)[0] ? r : [...r].reverse();
			const pid = `s${id++}`;
			defs.push(`<path id="${pid}" d="${pathD(v, false)}"/>`);
			labels.push(`<text><textPath href="#${pid}" startOffset="50%">${esc(short)}</textPath></text>`);
			break;
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<!-- Данные © участники OpenStreetMap, ODbL. Сгенерировано scripts/build-contact-map.mjs -->
<defs>${defs.join('')}</defs>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<g stroke="none">
<g fill="${C.block}">${layers.block.map((d) => `<path d="${d}"/>`).join('')}</g>
<g fill="${C.green}">${layers.green.map((d) => `<path d="${d}"/>`).join('')}</g>
<g fill="${C.water}" stroke="${C.waterLine}" stroke-width="1.5">${layers.water.map((d) => `<path d="${d}"/>`).join('')}</g>
</g>
<g fill="none" stroke="${C.waterLine}" stroke-width="2.5">${layers.waterway.map((d) => `<path d="${d}"/>`).join('')}</g>
<g fill="${C.building}" stroke="${C.buildingLine}" stroke-width="1">${layers.building.map((d) => `<path d="${d}"/>`).join('')}</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${strokes(layers.minor, C.minor)}
${strokes(layers.road, C.road)}
${strokes(layers.major, C.major)}
</g>
<g font-family="'Golos Text','Segoe UI',system-ui,-apple-system,sans-serif" font-size="15" font-weight="500" fill="${C.label}" stroke="${C.halo}" stroke-width="4" paint-order="stroke" text-anchor="middle" dominant-baseline="central" letter-spacing="0.2">
${labels.join('\n')}
</g>
</svg>
`;
}

const osm = await loadOsm(process.argv[2]);
const svg = render(osm);
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg);
console.log(`✔ ${OUT.replace(ROOT + '/', '')} — ${(svg.length / 1024).toFixed(0)} КБ`);
