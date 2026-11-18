import { getBaseUrl } from '../components/PublicImage';
import {
  NEUTRAL_OFFICIAL_EMBLEM_FILE,
  NEUTRAL_ICON_FILE,
  LEGACY_OFFICIAL_EMBLEM_FILE,
  LEGACY_ICON_FILE
} from '../utils/assetResolver';
import biltyWatermarkBgImported from './images/bilty_watermark_bg_1794821577675.jpg';
export { PublicImage, getAssetCandidates, getBaseUrl } from '../components/PublicImage';
export type { PublicImageProps } from '../components/PublicImage';

export const biltyWatermarkBgData: string = biltyWatermarkBgImported;

/**
 * Dynamic and resilient public asset path resolver for Warraich Goods application.
 * Seamlessly resolves in Vite dev, iframe preview, GitHub Pages, Cloud Run container, and Android PWA wrappers.
 */
export function getAssetUrl(fileName: string): string {
  const clean = (fileName || '').replace(/^\.?\//, '');
  const baseUrl = getBaseUrl();
  return `${baseUrl}${clean}`;
}

// Exported standard public asset path strings
export const tripIconData: string = './trip-icon.png';
export const ledgerIconData: string = './ledger-icon.png';
export const gariHisaabIconData: string = './gari-hisaab-icon.png';
export const vehicleIconData: string = './vehicle-icon.png';
export const licenseIconData: string = './license-icon.png';
export const echallanIconData: string = './echallan-icon.png';
export const safarDiaryIconData: string = './safar-diary-icon.png';
export const quickOpsIconData: string = './quick-ops-icon.png';
export const mapIconData: string = './map-icon.png';
export const docOfficialIconData: string = `./${NEUTRAL_OFFICIAL_EMBLEM_FILE}`;
export const docIconData: string = `./${NEUTRAL_ICON_FILE}`;
export const biltyOfficialIconData: string = docOfficialIconData;
export const biltyIconData: string = docOfficialIconData;
export const biltyIconLegacyData: string = `./${LEGACY_OFFICIAL_EMBLEM_FILE}`;
export const biltyIconFallbackData: string = `./${LEGACY_ICON_FILE}`;
export const logoIconData: string = './logo.png';
export const appIconData: string = './app-icon.png';
export const splashScreenData: string = './splash.png';
export const splashScreenBackupData: string = './splash-screen.png';
export const scanMeQrData: string = './scan-me-qr.png';
export const tollIconData: string = './toll-icon.png';
export const icon192Data: string = './icon-192.png';
export const icon512Data: string = './icon-512.png';
export const companyCardData: string = biltyWatermarkBgImported;
export const warraichCardData: string = biltyWatermarkBgImported;
export const dashcamIconData: string = './dashcam-icon.png';

// Alternate / legacy public filenames (some users or PWA wrappers may serve these variants)
export const tollIconAltData: string = './toll_icon.png';
export const splashScreenAltData: string = './splash-screen.png';
export const companyCardAltData: string = './warraich-card.png';

