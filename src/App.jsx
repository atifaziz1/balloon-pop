import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BALLOON_SECONDS, COLORS, gameReducer, initialGame } from './game.js';

function Icon({ name, ...props }) {
  const paths = {
    sound: <><path d="m11 5-6 4H2v6h3l6 4z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
    mute: <><path d="m11 5-6 4H2v6h3l6 4z"/><path d="m16 9 6 6m0-6-6 6"/></>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    play: <path d="m8 4 12 8-12 8z"/>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/></>,
    clock: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3"/></>,
    star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function Balloon({ color }) {
  return <svg className="balloon-art" viewBox="0 0 300 440" aria-hidden="true">
    <defs>
      <radialGradient id="balloon-color" cx="35%" cy="28%" r="80%"><stop offset="0%" stopColor={color.glow}/><stop offset="53%" stopColor={color.fill}/><stop offset="100%" stopColor={color.shade}/></radialGradient>
      <linearGradient id="shine" x2="1" y2="1"><stop stopColor="white" stopOpacity=".7"/><stop offset="1" stopColor="white" stopOpacity=".05"/></linearGradient>
    </defs>
    <path d="M150 297c-25 35 30 40 9 74s-12 40-3 59" fill="none" stroke="#a99aba" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="m150 279-12 21q12 6 24 0z" fill={color.shade}/>
    <path d="M150 12C77 12 28 60 28 134c0 80 67 151 122 151s122-71 122-151C272 60 223 12 150 12Z" fill="url(#balloon-color)"/>
    <path d="M79 57c-20 18-29 44-27 64" fill="none" stroke="url(#shine)" strokeWidth="19" strokeLinecap="round"/>
    <ellipse cx="109" cy="42" rx="13" ry="7" fill="white" opacity=".35" transform="rotate(-20 109 42)"/>
    <ellipse cx="112" cy="159" rx="5" ry="7" fill="#61364f"/><ellipse cx="187" cy="159" rx="5" ry="7" fill="#61364f"/>
    <ellipse cx="97" cy="178" rx="14" ry="7" fill="#ee6287" opacity=".4"/><ellipse cx="202" cy="178" rx="14" ry="7" fill="#ee6287" opacity=".4"/>
    <path d="M136 176q14 17 28 0" fill="none" stroke="#61364f" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
}

export default function App() {
  const [game, dispatch] = useReducer(gameReducer, initialGame);
  const [sound, setSound] = useState(true);
  const [help, setHelp] = useState(false);
  const [lastKey, setLastKey] = useState('');
  const audio = useRef(null);
  const deadline = useRef(0);
  const remaining = useRef(BALLOON_SECONDS * 1000);
  const currentBalloon = useRef(-1);
  const helpButton = useRef(null);
  const dialog = useRef(null);
  const color = COLORS[game.balloon % COLORS.length];
  const paused = game.paused || help;

  useEffect(() => {
    if (currentBalloon.current !== game.balloon) {
      remaining.current = BALLOON_SECONDS * 1000;
      currentBalloon.current = game.balloon;
    }
    if (paused || game.celebrating) return;
    deadline.current = performance.now() + remaining.current;
    const timer = setInterval(() => {
      const seconds = (deadline.current - performance.now()) / 1000;
      if (seconds <= 0) clearInterval(timer);
      dispatch({ type: 'TICK', seconds });
    }, 100);
    return () => {
      remaining.current = Math.max(0, deadline.current - performance.now());
      clearInterval(timer);
    };
  }, [game.balloon, paused, game.celebrating]);

  useEffect(() => {
    if (!game.celebrating) return;
    const timer = setTimeout(() => dispatch({ type: 'NEXT' }), 650);
    return () => clearTimeout(timer);
  }, [game.celebrating]);

  useEffect(() => {
    const onHidden = () => { if (document.hidden && !game.paused) dispatch({ type: 'PAUSE' }); };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [game.paused]);

  useEffect(() => {
    if (help) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [help]);

  useEffect(() => () => { audio.current?.close(); }, []);

  const playPop = useCallback(() => {
    if (!sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      void ctx.resume().catch(() => {});
      const oscillator = ctx.createOscillator();
      const volume = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(520, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + .14);
      volume.gain.setValueAtTime(.16, ctx.currentTime);
      volume.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2);
      oscillator.connect(volume);
      volume.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + .2);
    } catch { /* The game also works when audio is unavailable. */ }
  }, [sound]);

  const pop = useCallback((key = '') => {
    if (paused || game.celebrating) return;
    setLastKey(key === ' ' ? 'SPACE' : key.toUpperCase());
    playPop();
    dispatch({ type: 'POP' });
  }, [paused, game.celebrating, playPop]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || paused) return;
      if (event.key.length !== 1 && !event.key.startsWith('Arrow')) return;
      // Leave Space and Enter activation on controls to the browser.
      if (event.key === ' ' && event.target.closest?.('button, input, select, textarea, a')) return;
      event.preventDefault();
      pop(event.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pop, paused]);

  return <main className="game">
    <div className="sky-decor" aria-hidden="true"><span className="cloud cloud-one"/><span className="cloud cloud-two"/><span className="cloud cloud-three"/><span className="sparkle s-one">✦</span><span className="sparkle s-two">✧</span><span className="sparkle s-three">✦</span><span className="sparkle s-four">✧</span><div className="hill hill-back"/><div className="hill hill-front"/></div>
    <header className="header">
      <a className="brand" href="./" aria-label="Pop and Play home"><img src="./balloon.svg" alt=""/><span>pop<span className="brand-and">&</span>play<span className="brand-dot">.</span><small>LITTLE HANDS, BIG FUN</small></span></a>
      <nav className="controls" aria-label="Game controls">
        <button className="control" onClick={() => setSound(!sound)} aria-label={sound ? 'Mute sound' : 'Turn sound on'} aria-pressed={sound}><Icon name={sound ? 'sound' : 'mute'}/><span>Sound {sound ? 'on' : 'off'}</span></button>
        <button className="control" onClick={() => dispatch({ type: 'PAUSE' })} aria-label={game.paused ? 'Resume game' : 'Pause game'}><Icon name={game.paused ? 'play' : 'pause'}/><span>{game.paused ? 'Resume' : 'Pause'}</span></button>
        <button className="help-control" ref={helpButton} onClick={() => setHelp(true)} aria-label="How to play">?</button>
      </nav>
    </header>

    <section className="play-area" aria-label="Balloon popping game">
      <div className="intro"><span className="eyebrow">A LITTLE POP OF HAPPINESS</span><h1>Ready, set, <span>pop!</span></h1><p>One happy balloon. Endless little smiles.</p></div>
      <div className="stats">
        <div className="stat score"><span className="stat-icon"><Icon name="star"/></span><span><strong data-testid="score">{game.popped}</strong><small>balloons popped</small></span></div>
        <div className="stat timer"><span className="stat-icon"><Icon name="clock"/></span><span><strong data-testid="timer">{Math.floor(game.seconds / 60)}:{String(game.seconds % 60).padStart(2, '0')}</strong><small>for this balloon</small></span><svg className="timer-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="16" style={{ strokeDasharray: '100.53', strokeDashoffset: 100.53 * (1 - game.seconds / BALLOON_SECONDS) }}/></svg></div>
      </div>

      <div className="balloon-stage">
        <span className="floating-note note-left" aria-hidden="true">hello, little<br/>balloon!<svg viewBox="0 0 65 45"><path d="M4 4q-3 30 52 26m-10-9 12 9-13 7"/></svg></span>
        {game.celebrating ? <div className="celebration" data-testid="celebration"><div className="confetti" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ '--i': i, '--color': COLORS[i % COLORS.length].fill }}/>)}</div><strong>{['Lovely pop!', 'You did it!', 'Hooray!', 'So much fun!', 'Great job!'][game.popped % 5]}</strong><span>{lastKey && <kbd>{lastKey}</kbd>} A little burst of joy!</span></div> : <button key={game.balloon} className={`balloon-button ${paused ? 'is-paused' : ''}`} aria-label={`Pop the ${color.name.toLowerCase()} balloon`} onClick={() => pop()} disabled={paused}><Balloon color={color}/></button>}
        <span className="floating-note note-right" aria-hidden="true">{color.name.toLowerCase()} &<br/>full of joy <span>♡</span></span>
        <div className="balloon-shadow" aria-hidden="true"/>
        {paused && <div className="pause-overlay"><span>☁</span><h2>{help ? 'A little break' : 'Taking a little break?'}</h2><p>Your balloon is waiting for you.</p>{!help && <button className="primary-button" onClick={() => dispatch({ type: 'PAUSE' })}><Icon name="play"/> Let’s play</button>}</div>}
      </div>

      <div className="instructions"><span className="keyboard-icon"><Icon name="keyboard"/></span><div><p>Press <kbd>any letter</kbd> or <kbd>space</kbd> to pop</p><small>Or tap the balloon. You’re in charge!</small></div></div>
      <div className="color-trail" aria-hidden="true">{COLORS.map((c, i) => <span key={c.name} className={i === game.balloon % COLORS.length ? 'active' : ''} style={{ '--dot-color': c.fill }}/>)}</div>
    </section>
    <footer><span>Made for little moments of joy <span className="heart">♥</span></span><span>No rush. No game over. Just play.</span></footer>
    <div className="sr-only" role="status" aria-live="polite">{game.celebrating ? `Pop! ${game.popped} balloons popped.` : `${color.name} balloon ready.`}</div>
    <dialog ref={dialog} className="help-dialog" onCancel={() => setHelp(false)} onClose={() => { setHelp(false); helpButton.current?.focus(); }}><span className="dialog-balloon">🎈</span><h2>Little hands, big fun.</h2><p>Press a letter, a number, an arrow key, or the space bar to pop the balloon. You can tap it, too!</p><p>Each balloon gets one minute. When time runs out, a new balloon appears. The fun keeps going for as long as you like.</p><p>Use Pause for a break, or the speaker to turn sounds off. Switching to another tab pauses the game.</p><button className="primary-button" onClick={() => setHelp(false)}>Let’s play</button></dialog>
  </main>;
}
