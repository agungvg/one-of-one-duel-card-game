// duel.js — the duel rules: turns, mana, summoning, spells, battle, winning.
// Both duelists start at 8000 Life. First to 0 Life loses.

import { cardById } from './cards.js';
import { buildDeck, drawCards, makeRandom } from './deck.js';

export const START_LIFE = 8000;
export const MAX_FIELD = 3;
export const MAX_HAND = 7;

export function createDuel(seed) {
  const random = makeRandom(seed);
  const duel = {
    seed, random, turn: 1, phase: 'you', winner: null,
    you: newDuelist('you', random), rival: newDuelist('rival', random),
    log: [], intent: '', score: { you: 0, rival: 0 }, genesisDrawn: false,
  };
  drawCards(duel.you.deck, duel.you.hand, 5);
  drawCards(duel.rival.deck, duel.rival.hand, 5);
  duel.you.mana = 3; duel.you.maxMana = 3;
  duel.rival.mana = 3; duel.rival.maxMana = 3;
  logLine(duel, 'The duel begins. Both duelists draw 5 cards.');
  logLine(duel, 'Somewhere in the decks hides THE GENESIS COIN — one copy only.');
  return duel;
}

function newDuelist(side, random) {
  return { side, life: START_LIFE, deck: buildDeck(random), hand: [], field: [], grave: [], mana: 0, maxMana: 0 };
}

export function logLine(duel, text) {
  duel.log.unshift(text);
  if (duel.log.length > 30) duel.log.length = 30;
}

export function effAtk(entry) {
  const card = cardById(entry.id);
  return card.atk + (entry.buffAtk || 0);
}

export function effDef(entry) {
  const card = cardById(entry.id);
  return card.def + (entry.buffDef || 0);
}

function checkGenesis(duel, entry) {
  const card = cardById(entry.id);
  if (card && card.mythic) duel.genesisDrawn = true;
}

export function startTurn(duel, side) {
  const d = duel[side];
  d.maxMana = Math.min(10, 2 + duel.turn);
  d.mana = d.maxMana;
  for (const entry of d.field) { entry.hasAttacked = false; entry.buffAtk = 0; entry.buffDef = 0; }
  const drawn = drawCards(d.deck, d.hand, 1);
  for (const id of drawn) checkGenesis(duel, { id });
  if (d.hand.length > MAX_HAND) {
    const discarded = d.hand.pop();
    d.grave.push(discarded.id);
    logLine(duel, `${side === 'you' ? 'You' : 'Rival'} discard a card (hand full).`);
  }
  return drawn;
}

export function playMonster(duel, side, handIndex) {
  const d = duel[side];
  const entry = d.hand[handIndex];
  if (!entry) return { ok: false, why: 'No card there.' };
  const card = cardById(entry.id);
  if (card.spell) return { ok: false, why: 'That is a spell — click it, then a target.' };
  if (d.field.length >= MAX_FIELD) return { ok: false, why: 'Your field is full (3 monsters).' };
  if (card.stars > d.mana) return { ok: false, why: `Needs ${card.stars} mana, you have ${d.mana}.` };
  d.mana -= card.stars;
  d.hand.splice(handIndex, 1);
  d.field.push(entry);
  checkGenesis(duel, entry);
  logLine(duel, `${side === 'you' ? 'You summon' : 'Rival summons'} ${card.name} (${card.atk}/${card.def}).`);
  return { ok: true };
}

export function castSpell(duel, side, handIndex, target) {
  const d = duel[side];
  const entry = d.hand[handIndex];
  if (!entry) return { ok: false, why: 'No card there.' };
  const card = cardById(entry.id);
  if (!card.spell) return { ok: false, why: 'That is a monster, not a spell.' };
  if (card.stars > d.mana) return { ok: false, why: `Needs ${card.stars} mana, you have ${d.mana}.` };
  const foe = duel[side === 'you' ? 'rival' : 'you'];
  if (card.spell === 'spark' || card.spell === 'wall') {
    if (!target || target.side !== side) return { ok: false, why: 'Pick one of your own monsters.' };
    const m = d.field[target.index];
    if (!m) return { ok: false, why: 'No monster there.' };
    if (card.spell === 'spark') { m.buffAtk += 600; logLine(duel, `${side === 'you' ? 'You cast' : 'Rival casts'} Mint Surge: ${cardById(m.id).name} +600 ATK.`); }
    else { m.buffDef += 800; logLine(duel, `${side === 'you' ? 'You cast' : 'Rival casts'} Vault Shield: ${cardById(m.id).name} +800 DEF.`); }
  } else if (card.spell === 'burst') {
    foe.life = Math.max(0, foe.life - 800);
    logLine(duel, `${side === 'you' ? 'You cast' : 'Rival casts'} Flash Dump: 800 damage to ${foe.side === 'you' ? 'you' : 'the rival'}!`);
  } else if (card.spell === 'gust') {
    if (!target || target.side !== foe.side) return { ok: false, why: 'Pick one rival monster.' };
    const m = foe.field[target.index];
    if (!m) return { ok: false, why: 'No monster there.' };
    foe.field.splice(target.index, 1);
    foe.hand.push(m);
    logLine(duel, `${side === 'you' ? 'You cast' : 'Rival casts'} Chain Rewind: ${cardById(m.id).name} blown back to hand.`);
  }
  d.mana -= card.stars;
  d.hand.splice(handIndex, 1);
  d.grave.push(entry.id);
  checkWinner(duel);
  return { ok: true };
}

// Battle: attacker ATK vs defender DEF. Genesis bonus: when it fells a foe,
// the foe's ATK strikes its master as well.
export function attack(duel, side, attackerIndex, defenderIndex) {
  const me = duel[side];
  const foe = duel[side === 'you' ? 'rival' : 'you'];
  const attacker = me.field[attackerIndex];
  if (!attacker) return { ok: false, why: 'No attacker there.' };
  if (attacker.hasAttacked) return { ok: false, why: 'That monster already attacked this turn.' };
  const atkCard = cardById(attacker.id);
  attacker.hasAttacked = true;
  if (defenderIndex === null || defenderIndex === undefined) {
    if (foe.field.length > 0) return { ok: false, why: 'The rival has monsters — attack one of them first.' };
    foe.life = Math.max(0, foe.life - effAtk(attacker));
    logLine(duel, `${atkCard.name} strikes directly for ${effAtk(attacker)}! ${foe.side === 'you' ? 'Your' : 'Rival'} Life: ${foe.life}.`);
  } else {
    const defender = foe.field[defenderIndex];
    if (!defender) return { ok: false, why: 'No defender there.' };
    const defCard = cardById(defender.id);
    const atk = effAtk(attacker);
    const def = effDef(defender);
    if (atk > def) {
      foe.field.splice(defenderIndex, 1);
      foe.grave.push(defender.id);
      foe.life = Math.max(0, foe.life - (atk - def));
      logLine(duel, `${atkCard.name} (${atk}) destroys ${defCard.name} (${def})! ${atk - def} damage to ${foe.side === 'you' ? 'you' : 'the rival'}.`);
      if (atkCard.mythic) {
        foe.life = Math.max(0, foe.life - defCard.atk);
        logLine(duel, `★ GENESIS effect! ${defCard.name}'s strength (${defCard.atk}) strikes its master!`);
      }
      duel.score[side] += 1;
    } else if (atk < def) {
      me.field.splice(attackerIndex, 1);
      me.grave.push(attacker.id);
      me.life = Math.max(0, me.life - (def - atk));
      logLine(duel, `${atkCard.name} (${atk}) shatters on ${defCard.name} (${def})! ${def - atk} damage to ${side === 'you' ? 'you' : 'the rival'}.`);
      duel.score[side === 'you' ? 'rival' : 'you'] += 1;
    } else {
      me.field.splice(attackerIndex, 1);
      me.grave.push(attacker.id);
      foe.field.splice(defenderIndex, 1);
      foe.grave.push(defender.id);
      logLine(duel, `${atkCard.name} and ${defCard.name} destroy each other!`);
    }
  }
  checkWinner(duel);
  return { ok: true };
}

export function checkWinner(duel) {
  if (duel.winner) return duel.winner;
  if (duel.rival.life <= 0) {
    duel.winner = 'you';
    logLine(duel, 'VICTORY! The Genesis Coin is yours!');
  } else if (duel.you.life <= 0) {
    duel.winner = 'rival';
    logLine(duel, 'DEFEAT. Vex keeps the Genesis Coin… this time.');
  }
  return duel.winner;
}

export function endTurn(duel) {
  if (duel.winner) return;
  duel.phase = 'rival';
  duel.turn += 1;
}
