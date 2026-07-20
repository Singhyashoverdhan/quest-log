// ── Design tokens — single source of truth ────────────────────────────────
// Every raw number in the codebase should trace back to one of these values.
// Import the category you need: import { FONT, COLOR, RADIUS, SPACE, ICON } from '../tokens';

export const FONT = {
  xs:      10,   // mono micro-labels, ALL-CAPS kickers
  sm:      11,   // captions, metadata, pill text
  md:      13,   // body text, row content
  lg:      15,   // section headings, modal titles, button labels
  xl:      20,   // screen titles, card headings
  hero:    24,   // stat values, XP ring numbers
  display: 28,   // login splash title only
};

export const RADIUS = {
  sm: 8,   // checkboxes, tags, small buttons, input fields
  md: 14,  // cards, rows, modals, primary buttons
  lg: 20,  // pills, FAB, bottom-sheet top corners
};

// 4-point grid. No 5s, 7s, 9s, 11s, 13s, or 14s in gap/padding.
export const SPACE = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  32,
};

// 6 neutrals by role, not by hex value.
// Kill: #FAFAF8, #F0EDE8, #E8E4DC, #D8D4CC as separate values — they map below.
export const COLOR = {
  bg:           '#F5F3EE',  // page background
  surface:      '#FFFFFF',  // card / modal surface
  surfaceMuted: '#F8F6F1',  // input fill, disabled state, done-task bg
  border:       '#EAE6DE',  // every border and divider, one value
  textMuted:    '#A09C96',  // mono labels, helper text, placeholders
  textSub:      '#706C66',  // secondary prose, button text, inactive
  text:         '#1A1814',  // primary text

  // Semantic — stay consistent, never swap these for neutrals
  accent:  '#C9A970',
  success: '#7BAF92',
  danger:  '#C47878',
  info:    '#7B9EC4',
  purple:  '#A48CC4',
};

// 4 sizes, always passed explicitly — no silent defaults.
export const ICON = {
  sm:  11,   // inline with caption text
  md:  14,   // inline with body / row icons
  nav: 20,   // bottom nav tabs
  lg:  22,   // FAB, primary-action buttons
};
