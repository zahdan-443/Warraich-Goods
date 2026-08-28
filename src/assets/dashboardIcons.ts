export { PublicImage, getAssetCandidates } from '../components/PublicImage';
export type { PublicImageProps } from '../components/PublicImage';

/**
 * Dynamic and resilient public asset path resolver for Warraich Goods application.
 * Seamlessly resolves in Vite dev, iframe preview, GitHub Pages, Cloud Run container, and Android PWA wrappers.
 */
export function getAssetUrl(fileName: string): string {
  const clean = (fileName || '').replace(/^\.?\//, '');
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  return `${cleanBase}${clean}`;
}

// Exported standard public asset path strings
export const tripIconData: string = './trip-icon.png';
export const gariHisaabIconData: string = './gari-hisaab-icon.png';
export const vehicleIconData: string = './vehicle-icon.png';
export const licenseIconData: string = './license-icon.png';
export const echallanIconData: string = './echallan-icon.png';
export const safarDiaryIconData: string = './safar-diary-icon.png';
export const quickOpsIconData: string = './quick-ops-icon.png';
export const biltyIconData: string = './bilty-icon.png';
export const logoIconData: string = './logo.png';
export const appIconData: string = './app-icon.png';
export const splashScreenData: string = './splash.png';
export const splashScreenBackupData: string = './splash-screen.png';
export const scanMeQrData: string = './scan-me-qr.png';
export const tollIconData: string = './toll-icon.png';
export const icon192Data: string = './icon-192.png';
export const icon512Data: string = './icon-512.png';

// Alternate / legacy public filenames (some users or PWA wrappers may serve these variants)
export const tollIconAltData: string = './toll_icon.png';
export const splashScreenAltData: string = './splash-screen.png';

