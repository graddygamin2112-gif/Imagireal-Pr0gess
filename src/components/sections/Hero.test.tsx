import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { Hero } from './Hero';

/**
 * Regression guard for the hero rotating-word layout.
 *
 * The original bug: the word container was sized to the *widest* rotating word
 * ("Storyboards") and its text was centred, so short words like "Grade" sat in
 * the middle of a wide box (a visible gap). A second, related bug measured
 * widths with `getBoundingClientRect()` while an ancestor `scale()` transform
 * was active, under-measuring each word and clipping it ("Grade" → "Grac").
 *
 * jsdom performs no layout, so `offsetWidth` is normally 0. We stub it with a
 * deterministic, text-length-proportional value so the component's measurement
 * path runs for real and we can assert the resulting width.
 */
function stubOffsetWidth() {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return (this.textContent?.trim().length ?? 0) * 10;
    },
  });
}

/** The visible rotating-word container (identified by its test id). */
function wordBox() {
  return screen.getByTestId('hero-rotating-word');
}

describe('Hero rotating headline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubOffsetWidth();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sizes the rotating container to the ACTIVE word, not the widest one', () => {
    render(
      <TestApp>
        <Hero />
      </TestApp>,
    );

    // Index 0 is "Timelines" (9 chars) → 9*10 + 4 buffer = 94px.
    // Crucially this is NOT the widest word ("Storyboards" would be 114px),
    // which is what previously produced the gap.
    expect(wordBox().style.width).toBe('94px');

    // Advance one rotation → "Storyboards" (11 chars) → 114px.
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(wordBox().style.width).toBe('114px');

    // Advance again → "Grade" (5 chars) → 54px. The container must shrink to
    // the active word so "Edit" can glide toward it (no leftover gap).
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(wordBox().style.width).toBe('54px');
  });

  it('never clips horizontally and left-aligns short words', () => {
    render(
      <TestApp>
        <Hero />
      </TestApp>,
    );

    const box = wordBox();
    // Horizontal clipping is what truncated "Grade" → "Grac". It must be gone.
    expect(box.className).not.toContain('overflow-hidden');
    // Words are left-aligned inside the box rather than centred, which is what
    // removes the visual gap for short words.
    expect(box.className).toContain('justify-items-start');
  });
});