// input.js — mouse + keyboard. One job: turn clicks and keys into duel moves.
// Click a hand card to select it; click a field slot to summon; click a rival
// monster (with A, or after selecting one of your field monsters) to attack.
// Keys: 1-5 select hand card, A attack mode, Space end turn, Enter start, R restart.

import { cardById } from './cards.js';
import { attack, castSpell, playMonster } from './duel.js';

export function createInput(duel, render, callbacks) {
  const ui = {
    selectedHand: null,
    selectedIsMonster: false,
    attackMode: false,
    attackerIndex: null,
  };

  function refresh() { render(duel, ui); }

  function clearSelection() {
    ui.selectedHand = null; ui.selectedIsMonster = false; ui.attackMode = false; ui.attackerIndex = null;
  }

  function tryEndTurn() {
    if (duel.winner || duel.phase !== 'you') return;
    clearSelection();
    callbacks.onEndTurn();
  }

  ui.onHandCard = (i) => {
    if (duel.winner || duel.phase !== 'you') return;
    const entry = duel.you.hand[i];
    if (!entry) return;
    const card = cardById(entry.id);
    if (ui.selectedHand === i) { clearSelection(); refresh(); return; }
    ui.selectedHand = i;
    ui.selectedIsMonster = !card.spell;
    ui.attackMode = false; ui.attackerIndex = null;
    if (card.spell && (card.spell === 'burst')) {
      const res = castSpell(duel, 'you', i, null);
      if (!res.ok) callbacks.onMessage(res.why);
      clearSelection();
    }
    refresh();
  };

  ui.onFieldSlot = (slotIndex) => {
    if (duel.winner || duel.phase !== 'you' || ui.selectedHand === null) return;
    const res = playMonster(duel, 'you', ui.selectedHand);
    if (!res.ok) callbacks.onMessage(res.why);
    clearSelection();
    refresh();
    callbacks.afterMove();
  };

  ui.onFieldCard = (side, index) => {
    if (duel.winner || duel.phase !== 'you') return;
    if (side === 'you') {
      // Select one of your monsters as the attacker.
      const entry = duel.you.field[index];
      if (!entry || entry.hasAttacked) return;
      ui.attackerIndex = index;
      ui.attackMode = true;
      ui.selectedHand = null; ui.selectedIsMonster = false;
      refresh();
      return;
    }
    // Rival monster clicked: a spell target, or an attack target.
    if (ui.selectedHand !== null) {
      const entry = duel.you.hand[ui.selectedHand];
      const card = entry && cardById(entry.id);
      if (card && card.spell === 'gust') {
        const res = castSpell(duel, 'you', ui.selectedHand, { side: 'rival', index });
        if (!res.ok) callbacks.onMessage(res.why);
        clearSelection(); refresh(); callbacks.afterMove();
        return;
      }
    }
    if (ui.attackMode && ui.attackerIndex !== null) {
      const res = attack(duel, 'you', ui.attackerIndex, index);
      if (!res.ok) callbacks.onMessage(res.why);
      clearSelection(); refresh(); callbacks.afterMove();
      return;
    }
    // Clicking a rival monster with a buff spell selected does nothing; buffs target your own field.
    if (ui.selectedHand !== null) {
      const entry = duel.you.hand[ui.selectedHand];
      const card = entry && cardById(entry.id);
      if (card && (card.spell === 'spark' || card.spell === 'wall')) {
        callbacks.onMessage('That spell targets one of YOUR monsters — click one of your field cards.');
      }
    }
  };

  // Buff spells target your own field monsters: handled by clicking your field
  // card while a spell is selected.
  const origOnFieldCard = ui.onFieldCard;
  ui.onFieldCard = (side, index) => {
    if (side === 'you' && ui.selectedHand !== null) {
      const entry = duel.you.hand[ui.selectedHand];
      const card = entry && cardById(entry.id);
      if (card && (card.spell === 'spark' || card.spell === 'wall')) {
        const res = castSpell(duel, 'you', ui.selectedHand, { side: 'you', index });
        if (!res.ok) callbacks.onMessage(res.why);
        clearSelection(); refresh(); callbacks.afterMove();
        return;
      }
    }
    origOnFieldCard(side, index);
  };

  document.getElementById('btn-end').addEventListener('click', tryEndTurn);
  document.getElementById('btn-restart').addEventListener('click', () => callbacks.onRestart());
  document.getElementById('btn-start').addEventListener('click', () => callbacks.onStart());

  // Mouse-follow 3D tilt: the hovered card leans toward the cursor.
  const tableWrap = document.getElementById('table-wrap');
  if (tableWrap) {
    tableWrap.addEventListener('mousemove', (event) => {
      const hovered = event.target.closest('.card');
      document.querySelectorAll('.card.tilt').forEach((c) => { if (c !== hovered) c.classList.remove('tilt'); });
      if (!hovered) return;
      const r = hovered.getBoundingClientRect();
      hovered.style.setProperty('--mx', (((event.clientX - r.left) / r.width - 0.5) * 2).toFixed(2));
      hovered.style.setProperty('--my', (((event.clientY - r.top) / r.height - 0.5) * 2).toFixed(2));
      hovered.classList.add('tilt');
    });
    tableWrap.addEventListener('mouseleave', () => {
      document.querySelectorAll('.card.tilt').forEach((c) => c.classList.remove('tilt'));
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '5') {
      ui.onHandCard(Number(event.key) - 1);
    } else if (event.key === 'a' || event.key === 'A') {
      const ready = duel.you.field.findIndex((e) => e && !e.hasAttacked);
      if (ready >= 0) { ui.attackerIndex = ready; ui.attackMode = true; refresh(); }
    } else if (event.key === ' ') {
      event.preventDefault();
      tryEndTurn();
    } else if (event.key === 'Enter') {
      callbacks.onStartOrRestart();
    } else if (event.key === 'r' || event.key === 'R') {
      callbacks.onRestart();
    }
  });

  return ui;
}
