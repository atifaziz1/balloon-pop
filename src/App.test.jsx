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
    expect(screen.getAllByRole('button', { name: /pop the .* balloon/i })).toHaveLength(1);
    advance(14000);
    expect(screen.getByTestId('timer').textContent).toBe('0:46');
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    expect(screen.queryByRole('button', { name: /pop the .* balloon/i })).toBeNull();
    fireEvent.keyDown(window, { key: 'b' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    advance(650);
    expect(screen.getByRole('button', { name: 'Pop the blue balloon' })).toBeTruthy();
    expect(screen.getByTestId('timer').textContent).toBe('1:00');
  });

  it('automatically replaces unpopped balloons every minute without increasing score or ending', () => {
    render(<App />);
    for (const color of ['blue', 'purple', 'orange', 'green', 'yellow', 'pink', 'blue']) {
      advance(60000);
      expect(screen.getByRole('button', { name: `Pop the ${color} balloon` })).toBeTruthy();
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
    expect(screen.getByRole('button', { name: 'Pop the pink balloon' })).toBeTruthy();
    advance(600);
    expect(screen.getByRole('button', { name: 'Pop the blue balloon' })).toBeTruthy();
  });

  it('ignores held keys and system shortcuts, and supports space and tapping', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'a', repeat: true });
    fireEvent.keyDown(window, { key: 'r', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByTestId('score').textContent).toBe('0');
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByTestId('score').textContent).toBe('1');
    advance(650);
    fireEvent.click(screen.getByRole('button', { name: 'Pop the blue balloon' }));
    expect(screen.getByTestId('score').textContent).toBe('2');
  });
});
