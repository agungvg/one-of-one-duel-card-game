// render.js — draws the duel state into the DOM. One job: the picture.
// Cards are DOM (crisp text at thumbnail size), not canvas.

import { ELEMENTS, cardById } from './cards.js';
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
  const node = el('div', `card el-${card.el}`);
  if (card.mythic) node.classList.add('el-wish');
  if (opts.selected) node.classList.add('selected');
  if (opts.canAttack) node.classList.add('can-attack');
  if (opts.targetable) node.classList.add('targetable');
  if (entry.hasAttacked) node.classList.add('exhausted');
  node.dataset.uid = entry.uid;
  node.appendChild(el('div', 'c-cost', `${card.stars}★`));
  node.appendChild(el('div', 'c-name', card.name));
  node.appendChild(el('div', 'c-elem', `${info.glyph} ${info.name.toUpperCase()}`));
  const art = el('div', 'c-art', card.art);
  node.appendChild(art);
  if (card.spell) {
    node.appendChild(el('div', 'c-stats', ''));
    node.querySelector('.c-stats').appendChild(el('span', 'atk', 'SPELL'));
  } else {
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
  const node = el('div', 'card-back', '★');
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
  const wishInDeck = duel.you.deck.includes('last-wishblade') || duel.rival.deck.includes('last-wishblade');
  $('wish-left').textContent = duel.wishbladeDrawn ? 'drawn!' : (wishInDeck ? '1 copy' : '1 copy');
  $('rival-hand-count').textContent = `${duel.rival.hand.length} cards`;
  $('you-hand-count').textContent = `${duel.you.hand.length} cards`;

  const intent = $('intent');
  if (duel.winner || !duel.intent) { intent.classList.add('hidden'); }
  else { intent.classList.remove('hidden'); intent.textContent = duel.intent; intent.classList.toggle('gold', duel.intent.includes('WISHBLADE')); }

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
    const opts = {};
    if (side === 'you' && !entry.hasAttacked) opts.canAttack = true;
    if (ui.attackMode && side === 'rival') opts.targetable = true;
    const node = cardElement(entry, opts);
    if (ui.onFieldCard) node.addEventListener('click', () => ui.onFieldCard(side, i));
    container.appendChild(node);
  }
}

export function renderTitle() {
  const wish = cardById('last-wishblade');
  const holder = document.getElementById('title-wishblade');
  holder.innerHTML = '';
  holder.appendChild(cardElement({ uid: 'title-wish', id: wish.id, hasAttacked: false, buffAtk: 0, buffDef: 0 }, {}));
}

export function renderOverlay(kind, duel) {
  const overlay = document.getElementById('overlay');
  const card = document.getElementById('overlay-card');
  if (kind === 'win') {
    card.className = 'win';
    card.innerHTML = '';
    card.appendChild(el('h2', null, '★ VICTORY ★'));
    card.appendChild(el('div', 'ov-sub', 'The Last Wishblade is yours!'));
    card.appendChild(el('div', 'ov-wish', '🗡 THE LAST WISHBLADE — 3000 ATK · ONE-OF-ONE · joins your collection'));
    card.appendChild(el('div', 'ov-score', `Final Life — YOU ${duel.you.life} · RIVAL ${duel.rival.life} · Turns: ${duel.turn} · Monsters felled: ${duel.score.you}`));
    const btn = el('button', 'big-btn gold', '⚔ DUEL AGAIN (Enter)');
    btn.addEventListener('click', () => window.__restart && window.__restart());
    card.appendChild(btn);
    overlay.classList.remove('hidden');
  } else if (kind === 'loss') {
    card.className = 'loss';
    card.innerHTML = '';
    card.appendChild(el('h2', null, '✖ DEFEAT ✖'));
    card.appendChild(el('div', 'ov-sub', 'Vex the Collector keeps the Wishblade… this time.'));
    card.appendChild(el('div', 'ov-score', `Final Life — YOU ${duel.you.life} · RIVAL ${duel.rival.life} · Turns: ${duel.turn} · Monsters felled: ${duel.score.you}`));
    card.appendChild(el('div', 'ov-wish', 'Tip: hold your Wish Spark for the Wishblade, and guard your Life.'));
    const btn = el('button', 'big-btn gold', '⚔ REMATCH (Enter)');
    btn.addEventListener('click', () => window.__restart && window.__restart());
    card.appendChild(btn);
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}
