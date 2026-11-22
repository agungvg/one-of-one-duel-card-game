// ai.js — Vex the Collector, the rival. One job: plan and play the rival's turn.
// The plan is VISIBLE before it happens (the intent banner), so the player
// can read the rival's choices and counter them.

import { cardById } from './cards.js';
import { attack, castSpell, checkWinner, effAtk, playMonster } from './duel.js';

// Describe what the rival will do next, from the board as it stands now.
export function planIntent(duel) {
  const rival = duel.rival;
  const affordable = rival.hand
    .map((entry, i) => ({ entry, i, card: cardById(entry.id) }))
    .filter((x) => !x.card.spell && x.card.stars <= rival.mana);
  const you = duel.you;
  if (affordable.length === 0 && rival.field.length === 0) {
    return 'RIVAL PLANS: hold — no monster to summon, saving mana.';
  }
  const best = affordable.sort((a, b) => b.card.atk - a.card.atk)[0];
  const target = you.field.length > 0
    ? you.field.map((e, i) => ({ e, i })).sort((a, b) => effAtk(a.e) - effAtk(b.e))[0]
    : null;
  if (best && target) {
    return `RIVAL PLANS: summon ${best.card.name} (${best.card.atk} ATK), then attack your ${cardById(target.e.id).name}.`;
  }
  if (best) {
    return `RIVAL PLANS: summon ${best.card.name} (${best.card.atk} ATK), then strike you directly!`;
  }
  if (target) {
    const atk = rival.field.map((e) => effAtk(e)).sort((a, b) => b - a)[0];
    return `RIVAL PLANS: attack your ${cardById(target.e.id).name} with ${atk} ATK.`;
  }
  return 'RIVAL PLANS: strike you directly!';
}

// Play the rival's whole turn, synchronously, in a sensible order:
// summon the strongest affordable monster, buff it, then attack.
// The caller starts the rival's turn first (draw + mana), so the intent
// banner can be planned from the refilled mana and shown before this runs.
export function takeRivalTurn(duel) {
  const rival = duel.rival;
  // Summon strongest affordable monster (up to field limit).
  let guard = 0;
  while (rival.field.length < 3 && guard < 6) {
    guard += 1;
    const affordable = rival.hand
      .map((entry, i) => ({ entry, i, card: cardById(entry.id) }))
      .filter((x) => !x.card.spell && x.card.stars <= rival.mana)
      .sort((a, b) => b.card.atk - a.card.atk);
    if (affordable.length === 0) break;
    playMonster(duel, 'rival', affordable[0].i);
  }
  // Buff the strongest field monster with Wish Spark if held.
  const spark = rival.hand.findIndex((e) => cardById(e.id).spell === 'spark');
  if (spark >= 0 && rival.field.length > 0) {
    const strongest = rival.field.map((e, i) => ({ e, i })).sort((a, b) => effAtk(b.e) - effAtk(a.e))[0];
    castSpell(duel, 'rival', spark, { side: 'rival', index: strongest.i });
  }
  // Flame Burst when the player is low.
  const burst = rival.hand.findIndex((e) => cardById(e.id).spell === 'burst');
  if (burst >= 0 && duel.you.life <= 1600) castSpell(duel, 'rival', burst, null);
  // Attack with every fresh monster: weakest player monster first, else direct.
  for (let i = rival.field.length - 1; i >= 0; i -= 1) {
    if (duel.winner) break;
    const entry = rival.field[i];
    if (!entry || entry.hasAttacked) continue;
    if (duel.you.field.length > 0) {
      const weakest = duel.you.field.map((e, j) => ({ e, j }))
        .sort((a, b) => effAtk(a.e) - effAtk(b.e))[0];
      attack(duel, 'rival', i, weakest.j);
    } else {
      attack(duel, 'rival', i, null);
    }
  }
  checkWinner(duel);
  duel.phase = 'you';
}
