// render.js — draws the duel state into the DOM. One job: the picture.
// Cards are DOM (crisp text at thumbnail size), not canvas. The table and
// the cards are CSS 3D: perspective on the table, tilted cards, coin discs.

import { ELEMENTS, RARITIES, cardById } from './cards.js';
import { effAtk, effDef } from './duel.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function manaDots(mana, max) {
  let s = '';
  for (let i = 0; i < Math.max(max, mana); i += 1) s += i < mana ? '●' : '○';
  return s;
}

export function cardElement(entry, opts = {}) {
  const card = cardById(entry.id);
  const info = ELEMENTS[card.el];
  const rare = RARITIES[card.rarity];
  const node = el('div', `card el-${card.el} rar-${card.rarity}`);
  if (card.mythic) node.classList.add('el-wish');
  if (opts.selected) node.classList.add('selected');
  if (opts.canAttack) node.classList.add('can-attack');
  if (opts.targetable) node.classList.add('targetable');
  if (opts.hero) node.classList.add('hero-3d');
  if (opts.lost) node.classList.add('lost-coin');
  if (entry.hasAttacked) node.classList.add('exhausted');
  node.dataset.uid = entry.uid;
  node.appendChild(el('div', 'c-cost', `${card.stars}★`));
  node.appendChild(el('div', 'c-name', card.name));
  node.appendChild(el('div', 'c-elem', `${info.glyph} ${info.name.toUpperCase()}`));
  // Rarity badge: colour AND shape, never text alone.
  const badge = el('div', 'c-rarity');
  badge.style.setProperty('--rar', rare.colour);
  badge.appendChild(el('span', 'rar-glyph', rare.glyph));
  badge.appendChild(el('span', 'rar-label', rare.label));
  node.appendChild(badge);
  if (card.spell) {
    // Spell art is the effect first (a shield for Vault Shield); the
    // PROTOCOL label is small — it must never outshout the art.
    node.appendChild(el('div', 'c-art', card.art));
    const stats = el('div', 'c-stats');
    stats.appendChild(el('span', 'spell-tag', '✦ PROTOCOL'));
    node.appendChild(stats);
  } else {
    // The coin face: a metallic disc stamped with the coin's ticker.
    const art = el('div', 'c-art');
    const disc = el('div', 'coin-disc');
    disc.appendChild(el('span', 'coin-ticker', card.ticker));
    art.appendChild(disc);
    node.appendChild(art);
    const stats = el('div', 'c-stats');
    const atkSpan = el('span', 'atk');
    atkSpan.appendChild(el('i', null, 'ATK'));
    atkSpan.appendChild(document.createTextNode(String(effAtk(entry))));
    const defSpan = el('span', 'def');
    defSpan.appendChild(el('i', null, 'DEF'));
    defSpan.appendChild(document.createTextNode(String(effDef(entry))));
    stats.appendChild(atkSpan);
    stats.appendChild(defSpan);
    node.appendChild(stats);
  }
  node.appendChild(el('div', 'c-text', card.text));
  if (opts.key) node.appendChild(el('div', 'c-key', opts.key));
  return node;
}

function backElement() {
  const node = el('div', 'card-back', '◉');
  return node;
}

export function renderDuel(duel, ui) {
  const $ = (id) => document.getElementById(id);
  $('lp-you').textContent = duel.you.life;
  $('lp-rival').textContent = duel.rival.life;
  $('lpbar-you').style.width = `${(duel.you.life / 8000) * 100}%`;
  $('lpbar-rival').style.width = `${(duel.rival.life / 8000) * 100}%`;
  $('mana-you').textContent = `MANA ${manaDots(duel.you.mana, duel.you.maxMana)} (${duel.you.mana})`;
  $('mana-rival').textContent = `MANA ${manaDots(duel.rival.mana, duel.rival.maxMana)} (${duel.rival.mana})`;
  $('turn-line').textContent = duel.winner
    ? (duel.winner === 'you' ? '★ VICTORY ★' : '✖ DEFEAT ✖')
    : `TURN ${duel.turn} · ${duel.phase === 'you' ? 'YOUR TURN' : "RIVAL'S TURN"}`;
  $('phase-line').textContent = duel.winner
    ? 'The duel is decided.'
    : duel.phase === 'you'
      ? 'Summon, cast, attack — then END TURN.'
      : 'Vex the Collector is playing…';
  $('duel-score').textContent = `SCORE · YOU ${duel.score.you} — ${duel.score.rival} RIVAL`;
  $('deck-you').textContent = duel.you.deck.length;
  $('deck-rival').textContent = duel.rival.deck.length;
  $('grave-you').textContent = duel.you.grave.length;
  $('grave-rival').textContent = duel.rival.grave.length;
  const genesisInDeck = duel.you.deck.includes('genesis-coin') || duel.rival.deck.includes('genesis-coin');
  $('wish-left').textContent = duel.genesisDrawn ? 'drawn!' : (genesisInDeck ? '1 copy' : '1 copy');
  $('rival-hand-count').textContent = `${duel.rival.hand.length} cards`;
  $('you-hand-count').textContent = `${duel.you.hand.length} cards`;

  const intent = $('intent');
  if (duel.winner || !duel.intent) { intent.classList.add('hidden'); }
  else { intent.classList.remove('hidden'); intent.textContent = duel.intent; intent.classList.toggle('gold', duel.intent.includes('GENESIS')); }

  // Rival hand: face-down backs (the opponent's hand is visible as cards).
  const rh = $('rival-hand');
  rh.innerHTML = '';
  duel.rival.hand.forEach(() => rh.appendChild(backElement()));

  // Fields.
  renderField($('rival-field'), duel.rival.field, ui, 'rival');
  renderField($('you-field'), duel.you.field, ui, 'you');
  // Your hand.
  const yh = $('you-hand');
  yh.innerHTML = '';
  duel.you.hand.forEach((entry, i) => {
    const node = cardElement(entry, { selected: ui.selectedHand === i, key: String(i + 1) });
    if (ui.onHandCard) node.addEventListener('click', () => ui.onHandCard(i));
    yh.appendChild(node);
  });

  // Log.
  const log = $('log');
  log.innerHTML = '';
  for (const line of duel.log) log.appendChild(el('li', null, line));
}

function renderField(container, field, ui, side) {
  container.innerHTML = '';
  for (let i = 0; i < 3; i += 1) {
    const entry = field[i];
    if (!entry) {
      const slot = el('div', 'field-slot', ui.selectedHand !== null && ui.selectedIsMonster && side === 'you' ? 'SUMMON HERE' : '— empty —');
      if (ui.selectedHand !== null && ui.selectedIsMonster && side === 'you') {
        slot.classList.add('playable');
        if (ui.onFieldSlot) slot.addEventListener('click', () => ui.onFieldSlot(i));
      }
      container.appendChild(slot);
      continue;
    }
    const card = cardById(entry.id);
    const opts = {};
    if (side === 'you' && !entry.hasAttacked) opts.canAttack = true;
    if (ui.attackMode && side === 'rival') opts.targetable = true;
    if (card.mythic) opts.hero = true;
    const node = cardElement(entry, opts);
    if (ui.onFieldCard) node.addEventListener('click', () => ui.onFieldCard(side, i));
    container.appendChild(node);
  }
}

export function renderTitle() {
  const genesis = cardById('genesis-coin');
  const holder = document.getElementById('title-genesis');
  holder.innerHTML = '';
  holder.appendChild(cardElement({ uid: 'title-genesis', id: genesis.id, hasAttacked: false, buffAtk: 0, buffDef: 0 }, { hero: true }));
  const legend = document.getElementById('rarity-legend');
  if (legend) {
    legend.innerHTML = '';
    for (const key of ['common', 'rare', 'epic', 'legendary', 'mythic']) {
      const r = RARITIES[key];
      const chip = el('span', `rar-chip rar-${key}`);
      chip.style.setProperty('--rar', r.colour);
      chip.appendChild(el('span', 'rar-glyph', r.glyph));
      chip.appendChild(el('span', 'rar-label', r.label));
      legend.appendChild(chip);
    }
  }
}

// Full end screens: their own stage, not an overlay on the dimmed table.
export function renderEndScreen(kind, duel) {
  const screen = document.getElementById('end-screen');
  const inner = document.getElementById('end-inner');
  if (kind !== 'win' && kind !== 'loss') {
    screen.classList.add('hidden');
    inner.innerHTML = '';
    return;
  }
  const genesis = cardById('genesis-coin');
  const won = kind === 'win';
  screen.className = won ? 'end-win' : 'end-loss';
  inner.innerHTML = '';
  if (won) {
    // Gold coins rising behind the trophy (frozen poses in shot mode).
    const coins = el('div', 'rise-coins');
    for (let i = 0; i < 10; i += 1) coins.appendChild(el('div', `rise-coin rc${i}`, '◉'));
    inner.appendChild(coins);
  }
  inner.appendChild(el('div', 'end-kicker', won ? '★ THE ONE-OF-ONE COIN IS YOURS ★' : '✖ VEX KEEPS THE GENESIS COIN ✖'));
  inner.appendChild(el('h2', 'end-title', won ? '🏆 VICTORY' : '✖ DEFEAT'));
  inner.appendChild(el('div', 'end-sub', won
    ? 'You beat Vex the Collector — the Genesis Coin joins your vault!'
    : 'Vex the Collector keeps the Genesis Coin… this time.'));
  const coinWrap = el('div', 'end-coin');
  coinWrap.appendChild(cardElement(
    { uid: 'end-genesis', id: genesis.id, hasAttacked: false, buffAtk: 0, buffDef: 0 },
    { hero: true, lost: !won },
  ));
  inner.appendChild(coinWrap);
  const stats = el('div', 'end-stats');
  const stat = (label, value) => {
    const box = el('div', 'end-stat');
    box.appendChild(el('div', 'end-stat-num', value));
    box.appendChild(el('div', 'end-stat-label', label));
    return box;
  };
  stats.appendChild(stat('FINAL LIFE', `YOU ${duel.you.life} · RIVAL ${duel.rival.life}`));
  stats.appendChild(stat('TURNS', String(duel.turn)));
  stats.appendChild(stat('COINS FELLED', String(duel.score.you)));
  stats.appendChild(stat('RARITIES PULLED', `${countRarities(duel)} / 5`));
  inner.appendChild(stats);
  if (!won) inner.appendChild(el('div', 'end-tip', 'Tip: hold your Mint Surge for the Genesis Coin, and guard your Life.'));
  const btn = el('button', 'big-btn gold', won ? '⚔ DUEL AGAIN (Enter)' : '⚔ REMATCH (Enter)');
  btn.addEventListener('click', () => window.__restart && window.__restart());
  inner.appendChild(btn);
  screen.classList.remove('hidden');
}

function countRarities(duel) {
  const seen = new Set();
  for (const side of [duel.you, duel.rival]) {
    for (const entry of [...side.field, ...side.hand, ...side.grave.map((id) => ({ id }))]) {
      const card = cardById(entry.id);
      if (card) seen.add(card.rarity);
    }
  }
  return seen.size;
}
