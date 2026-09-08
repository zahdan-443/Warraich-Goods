# Palette's Journal - UX & Accessibility Learnings

## 2026-03-30 - Voice Toggle Button Accessibility in Bilingual Transport Apps
**Learning:** Icon buttons that toggle speech-to-text input require explicit dynamic `aria-label` and `aria-pressed` attributes in both application languages (Urdu & English) so screen readers communicate whether recording is active or idle.
**Action:** Always provide localized `aria-label` and `aria-pressed` attributes along with `focus-visible` ring indicators on toggle buttons performing device input actions.
