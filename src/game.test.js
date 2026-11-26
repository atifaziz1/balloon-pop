import { describe, expect, it } from 'vitest';
import { ALPHABET, chooseLetter, gameReducer } from './game.js';

describe('random alphabet balloons', () => {
  it('can choose any letter for the first balloon', () => {
    const letters = [...ALPHABET].map((_, i) => chooseLetter(null, (i + 0.5) / 26));
    expect(letters.join('')).toBe(ALPHABET);
  });

  it('can choose every other letter without immediately repeating the previous one', () => {
    for (const previous of ALPHABET) {
      const letters = Array.from({ length: 25 }, (_, i) => chooseLetter(previous, (i + 0.5) / 25));
      expect(letters.join('')).toBe(ALPHABET.replace(previous, ''));
    }
  });

  it('keeps reducer replay deterministic for React StrictMode', () => {
    const state = { balloon: 0, letter: 'T', popped: 0, seconds: 1, paused: false, celebrating: false };
    for (const action of [{ type: 'NEXT', random: 0.4 }, { type: 'TICK', seconds: 0, random: 0.8 }]) {
      expect(gameReducer(state, action)).toEqual(gameReducer(state, action));
      expect(gameReducer(state, action).letter).not.toBe('T');
    }
    expect(gameReducer(state, { type: 'POP', key: 'a' })).toBe(state);
    expect(gameReducer(state, { type: 'POP', key: 't' }).celebrating).toBe(true);
  });
});
