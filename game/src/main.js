// main.js — boot. Screenshot mode (?shot=…) stages a deterministic scene
// and paints it twice, then sets window.__shotReady. Live mode opens the
// title screen and wires mouse + keyboard through input.js.

import { createDuel, checkWinner, logLine, startTurn } from './duel.js';
import { planIntent, takeRivalTurn } from './ai.js';
import { createInput } from './input.js';
import { renderDuel, renderEndScreen, renderTitle, SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 7;
const status = document.getElementById('status');

function announce(message) { status.textContent = message; }

let duel = createDuel(seed);
let screen = SCREEN_TITLE;
let ui = null;

function render() {
  renderDuel(duel, ui || { selectedHand: null, selectedIsMonster: false, attackMode: false, attackerIndex: null });
  if (screen === SCREEN_TITLE) {
    document.getElementById('title-screen').classList.remove('hidden');
    renderTitle();
  } else {
    document.getElementById('title-screen').classList.add('hidden');
  }
  if (duel.winner === 'you') renderEndScreen('win', duel);
  else if (duel.winner === 'rival') renderEndScreen('loss', duel);
  else renderEndScreen(null, duel);
}

function startNewDuel() {
  duel = createDuel(seed + Math.floor(Math.random() * 1000));
  screen = SCREEN_PLAY;
  ui = wireInput();
  duel.intent = '';
  render();
  announce('Duel started. Your turn.');
}

function wireInput() {
  return createInput(duel, (d, u) => { renderDuel(d, u); }, {
    onMessage: (text) => { document.getElementById('phase-line').textContent = text; },
    afterMove: () => {
      if (duel.winner) { render(); return; }
      render();
    },
    onEndTurn: () => {
      duel.turn += 1;
      duel.phase = 'rival';
      startTurn(duel, 'rival');
      duel.intent = planIntent(duel);
      render();
      announce(duel.intent);
      window.setTimeout(() => {
        takeRivalTurn(duel);
        if (!duel.winner) {
          startTurn(duel, 'you');
          duel.phase = 'you';
          duel.intent = '';
          logLine(duel, `Turn ${duel.turn}: your move.`);
        }
        render();
        announce(duel.winner ? 'Duel over.' : 'Your turn.');
      }, 900);
    },
    onStart: () => { if (screen === SCREEN_TITLE) startNewDuel(); },
    onStartOrRestart: () => {
      if (screen === SCREEN_TITLE || duel.winner) startNewDuel();
    },
    onRestart: () => startNewDuel(),
  });
}

window.__restart = () => startNewDuel();

if (shot) {
  // Screenshot mode: stage the scene, paint twice, signal readiness.
  document.body.classList.add('shot');
  duel = createDuel(seed);
  const staged = stageShot(shot, duel);
  screen = staged.screen;
  ui = { selectedHand: shot === 'duel' ? 0 : null, selectedIsMonster: false, attackMode: false, attackerIndex: null };
  let painted = 0;
  function paint() {
    render();
    if (screen === SCREEN_TITLE) {
      document.getElementById('title-screen').classList.remove('hidden');
      renderTitle();
    }
    if (staged.screen === SCREEN_WIN) renderEndScreen('win', duel);
    if (staged.screen === SCREEN_LOSS) renderEndScreen('loss', duel);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
} else {
  // Live mode.
  ui = wireInput();
  render();
}
