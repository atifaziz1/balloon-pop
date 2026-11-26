export const BALLOON_SECONDS = 60;
export const COLORS = [
  { name: 'Pink', fill: '#fa8095', shade: '#d95375', glow: '#ffafbc' },
  { name: 'Blue', fill: '#76baff', shade: '#468ddd', glow: '#b6dcff' },
  { name: 'Purple', fill: '#b198ef', shade: '#8562ce', glow: '#d5c3ff' },
  { name: 'Orange', fill: '#ffb46c', shade: '#e28c48', glow: '#ffdaa8' },
  { name: 'Green', fill: '#78d6b2', shade: '#41a982', glow: '#baf5d7' },
  { name: 'Yellow', fill: '#f9d76e', shade: '#d7ac3a', glow: '#ffecb1' },
];

export const initialGame = { balloon: 0, popped: 0, seconds: BALLOON_SECONDS, paused: false, celebrating: false };

export function gameReducer(state, action) {
  switch (action.type) {
    case 'POP':
      if (state.paused || state.celebrating) return state;
      return { ...state, popped: state.popped + 1, celebrating: true };
    case 'NEXT':
      return { ...state, balloon: state.balloon + 1, seconds: BALLOON_SECONDS, celebrating: false };
    case 'TICK':
      if (state.paused || state.celebrating) return state;
      if (action.seconds <= 0) return { ...state, balloon: state.balloon + 1, seconds: BALLOON_SECONDS };
      return { ...state, seconds: Math.min(BALLOON_SECONDS, Math.ceil(action.seconds)) };
    case 'PAUSE':
      return { ...state, paused: !state.paused };
    default:
      return state;
  }
}
