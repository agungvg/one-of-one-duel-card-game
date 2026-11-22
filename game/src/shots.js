// shots.js — deterministic staged screenshots (?shot=title|duel|win|loss).
// Each scene plays the REAL rules forward from a fresh duel with a fixed
// seed, steered by a simple autopilot, so the frame is what a real game
// looks like and the same seed always gives the same frame.

import { cardById } from './cards.js';
import { takeRivalTurn, planIntent } from './ai.js';
import { attack, castSpell, checkWinner, effAtk, playMonster, startTurn } from './duel.js';
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

// The player's autopilot: summon the strongest affordable monster, buff it,
// then attack the weakest rival monster (or directly when the field is empty).
function autoPlayer(duel) {
  let guard = 0;
  while (duel.you.field.length < 3 && guard < 6) {
    guard += 1;
    const affordable = duel.you.hand
      .map((entry, i) => ({ entry, i, card: cardById(entry.id) }))
      .filter((x) => !x.card.spell && x.card.stars <= duel.you.mana)
      .sort((a, b) => b.card.atk - a.card.atk);
    if (affordable.length === 0) break;
    playMonster(duel, 'you', affordable[0].i);
  }
  const spark = duel.you.hand.findIndex((e) => cardById(e.id).spell === 'spark');
  if (spark >= 0 && duel.you.field.length > 0) {
    const strongest = duel.you.field.map((e, i) => ({ e, i })).sort((a, b) => effAtk(b.e) - effAtk(a.e))[0];
    castSpell(duel, 'you', spark, { side: 'you', index: strongest.i });
  }
  // Staged play only: attack rival monsters, never directly, so the staged
  // duel stays a rich mid-game board instead of ending in three turns.
  for (let i = duel.you.field.length - 1; i >= 0; i -= 1) {
    if (duel.winner) break;
    const entry = duel.you.field[i];
    if (!entry || entry.hasAttacked) continue;
    if (duel.rival.field.length > 0) {
      const weakest = duel.rival.field.map((e, j) => ({ e, j }))
        .sort((a, b) => effAtk(a.e) - effAtk(b.e))[0];
      attack(duel, 'you', i, weakest.j);
    }
  }
}

// Play N full rounds (you + rival) from the fresh duel.
function playRounds(duel, rounds) {
  for (let r = 0; r < rounds && !duel.winner; r += 1) {
    autoPlayer(duel);
    if (duel.winner) break;
    duel.turn += 1;
    duel.phase = 'rival';
    startTurn(duel, 'rival');
    duel.intent = planIntent(duel);
    takeRivalTurn(duel);
    if (duel.winner) break;
    startTurn(duel, 'you');
    duel.phase = 'you';
  }
}

// The cover moment: the Genesis Coin on the table. If the autopilot has not
// drawn it yet, bring it from the deck — the one copy, staged for the shot.
function bringGenesis(duel) {
  const genesis = cardById('genesis-coin');
  let entry = duel.you.hand.find((e) => e.id === genesis.id);
  if (!entry) {
    const deckIndex = duel.you.deck.indexOf(genesis.id);
    if (deckIndex >= 0) {
      duel.you.deck.splice(deckIndex, 1);
      entry = { uid: 'genesis-shot', id: genesis.id, hasAttacked: false, buffAtk: 0, buffDef: 0 };
      duel.you.hand.push(entry);
    }
  }
  if (!entry) return;
  if (duel.you.field.length >= 3) {
    const moved = duel.you.field.shift();
    duel.you.grave.push(moved.id);
  }
  duel.you.mana = Math.max(duel.you.mana, 8);
  const handIndex = duel.you.hand.indexOf(entry);
  playMonster(duel, 'you', handIndex);
  duel.log.unshift('★ THE GENESIS COIN enters the table — the one copy in the realm!');
}

export function stageShot(name, duel) {
  if (name === 'title') {
    return { screen: SCREEN_TITLE };
  }
  playRounds(duel, 4);
  if (name === 'duel') {
    bringGenesis(duel);
    // Rival's next move, readable on the banner for the cover.
    duel.intent = planIntent(duel);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'win') {
    bringGenesis(duel);
    duel.rival.life = 0;
    checkWinner(duel);
    duel.intent = '';
    return { screen: SCREEN_WIN };
  }
  // loss
  duel.you.life = 0;
  checkWinner(duel);
  duel.intent = '';
  return { screen: SCREEN_LOSS };
}
