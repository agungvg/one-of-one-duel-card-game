// deck.js — builds, shuffles and draws decks. One job: the deck.
// Seeded shuffle (mulberry32) so staged screenshots are deterministic.

import { ROSTER, SPELLS } from './cards.js';

export function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDeck(random) {
  const deck = [];
  for (const card of [...ROSTER, ...SPELLS]) {
    for (let i = 0; i < card.copies; i += 1) deck.push(card.id);
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(deck, hand, count) {
  const drawn = [];
  for (let i = 0; i < count && deck.length > 0; i += 1) {
    const id = deck.pop();
    hand.push({ uid: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${drawn.length}`, id, hasAttacked: false, buffAtk: 0, buffDef: 0 });
    drawn.push(id);
  }
  return drawn;
}
