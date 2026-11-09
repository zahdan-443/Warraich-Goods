export interface DashcamClip {
  id: string;
  filename: string;
  path: string;
  sizeBytes: number;
  durationSeconds: number;
  recordedAt: string;
  isDual: boolean;
  rearPath?: string;
  rearFilename?: string;
}

export interface DashcamStatus {
  isRecording: boolean;
  elapsedSeconds: number;
  currentFile: string;
  currentRearFile?: string;
  isDualMode: boolean;
  dualSupported: boolean;
  fallbackReason?: string;
}

export interface DualCameraCapability {
  supported: boolean;
  reason?: string;
}

export const isNativeDashcamAvailable = (): boolean => false;
export const getDashcamPlatform = (): 'native' | 'web' => 'web';

export async function checkDualCameraCapability(): Promise<DualCameraCapability> {
  return { supported: false, reason: 'Dashcam is disabled in this store build.' };
}

export async function checkDashcamPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
  return { camera: false, microphone: false };
}

export async function requestDashcamPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
  return { camera: false, microphone: false };
}

export async function startDashcamRecording(): Promise<{ success: boolean; message: string }> {
  return { success: false, message: 'Dashcam is not available in this build.' };
}

export async function stopDashcamRecording(): Promise<{ success: boolean; clip?: DashcamClip }> {
  return { success: true };
}

export async function getDashcamStatus(): Promise<DashcamStatus> {
  return {
    isRecording: false,
    elapsedSeconds: 0,
    currentFile: '',
    isDualMode: false,
    dualSupported: false,
    fallbackReason: 'Store build'
  };
}

export async function listDashcamClips(): Promise<DashcamClip[]> {
  return [];
}

export async function deleteDashcamClip(): Promise<boolean> {
  return false;
}

export async function playDashcamClip(): Promise<void> {}

export async function shareDashcamClip(): Promise<boolean> {
  return false;
}

export function subscribeDashcamStatus(): () => void {
  return () => {};
}
