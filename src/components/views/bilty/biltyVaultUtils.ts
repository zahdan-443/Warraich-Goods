import { BiltyLegalVault } from '../../../types';

export type LegalVaultImageKey = Exclude<keyof BiltyLegalVault, 'recordings' | 'updatedAt'>;

export const LEGAL_VAULT_IMAGE_KEYS: readonly LegalVaultImageKey[] = [
  'driverPhoto',
  'driverLicense',
  'driverCnic',
  'vehiclePhoto',
  'senderPhoto',
  'senderCnic',
  'receiverPhoto',
  'receiverCnic'
];

export function countLegalVaultAttachments(vault?: BiltyLegalVault): number {
  if (!vault) return 0;
  const imgCount = LEGAL_VAULT_IMAGE_KEYS.filter((k) => Boolean(vault[k])).length;
  return imgCount + (vault.recordings?.length || 0);
}
