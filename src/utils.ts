/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Numeral lists for Indian and Arabic scripts
const BN_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const AR_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Automates Bengali and Arabic numeral conversion for report cards and exam papers.
 */
export function formatNumerals(
  val: string | number,
  lang: string,
  arabicNumeralsEnabled = false
): string {
  const str = String(val);
  
  if (lang === 'bn') {
    return str.replace(/[0-9]/g, (digit) => BN_NUMERALS[parseInt(digit, 10)]);
  }
  
  if (lang === 'ar' && arabicNumeralsEnabled) {
    return str.replace(/[0-9]/g, (digit) => AR_NUMERALS[parseInt(digit, 10)]);
  }
  
  return str;
}

/**
 * Custom color tokens representing the 10 customizable design themes.
 */
export interface ColorTheme {
  primaryText: string;
  primaryBorder: string;
  primaryBg: string;
  secondaryBg: string;
  badgeBg: string;
  accentText: string;
  bulletColor: string;
  solidBg: string;
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  indigo: {
    primaryText: 'text-indigo-700',
    primaryBorder: 'border-indigo-600',
    primaryBg: 'bg-indigo-50/50',
    secondaryBg: 'bg-indigo-100/40',
    badgeBg: 'bg-indigo-600',
    accentText: 'text-indigo-900',
    bulletColor: 'bg-indigo-600',
    solidBg: 'bg-indigo-600',
  },
  emerald: {
    primaryText: 'text-emerald-700',
    primaryBorder: 'border-emerald-600',
    primaryBg: 'bg-emerald-50/50',
    secondaryBg: 'bg-emerald-100/40',
    badgeBg: 'bg-emerald-600',
    accentText: 'text-emerald-900',
    bulletColor: 'bg-emerald-600',
    solidBg: 'bg-emerald-600',
  },
  crimson: {
    primaryText: 'text-rose-700',
    primaryBorder: 'border-rose-600',
    primaryBg: 'bg-rose-50/50',
    secondaryBg: 'bg-rose-100/40',
    badgeBg: 'bg-rose-600',
    accentText: 'text-rose-900',
    bulletColor: 'bg-rose-600',
    solidBg: 'bg-rose-600',
  },
  amber: {
    primaryText: 'text-amber-700',
    primaryBorder: 'border-amber-600',
    primaryBg: 'bg-amber-50/40',
    secondaryBg: 'bg-amber-100/40',
    badgeBg: 'bg-amber-600',
    accentText: 'text-amber-900',
    bulletColor: 'bg-amber-600',
    solidBg: 'bg-amber-600',
  },
  slate: {
    primaryText: 'text-slate-800',
    primaryBorder: 'border-slate-800',
    primaryBg: 'bg-slate-50',
    secondaryBg: 'bg-slate-100',
    badgeBg: 'bg-slate-800',
    accentText: 'text-slate-900',
    bulletColor: 'bg-slate-800',
    solidBg: 'bg-slate-800',
  },
  violet: {
    primaryText: 'text-violet-700',
    primaryBorder: 'border-violet-600',
    primaryBg: 'bg-violet-50/50',
    secondaryBg: 'bg-violet-100/40',
    badgeBg: 'bg-violet-600',
    accentText: 'text-violet-900',
    bulletColor: 'bg-violet-600',
    solidBg: 'bg-violet-600',
  },
  rose: {
    primaryText: 'text-pink-700',
    primaryBorder: 'border-pink-600',
    primaryBg: 'bg-pink-50/50',
    secondaryBg: 'bg-pink-100/40',
    badgeBg: 'bg-pink-600',
    accentText: 'text-pink-900',
    bulletColor: 'bg-pink-600',
    solidBg: 'bg-pink-600',
  },
  sky: {
    primaryText: 'text-sky-700',
    primaryBorder: 'border-sky-600',
    primaryBg: 'bg-sky-50/50',
    secondaryBg: 'bg-sky-100/40',
    badgeBg: 'bg-sky-600',
    accentText: 'text-sky-950',
    bulletColor: 'bg-sky-600',
    solidBg: 'bg-sky-600',
  },
  teal: {
    primaryText: 'text-teal-700',
    primaryBorder: 'border-teal-600',
    primaryBg: 'bg-teal-50/50',
    secondaryBg: 'bg-teal-100/40',
    badgeBg: 'bg-teal-600',
    accentText: 'text-teal-900',
    bulletColor: 'bg-teal-600',
    solidBg: 'bg-teal-600',
  },
  gold: {
    primaryText: 'text-amber-800',
    primaryBorder: 'border-amber-700',
    primaryBg: 'bg-stone-50',
    secondaryBg: 'bg-amber-100/30',
    badgeBg: 'bg-amber-700',
    accentText: 'text-amber-950',
    bulletColor: 'bg-amber-700',
    solidBg: 'bg-amber-700',
  },
};

/**
 * Tailwind typography classes for the configurable fonts setup
 */
export const FONT_CLASSES: Record<string, string> = {
  sans: 'font-style-sans font-sans',
  display: 'font-style-display font-sans font-medium',
  serif: 'font-style-serif font-serif',
  elegant: 'font-style-elegant font-sans',
  mono: 'font-style-mono font-mono text-xs',
  tajawal: 'font-style-arabic-tajawal font-sans',
  amiri: 'font-style-arabic-amiri font-serif',
};

/**
 * Undo Redo State Manager
 */
export class StateHistory<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];

  constructor(initialState: T) {
    this.present = JSON.parse(JSON.stringify(initialState));
  }

  get state(): T {
    return this.present;
  }

  set(newState: T) {
    const serialized = JSON.stringify(newState);
    if (JSON.stringify(this.present) === serialized) return;

    this.past.push(JSON.parse(JSON.stringify(this.present)));
    this.present = JSON.parse(serialized);
    this.future = []; // Clear redo stack on manual updates
  }

  undo(): boolean {
    if (this.past.length === 0) return false;
    const previous = this.past.pop()!;
    this.future.push(JSON.parse(JSON.stringify(this.present)));
    this.present = previous;
    return true;
  }

  redo(): boolean {
    if (this.future.length === 0) return false;
    const next = this.future.pop()!;
    this.past.push(JSON.parse(JSON.stringify(this.present)));
    this.present = next;
    return true;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }
}
