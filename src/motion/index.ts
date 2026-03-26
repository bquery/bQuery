/**
 * Motion module providing view transitions, FLIP animations, spring physics,
 * parallax, typewriter effects, and more.
 * Designed to work with modern browser APIs while providing smooth fallbacks.
 *
 * @module bquery/motion
 */

export type {
  AnimateOptions,
  EasingFunction,
  ElementBounds,
  FlipGroupOptions,
  FlipOptions,
  MorphOptions,
  ParallaxCleanup,
  ParallaxOptions,
  ScrollAnimateCleanup,
  ScrollAnimateOptions,
  SequenceOptions,
  SequenceStep,
  Spring,
  SpringConfig,
  StaggerFunction,
  StaggerOptions,
  TimelineConfig,
  TimelineControls,
  TimelineStep,
  TransitionOptions,
  TypewriterControls,
  TypewriterOptions,
} from './types';

export { animate } from './animate';
export {
  easeInCubic,
  easeInOutCubic,
  easeInOutQuad,
  easeInQuad,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  easeOutQuad,
  easingPresets,
  linear,
} from './easing';
export { capturePosition, flip, flipElements, flipList } from './flip';
export { keyframePresets } from './keyframes';
export { morphElement } from './morph';
export { parallax } from './parallax';
export { prefersReducedMotion, setReducedMotion } from './reduced-motion';
export { scrollAnimate } from './scroll';
export { spring, springPresets } from './spring';
export { stagger } from './stagger';
export { sequence, timeline } from './timeline';
export { transition } from './transition';
export { typewriter } from './typewriter';
