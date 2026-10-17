import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Eye,
  Lock,
  RotateCcw,
  Scissors,
  Wand2,
  Maximize2,
} from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Scene data                                                                */
/* -------------------------------------------------------------------------- */

interface Clip {
  id: string;
  name: string;
  track: number; // 0 = V2, 1 = V1, 2 = A1, 3 = A2
  start: number;
  duration: number;
  accent: string;
}

const TRACKS = [
  { label: 'V2', kind: 'video' as const },
  { label: 'V1', kind: 'video' as const },
  { label: 'A1', kind: 'audio' as const },
  { label: 'A2', kind: 'audio' as const },
];

const DURATION = 32;

const CLIPS: Clip[] = [
  // V1 — the cut
  { id: 'v1-1', name: 'A_CAM_001', track: 1, start: 0, duration: 6, accent: 'var(--iris)' },
  { id: 'v1-2', name: 'B_CAM_004', track: 1, start: 6, duration: 7, accent: 'var(--violet)' },
  { id: 'v1-3', name: 'DRONE_12', track: 1, start: 13, duration: 7, accent: 'var(--magenta)' },
  { id: 'v1-4', name: 'B_ROLL_07', track: 1, start: 20, duration: 7, accent: 'var(--iris)' },
  { id: 'v1-5', name: 'INT_EGO_02', track: 1, start: 27, duration: 5, accent: 'var(--mint)' },
  // V2 — titles + overlays
  { id: 'v2-1', name: 'TITLE_OPEN', track: 0, start: 1, duration: 3.5, accent: 'var(--magenta)' },
  { id: 'v2-2', name: 'LOWER_3RD', track: 0, start: 8, duration: 3, accent: 'var(--violet)' },
  { id: 'v2-3', name: 'SUBTITLE_EN', track: 0, start: 21, duration: 5, accent: 'var(--iris)' },
  // A1 — score
  { id: 'a1-1', name: 'SCORE_MAIN', track: 2, start: 0, duration: 32, accent: 'var(--mint)' },
  // A2 — dialogue
  { id: 'a2-1', name: 'DIALOG_01', track: 3, start: 2, duration: 6, accent: 'var(--violet)' },
  { id: 'a2-2', name: 'DIALOG_02', track: 3, start: 14, duration: 5, accent: 'var(--violet)' },
  { id: 'a2-3', name: 'DIALOG_03', track: 3, start: 24, duration: 6, accent: 'var(--violet)' },
];

/** Deterministic pseudo-random heights so waveform bars are stable across renders. */
function waveform(seed: number, count: number): number[] {
  const bars: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    bars.push(0.25 + (s / 233280) * 0.75);
  }
  return bars;
}

interface Grade {
  exposure: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
}

const DEFAULT_GRADE: Grade = { exposure: 0, contrast: 0, saturation: 0 };

/* -------------------------------------------------------------------------- */
/*  Demo                                                                      */
/* -------------------------------------------------------------------------- */

export function StudioDemo() {
  const [time, setTime] = useState(4.5);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('v1-2');
  const [grade, setGrade] = useState<Grade>(DEFAULT_GRADE);
  const [activePanel, setActivePanel] = useState<'media' | 'effects'>('media');

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const scrubbing = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTs = useRef<number>(0);

  /* ---- Transport loop ---------------------------------------------------- */
  useEffect(() => {
    if (!playing) return;

    const step = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;

      setTime((prev) => {
        const next = prev + dt;
        return next >= DURATION ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTs.current = 0;
    };
  }, [playing]);

  /* ---- Scrubbing --------------------------------------------------------- */
  const seekFromClientX = useCallback((clientX: number) => {
    const node = timelineRef.current;
    if (!node) return;
    // Use layout metrics rather than the rendered rect: the workspace sits
    // inside a reveal transition that scales it, and layout values keep the
    // scrub mapping exact regardless of that transform.
    let left = 0;
    let el: HTMLElement | null = node;
    while (el) {
      left += el.offsetLeft;
      el = el.offsetParent as HTMLElement | null;
    }
    const width = node.offsetWidth || 1;
    const ratio = Math.min(Math.max((clientX + window.scrollX - left) / width, 0), 1);
    setTime(ratio * DURATION);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (scrubbing.current) seekFromClientX(e.clientX);
    };
    const onUp = () => {
      scrubbing.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [seekFromClientX]);

  /* ---- Derived state ----------------------------------------------------- */
  const isLive = (clip: Clip) => time >= clip.start && time < clip.start + clip.duration;

  const activeVideo =
    CLIPS.find((c) => c.track === 1 && isLive(c)) ??
    CLIPS.find((c) => c.track === 0 && isLive(c)) ??
    CLIPS[0];

  const selected = useMemo(
    () => CLIPS.find((c) => c.id === selectedId) ?? CLIPS[0],
    [selectedId],
  );

  const videoFilter = `brightness(${100 + grade.exposure * 0.6}%) contrast(${100 + grade.contrast}%) saturate(${100 + grade.saturation}%)`;

  const timecode = useMemo(() => {
    const totalFrames = Math.floor(time * 24);
    const h = Math.floor(totalFrames / (24 * 3600));
    const m = Math.floor(totalFrames / (24 * 60)) % 60;
    const s = Math.floor(totalFrames / 24) % 60;
    const f = totalFrames % 24;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  }, [time]);

  const changeGrade = (key: keyof Grade, value: number) =>
    setGrade((g) => ({ ...g, [key]: value }));

  return (
    <section id="studio" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--iris)_10%,transparent),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <Wand2 className="size-3.5 text-iris" />
              Interactive preview
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Take the <span className="text-spectrum">timeline</span> for a spin.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              This is a live, cut-down taste of the Imagireal workspace — scrub the playhead, select
              clips and push the grade. No download, no sign-up.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160} from="scale">
          <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-[0_60px_160px_-60px_rgba(0,0,0,1)] backdrop-blur-xl">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-white/6 px-3 py-1 font-mono">scene_01 · imagireal</span>
                <span className="hidden rounded-md bg-white/6 px-3 py-1 font-mono sm:inline">
                  Rec.709 · 8K · 23.976
                </span>
              </div>
              <div className="hidden items-center gap-1 text-xs text-mint sm:flex">
                <span className="size-1.5 animate-pulse rounded-full bg-mint" />
                GPU 42%
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px]">
              {/* ---- Left panel: media / effects ----------------------------- */}
              <aside className="hidden border-r border-white/8 bg-white/[0.015] p-3 lg:block">
                <div className="flex gap-1 rounded-xl bg-white/5 p-1">
                  {(['media', 'effects'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePanel(tab)}
                      className={cn(
                        'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        activePanel === tab
                          ? 'bg-white/10 text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5">
                  {activePanel === 'media'
                    ? CLIPS.filter((c) => c.track === 1).map((clip) => (
                        <button
                          key={clip.id}
                          onClick={() => setSelectedId(clip.id)}
                          className={cn(
                            'group flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition-colors',
                            selectedId === clip.id
                              ? 'border-white/16 bg-white/8'
                              : 'border-transparent hover:bg-white/5',
                          )}
                        >
                          <span
                            className="h-8 w-12 shrink-0 rounded-md"
                            style={{
                              background: `linear-gradient(135deg, color-mix(in oklab, ${clip.accent} 70%, #05060f), color-mix(in oklab, ${clip.accent} 20%, #05060f))`,
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-[11px] text-foreground">
                              {clip.name}
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              {clip.duration.toFixed(1)}s · 8K
                            </span>
                          </span>
                        </button>
                      ))
                    : ['Film Grain', 'Teal & Orange', 'Kodak 2383', 'Halation', 'Bloom'].map((fx) => (
                        <button
                          key={fx}
                          className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                        >
                          {fx}
                          <span className="font-mono text-[10px] text-iris">+</span>
                        </button>
                      ))}
                </div>
              </aside>

              {/* ---- Center: preview + timeline ------------------------------ */}
              <div className="flex min-w-0 flex-col">
                {/* Preview monitor */}
                <div className="relative aspect-video overflow-hidden bg-black">
                  {/* Simulated graded frame */}
                  <div
                    className="absolute inset-0 transition-[filter] duration-300"
                    style={{
                      filter: videoFilter,
                      background:
                        'radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--violet) 55%, transparent), transparent 55%), radial-gradient(circle at 75% 70%, color-mix(in oklab, var(--iris) 50%, transparent), transparent 55%), linear-gradient(160deg, #0a0b1c, #05060f 70%)',
                    }}
                  />
                  {/* Faux subject silhouette */}
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative h-1/2 w-1/3 rounded-[40%_40%_45%_45%/60%_60%_40%_40%] bg-black/45 blur-[2px]" />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_45%)]" />

                  {/* Overlay title when the V2 title clip is live */}
                  {time >= 1 && time < 4.5 && (
                    <div className="absolute inset-x-0 top-[16%] text-center">
                      <p className="font-display text-[clamp(1rem,3.4vw,2.2rem)] font-semibold tracking-tight text-white/95 drop-shadow-lg">
                        A story in motion
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-white/60">
                        Imagireal Pictures
                      </p>
                    </div>
                  )}
                  {(time >= 8 && time < 11) && (
                    <div className="absolute bottom-6 left-6 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur">
                      <p className="text-xs font-semibold text-white">Maya Chen</p>
                      <p className="text-[10px] text-white/70">Director of Photography</p>
                    </div>
                  )}

                  {/* HUD */}
                  <div className="absolute right-3 top-3 flex items-center gap-2 text-[10px] font-mono text-white/70">
                    <span className="rounded bg-black/50 px-2 py-1">ISO 800</span>
                    <span className="rounded bg-black/50 px-2 py-1">ƒ/1.8</span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="rounded bg-black/55 px-2 py-1 font-mono text-[11px] text-white/85">
                      {timecode}
                    </span>
                  </div>
                </div>

                {/* Transport */}
                <div className="flex items-center gap-3 border-y border-white/8 bg-white/[0.02] px-4 py-2.5">
                  <button
                    aria-label="Go to start"
                    onClick={() => setTime(0)}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SkipBack className="size-4" />
                  </button>
                  <button
                    aria-label={playing ? 'Pause' : 'Play'}
                    onClick={() => setPlaying((p) => !p)}
                    className="grid size-10 place-items-center rounded-full bg-spectrum text-[hsl(240_40%_5%)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                  </button>
                  <button
                    aria-label="Go to end"
                    onClick={() => setTime(DURATION - 0.1)}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SkipForward className="size-4" />
                  </button>
                  <div className="mx-2 hidden items-center gap-2 sm:flex">
                    <Scissors className="size-4 text-muted-foreground" />
                    <Volume2 className="size-4 text-muted-foreground" />
                    <span className="font-mono text-[11px] text-muted-foreground">{timecode}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded bg-white/6 px-2 py-1 font-mono">
                      {selected.name}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex gap-3 p-3">
                  {/* Track labels — top padding aligns them with the lanes below the ruler */}
                  <div className="flex w-8 shrink-0 flex-col gap-1.5 pt-[1.875rem] text-muted-foreground">
                    {TRACKS.map((track) => (
                      <div key={track.label} className="flex h-11 flex-col items-center justify-center gap-1">
                        <span className="font-mono text-[10px]">{track.label}</span>
                        <span className="flex gap-0.5 opacity-60">
                          <Eye className="size-2.5" />
                          <Lock className="size-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Lanes column — single coordinate space for ruler, clips and playhead */}
                  <div
                    ref={timelineRef}
                    className="relative flex-1"
                    onPointerDown={(e) => {
                      scrubbing.current = true;
                      seekFromClientX(e.clientX);
                    }}
                  >
                    {/* Ruler */}
                    <div className="relative mb-1.5 h-6 cursor-pointer select-none">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 flex flex-col items-start"
                          style={{ left: `${(i / 8) * 100}%` }}
                        >
                          <span className="font-mono text-[9px] text-muted-foreground">{i * 4}s</span>
                          <span className="mt-0.5 h-2 w-px bg-white/20" />
                        </div>
                      ))}
                    </div>

                    {/* Track lanes */}
                    <div className="flex flex-col gap-1.5">
                      {TRACKS.map((track, trackIndex) => (
                        <div key={track.label} className="relative h-11 overflow-hidden rounded-lg bg-white/[0.03]">
                          {/* Grid lines aligned to the 4s ruler ticks */}
                          {Array.from({ length: 7 }).map((_, i) => (
                            <span
                              key={i}
                              className="absolute top-0 h-full w-px bg-white/[0.05]"
                              style={{ left: `${((i + 1) / 8) * 100}%` }}
                            />
                          ))}
                          {CLIPS.filter((c) => c.track === trackIndex).map((clip) => {
                            const isSelected = selectedId === clip.id;
                            return (
                              <button
                                key={clip.id}
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(clip.id);
                                }}
                                className={cn(
                                  'group absolute top-1 bottom-1 overflow-hidden rounded-md border text-left transition-all duration-150',
                                  isSelected ? 'z-10 border-white/60' : 'border-white/15 hover:border-white/35',
                                )}
                                style={{
                                  left: `${(clip.start / DURATION) * 100}%`,
                                  width: `${(clip.duration / DURATION) * 100}%`,
                                  background: `linear-gradient(135deg, color-mix(in oklab, ${clip.accent} 55%, transparent), color-mix(in oklab, ${clip.accent} 12%, transparent))`,
                                  boxShadow: isSelected ? `0 0 0 1px ${clip.accent}, 0 8px 24px -12px ${clip.accent}` : undefined,
                                }}
                              >
                                {track.kind === 'video' ? (
                                  <span className="absolute inset-0 flex items-center px-2">
                                    <span className="truncate font-mono text-[10px] text-white/90">
                                      {clip.name}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="absolute inset-0 flex items-center gap-px px-1">
                                    {waveform(clip.start * 100 + 7, Math.max(Math.floor(clip.duration * 6), 8)).map((h, i) => (
                                      <span
                                        key={i}
                                        className="w-0.5 shrink-0 rounded-full bg-white/70"
                                        style={{ height: `${h * 60}%` }}
                                      />
                                    ))}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Playhead spans the full lanes column */}
                    <div
                      className="pointer-events-none absolute inset-y-0 z-20 w-px bg-spectrum"
                      style={{ left: `${(time / DURATION) * 100}%` }}
                    >
                      <span className="absolute -left-[4px] top-0 size-2 rotate-45 rounded-[2px] bg-spectrum" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- Right panel: inspector ---------------------------------- */}
              <aside className="border-t border-white/8 bg-white/[0.015] p-4 lg:border-l lg:border-t-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Inspector
                </p>
                <p className="mt-1 truncate font-mono text-sm text-foreground">{activeVideo.name}</p>

                <div className="mt-5 space-y-5">
                  {(
                    [
                      { key: 'exposure', label: 'Exposure' },
                      { key: 'contrast', label: 'Contrast' },
                      { key: 'saturation', label: 'Saturation' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs">
                        <label htmlFor={`grade-${key}`} className="text-muted-foreground">
                          {label}
                        </label>
                        <span className="font-mono text-iris">
                          {grade[key] > 0 ? '+' : ''}
                          {grade[key]}
                        </span>
                      </div>
                      <input
                        id={`grade-${key}`}
                        type="range"
                        min={-100}
                        max={100}
                        value={grade[key]}
                        onChange={(e) => changeGrade(key, Number(e.target.value))}
                        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--iris)] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--iris)] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_color-mix(in_oklab,var(--iris)_30%,transparent)]"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setGrade(DEFAULT_GRADE)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RotateCcw className="size-3.5" />
                  Reset grade
                </button>

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Maximize2 className="size-3" /> Render queue
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-spectrum transition-[width] duration-300"
                      style={{ width: `${Math.round((time / DURATION) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    H.265 · 4K · {Math.round((time / DURATION) * 100)}%
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            The real app supports multi-cam, 32-bit float audio and unlimited tracks.
          </p>
        </Reveal>
      </div>
    </section>
  );
}