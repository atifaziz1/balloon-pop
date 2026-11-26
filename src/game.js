export const BALLOON_SECONDS = 60;
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function chooseLetter(previousLetter, randomValue) {
  const choices = ALPHABET.replace(previousLetter ?? '', '');
  return choices[Math.floor(randomValue * choices.length)];
}
export const COLORS = [
  { name: 'Pink', fill: '#fa8095', shade: '#d95375', glow: '#ffafbc' },
  { name: 'Blue', fill: '#76baff', shade: '#468ddd', glow: '#b6dcff' },
  { name: 'Purple', fill: '#b198ef', shade: '#8562ce', glow: '#d5c3ff' },
  { name: 'Orange', fill: '#ffb46c', shade: '#e28c48', glow: '#ffdaa8' },
  { name: 'Green', fill: '#78d6b2', shade: '#41a982', glow: '#baf5d7' },
  { name: 'Yellow', fill: '#f9d76e', shade: '#d7ac3a', glow: '#ffecb1' },
];

export const createGame = () => ({
  balloon: 0,
  letter: chooseLetter(null, Math.random()),
  popped: 0,
  seconds: BALLOON_SECONDS,
  paused: false,
  celebrating: false,
});

const nextBalloon = (state, randomValue) => ({
  ...state,
  balloon: state.balloon + 1,
  letter: chooseLetter(state.letter, randomValue),
  seconds: BALLOON_SECONDS,
  celebrating: false,
});

export function gameReducer(state, action) {
  switch (action.type) {
    case 'POP':
      if (state.paused || state.celebrating) return state;
      if (typeof action.key !== 'string' || action.key.toUpperCase() !== state.letter) return state;
      return { ...state, popped: state.popped + 1, celebrating: true };
    case 'NEXT':
      return nextBalloon(state, action.random);
    case 'TICK':
      if (state.paused || state.celebrating) return state;
      if (action.seconds <= 0) return nextBalloon(state, action.random);
      return { ...state, seconds: Math.min(BALLOON_SECONDS, Math.ceil(action.seconds)) };
    case 'PAUSE':
      return { ...state, paused: !state.paused };
    default:
      return state;
  }
}
