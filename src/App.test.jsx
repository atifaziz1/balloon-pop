import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] }));
afterEach(() => { cleanup(); vi.useRealTimers(); });
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
    for (const letter of 'BCDEFGH') {
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

  it('shows all letters A to Z and repeats with A after Z', () => {
    render(<App />);
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const balloon = screen.getByRole('img', { name: new RegExp(`balloon, letter ${letter}`) });
      expect(balloon.querySelector('text').textContent).toBe(letter);
      fireEvent.keyDown(window, { key: letter.toLowerCase() });
      advance(650);
    }
    expect(screen.getByTestId('score').textContent).toBe('26');
    expect(screen.getByRole('img', { name: /balloon, letter A/ })).toBeTruthy();
  });
});
