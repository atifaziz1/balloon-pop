import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

describe('continuous balloon play', () => {
  it('shows one balloon, pops with a key, and resets time for the next balloon', () => {
    render(<App />);
    expect(screen.getAllByRole('img', { name: /balloon, letter [A-Z]/ })).toHaveLength(1);
    advance(14000);
    expect(screen.getByTestId('timer').textContent).toBe('0:46');
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    expect(screen.queryByRole('img', { name: /balloon, letter [A-Z]/ })).toBeNull();
    fireEvent.keyDown(window, { key: 'b' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    advance(650);
    expect(screen.getByRole('img', { name: 'Blue balloon, letter B. Press B to pop.' })).toBeTruthy();
    expect(screen.getByTestId('timer').textContent).toBe('1:00');
  });

  it('automatically replaces unpopped balloons every minute without increasing score or ending', () => {
    render(<App />);
    for (const letter of 'BABABAB') {
      advance(60000);
      expect(screen.getByRole('img', { name: new RegExp(`balloon, letter ${letter}\\.`) })).toBeTruthy();
      expect(screen.getByTestId('timer').textContent).toBe('1:00');
      expect(screen.getByTestId('score').textContent).toBe('0');
    }
  });

  it('pauses the countdown and popping, then resumes with the remaining time', () => {
    render(<App />);
    advance(12500);
    fireEvent.click(screen.getByRole('button', { name: 'Pause game' }));
    const pausedTime = screen.getByTestId('timer').textContent;
    advance(90000);
    fireEvent.keyDown(window, { key: 'x' });
    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('timer').textContent).toBe(pausedTime);
    fireEvent.click(screen.getByRole('button', { name: 'Resume game' }));
    advance(47000);
    expect(screen.getByRole('img', { name: 'Pink balloon, letter A. Press A to pop.' })).toBeTruthy();
    advance(600);
    expect(screen.getByRole('img', { name: 'Blue balloon, letter B. Press B to pop.' })).toBeTruthy();
  });

  it('ignores wrong keys, held keys, system shortcuts, clicks and taps without resetting the timer', () => {
    render(<App />);
    advance(10000);
    for (const key of ['b', 'z', '1', ' ', 'Enter', 'ArrowUp', 'Tab']) {
      fireEvent.keyDown(window, { key });
    }
    fireEvent.keyDown(window, { key: 'a', repeat: true });
    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'a', altKey: true });
    fireEvent.keyDown(window, { key: 'a', metaKey: true });
    const balloon = screen.getByRole('img', { name: 'Pink balloon, letter A. Press A to pop.' });
    fireEvent.click(balloon);
    fireEvent.touchStart(balloon);
    fireEvent.touchEnd(balloon);
    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('timer').textContent).toBe('0:50');
    expect(balloon.querySelector('text').textContent).toBe('A');
    fireEvent.keyDown(window, { key: 'A', shiftKey: true });
    expect(screen.getByTestId('score').textContent).toBe('1');
    advance(650);
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    fireEvent.keyDown(window, { key: 'b' });
    expect(screen.getByTestId('score').textContent).toBe('2');
  });

  it('starts with a random letter and draws again only for a new balloon', () => {
    vi.mocked(Math.random).mockReturnValue(0.75);
    render(<App />);
    expect(screen.getByRole('img', { name: /balloon, letter T/ })).toBeTruthy();
    vi.mocked(Math.random).mockReturnValue(0);
    advance(5000);
    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }));
    expect(screen.getByRole('img', { name: /balloon, letter T/ })).toBeTruthy();
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByTestId('score').textContent).toBe('0');
    fireEvent.keyDown(window, { key: 't' });
    advance(650);
    expect(screen.getByRole('img', { name: /balloon, letter A/ })).toBeTruthy();
    vi.mocked(Math.random).mockReturnValue(0.999);
    advance(60000);
    expect(screen.getByRole('img', { name: /balloon, letter Z/ })).toBeTruthy();
    expect(screen.getByTestId('score').textContent).toBe('1');
    expect(screen.getByTestId('timer').textContent).toBe('1:00');
  });
});
