/* Mes p'tits compagnons — moteur de dessin des créatures (SVG vectoriel, dessins originaux).
   Chaque créature = un plan de corps (quadrupède, bipède, oiseau, aquatique, fantôme, graine)
   + des pièces (oreilles, crête, queue, ailes, armure…), un ombrage « cel » façon anime,
   des yeux expressifs et des animations (respiration, clignement, queue, ailes, attaque, coup). */
'use strict';
(function () {
  let U = 0;
  const hex = c => { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const mir = s => s + `<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
  const stp = (cx, cy, r1, r2, n = 5) => { const p = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / n; p.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1)); } return p.join(' '); };
  const FL = 'M0 0 C-15 0 -19 -14 -11 -26 C-6 -33 -3 -39 0 -52 C5 -41 13 -34 15 -23 C19 -11 13 0 0 0Z';
  const LF = 'M0 0 C-12 -10 -12 -30 0 -44 C12 -30 12 -10 0 0Z';

  /* ---------- plans de corps : ancres + dessin ---------- */
  const PLANS = {
    quad: {
      eyeY: 90, eyeDX: 19, eyeR: 12.5, mouthY: 110, ear: [72, 62], crest: [100, 50], tail: [138, 146], wing: [70, 126], chest: [100, 146], hc: [100, 90], neck: [100, 128], arm: null,
      draw: h => ({
        legsBack: mir(`<path d="M56 148 C52 162 54 176 64 179 C72 181 77 176 76 164 L74 148Z" fill="${h.D}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/>`),
        body: `<path d="M52 144 C50 120 74 112 100 112 C126 112 150 120 148 144 C147 166 128 174 100 174 C72 174 53 166 52 144Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <ellipse cx="100" cy="154" rx="26" ry="15" fill="${h.C}"/>`,
        legsFront: mir(`<path d="M72 146 C68 160 68 172 70 178 C74 184 90 184 92 178 C93 168 92 156 90 146Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M77 181 v-6 M84 182 v-6" stroke="${h.K}" stroke-width="2" stroke-linecap="round"/>`),
        head: `<path d="M60 92 C58 62 78 48 100 48 C122 48 142 62 140 92 C139 116 122 130 100 130 C78 130 61 116 60 92Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          ${h.sp.fluff !== false ? mir(`<path d="M63 104 L50 108 L61 114 L53 121 L70 121Z" fill="${h.B}" stroke="${h.K}" stroke-width="2.5" stroke-linejoin="round"/>`) : ''}
          <ellipse cx="100" cy="113" rx="17" ry="11" fill="${h.C}"/><ellipse cx="100" cy="106" rx="4.5" ry="3.2" fill="${h.K}"/>`,
      }),
    },
    biped: {
      eyeY: 70, eyeDX: 16, eyeR: 11, mouthY: 90, ear: [74, 44], crest: [100, 34], tail: [128, 152], wing: [74, 114], chest: [100, 132], hc: [100, 70], neck: [100, 104], arm: [56, 140],
      draw: h => ({
        legsBack: '',
        body: `<path d="M66 146 C62 116 78 100 100 100 C122 100 138 116 134 146 C132 166 116 172 100 172 C84 172 68 166 66 146Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <ellipse cx="100" cy="142" rx="21" ry="22" fill="${h.C}"/>`,
        legsFront: mir(`<path d="M74 152 C70 164 70 174 72 178 L94 178 C95 168 94 158 92 152Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="82" cy="179" rx="14" ry="5.5" fill="${h.D}" stroke="${h.K}" stroke-width="2.5"/>`)
          + mir(`<g class="${h.an('cr-arm')}" style="transform-origin:72px 116px"><path d="M72 112 C58 116 50 128 52 140 C54 147 63 147 65 140 C67 132 72 128 78 126Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M53 141 l-3 5 M58 144 l-1 5" stroke="${h.K}" stroke-width="2" stroke-linecap="round"/></g>`),
        head: `<path d="M64 74 C62 46 80 32 100 32 C120 32 138 46 136 74 C135 96 120 108 100 108 C80 108 65 96 64 74Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <ellipse cx="100" cy="92" rx="14" ry="8.5" fill="${h.C}"/><ellipse cx="100" cy="86" rx="4" ry="2.8" fill="${h.K}"/>`,
      }),
    },
    bird: {
      eyeY: 94, eyeDX: 17, eyeR: 12, mouthY: 0, ear: [76, 62], crest: [100, 58], tail: [100, 168], wing: [62, 118], chest: [100, 140], hc: [100, 100], neck: [100, 128], arm: null, beak: 1,
      draw: h => ({
        legsBack: '',
        body: `<path d="M56 118 C56 76 76 58 100 58 C124 58 144 76 144 118 C144 154 124 172 100 172 C76 172 56 154 56 118Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <path d="M74 132 C74 118 86 112 100 112 C114 112 126 118 126 132 C126 152 114 164 100 164 C86 164 74 152 74 132Z" fill="${h.C}"/>
          ${[0, 1, 2].map(i => `<path d="M${84 + i * 8} ${138 + (i % 2) * 8} q4 4 8 0" stroke="${h.d}" stroke-width="2" fill="none" opacity=".5"/>`).join('')}`,
        legsFront: mir(`<path d="M88 168 L86 182 M86 182 l-7 1 M86 182 l2 2 M86 182 l7 0" stroke="#e8a030" stroke-width="4.5" stroke-linecap="round" fill="none"/>`),
        head: `<path d="M90 106 L110 106 L100 122Z" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M93 108 L107 108" stroke="${h.K}" stroke-width="1.5"/>`,
      }),
    },
    fish: {
      eyeY: 100, eyeDX: 19, eyeR: 12.5, mouthY: 120, ear: [56, 112], crest: [100, 66], tail: [144, 128], wing: [60, 128], chest: [100, 140], hc: [100, 106], neck: [100, 140], arm: null, float: 1,
      draw: h => ({
        legsBack: mir(`<path d="M74 152 C66 166 58 170 52 168 C58 160 62 152 70 146Z" fill="url(#${h.id}W)" stroke="${h.K}" stroke-width="2.5" stroke-linejoin="round"/>`),
        body: `<path d="M50 116 C50 78 76 64 102 64 C132 64 150 84 150 116 C150 148 128 164 100 164 C72 164 50 148 50 116Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <path d="M70 136 C76 152 90 158 100 158 C112 158 126 152 130 136 C118 142 82 142 70 136Z" fill="${h.C}"/>
          ${[0, 1, 2].map(i => `<path d="M${118 + i * 7} ${84 + i * 4} q5 6 0 12" stroke="${h.d}" stroke-width="2" fill="none" opacity=".45"/>`).join('')}`,
        legsFront: '',
        head: '',
      }),
    },
    ghost: {
      eyeY: 98, eyeDX: 18, eyeR: 12.5, mouthY: 118, ear: [70, 66], crest: [100, 56], tail: [140, 142], wing: [62, 112], chest: [100, 136], hc: [100, 100], neck: [100, 136], arm: null, float: 1,
      draw: h => ({
        legsBack: '',
        body: `<path d="M56 108 C56 70 78 54 100 54 C122 54 144 70 144 108 L144 152 Q134 142 123 154 Q112 142 100 154 Q88 142 77 154 Q66 142 56 152Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/>
          <ellipse cx="100" cy="134" rx="22" ry="12" fill="${h.C}" opacity=".9"/>`,
        legsFront: mir(`<g class="${h.an('cr-arm')}" style="transform-origin:58px 116px"><path d="M58 112 C44 114 40 126 46 132 C52 136 58 128 60 122Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/></g>`),
        head: '',
      }),
    },
    seed: {
      eyeY: 110, eyeDX: 18, eyeR: 12.5, mouthY: 130, ear: [70, 82], crest: [100, 68], tail: [138, 152], wing: [64, 124], chest: [100, 150], hc: [100, 116], neck: [100, 150], arm: null,
      draw: h => ({
        legsBack: '',
        body: `<path d="M58 122 C56 84 78 68 100 68 C122 68 144 84 142 122 C141 154 124 172 100 172 C76 172 59 154 58 122Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/>
          <ellipse cx="100" cy="152" rx="24" ry="13" fill="${h.C}"/>`,
        legsFront: mir(`<ellipse cx="80" cy="175" rx="13" ry="7" fill="${h.D}" stroke="${h.K}" stroke-width="2.5"/>`) + mir(`<g class="${h.an('cr-arm')}" style="transform-origin:60px 130px"><path d="M60 126 C48 128 44 138 48 144 C54 148 60 140 62 134Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/></g>`),
        head: '',
      }),
    },
  };

  /* ---------- pièces ---------- */
  const flame = (h, x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><g class="${h.an('flick')}"><path d="${FL}" fill="url(#${h.id}F)" stroke="#c8401e" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 -4 C-7 -4 -9 -11 -5 -18 C-2 -23 0 -27 0 -33 C3 -26 7 -21 7 -15 C8 -8 6 -4 0 -4Z" fill="#fff6b0"/></g></g>`;
  const leaf = (h, x, y, r = 0, s = 1, col) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="${LF}" fill="${col || `url(#${h.id}G)`}" stroke="#256b36" stroke-width="2.4"/><path d="M0 -3 V-38" stroke="#256b36" stroke-width="1.8"/></g>`;
  const bolt = (h, x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><polygon points="-5,0 7,-17 0,-17 9,-36 -10,-12 -3,-12 -12,0" fill="url(#${h.id}Y)" stroke="#b07800" stroke-width="2.4" stroke-linejoin="round"/></g>`;
  const drop = (h, x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0 C-11 0 -15 -8 -13 -15 C-11 -21 -3 -27 0 -36 C3 -27 11 -21 13 -15 C15 -8 11 0 0 0Z" fill="url(#${h.id}W)" stroke="#2468b8" stroke-width="2.2"/><ellipse cx="-4" cy="-16" rx="3" ry="5" fill="#fff" opacity=".85"/></g>`;
  const crys = (h, pts) => `<polygon points="${pts}" fill="url(#${h.id}X)" stroke="#5a9ac8" stroke-width="2.4" stroke-linejoin="round"/>`;

  const EARS = {
    fox: (h, x, y) => `<path d="M${x + 6} ${y + 16} L${x - 12} ${y - 30} L${x + 26} ${y + 2}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + 6} ${y + 9} L${x - 5} ${y - 18} L${x + 18} ${y + 2}Z" fill="${h.A}"/><path d="M${x - 12} ${y - 30} L${x - 6} ${y - 16} L${x + 1} ${y - 20}Z" fill="${h.d}"/>`,
    cat: (h, x, y) => `<path d="M${x + 4} ${y + 18} L${x - 6} ${y - 16} L${x + 26} ${y + 4}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + 6} ${y + 10} L${x} ${y - 6} L${x + 16} ${y + 4}Z" fill="${h.A}"/>`,
    round: (h, x, y) => `<circle cx="${x + 4}" cy="${y + 2}" r="16" fill="${h.B}" stroke="${h.K}" stroke-width="3"/><circle cx="${x + 5}" cy="${y + 3}" r="8" fill="${h.A}"/>`,
    bunny: (h, x, y) => `<g transform="rotate(-16 ${x + 8} ${y + 10})"><path d="M${x + 8} ${y + 14} C${x - 6} ${y - 10} ${x - 4} ${y - 52} ${x + 8} ${y - 54} C${x + 20} ${y - 52} ${x + 22} ${y - 10} ${x + 8} ${y + 14}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3"/><path d="M${x + 8} ${y + 2} C${x + 2} ${y - 16} ${x + 2} ${y - 40} ${x + 8} ${y - 44} C${x + 14} ${y - 40} ${x + 14} ${y - 16} ${x + 8} ${y + 2}Z" fill="${h.A}"/></g>`,
    fin: (h, x, y) => `<path d="M${x + 12} ${y + 10} C${x - 16} ${y + 4} ${x - 26} ${y - 22} ${x - 16} ${y - 38} C${x - 6} ${y - 22} ${x + 10} ${y - 12} ${x + 24} ${y}Z" fill="url(#${h.id}W)" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x + 6} ${y + 4} L${x - 12} ${y - 28} M${x + 12} ${y + 2} L${x - 2} ${y - 22}" stroke="#2468b8" stroke-width="1.6" opacity=".6"/>`,
    leaf: (h, x, y) => leaf(h, x + 8, y + 12, -52, 1),
    horn: (h, x, y) => `<path d="M${x + 12} ${y + 8} C${x + 2} ${y - 10} ${x - 6} ${y - 28} ${x - 20} ${y - 38} C${x - 4} ${y - 34} ${x + 16} ${y - 18} ${x + 24} ${y + 2}Z" fill="url(#${h.id}H)" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x + 4} ${y - 8} l8 -2 M${x - 4} ${y - 20} l7 -3" stroke="${h.K}" stroke-width="1.6" opacity=".5"/>`,
    antenna: (h, x, y) => `<g class="${h.an('cr-ear')}" style="transform-origin:${x + 14}px ${y + 8}px"><path d="M${x + 14} ${y + 8} Q${x + 6} ${y - 12} ${x - 6} ${y - 24}" stroke="${h.K}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x - 7}" cy="${y - 26}" r="8" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.4"/><circle cx="${x - 9}" cy="${y - 28}" r="2.5" fill="#fff"/></g>`,
    bolt: (h, x, y) => `<polygon points="${x + 8},${y + 14} ${x - 4},${y - 6} ${x + 6},${y - 8} ${x - 8},${y - 34} ${x + 18},${y - 4} ${x + 8},${y - 2} ${x + 22},${y + 6}" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/>`,
    crystal: (h, x, y) => crys(h, `${x + 6},${y + 14} ${x - 8},${y - 26} ${x + 20},${y + 2}`),
    antler: (h, x, y) => `<path d="M${x + 14} ${y + 8} C${x + 6} ${y - 8} ${x} ${y - 20} ${x - 4} ${y - 36} M${x + 3} ${y - 12} L${x - 12} ${y - 20} M${x - 1} ${y - 26} L${x + 10} ${y - 34}" stroke="#7a5030" stroke-width="6" fill="none" stroke-linecap="round"/>${leaf(h, x - 12, y - 20, -70, .5)}${leaf(h, x + 10, y - 34, 40, .45)}`,
    feather: (h, x, y) => `<path d="M${x + 14} ${y + 10} C${x} ${y - 4} ${x - 8} ${y - 20} ${x - 6} ${y - 34} C${x + 4} ${y - 22} ${x + 16} ${y - 14} ${x + 24} ${y + 2}Z" fill="${h.A}" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/>`,
  };
  const CRESTS = {
    flame1: (h, x, y) => flame(h, x, y + 8, 0, .8),
    flame3: (h, x, y) => flame(h, x - 16, y + 10, -28, .62) + flame(h, x + 16, y + 10, 28, .62) + flame(h, x, y + 8, 0, 1.05),
    sprout: (h, x, y) => `<path d="M${x} ${y + 6} Q${x - 2} ${y - 6} ${x} ${y - 14}" stroke="#256b36" stroke-width="4" fill="none" stroke-linecap="round"/>` + leaf(h, x, y - 12, -55, .7) + leaf(h, x, y - 12, 55, .7),
    leaves: (h, x, y) => leaf(h, x, y + 8, -42, .95) + leaf(h, x, y + 8, 42, .95) + leaf(h, x, y + 8, 0, 1.1, '#8fe88a'),
    flower: (h, x, y) => leaf(h, x, y + 8, -64, .8) + leaf(h, x, y + 8, 64, .8) + `<g class="${h.an('cr-spin')}" style="transform-origin:${x}px ${y - 8}px">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="${x}" cy="${y - 25}" rx="11" ry="17" transform="rotate(${a} ${x} ${y - 8})" fill="#ffb3d1" stroke="#c84a80" stroke-width="2.2"/>`).join('')}</g><circle cx="${x}" cy="${y - 8}" r="11" fill="#ffd84a" stroke="#c88a00" stroke-width="2.2"/><circle cx="${x - 3}" cy="${y - 11}" r="3" fill="#fff" opacity=".8"/>`,
    wave: (h, x, y) => `<path d="M${x - 18} ${y + 12} C${x - 20} ${y - 12} ${x + 4} ${y - 26} ${x + 24} ${y - 14} C${x + 10} ${y - 12} ${x + 2} ${y - 4} ${x + 10} ${y + 4} C${x - 4} ${y} ${x - 10} ${y + 8} ${x - 6} ${y + 14}Z" fill="url(#${h.id}W)" stroke="${h.K}" stroke-width="2.4" stroke-linejoin="round"/>`,
    drop: (h, x, y) => drop(h, x, y + 8, 0, 1),
    zig: (h, x, y) => `<polyline points="${x},${y + 8} ${x - 8},${y - 4} ${x + 6},${y - 12} ${x - 4},${y - 26}" stroke="${h.K}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${x},${y + 8} ${x - 8},${y - 4} ${x + 6},${y - 12} ${x - 4},${y - 26}" stroke="#ffe14d" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x - 4}" cy="${y - 30}" r="7" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.2"/>`,
    crystal: (h, x, y) => crys(h, `${x - 14},${y + 10} ${x - 9},${y - 20} ${x},${y + 6}`) + crys(h, `${x - 5},${y + 8} ${x + 3},${y - 34} ${x + 11},${y + 8}`) + crys(h, `${x + 8},${y + 10} ${x + 16},${y - 14} ${x + 18},${y + 10}`),
    cap: (h, x, y) => `<path d="M${x - 62} ${y + 36} C${x - 62} ${y - 16} ${x + 62} ${y - 16} ${x + 62} ${y + 36} C${x + 30} ${y + 24} ${x - 30} ${y + 24} ${x - 62} ${y + 36}Z" fill="url(#${h.id}A)" stroke="${h.K}" stroke-width="3"/><g fill="#fff" opacity=".92"><circle cx="${x - 30}" cy="${y + 10}" r="8"/><circle cx="${x + 4}" cy="${y - 2}" r="10"/><circle cx="${x + 34}" cy="${y + 14}" r="6.5"/></g>`,
    tuft: (h, x, y) => `<path d="M${x - 14} ${y + 8} C${x - 18} ${y - 10} ${x - 4} ${y - 18} ${x - 2} ${y - 4} C${x} ${y - 22} ${x + 16} ${y - 18} ${x + 12} ${y} C${x + 22} ${y - 6} ${x + 26} ${y + 6} ${x + 16} ${y + 12}Z" fill="${h.L}" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/>`,
    star: (h, x, y) => `<path d="M${x} ${y + 6} Q${x - 4} ${y - 6} ${x} ${y - 16}" stroke="${h.K}" stroke-width="4" fill="none"/><polygon class="${h.an('twinkle')}" points="${stp(x, y - 24, 14, 6)}" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.2" stroke-linejoin="round"/>`,
    moon: (h, x, y) => `<path d="M${x + 8} ${y - 30} A16 16 0 1 1 ${x + 8} ${y + 2} A12 12 0 1 0 ${x + 8} ${y - 30}Z" fill="#fff3a6" stroke="#c8a83a" stroke-width="2.4"/>`,
    bud: (h, x, y) => `<path d="M${x} ${y + 6} V${y - 8}" stroke="#256b36" stroke-width="4"/><path d="M${x} ${y - 34} C${x - 12} ${y - 26} ${x - 10} ${y - 10} ${x} ${y - 8} C${x + 10} ${y - 10} ${x + 12} ${y - 26} ${x} ${y - 34}Z" fill="${h.A}" stroke="${h.K}" stroke-width="2.2"/>`,
    coral: (h, x, y) => mir(`<path d="M${x - 8} ${y + 8} C${x - 12} ${y - 6} ${x - 20} ${y - 12} ${x - 26} ${y - 22} M${x - 16} ${y - 10} C${x - 12} ${y - 18} ${x - 12} ${y - 24} ${x - 8} ${y - 30}" stroke="${h.K}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M${x - 8} ${y + 8} C${x - 12} ${y - 6} ${x - 20} ${y - 12} ${x - 26} ${y - 22} M${x - 16} ${y - 10} C${x - 12} ${y - 18} ${x - 12} ${y - 24} ${x - 8} ${y - 30}" stroke="${h.a}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`),
    crown: (h, x, y) => `<path d="M${x - 24} ${y + 10} L${x - 28} ${y - 16} L${x - 13} ${y - 4} L${x} ${y - 26} L${x + 13} ${y - 4} L${x + 28} ${y - 16} L${x + 24} ${y + 10}Z" fill="url(#${h.id}O)" stroke="#8a5a00" stroke-width="2.6" stroke-linejoin="round"/><circle cx="${x}" cy="${y + 1}" r="5" fill="${h.a}" stroke="#fff" stroke-width="2"/><circle cx="${x - 28}" cy="${y - 17}" r="3" fill="#fff"/><circle cx="${x + 28}" cy="${y - 17}" r="3" fill="#fff"/><circle cx="${x}" cy="${y - 27}" r="3.5" fill="#fff"/>`,
    boltcrown: (h, x, y) => bolt(h, x - 22, y + 12, -26, .95) + bolt(h, x + 22, y + 12, 26, .95) + bolt(h, x, y + 8, 0, 1.35),
    pearlcrown: (h, x, y) => drop(h, x - 20, y + 12, -32, .8) + drop(h, x + 20, y + 12, 32, .8) + drop(h, x, y + 6, 0, 1.15) + `<circle cx="${x}" cy="${y + 14}" r="8" fill="#fff" stroke="#9ad8ff" stroke-width="3"/><circle cx="${x - 3}" cy="${y + 11}" r="2.5" fill="#fff"/>`,
    floralcrown: (h, x, y) => CRESTS.crown(h, x, y) + [-30, 30].map(dx => `<g transform="translate(${x + dx} ${y + 4})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-8" rx="5" ry="8" transform="rotate(${a})" fill="#ffb3d1" stroke="#c84a80" stroke-width="1.6"/>`).join('')}<circle r="4" fill="#ffd84a"/></g>`).join(''),
  };
  const TAILS = {
    flame: (h, x, y) => `<path d="M${x} ${y - 6} C${x + 28} ${y - 4} ${x + 38} ${y - 22} ${x + 34} ${y - 38} L${x + 27} ${y - 34} C${x + 28} ${y - 20} ${x + 18} ${y + 2} ${x} ${y + 6}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/>` + flame(h, x + 31, y - 34, 18, .8),
    fluff: (h, x, y) => `<path d="M${x} ${y} C${x + 40} ${y + 6} ${x + 52} ${y - 30} ${x + 38} ${y - 56} C${x + 34} ${y - 42} ${x + 26} ${y - 36} ${x + 20} ${y - 38} C${x + 30} ${y - 22} ${x + 18} ${y - 6} ${x} ${y - 10}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + 38} ${y - 56} C${x + 34} ${y - 42} ${x + 26} ${y - 36} ${x + 20} ${y - 38} C${x + 30} ${y - 40} ${x + 40} ${y - 44} ${x + 38} ${y - 56}Z" fill="${h.C}"/>`,
    foxflame: (h, x, y) => TAILS.fluff(h, x, y) + flame(h, x + 37, y - 52, 20, .7),
    bolt: (h, x, y) => `<polygon points="${x},${y - 4} ${x + 26},${y - 18} ${x + 16},${y - 24} ${x + 44},${y - 50} ${x + 36},${y - 26} ${x + 46},${y - 22} ${x + 10},${y + 6}" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/>`,
    leaf: (h, x, y) => `<path d="M${x} ${y} Q${x + 18} ${y - 2} ${x + 22} ${y - 14}" stroke="#256b36" stroke-width="4" fill="none"/>` + leaf(h, x + 22, y - 12, 50, 1.05),
    fish: (h, x, y) => `<path d="M${x} ${y - 8} C${x + 14} ${y - 10} ${x + 22} ${y - 22} ${x + 30} ${y - 40} C${x + 30} ${y - 18} ${x + 38} ${y - 4} ${x + 50} ${y + 6} C${x + 32} ${y + 6} ${x + 16} ${y + 10} ${x} ${y + 10}Z" fill="url(#${h.id}W)" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x + 8} ${y} L${x + 26} ${y - 26} M${x + 10} ${y + 4} L${x + 38} ${y}" stroke="#2468b8" stroke-width="1.6" opacity=".6"/>`,
    curl: (h, x, y) => `<path d="M${x} ${y} C${x + 32} ${y - 2} ${x + 36} ${y - 36} ${x + 18} ${y - 40} C${x + 4} ${y - 42} ${x + 4} ${y - 22} ${x + 16} ${y - 24}" stroke="${h.K}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M${x} ${y} C${x + 32} ${y - 2} ${x + 36} ${y - 36} ${x + 18} ${y - 40} C${x + 4} ${y - 42} ${x + 4} ${y - 22} ${x + 16} ${y - 24}" stroke="${h.b}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    star: (h, x, y) => `<path d="M${x} ${y} C${x + 26} ${y + 4} ${x + 32} ${y - 16} ${x + 30} ${y - 30}" stroke="${h.K}" stroke-width="7" fill="none" stroke-linecap="round"/><polygon class="${h.an('twinkle')}" points="${stp(x + 30, y - 38, 14, 6)}" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="2.2" stroke-linejoin="round"/>`,
    puff: (h, x, y) => `<circle cx="${x + 12}" cy="${y + 4}" r="15" fill="${h.C}" stroke="${h.K}" stroke-width="3"/>`,
    dragon: (h, x, y) => `<path d="M${x} ${y - 6} C${x + 30} ${y - 4} ${x + 40} ${y - 26} ${x + 40} ${y - 44} L${x + 34} ${y - 42} C${x + 32} ${y - 24} ${x + 20} ${y + 4} ${x} ${y + 8}Z" fill="${h.B}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + 37} ${y - 44} L${x + 26} ${y - 56} L${x + 40} ${y - 70} L${x + 52} ${y - 54}Z" fill="${h.A}" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/>`,
    feathers: (h, x, y) => [-24, 0, 24].map(a => `<path d="M${x} ${y} C${x - 8} ${y + 10} ${x - 6} ${y + 22} ${x} ${y + 28} C${x + 6} ${y + 22} ${x + 8} ${y + 10} ${x} ${y}Z" transform="rotate(${a} ${x} ${y})" fill="${h.A}" stroke="${h.K}" stroke-width="2.4"/>`).join(''),
  };
  const WINGS = {
    dragon: (h, x, y) => `<path d="M${x} ${y} C${x - 16} ${y - 30} ${x - 40} ${y - 56} ${x - 62} ${y - 56} C${x - 56} ${y - 40} ${x - 62} ${y - 22} ${x - 58} ${y - 6} C${x - 48} ${y - 12} ${x - 40} ${y - 6} ${x - 36} ${y + 6} C${x - 26} ${y - 2} ${x - 14} ${y + 2} ${x - 4} ${y + 12}Z" fill="${h.A}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 2} ${y + 2} L${x - 62} ${y - 56} M${x - 10} ${y} L${x - 58} ${y - 8} M${x - 6} ${y + 4} L${x - 36} ${y + 4}" stroke="${h.K}" stroke-width="2" opacity=".55"/>`,
    feather: (h, x, y) => `<path d="M${x} ${y + 8} C${x - 32} ${y - 6} ${x - 50} ${y - 34} ${x - 46} ${y - 56} C${x - 34} ${y - 40} ${x - 20} ${y - 34} ${x - 10} ${y - 34} C${x - 22} ${y - 26} ${x - 26} ${y - 16} ${x - 24} ${y - 8} C${x - 16} ${y - 12} ${x - 6} ${y - 10} ${x + 4} ${y - 8}Z" fill="${h.C}" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 46} ${y - 56} C${x - 40} ${y - 38} ${x - 30} ${y - 28} ${x - 14} ${y - 22}" stroke="${h.A}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    fairy: (h, x, y) => `<ellipse cx="${x - 26}" cy="${y - 26}" rx="22" ry="34" transform="rotate(-38 ${x - 26} ${y - 26})" fill="${h.a}" opacity=".5" stroke="#fff" stroke-width="2.5"/><ellipse cx="${x - 26}" cy="${y + 10}" rx="13" ry="21" transform="rotate(-72 ${x - 26} ${y + 10})" fill="${h.a}" opacity=".4" stroke="#fff" stroke-width="2.5"/>`,
    flame: (h, x, y) => flame(h, x - 8, y + 6, -64, 1.35) + flame(h, x - 4, y + 14, -96, 1),
    leaf: (h, x, y) => leaf(h, x, y, -58, 1.45) + leaf(h, x, y + 12, -95, 1.15) + leaf(h, x, y - 6, -28, 1.05, '#8fe88a'),
    water: (h, x, y) => `<path d="M${x} ${y + 8} C${x - 30} ${y + 2} ${x - 48} ${y - 26} ${x - 40} ${y - 56} C${x - 28} ${y - 34} ${x - 12} ${y - 24} ${x + 6} ${y - 18}Z" fill="url(#${h.id}W)" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 4} ${y} L${x - 38} ${y - 48} M${x} ${y - 6} L${x - 24} ${y - 36}" stroke="#2468b8" stroke-width="1.8" opacity=".6"/>`,
    bolt: (h, x, y) => `<polygon points="${x + 2},${y + 2} ${x - 46},${y - 44} ${x - 22},${y - 34} ${x - 38},${y - 66} ${x + 8},${y - 18}" fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="3" stroke-linejoin="round"/>`,
    crystal: (h, x, y) => crys(h, `${x},${y + 6} ${x - 50},${y - 40} ${x - 30},${y - 10} ${x - 44},${y + 4}`) + crys(h, `${x},${y} ${x - 26},${y - 58} ${x + 6},${y - 16}`),
  };
  const EXTRAS = {
    armor: (h, P) => `<path d="M${P.chest[0] - 20} ${P.chest[1] - 10} L${P.chest[0]} ${P.chest[1] - 18} L${P.chest[0] + 20} ${P.chest[1] - 10} L${P.chest[0] + 16} ${P.chest[1] + 10} L${P.chest[0]} ${P.chest[1] + 18} L${P.chest[0] - 16} ${P.chest[1] + 10}Z" fill="url(#${h.id}O)" stroke="#8a5a00" stroke-width="2.6" stroke-linejoin="round"/><polygon points="${P.chest[0]},${P.chest[1] - 8} ${P.chest[0] + 7},${P.chest[1]} ${P.chest[0]},${P.chest[1] + 8} ${P.chest[0] - 7},${P.chest[1]}" fill="${h.a}" stroke="#fff" stroke-width="1.8"/>`,
    gem: (h, P) => `<polygon points="100,${P.hc[1] - 28} 106,${P.hc[1] - 21} 100,${P.hc[1] - 14} 94,${P.hc[1] - 21}" fill="${h.a}" stroke="#fff" stroke-width="2"/>`,
    shoulder: (h, P) => mir(`<path d="M${P.wing[0] - 4} ${P.wing[1] - 8} L${P.wing[0] - 16} ${P.wing[1] - 24} L${P.wing[0] + 10} ${P.wing[1] - 12}Z" fill="url(#${h.id}O)" stroke="#8a5a00" stroke-width="2.4" stroke-linejoin="round"/>`),
    collar: (h, P) => `<path d="M${P.neck[0] - 34} ${P.neck[1] - 6} ${[...Array(9)].map((_, i) => `L${P.neck[0] - 30 + i * 7.5} ${P.neck[1] + (i % 2 ? 10 : 2)}`).join(' ')} L${P.neck[0] + 34} ${P.neck[1] - 6} Q${P.neck[0]} ${P.neck[1] + 4} ${P.neck[0] - 34} ${P.neck[1] - 6}Z" fill="${h.C}" stroke="${h.K}" stroke-width="2.4" stroke-linejoin="round"/>`,
    whiskers: (h, P) => mir(`<path d="M${P.hc[0] - 22} ${P.eyeY + 22} q-16 -2 -26 -8 M${P.hc[0] - 22} ${P.eyeY + 27} q-16 2 -26 2" stroke="${h.K}" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    wrist: (h, P) => P.arm ? mir(flame(h, P.arm[0] - 2, P.arm[1] + 2, -40, .45)) : '',
    stripes: (h, P) => mir(`<path d="M${P.hc[0] - 34} ${P.eyeY - 14} l10 4 l-10 4Z M${P.hc[0] - 36} ${P.eyeY - 4} l9 3 l-9 3Z" fill="${h.d}"/>`) + `<path d="M${P.hc[0] - 7} ${P.eyeY - 30} q7 9 14 0 q-7 14 -14 0Z" fill="${h.d}"/>`,
    spots: (h, P) => `<g fill="${h.L}" opacity=".85"><circle cx="${P.chest[0] - 36}" cy="${P.chest[1] - 4}" r="5"/><circle cx="${P.chest[0] + 38}" cy="${P.chest[1] + 2}" r="4"/><circle cx="${P.chest[0] + 30}" cy="${P.chest[1] - 14}" r="3"/><circle cx="${P.hc[0] - 30}" cy="${P.eyeY - 18}" r="3.5"/></g>`,
    stars: (h, P) => `<g fill="url(#${h.id}Y)" stroke="${h.K}" stroke-width="1.2"><polygon points="${stp(P.chest[0] - 36, P.chest[1] - 2, 6, 2.5)}"/><polygon points="${stp(P.chest[0] + 36, P.chest[1] + 4, 5, 2)}"/><polygon points="${stp(P.hc[0] + 32, P.eyeY - 20, 4.5, 2)}"/></g>`,
    rocks: (h, P) => `<g fill="${h.d}" stroke="${h.K}" stroke-width="2" stroke-linejoin="round"><path d="M${P.chest[0] - 40} ${P.chest[1] - 12} l12 -7 l8 9 l-10 7Z"/><path d="M${P.chest[0] + 30} ${P.chest[1] + 2} l11 -5 l5 10 l-11 4Z"/><path d="M${P.hc[0] + 24} ${P.eyeY - 30} l9 -4 l4 8 l-9 3Z"/></g>`,
    cape: (h, P) => [...Array(7)].map((_, i) => { const a = (200 + i * 23) * Math.PI / 180, cx = 100 + Math.cos(a) * 60, cy = P.chest[1] + Math.sin(a) * 52; return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="15" ry="30" transform="rotate(${200 + i * 23 + 90} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="#ffb3d1" stroke="#c84a80" stroke-width="2.2"/>`; }).join(''),
    mane: (h, P) => [...Array(13)].map((_, i) => { const a = (-180 + i * 15) * Math.PI / 180; return flame(h, P.hc[0] + Math.cos(a) * 46, P.hc[1] + 4 + Math.sin(a) * 44, (-180 + i * 15) + 90, 1.05); }).join(''),
    bubbles: (h, P) => [[40, 150, 0], [160, 138, 1], [152, 86, 2], [48, 92, 1.5]].map(([x, y, d]) => `<circle class="${h.an('floaty')}" style="animation-delay:${d}s" cx="${x}" cy="${y}" r="6" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="1.6"/>`).join(''),
    sparkles: (h, P) => [[30, 60, 0], [170, 70, .6], [164, 166, 1.1], [34, 158, .3]].map(([x, y, d]) => `<polygon class="${h.an('twinkle')}" style="animation-delay:${d}s" points="${stp(x, y, 7, 2.5, 4)}" fill="#fff8c4"/>`).join(''),
    talons: () => '',
  };
  const BACK_EXTRAS = { cape: 1, mane: 1 };

  /* ---------- yeux & bouche ---------- */
  function eyeL(h, x, y, r, style) {
    const lid = style === 'fierce' ? `<path d="M${x - r * 1.1} ${y - r * 1.7} L${x + r * 1.15} ${y - r * 1.3} L${x + r * 1.15} ${y - r * .72} L${x - r * 1.1} ${y - r * 1.08}Z" fill="${h.b}"/><path d="M${x - r * 1.05} ${y - r * 1.06} L${x + r * 1.1} ${y - r * .7}" stroke="${h.K}" stroke-width="3.6" stroke-linecap="round"/>`
      : style === 'sharp' ? `<path d="M${x - r * .95} ${y - r * .5} Q${x} ${y - r * 1.45} ${x + r * 1.05} ${y - r * .75}" stroke="${h.K}" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="M${x - r * .9} ${y - r * 1.7} L${x + r * .9} ${y - r * 1.3}" stroke="${h.K}" stroke-width="3.2" stroke-linecap="round"/>`
        : `<path d="M${x - r * .95} ${y - r * .45} Q${x} ${y - r * 1.4} ${x + r * .95} ${y - r * .45}" stroke="${h.K}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M${x - r * .85} ${y - r * .7} l-5 -4" stroke="${h.K}" stroke-width="2.4" stroke-linecap="round"/>`;
    const rays = [...Array(10)].map((_, i) => { const a = i * Math.PI / 5, ix = x + r * .1, iy = y + r * .12; return `M${(ix + Math.cos(a) * r * .38).toFixed(1)} ${(iy + Math.sin(a) * r * .52).toFixed(1)} L${(ix + Math.cos(a) * r * .62).toFixed(1)} ${(iy + Math.sin(a) * r * .84).toFixed(1)}`; }).join(' ');
    return `<g class="${h.an('eye')}"><ellipse cx="${x}" cy="${y}" rx="${r * .92}" ry="${r * 1.14}" fill="url(#${h.id}S)" stroke="${h.K}" stroke-width="2.2"/>
      <ellipse cx="${x + r * .1}" cy="${y + r * .12}" rx="${r * .72}" ry="${r * .94}" fill="url(#${h.id}E)" stroke="#120826" stroke-width="1.4"/>
      <path d="${rays}" stroke="#fff" stroke-width=".9" opacity=".35"/>
      <ellipse cx="${x + r * .1}" cy="${y + r * .12}" rx="${r * .5}" ry="${r * .68}" fill="none" stroke="${mix(h.eyeC, '#fff', .6)}" stroke-width="1.2" opacity=".55"/>
      <ellipse cx="${x + r * .12}" cy="${y + r * .18}" rx="${r * .32}" ry="${r * .48}" fill="#120826"/>
      <path d="M${x - r * .6} ${y + r * .5} Q${x + r * .1} ${y + r * 1.05} ${x + r * .78} ${y + r * .45}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/>
      <ellipse cx="${x - r * .24}" cy="${y - r * .34}" rx="${r * .34}" ry="${r * .3}" fill="#fff"/><circle cx="${x + r * .4}" cy="${y + r * .48}" r="${r * .16}" fill="#fff"/><circle cx="${x + r * .38}" cy="${y - r * .28}" r="${r * .09}" fill="#fff"/>
      ${h.tier >= 3 ? `<polygon points="${stp(x + r * .3, y - r * .05, r * .28, r * .09, 4)}" fill="#fff"/>` : ''}
      <path d="M${x - r * .5} ${y + r * 1.22} q${r * .5} ${r * .18} ${r * 1.0} 0" stroke="${h.K}" stroke-width="1.3" fill="none" opacity=".6"/>${lid}</g>
      <g class="xeye"><path d="M${x - r * .6} ${y - r * .6} L${x + r * .6} ${y} L${x - r * .6} ${y + r * .6}" stroke="${h.K}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  function mouth(h, P, kind) {
    const y = P.beak ? P.eyeY + 34 : P.mouthY + 4, fang = kind === 'fang';
    if (P.beak) return `<g class="mo-happy"><path d="M92 122 Q100 132 108 122Z" fill="#7a2244" stroke="${h.K}" stroke-width="2"/></g>`;
    return `<path class="mo-calm" d="M${100 - 9} ${y} Q${100 - 4.5} ${y + 5} 100 ${y} Q${100 + 4.5} ${y + 5} ${100 + 9} ${y}" stroke="${h.K}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      ${fang ? `<path class="mo-calm" d="M${100 + 3} ${y + 1.5} l2.5 5 l2.5 -4.5Z" fill="#fff" stroke="${h.K}" stroke-width="1.2"/>` : ''}
      <g class="mo-happy"><path d="M${100 - 12} ${y - 2} Q100 ${y + 20} ${100 + 12} ${y - 2}Z" fill="#7a2244" stroke="${h.K}" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="100" cy="${y + 8}" rx="6" ry="4" fill="#ff8fb0"/>${fang ? `<path d="M${100 - 10} ${y - 1} l3 6 l3 -6Z M${100 + 4} ${y - 1} l3 6 l3 -6Z" fill="#fff"/>` : ''}</g>`;
  }

  /* ---------- assemblage ---------- */
  function drawCreature(sp, o = {}) {
    const A = sp.art, P = PLANS[A.plan] || PLANS.quad, id = 'k' + (++U), tier = sp.tier || 1;
    const b = sp.mid || sp.c1, l = sp.c1, d = sp.c2, a = sp.acc || d, belly = sp.belly || '#fff', K = mix(d, '#1a0f30', .62);
    const st = !!o.still, h = { id, sp: A, tier, eyeC: sp.eye || d, b, l, d, a, K, B: `url(#${id}B)`, A: `url(#${id}A)`, C: `url(#${id}C)`, D: d, L: l, an: c => st ? '' : c };
    const parts = P.draw(h);
    const at = (k, xy) => xy ? [xy[0], xy[1]] : null;
    const back = [], mid = [], front = [];
    (A.extras || []).filter(x => BACK_EXTRAS[x]).forEach(x => back.push(EXTRAS[x](h, P)));
    if (A.wings) { const [wx, wy] = A.wingAt || P.wing; back.push(mir(`<g class="${h.an('cr-wing')}" style="transform-origin:${wx}px ${wy}px">${WINGS[A.wings](h, wx, wy)}</g>`)); }
    if (A.tail) { const [tx, ty] = A.tailAt || P.tail; back.push(`<g class="${h.an('cr-tail')}" style="transform-origin:${tx}px ${ty}px">${TAILS[A.tail](h, tx, ty)}</g>`); }
    back.push(parts.legsBack || '');
    mid.push(parts.body);
    (A.extras || []).filter(x => ['spots', 'stars', 'rocks', 'armor', 'shoulder', 'talons'].includes(x)).forEach(x => mid.push(EXTRAS[x](h, P)));
    mid.push(parts.legsFront || '');
    if (A.extras && A.extras.includes('wrist')) mid.push(EXTRAS.wrist(h, P));
    // tête
    const head = [];
    if (A.ears) { const [ex, ey] = A.earAt || P.ear; head.push(mir(`<g class="${h.an('cr-ear')}" style="transform-origin:${ex + 14}px ${ey + 10}px">${EARS[A.ears](h, ex, ey)}</g>`)); }
    if (A.extras && A.extras.includes('collar')) head.push(EXTRAS.collar(h, P));
    head.push(parts.head || '');
    head.push(`<ellipse cx="${100 - P.eyeDX - 10}" cy="${P.eyeY + 15}" rx="8" ry="5" fill="${sp.cheek || '#ff6f9e'}" opacity=".5"/><ellipse cx="${100 + P.eyeDX + 10}" cy="${P.eyeY + 15}" rx="8" ry="5" fill="${sp.cheek || '#ff6f9e'}" opacity=".5"/>`);
    head.push(mir(eyeL(h, 100 - P.eyeDX, P.eyeY, P.eyeR, A.eyes || 'cute')));
    head.push(mouth(h, P, A.mouth));
    (A.extras || []).filter(x => ['stripes', 'whiskers', 'gem'].includes(x)).forEach(x => head.push(EXTRAS[x](h, P)));
    if (A.crest) { const [cx, cy] = A.crestAt || P.crest; head.push(CRESTS[A.crest](h, cx, cy)); }
    head.push(`<ellipse cx="${100 - 18}" cy="${(P.hc[1] - 30)}" rx="12" ry="6" fill="#fff" opacity=".28" transform="rotate(-25 ${100 - 18} ${P.hc[1] - 30})"/>`);
    (o.noFx ? [] : A.extras || []).filter(x => ['bubbles', 'sparkles'].includes(x)).forEach(x => front.push(EXTRAS[x](h, P)));
    // ---- détails « manga » : textures, reflets, hachures ----
    const seed = [...(sp.name || A.plan + (A.crest || '') + (A.ears || ''))].reduce((t, c) => (t * 31 + c.charCodeAt(0)) >>> 0, 7);
    let rs = seed || 1; const R = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
    const bodyD = (parts.body.match(/d="([^"]+)"/) || [])[1], headD = ((parts.head || '').match(/d="([^"]+)"/) || [])[1];
    const clipB = bodyD ? `<clipPath id="${id}cb"><path d="${bodyD}"/></clipPath>` : '', clipH = headD && !P.beak ? `<clipPath id="${id}ch"><path d="${headD}"/></clipPath>` : '';
    const kind = A.tex || ({ eau: 'scale', plante: 'vein', eclair: 'fur', feu: 'fur', roche: 'facet', glace: 'facet', ciel: 'feather', etoile: 'dot' }[sp.elx] || 'fur');
    const kd = A.plan === 'bird' ? 'feather' : A.plan === 'fish' ? 'scale' : A.plan === 'ghost' ? 'wisp' : kind;
    const texStroke = (cx, cy) => {
      if (kd === 'scale') return `<path d="M${cx - 5} ${cy} q5 6 10 0" stroke="${K}" stroke-width="1.3" fill="none" opacity=".32"/><path d="M${cx - 3} ${cy + 1.5} q3 3 6 0" stroke="#fff" stroke-width="1" fill="none" opacity=".45"/>`;
      if (kd === 'feather') return `<path d="M${cx - 6} ${cy - 2} q6 7 12 0" stroke="${K}" stroke-width="1.4" fill="none" opacity=".35"/>`;
      if (kd === 'vein') return `<path d="M${cx} ${cy} l6 -6 M${cx + 3} ${cy - 3} l3 1" stroke="${mix(d, '#000', .3)}" stroke-width="1.2" fill="none" opacity=".4"/>`;
      if (kd === 'facet') return `<path d="M${cx - 5} ${cy + 3} l5 -8 l5 8" stroke="#fff" stroke-width="1.3" fill="none" opacity=".55"/>`;
      if (kd === 'wisp') return `<path d="M${cx - 6} ${cy} q4 -5 8 -1 q3 3 5 -2" stroke="#fff" stroke-width="1.2" fill="none" opacity=".45"/>`;
      if (kd === 'dot') return `<circle cx="${cx}" cy="${cy}" r="1.3" fill="#fff" opacity=".7"/>`;
      const a = (R() - .5) * 50; return `<path d="M${cx} ${cy} q2 -5 1 -9" transform="rotate(${a.toFixed(0)} ${cx} ${cy})" stroke="${K}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".38"/>`;
    };
    const scatter = (n, x0, y0, w, hh) => [...Array(n)].map(() => texStroke(+(x0 + R() * w).toFixed(1), +(y0 + R() * hh).toFixed(1))).join('');
    const texB = clipB ? `<g clip-path="url(#${id}cb)">${scatter(22, 50, P.chest[1] - 36, 100, 70)}</g>` : '';
    const texH = clipH ? `<g clip-path="url(#${id}ch)">${scatter(12, 62, P.hc[1] - 40, 76, 30)}${scatter(6, 60, P.hc[1] + 4, 20, 22)}${scatter(6, 120, P.hc[1] + 4, 20, 22)}</g>` : '';
    // contre-jour / ombre portée interne en hachures croisées (bas-droite du corps)
    const hatch = clipB ? `<g clip-path="url(#${id}cb)" opacity=".22">${[...Array(9)].map((_, i) => `<path d="M${118 + i * 5} ${P.chest[1] + 30} l18 -26" stroke="${K}" stroke-width="1.2"/>`).join('')}</g>` : '';
    mid.splice(1, 0, texB + hatch);
    const shine = !P.beak ? `<path d="M${100 - 26} ${P.hc[1] - 26} Q100 ${P.hc[1] - 40} ${100 + 26} ${P.hc[1] - 26}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".42"/><path d="M${100 - 12} ${P.hc[1] - 33} l6 -3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>` : '';
    const blush = mir(`<path d="M${100 - P.eyeDX - 15} ${P.eyeY + 17} l4 -5 M${100 - P.eyeDX - 10} ${P.eyeY + 18} l4 -5 M${100 - P.eyeDX - 5} ${P.eyeY + 18} l4 -5" stroke="#e0407a" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`);
    head.splice(head.length - 1, 0, texH, blush, shine);
    const kira = !o.noFx ? [[30, 44, 9], [172, 56, 7], [176, 150, 6]].slice(0, tier).map(([x, y, r]) => `<g class="${h.an('twinkle')}"><polygon points="${stp(x, y, r, r * .22, 4)}" fill="#fff" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/></g>`).join('') : '';

    // effets selon le niveau
    const fxc = sp.auraColor || a, fxB = [], fxF = [];
    if (!o.noFx && tier >= 2) fxF.push([[36, 70, 0], [166, 82, .7], [160, 160, 1.3]].map(([x, y, dl]) => `<polygon class="${h.an('twinkle')}" style="animation-delay:${dl}s" points="${stp(x, y, 6, 2, 4)}" fill="#fff8c4"/>`).join(''));
    if (!o.noFx && tier >= 3) {
      fxB.push(`<circle cx="100" cy="118" r="96" fill="url(#${id}g)" class="${h.an('fx-pulse')}"/>`);
      fxB.push(`<g class="${h.an('fx-spin')}"><circle cx="100" cy="118" r="88" fill="none" stroke="${fxc}" stroke-width="3" stroke-dasharray="3 13" stroke-linecap="round" opacity=".85"/></g>`);
      for (let i = 0; i < 3; i++) fxF.push(`<g class="${h.an('fx-orbit' + (i % 2 ? ' rev' : ''))}" style="animation-delay:-${i * 1.6}s"><g transform="rotate(${i * 120} 100 118)"><circle cx="100" cy="28" r="4.5" fill="#fff" filter="url(#${id}gl)"/><circle cx="100" cy="28" r="9" fill="${fxc}" opacity=".45"/></g></g>`);
    }
    fxF.push(kira);
    const s = A.scale || 1, fl = P.float || A.float;
    const defs = `<defs>
      <radialGradient id="${id}B" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${mix(l, '#fff', .35)}"/><stop offset=".3" stop-color="${l}"/><stop offset=".36" stop-color="${b}"/><stop offset=".78" stop-color="${b}"/><stop offset=".84" stop-color="${d}"/><stop offset="1" stop-color="${d}"/></radialGradient>
      <radialGradient id="${id}A" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${mix(a, '#fff', .5)}"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${mix(a, '#000', .25)}"/></radialGradient>
      <radialGradient id="${id}C" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="${belly}"/><stop offset="1" stop-color="${mix(belly, d, .25)}"/></radialGradient>
      <radialGradient id="${id}E" cx=".5" cy=".85" r=".9"><stop offset="0" stop-color="${mix(sp.eye || d, '#fff', .55)}"/><stop offset=".45" stop-color="${sp.eye || d}"/><stop offset="1" stop-color="#1c1036"/></radialGradient>
      <radialGradient id="${id}F" cx=".5" cy=".85" r=".9"><stop offset="0" stop-color="#fff3a0"/><stop offset=".45" stop-color="#ffaa30"/><stop offset="1" stop-color="#f04a20"/></radialGradient>
      <linearGradient id="${id}W" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8fbff"/><stop offset="1" stop-color="#3aa0f0"/></linearGradient>
      <linearGradient id="${id}Y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7a8"/><stop offset="1" stop-color="#ffb81a"/></linearGradient>
      <linearGradient id="${id}G" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8f59a"/><stop offset="1" stop-color="#38a050"/></linearGradient>
      <linearGradient id="${id}X" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cdf3ff"/><stop offset="1" stop-color="#86c8f0"/></linearGradient>
      <linearGradient id="${id}O" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset=".5" stop-color="#ffc83a"/><stop offset="1" stop-color="#d08a10"/></linearGradient>
      <linearGradient id="${id}H" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6e0"/><stop offset="1" stop-color="${a}"/></linearGradient>
      <linearGradient id="${id}S" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8c0e8"/><stop offset=".35" stop-color="#ffffff"/></linearGradient>
      <filter id="${id}M" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="bl"/>
        <feDiffuseLighting in="bl" surfaceScale="7" diffuseConstant="1.05" lighting-color="#fff" result="lit"><feDistantLight azimuth="225" elevation="38"/></feDiffuseLighting>
        <feComponentTransfer in="lit" result="cel"><feFuncR type="discrete" tableValues=".6 .8 .8 1 1"/><feFuncG type="discrete" tableValues=".56 .78 .78 1 1"/><feFuncB type="discrete" tableValues=".72 .86 .86 1 1"/></feComponentTransfer>
        <feBlend in="SourceGraphic" in2="cel" mode="multiply" result="shaded"/>
        <feSpecularLighting in="bl" surfaceScale="7" specularConstant="1" specularExponent="22" lighting-color="#fff" result="sp"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
        <feComponentTransfer in="sp" result="spc"><feFuncA type="discrete" tableValues="0 0 0 .55 .55"/></feComponentTransfer>
        <feSpecularLighting in="bl" surfaceScale="7" specularConstant="1.2" specularExponent="12" lighting-color="${mix(h.sp.rim || a, '#fff', .55)}" result="rm"><feDistantLight azimuth="40" elevation="12"/></feSpecularLighting>
        <feComponentTransfer in="rm" result="rmc"><feFuncA type="discrete" tableValues="0 0 0 0 .55"/></feComponentTransfer>
        <feMerge result="lit2"><feMergeNode in="shaded"/><feMergeNode in="spc"/><feMergeNode in="rmc"/></feMerge>
        <feComposite in="lit2" in2="SourceAlpha" operator="in" result="body"/>
        <feMorphology in="SourceAlpha" operator="dilate" radius="1.4" result="dl"/><feOffset in="dl" dx="1.3" dy="1.8" result="dlo"/>
        <feFlood flood-color="${K}"/><feComposite in2="dlo" operator="in" result="ink"/>
        <feMerge><feMergeNode in="ink"/><feMergeNode in="body"/></feMerge>
      </filter>
      <radialGradient id="${id}g"><stop offset="0" stop-color="${fxc}" stop-opacity=".7"/><stop offset=".6" stop-color="${fxc}" stop-opacity=".22"/><stop offset="1" stop-color="${fxc}" stop-opacity="0"/></radialGradient>
      <filter id="${id}gl" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      ${tier >= 3 && !o.noFx ? `<filter id="${id}bg" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${fxc}" flood-opacity=".9"/></filter>` : ''}
      ${clipB}${clipH}
    </defs>`;
    const shadow = o.noShadow ? '' : `<ellipse class="${h.an(fl ? 'cr-shadow' : '')}" cx="100" cy="184" rx="${48 * s}" ry="7" fill="#2d2350" opacity=".16"/>`;
    return `<svg class="crt${o.happy ? ' happy' : ''}" viewBox="${o.vb || '0 0 200 200'}" ${o.attrs || ''} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${shadow}${fxB.join('')}
      <g transform="translate(100 182) scale(${s}) translate(-100 -182)"><g class="cr-all"><g class="${h.an(fl ? 'cr-float' : '')}"><g class="${h.an('cr-breath')}"${tier >= 3 && !o.noFx ? ` filter="url(#${id}bg)"` : ''}><g filter="url(#${id}M)">
        ${back.join('')}${mid.join('')}<g transform="rotate(${A.tilt != null ? A.tilt : [0, 5, -3, -5][tier]} ${P.neck[0]} ${P.neck[1]})"><g class="${h.an('cr-head')}" style="transform-origin:${P.neck[0]}px ${P.neck[1]}px">${head.join('')}</g></g></g>${front.join('')}
      </g></g></g></g>${fxF.join('')}</svg>`;
  }

  /* ---------- les designs ---------- */
  const ART = {
    // Feu : renardeau → renard guerrier → lion-dragon ailé
    Flammi: { plan: 'quad', scale: .8, ears: 'fox', crest: 'flame1', tail: 'foxflame', eyes: 'cute' },
    Flambo: { plan: 'biped', scale: .94, ears: 'fox', crest: 'flame3', tail: 'flame', eyes: 'sharp', mouth: 'fang', extras: ['stripes', 'wrist', 'collar'] },
    'Flamboréal': { plan: 'quad', scale: 1.08, ears: 'horn', crest: 'flame3', tail: 'dragon', wings: 'dragon', eyes: 'fierce', mouth: 'fang', extras: ['mane', 'armor', 'shoulder', 'gem', 'stripes'], fluff: false },
    // Eau : bébé phoque → loutre des vagues → serpent-roi des mers
    Gouti: { plan: 'fish', scale: .8, ears: 'fin', crest: 'drop', eyes: 'cute' },
    Goutelo: { plan: 'quad', scale: .94, ears: 'fin', crest: 'wave', tail: 'fish', eyes: 'sharp', extras: ['whiskers', 'spots', 'bubbles'], fluff: false },
    'Océaline': { plan: 'fish', scale: 1.1, ears: 'fin', crest: 'pearlcrown', tail: 'fish', wings: 'water', eyes: 'fierce', mouth: 'fang', extras: ['whiskers', 'armor', 'bubbles', 'gem'] },
    // Plante : graine → faon feuillu → gardienne de la forêt
    Pousi: { plan: 'seed', scale: .8, crest: 'sprout', eyes: 'cute' },
    Bourgeo: { plan: 'quad', scale: .94, ears: 'leaf', crest: 'leaves', tail: 'leaf', eyes: 'sharp', extras: ['spots'], fluff: false },
    Florabelle: { plan: 'biped', scale: 1.08, ears: 'antler', crest: 'floralcrown', tail: 'leaf', wings: 'leaf', eyes: 'fierce', extras: ['cape', 'armor', 'shoulder', 'sparkles'] },
    // Éclair : nuage → furet à antennes → griffon du tonnerre
    Zippi: { plan: 'ghost', scale: .8, crest: 'zig', eyes: 'cute' },
    Zigzou: { plan: 'quad', scale: .94, ears: 'antenna', crest: 'zig', tail: 'bolt', eyes: 'sharp', mouth: 'fang', extras: ['stars'] },
    Foudrion: { plan: 'bird', scale: 1.1, ears: 'bolt', crest: 'boltcrown', tail: 'bolt', wings: 'bolt', eyes: 'fierce', extras: ['armor', 'shoulder', 'stars'], tailAt: [132, 160] },
    // Famille sauvage
    Braisette: { plan: 'quad', scale: .9, ears: 'cat', tail: 'flame', eyes: 'cute', mouth: 'fang' },
    Tisonnet: { plan: 'biped', scale: .9, crest: 'flame1', tail: 'curl', ears: 'round', extras: ['stripes'] },
    Volcanou: { plan: 'biped', scale: 1, ears: 'horn', crest: 'flame1', tail: 'dragon', eyes: 'sharp', mouth: 'fang', extras: ['rocks', 'shoulder'] },
    Bulleau: { plan: 'fish', scale: .9, crest: 'drop', extras: ['bubbles'] },
    Corailo: { plan: 'fish', scale: .92, ears: 'fin', crest: 'coral', tail: 'fish', extras: ['spots'] },
    'Écumou': { plan: 'ghost', scale: .9, crest: 'wave', tail: 'fish', extras: ['bubbles'] },
    'Nénuphy': { plan: 'quad', scale: .92, ears: 'leaf', crest: 'bud', tail: 'fish', fluff: false, eyes: 'sharp' },
    Moussette: { plan: 'seed', scale: .9, crest: 'sprout', extras: ['spots'] },
    Champinou: { plan: 'seed', scale: .9, crest: 'cap', crestAt: [100, 70] },
    Glandou: { plan: 'quad', scale: .9, ears: 'round', crest: 'cap', crestAt: [100, 56], tail: 'puff', fluff: false },
    'Pétalou': { plan: 'ghost', scale: .92, crest: 'flower', wings: 'fairy', extras: ['sparkles'] },
    'Mûrisson': { plan: 'seed', scale: .92, crest: 'leaves', tail: 'puff', extras: ['spots'], ears: 'round' },
    Tonnerrot: { plan: 'quad', scale: .9, ears: 'antenna', tail: 'bolt', mouth: 'fang' },
    Scintilla: { plan: 'ghost', scale: .95, crest: 'star', wings: 'fairy', extras: ['sparkles'], eyes: 'sharp' },
    Voltinou: { plan: 'biped', scale: .9, ears: 'cat', crest: 'zig', tail: 'bolt', extras: ['stripes'] },
    Nuagelle: { plan: 'ghost', scale: .9, wings: 'fairy', ears: 'round' },
    Plumeau: { plan: 'bird', scale: .9, ears: 'feather', crest: 'tuft', wings: 'feather', tail: 'feathers' },
    Pompom: { plan: 'quad', scale: .9, ears: 'bunny', tail: 'puff', fluff: false },
    Ventilou: { plan: 'bird', scale: .95, ears: 'feather', wings: 'feather', tail: 'curl', tailAt: [134, 156], eyes: 'sharp' },
    Rocaillon: { plan: 'biped', scale: .95, ears: 'round', extras: ['rocks'], eyes: 'sharp' },
    Sablon: { plan: 'quad', scale: .9, ears: 'cat', tail: 'curl', extras: ['spots'] },
    Cristallin: { plan: 'biped', scale: .98, ears: 'crystal', crest: 'crystal', extras: ['gem', 'shoulder'], eyes: 'sharp' },
    Givrelle: { plan: 'quad', scale: .9, ears: 'crystal', tail: 'puff', crest: 'crystal' },
    Floconou: { plan: 'ghost', scale: .9, crest: 'crystal', extras: ['sparkles'] },
    Pinguelin: { plan: 'bird', scale: .95, crest: 'tuft', wings: 'feather', tail: 'feathers', eyes: 'sharp' },
    'Étoilou': { plan: 'ghost', scale: .9, crest: 'star', extras: ['stars'] },
    Lunabelle: { plan: 'quad', scale: .95, ears: 'bunny', crest: 'moon', tail: 'star', extras: ['sparkles'], fluff: false },
    'Cométo': { plan: 'ghost', scale: .9, tail: 'star', extras: ['stars'] },
    Aurorine: { plan: 'biped', scale: 1.05, ears: 'feather', crest: 'floralcrown', wings: 'fairy', tail: 'star', eyes: 'sharp', extras: ['sparkles', 'gem'] },
    'Nébulon': { plan: 'quad', scale: 1.06, ears: 'horn', crest: 'crown', wings: 'feather', tail: 'star', eyes: 'fierce', mouth: 'fang', extras: ['stars', 'armor', 'collar', 'gem'], fluff: false },
    Cristalor: { plan: 'quad', scale: 1.06, ears: 'crystal', crest: 'crystal', wings: 'crystal', tail: 'fluff', eyes: 'fierce', extras: ['collar', 'gem', 'sparkles'] },
  };
  window.CREATURE_ART = ART;
  window.drawCreature = drawCreature;
})();
