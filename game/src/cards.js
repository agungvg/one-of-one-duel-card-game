// cards.js — the original crypto-coin roster. Every coin, name, ticker and
// effect is invented for this game; no real coin, ticker or logo is used.
// Coin families are told apart by colour AND shape, never by text alone:
// Forge ▲ red, Tide ● blue, Gale ◆ green, Stone ■ amber, Genesis ★ gold.
// Rarity traits are told by border colour, badge colour AND badge shape:
// Common ● grey, Rare ◆ blue, Epic ⬢ purple, Legendary ★ orange,
// Mythic ✦ prismatic gold (the one-of-one Genesis Coin only).

export const ELEMENTS = {
  forge: { name: 'Forge', glyph: '▲', colour: '#dc2626' },
  tide: { name: 'Tide', glyph: '●', colour: '#2563eb' },
  gale: { name: 'Gale', glyph: '◆', colour: '#059669' },
  stone: { name: 'Stone', glyph: '■', colour: '#b45309' },
  genesis: { name: 'Genesis', glyph: '★', colour: '#d97706' },
  spell: { name: 'Protocol', glyph: '✦', colour: '#7c3aed' },
};

export const RARITIES = {
  common: { label: 'COMMON', glyph: '●', colour: '#9ca3af' },
  rare: { label: 'RARE', glyph: '◆', colour: '#3b82f6' },
  epic: { label: 'EPIC', glyph: '⬢', colour: '#a855f7' },
  legendary: { label: 'LEGENDARY', glyph: '★', colour: '#f97316' },
  mythic: { label: 'MYTHIC', glyph: '✦', colour: '#eab308' },
};

// id, name, ticker, family (el), stars (cost), ATK, DEF, rarity, text, copies
export const ROSTER = [
  { id: 'kindle-coin', name: 'Kindle Coin', ticker: 'KIND', el: 'forge', stars: 1, atk: 800, def: 600, rarity: 'common', text: 'A small spark that refuses to go out.', copies: 2 },
  { id: 'flare-token', name: 'Flare Token', ticker: 'FLAR', el: 'forge', stars: 2, atk: 1100, def: 400, rarity: 'common', text: 'Small, quick, and always on fire.', copies: 2 },
  { id: 'cinder-coin', name: 'Cinder Coin', ticker: 'CNDR', el: 'forge', stars: 3, atk: 1500, def: 900, rarity: 'rare', text: 'Its burn leaves embers in the air.', copies: 2 },
  { id: 'pyre-chain', name: 'Pyre Chain', ticker: 'PYRE', el: 'forge', stars: 4, atk: 1900, def: 1200, rarity: 'epic', text: 'Forged in a burning keep, block by block.', copies: 2 },
  { id: 'phoenix-mint', name: 'Phoenix Mint', ticker: 'PHNX', el: 'forge', stars: 6, atk: 2500, def: 1800, rarity: 'legendary', text: 'Burns out, rises again, burns brighter.', copies: 1 },
  { id: 'mist-coin', name: 'Mist Coin', ticker: 'MIST', el: 'tide', stars: 1, atk: 700, def: 800, rarity: 'common', text: 'Slips through every net.', copies: 2 },
  { id: 'tidepool', name: 'Tidepool', ticker: 'TIDE', el: 'tide', stars: 2, atk: 900, def: 1100, rarity: 'common', text: 'The sea answers when it sings.', copies: 2 },
  { id: 'coral-cash', name: 'Coral Cash', ticker: 'CORL', el: 'tide', stars: 3, atk: 1400, def: 1400, rarity: 'rare', text: 'Teeth of coral, patience of the tide.', copies: 2 },
  { id: 'leviathan', name: 'Leviathan', ticker: 'LVTH', el: 'tide', stars: 6, atk: 2400, def: 2000, rarity: 'legendary', text: 'Older than the shoreline itself.', copies: 1 },
  { id: 'zephyr-coin', name: 'Zephyr Coin', ticker: 'ZPHR', el: 'gale', stars: 1, atk: 600, def: 900, rarity: 'common', text: 'Gone before you blink.', copies: 2 },
  { id: 'gale-token', name: 'Gale Token', ticker: 'GALE', el: 'gale', stars: 2, atk: 1200, def: 700, rarity: 'common', text: 'Rides the storm, never fights it.', copies: 2 },
  { id: 'storm-vault', name: 'Storm Vault', ticker: 'STRM', el: 'gale', stars: 4, atk: 1800, def: 1300, rarity: 'epic', text: 'Every gust is a blade with a balance.', copies: 2 },
  { id: 'skyline-coin', name: 'Skyline Coin', ticker: 'SKYL', el: 'gale', stars: 5, atk: 2200, def: 1500, rarity: 'legendary', text: 'The sky itself, given wings.', copies: 1 },
  { id: 'pebble', name: 'Pebble', ticker: 'PBBL', el: 'stone', stars: 1, atk: 500, def: 1000, rarity: 'common', text: 'Small stone, stubborn heart.', copies: 2 },
  { id: 'bedrock', name: 'Bedrock', ticker: 'BDRK', el: 'stone', stars: 3, atk: 1200, def: 2000, rarity: 'rare', text: 'A mountain that learned to walk.', copies: 2 },
  { id: 'granite', name: 'Granite', ticker: 'GRNT', el: 'stone', stars: 4, atk: 1600, def: 2200, rarity: 'rare', text: 'No market has ever moved it.', copies: 2 },
  { id: 'titan-ore', name: 'Titan Ore', ticker: 'TTAN', el: 'stone', stars: 6, atk: 2300, def: 2400, rarity: 'legendary', text: 'When it wakes, valleys change shape.', copies: 1 },
  // The mythic one-of-one: exactly ONE copy in the whole game.
  { id: 'genesis-coin', name: 'GENESIS COIN', ticker: 'GNSIS', el: 'genesis', stars: 8, atk: 3000, def: 1500, rarity: 'mythic', text: 'ONE-OF-ONE. Felled foes strike their master.', copies: 1, mythic: true },
];

export const SPELLS = [
  { id: 'mint-surge', name: 'Mint Surge', ticker: 'MNT', el: 'spell', stars: 1, atk: 0, def: 0, art: '✦', rarity: 'rare', text: 'PROTOCOL: one of your coins gets +600 ATK.', copies: 2, spell: 'spark' },
  { id: 'flash-dump', name: 'Flash Dump', ticker: 'FLSH', el: 'spell', stars: 2, atk: 0, def: 0, art: '💥', rarity: 'rare', text: 'PROTOCOL: deal 800 damage straight to the rival.', copies: 2, spell: 'burst' },
  { id: 'vault-shield', name: 'Vault Shield', ticker: 'VLT', el: 'spell', stars: 2, atk: 0, def: 0, art: '🧱', rarity: 'rare', text: 'PROTOCOL: one of your coins gets +800 DEF.', copies: 2, spell: 'wall' },
  { id: 'chain-rewind', name: 'Chain Rewind', ticker: 'RWND', el: 'spell', stars: 2, atk: 0, def: 0, art: '💨', rarity: 'rare', text: 'PROTOCOL: send one rival coin back to its hand.', copies: 2, spell: 'gust' },
];

export function cardById(id) {
  return ROSTER.find((c) => c.id === id) || SPELLS.find((c) => c.id === id) || null;
}

export function allCards() {
  return [...ROSTER, ...SPELLS];
}
