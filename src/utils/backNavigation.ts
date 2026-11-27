import type { ActiveTab } from '../types';

export const DOUBLE_BACK_EXIT_WINDOW_MS = 2000;
const MAX_TAB_HISTORY_LENGTH = 30;

/**
 * Pure tab history stack helper.
 * - Navigating to 'home' resets the history root cleanly to ['home'].
 * - Navigating to a non-home tab pushes it onto the stack (avoiding consecutive duplicates).
 */
export function pushTabHistory(stack: ActiveTab[], nextTab: ActiveTab): ActiveTab[] {
  if (nextTab === 'home') {
    return ['home'];
  }
  const normalized: ActiveTab[] = stack.length > 0 ? [...stack] : ['home'];
  if (normalized[0] !== 'home') {
    normalized.unshift('home');
  }
  if (normalized[normalized.length - 1] === nextTab) {
    return normalized;
  }
  normalized.push(nextTab);
  if (normalized.length > MAX_TAB_HISTORY_LENGTH) {
    return ['home', ...normalized.slice(-(MAX_TAB_HISTORY_LENGTH - 1))];
  }
  return normalized;
}

/**
 * Pops one step back from the tab history stack.
 * When already at Dashboard root ('home'), reports `didStepBack: false`.
 */
export function popTabHistory(
  stack: ActiveTab[],
  currentTab: ActiveTab
): {
  nextTab: ActiveTab;
  nextStack: ActiveTab[];
  didStepBack: boolean;
} {
  if (currentTab === 'home') {
    return {
      nextTab: 'home',
      nextStack: ['home'],
      didStepBack: false
    };
  }

  const working: ActiveTab[] = stack.length > 0 ? [...stack] : ['home', currentTab];
  if (working[0] !== 'home') {
    working.unshift('home');
  }

  while (working.length > 1 && working[working.length - 1] === currentTab) {
    working.pop();
  }

  const nextTab = working[working.length - 1] || 'home';
  const nextStack: ActiveTab[] = nextTab === 'home' ? ['home'] : working;

  return {
    nextTab,
    nextStack,
    didStepBack: true
  };
}

/**
 * Evaluates whether pressing Back should exit the application.
 * Guarantees exit can ONLY happen when already on Dashboard ('home')
 * and pressed twice within `windowMs` (default 2000ms).
 */
export function evaluateDoubleBackExit(params: {
  activeTab: ActiveTab;
  lastPressTs: number;
  now: number;
  windowMs?: number;
}): {
  shouldExit: boolean;
  showToast: boolean;
  nextLastPressTs: number;
} {
  const { activeTab, lastPressTs, now, windowMs = DOUBLE_BACK_EXIT_WINDOW_MS } = params;

  if (activeTab !== 'home') {
    return {
      shouldExit: false,
      showToast: false,
      nextLastPressTs: 0
    };
  }

  if (lastPressTs > 0 && now - lastPressTs < windowMs) {
    return {
      shouldExit: true,
      showToast: false,
      nextLastPressTs: 0
    };
  }

  return {
    shouldExit: false,
    showToast: true,
    nextLastPressTs: now
  };
}

/**
 * Dispatches cancelable modal-level then view-level back events on window.
 */
export function dispatchModalBackEvent(): boolean {
  if (typeof window === 'undefined') return false;
  const ev = new CustomEvent('app-modal-back', { cancelable: true });
  window.dispatchEvent(ev);
  return ev.defaultPrevented;
}

export function dispatchViewBackEvent(): boolean {
  if (typeof window === 'undefined') return false;
  const ev = new CustomEvent('app-back-button', { cancelable: true });
  window.dispatchEvent(ev);
  return ev.defaultPrevented;
}
