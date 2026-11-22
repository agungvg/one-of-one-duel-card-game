// cards.js — the original card roster. Every name, effect and piece of art
// is invented for this game; nothing is copied from any commercial card game.
// Elements are told apart by colour AND shape, never by text alone:
// Flame ▲ red, Tide ● blue, Gale ◆ green, Stone ■ amber, Wish ★ gold.

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '▲', colour: '#dc2626' },
  tide: { name: 'Tide', glyph: '●', colour: '#2563eb' },
  gale: { name: 'Gale', glyph: '◆', colour: '#059669' },
  stone: { name: 'Stone', glyph: '■', colour: '#b45309' },
  wish: { name: 'Wish', glyph: '★', colour: '#d97706' },
  spell: { name: 'Spell', glyph: '✦', colour: '#7c3aed' },
};

// id, name, element, stars (cost), ATK, DEF, art glyph, text, copies in deck
export const ROSTER = [
  { id: 'ember-squire', name: 'Ember Squire', el: 'flame', stars: 1, atk: 800, def: 600, art: '⚔', text: 'A young knight sworn to the last ember.', copies: 2 },
  { id: 'flame-imp', name: 'Flame Imp', el: 'flame', stars: 2, atk: 1100, def: 400, art: '🔥', text: 'Small, quick, and always on fire.', copies: 2 },
  { id: 'cinder-wolf', name: 'Cinder Wolf', el: 'flame', stars: 3, atk: 1500, def: 900, art: '🐺', text: 'Its howl leaves embers in the air.', copies: 2 },
  { id: 'pyre-knight', name: 'Pyre Knight', el: 'flame', stars: 4, atk: 1900, def: 1200, art: '🛡', text: 'Armour forged in a burning keep.', copies: 2 },
  { id: 'ash-phoenix', name: 'Ash Phoenix', el: 'flame', stars: 6, atk: 2500, def: 1800, art: '🦅', text: 'Burns out, rises again, burns brighter.', copies: 1 },
  { id: 'mist-otter', name: 'Mist Otter', el: 'tide', stars: 1, atk: 700, def: 800, art: '🦦', text: 'Slips through every net.', copies: 2 },
  { id: 'tidecaller', name: 'Tidecaller', el: 'tide', stars: 2, atk: 900, def: 1100, art: '🌊', text: 'The sea answers when she sings.', copies: 2 },
  { id: 'coral-serpent', name: 'Coral Serpent', el: 'tide', stars: 3, atk: 1400, def: 1400, art: '🐍', text: 'Teeth of coral, patience of the tide.', copies: 2 },
  { id: 'deep-leviathan', name: 'Deep Leviathan', el: 'tide', stars: 6, atk: 2400, def: 2000, art: '🐋', text: 'Older than the shoreline itself.', copies: 1 },
  { id: 'breeze-fox', name: 'Breeze Fox', el: 'gale', stars: 1, atk: 600, def: 900, art: '🦊', text: 'Gone before you blink.', copies: 2 },
  { id: 'gale-hawk', name: 'Gale Hawk', el: 'gale', stars: 2, atk: 1200, def: 700, art: '🦅', text: 'Rides the storm, never fights it.', copies: 2 },
  { id: 'storm-dancer', name: 'Storm Dancer', el: 'gale', stars: 4, atk: 1800, def: 1300, art: '🌪', text: 'Every step is a gust with a blade.', copies: 2 },
  { id: 'sky-wyvern', name: 'Sky Wyvern', el: 'gale', stars: 5, atk: 2200, def: 1500, art: '🐉', text: 'The sky itself, given wings.', copies: 1 },
  { id: 'pebble-sprite', name: 'Pebble Sprite', el: 'stone', stars: 1, atk: 500, def: 1000, art: '🪨', text: 'Small stone, stubborn heart.', copies: 2 },
  { id: 'stone-golem', name: 'Stone Golem', el: 'stone', stars: 3, atk: 1200, def: 2000, art: '🗿', text: 'A mountain that learned to walk.', copies: 2 },
  { id: 'granite-guardian', name: 'Granite Guardian', el: 'stone', stars: 4, atk: 1600, def: 2200, art: '⛰', text: 'No army has ever moved it.', copies: 2 },
  { id: 'mountain-titan', name: 'Mountain Titan', el: 'stone', stars: 6, atk: 2300, def: 2400, art: '🏔', text: 'When it wakes, valleys change shape.', copies: 1 },
  // The mythic one-of-one: exactly ONE copy in the whole game.
  { id: 'last-wishblade', name: 'THE LAST WISHBLADE', el: 'wish', stars: 8, atk: 3000, def: 1500, art: '🗡', text: 'ONE-OF-ONE. Felled foes strike their master.', copies: 1, mythic: true },
];

export const SPELLS = [
  { id: 'wish-spark', name: 'Wish Spark', el: 'spell', stars: 1, atk: 0, def: 0, art: '✨', text: 'SPELL: one of your monsters gets +600 ATK.', copies: 2, spell: 'spark' },
  { id: 'flame-burst', name: 'Flame Burst', el: 'spell', stars: 2, atk: 0, def: 0, art: '💥', text: 'SPELL: deal 800 damage straight to the rival.', copies: 2, spell: 'burst' },
  { id: 'stone-wall', name: 'Stone Wall', el: 'spell', stars: 2, atk: 0, def: 0, art: '🧱', text: 'SPELL: one of your monsters gets +800 DEF.', copies: 2, spell: 'wall' },
  { id: 'gale-gust', name: 'Gale Gust', el: 'spell', stars: 2, atk: 0, def: 0, art: '💨', text: 'SPELL: send one rival monster back to its hand.', copies: 2, spell: 'gust' },
];

export function cardById(id) {
  return ROSTER.find((c) => c.id === id) || SPELLS.find((c) => c.id === id) || null;
}

export function allCards() {
  return [...ROSTER, ...SPELLS];
}
