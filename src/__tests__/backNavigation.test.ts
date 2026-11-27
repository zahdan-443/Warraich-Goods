import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DOUBLE_BACK_EXIT_WINDOW_MS,
  evaluateDoubleBackExit,
  popTabHistory,
  pushTabHistory
} from '../utils/backNavigation';

function readProjectFile(relPath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf8');
}

describe('Back Navigation State Machine & Multi-Screen Invariants', () => {
  it('traces visited tab stack step-by-step (home -> addaPanel -> bilty -> addaPanel -> home)', () => {
    let stack = pushTabHistory(['home'], 'addaPanel');
    expect(stack).toEqual(['home', 'addaPanel']);

    stack = pushTabHistory(stack, 'bilty');
    expect(stack).toEqual(['home', 'addaPanel', 'bilty']);

    // Consecutive duplicate tabs must not bloat stack
    stack = pushTabHistory(stack, 'bilty');
    expect(stack).toEqual(['home', 'addaPanel', 'bilty']);

    // Step 1 back from bilty -> addaPanel
    const back1 = popTabHistory(stack, 'bilty');
    expect(back1.didStepBack).toBe(true);
    expect(back1.nextTab).toBe('addaPanel');
    expect(back1.nextStack).toEqual(['home', 'addaPanel']);

    // Step 2 back from addaPanel -> home
    const back2 = popTabHistory(back1.nextStack, back1.nextTab);
    expect(back2.didStepBack).toBe(true);
    expect(back2.nextTab).toBe('home');
    expect(back2.nextStack).toEqual(['home']);

    // Step 3 back when already on home -> does not pop further
    const back3 = popTabHistory(back2.nextStack, back2.nextTab);
    expect(back3.didStepBack).toBe(false);
    expect(back3.nextTab).toBe('home');
  });

  it('resets tab stack cleanly when navigating directly back to home', () => {
    const stack = pushTabHistory(['home', 'addaPanel', 'ledger'], 'home');
    expect(stack).toEqual(['home']);
  });

  it('enforces double-back exit ONLY on Dashboard (home) within 2000ms window', () => {
    // Non-home tabs must NEVER trigger exit even with recent timestamp
    const nonHomePress = evaluateDoubleBackExit({
      activeTab: 'addaPanel',
      lastPressTs: 1000,
      now: 1200
    });
    expect(nonHomePress).toEqual({
      shouldExit: false,
      showToast: false,
      nextLastPressTs: 0
    });

    // First Back press on home shows exit toast and records timestamp
    const firstHomePress = evaluateDoubleBackExit({
      activeTab: 'home',
      lastPressTs: 0,
      now: 5000
    });
    expect(firstHomePress).toEqual({
      shouldExit: false,
      showToast: true,
      nextLastPressTs: 5000
    });

    // Second Back press within 2000ms exits
    const secondQuickPress = evaluateDoubleBackExit({
      activeTab: 'home',
      lastPressTs: firstHomePress.nextLastPressTs,
      now: 5000 + DOUBLE_BACK_EXIT_WINDOW_MS - 1
    });
    expect(secondQuickPress).toEqual({
      shouldExit: true,
      showToast: false,
      nextLastPressTs: 0
    });

    // Expired timestamp (>= 2000ms) does NOT exit; re-arms toast instead
    const expiredPress = evaluateDoubleBackExit({
      activeTab: 'home',
      lastPressTs: 5000,
      now: 5000 + DOUBLE_BACK_EXIT_WINDOW_MS
    });
    expect(expiredPress).toEqual({
      shouldExit: false,
      showToast: true,
      nextLastPressTs: 5000 + DOUBLE_BACK_EXIT_WINDOW_MS
    });
  });

  it('keeps App.tsx unified 2-slot history guard, modal-first dispatch, and step-back routing', () => {
    const appSrc = readProjectFile('src/App.tsx');

    expect(appSrc).toContain("new CustomEvent('app-back-button', { cancelable: true })");
    expect(appSrc).toContain('dispatchModalBackEvent()');
    expect(appSrc).toContain('__wgRoot: true');
    expect(appSrc).toContain('__wgGuard: true');
    expect(appSrc).toContain('onBackToDashboard={handleUiStepBack}');
    expect(appSrc).toContain('onStepBack={handleUiStepBack}');
  });

  it('handles AddaPanelView and OwnerBranchesPanel nested step-back with defaultPrevented guard', () => {
    const addaSrc = readProjectFile('src/components/views/AddaPanelView.tsx');
    const branchesSrc = readProjectFile('src/components/OwnerBranchesPanel.tsx');

    expect(addaSrc).toContain("window.addEventListener('app-back-button', onBack)");
    expect(addaSrc).toContain('if (e.defaultPrevented) return;');
    expect(addaSrc).toContain('onStepBack');

    // Innermost modals & previews must appear inside stepBackInternal before resetting subModule to 'hub'
    const idxDelete = addaSrc.indexOf('if (pendingDeleteItem)');
    const idxPayment = addaSrc.indexOf('if (paymentModalBillId)');
    const idxPreview = addaSrc.indexOf("if (subModule === 'bill' && previewBill)");
    const idxParty = addaSrc.indexOf("if (subModule === 'bill' && selectedPartyKey)");
    const idxSubModule = addaSrc.indexOf("if (subModule !== 'hub')");
    expect(idxDelete).toBeGreaterThan(-1);
    expect(idxPayment).toBeGreaterThan(idxDelete);
    expect(idxPreview).toBeGreaterThan(idxPayment);
    expect(idxParty).toBeGreaterThan(idxPreview);
    expect(idxSubModule).toBeGreaterThan(idxParty);

    expect(branchesSrc).toContain("window.addEventListener('app-back-button', handleBack)");
    expect(branchesSrc).toContain('if (e.defaultPrevented) return;');
  });

  it('guards all overlay/view back handlers with defaultPrevented and removes unmatched history.pushState calls', () => {
    const biltySrc = readProjectFile('src/components/views/BiltyView.tsx');
    const homeSrc = readProjectFile('src/components/views/HomeView.tsx');
    const ledgerSrc = readProjectFile('src/components/views/LedgerView.tsx');
    const billsSrc = readProjectFile('src/components/views/khata/KhataBillsPanel.tsx');
    const headerSrc = readProjectFile('src/components/Header.tsx');

    expect(biltySrc).toContain("window.addEventListener('app-back-button', handleBack)");
    expect(biltySrc).not.toContain('window.history.pushState');
    expect(homeSrc).not.toContain('window.history.pushState');
    expect(homeSrc).toContain('if (e.defaultPrevented) return;');
    expect(ledgerSrc).toContain('if (e.defaultPrevented) return;');
    expect(billsSrc).toContain("window.addEventListener('app-modal-back', handleModalBack)");
    expect(headerSrc).toContain("window.addEventListener('app-modal-back', handleHardwareBack)");
  });

  it('leaves AndroidManifest.xml untouched against baseline SHA-256', () => {
    const manifestPath = path.resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml');
    if (fs.existsSync(manifestPath)) {
      const sha256 = crypto.createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex');
      expect(sha256).toBe('eb265574e07cf003dd8ed2ac83d94c9521a2e64418236b0d48d2a2e400adb944');
    }
  });
});
