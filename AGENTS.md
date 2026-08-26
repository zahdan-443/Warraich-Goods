# Project Guidelines & Persistent Rules

## 1. Public Assets & Image Upload Policy (Strict Rule)
- **Do NOT edit, modify, replace, overwrite, or delete** any PNG or media files uploaded by the user from GitHub or file explorer into the `/public` directory.
- All user-uploaded PNG assets in `/public` are considered permanent and authoritative.
- Never treat user-provided `/public` image assets as file differences to be overwritten during code generation or GitHub sync.

## 2. Bilty Generator Access Control
- The Bilty Generator feature, navigation button, and creation tabs are strictly restricted and must only be visible and accessible to the authenticated App Owner (`warraichgoods43@gmail.com`).
- For guests and all other users, keep the Bilty creation interfaces hidden and protected.

## 3. Instant Guest Mode & Non-Blocking Experience
- The app must open directly and immediately without forcing blocking login popups or modal gates.
- All core trip calculation, toll, and log tools must work seamlessly in guest mode using local device storage.
- Sign-in should strictly occur on-demand when the user clicks the "Sign In" button.

## 4. Notifications & System Status Bar
- Maintain native device status bar and notification panel push alerts via Service Worker and Notifications API for all important transport operations (saved trips, vehicles, fuel logs, etc.).
