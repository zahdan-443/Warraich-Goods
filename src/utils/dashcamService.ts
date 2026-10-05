import { registerPlugin, Capacitor } from '@capacitor/core';

export interface DashcamClip {
  id: string;
  filename: string;
  path: string;
  sizeBytes: number;
  durationSeconds: number;
  dateFormatted: string;
  timestamp: number;
  cameraType?: 'rear' | 'front' | 'single';
  pairId?: string;
  blobUrl?: string;
  thumbnailUrl?: string;
}

export interface DashcamStatus {
  isRecording: boolean;
  elapsedSeconds: number;
  currentFile?: string;
  currentRearFile?: string;
  currentFrontFile?: string;
  isDualMode?: boolean;
  dualSupported?: boolean;
  fallbackReason?: string;
}

export interface DualCameraCapability {
  supported: boolean;
  reason?: string;
  apiLevel?: number;
  androidVersion?: string;
}

interface NativeDashcamPlugin {
  startRecording(options?: { mode?: string }): Promise<{ started: boolean; mode?: string; dualSupported?: boolean; fallbackReason?: string; message: string }>;
  stopRecording(): Promise<{ stopped: boolean; message: string }>;
  getStatus(): Promise<{
    isRecording: boolean;
    elapsedSeconds: number;
    currentFile: string;
    currentRearFile?: string;
    currentFrontFile?: string;
    isDualMode?: boolean;
    dualSupported?: boolean;
    fallbackReason?: string;
  }>;
  listClips(): Promise<{ clips: DashcamClip[]; totalCount: number }>;
  deleteClip(options: { path?: string; filename?: string }): Promise<{ success: boolean }>;
  playClip(options: { path?: string; filename?: string }): Promise<{ success: boolean }>;
  checkPermissions(): Promise<{ camera: string; microphone: string }>;
  requestPermissions(): Promise<{ camera: string; microphone: string }>;
  checkDualCameraSupport(): Promise<DualCameraCapability>;
  addListener(eventName: 'recordingStatusChange', listenerFunc: (status: DashcamStatus) => void): Promise<any>;
}

const NativeDashcam = registerPlugin<NativeDashcamPlugin>('Dashcam');

export const isNativeDashcamAvailable = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Dashcam');
};

// ==========================================
// IndexedDB Storage for Web/Preview Fallback
// ==========================================
const DB_NAME = 'driver_dost_dashcam_db';
const DB_VERSION = 2;
const STORE_NAME = 'clips';

interface StoredWebClip {
  id: string;
  filename: string;
  sizeBytes: number;
  durationSeconds: number;
  dateFormatted: string;
  timestamp: number;
  cameraType: 'rear' | 'front' | 'single';
  pairId?: string;
  blob: Blob;
}

function openDashcamDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveWebClipToDB(clip: StoredWebClip): Promise<void> {
  const db = await openDashcamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(clip);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getWebClipsFromDB(): Promise<StoredWebClip[]> {
  const db = await openDashcamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items: StoredWebClip[] = req.result || [];
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

async function deleteWebClipFromDB(id: string): Promise<void> {
  const db = await openDashcamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Web MediaRecorder state
let webMediaStream: MediaStream | null = null;
let webMediaRecorder: MediaRecorder | null = null;
let webRecordedChunks: Blob[] = [];
let webRecordingStartTime = 0;
let webRecordingTimer: any = null;
let webElapsedSeconds = 0;
let webStatusListeners: ((status: DashcamStatus) => void)[] = [];
let webIsDualMode = false;
let webDualFallbackReason = '';

// ==========================================
// Public Dashcam Service API
// ==========================================

export async function checkDualCameraCapability(): Promise<DualCameraCapability> {
  if (isNativeDashcamAvailable()) {
    try {
      return await NativeDashcam.checkDualCameraSupport();
    } catch (e: any) {
      return {
        supported: false,
        reason: e?.message || 'Native dual camera check unavailable',
      };
    }
  }

  // Web check
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      if (videoInputs.length >= 2) {
        return {
          supported: true,
          reason: undefined,
        };
      } else {
        return {
          supported: false,
          reason: 'Only one video camera sensor was detected on this device. Dual-camera requires both front and rear hardware sensors.',
        };
      }
    } catch (e: any) {
      return {
        supported: false,
        reason: 'Unable to query browser media devices: ' + e?.message,
      };
    }
  }

  return {
    supported: false,
    reason: 'Device environment does not support media device enumeration.',
  };
}

export async function checkDashcamPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
  if (isNativeDashcamAvailable()) {
    try {
      const status = await NativeDashcam.checkPermissions();
      return {
        camera: status.camera === 'granted',
        microphone: status.microphone === 'granted',
      };
    } catch {
      return { camera: false, microphone: false };
    }
  }

  // Web check
  if (typeof navigator !== 'undefined' && navigator.permissions) {
    try {
      const camPerm = await navigator.permissions.query({ name: 'camera' as any });
      const micPerm = await navigator.permissions.query({ name: 'microphone' as any });
      return {
        camera: camPerm.state === 'granted',
        microphone: micPerm.state === 'granted',
      };
    } catch {
      // Fallback
    }
  }
  return { camera: false, microphone: false };
}

export async function requestDashcamPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.requestPermissions();
      return {
        camera: res.camera === 'granted',
        microphone: res.microphone === 'granted',
      };
    } catch (e) {
      console.warn('Native permission request error', e);
      return { camera: false, microphone: false };
    }
  }

  // Web request
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return { camera: true, microphone: true };
  } catch (err) {
    console.warn('Web media permission denied', err);
    return { camera: false, microphone: false };
  }
}

export async function startDashcamRecording(options?: {
  mode?: 'auto' | 'dual' | 'rear';
  videoElement?: HTMLVideoElement | null;
}): Promise<{
  success: boolean;
  message?: string;
  isDualMode?: boolean;
  dualSupported?: boolean;
  fallbackReason?: string;
}> {
  const mode = options?.mode || 'auto';

  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.startRecording({ mode });
      return {
        success: res.started,
        message: res.message,
        isDualMode: res.dualSupported && mode !== 'rear',
        dualSupported: res.dualSupported,
        fallbackReason: res.fallbackReason,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to start native recording' };
    }
  }

  // Web Fallback Implementation with MediaRecorder
  try {
    if (webMediaRecorder && webMediaRecorder.state === 'recording') {
      return { success: true, message: 'Already recording' };
    }

    const dualCheck = await checkDualCameraCapability();
    const canDoDual = mode !== 'rear' && dualCheck.supported;
    webIsDualMode = canDoDual;
    webDualFallbackReason = canDoDual ? '' : (dualCheck.reason || 'Single camera mode active');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    });

    webMediaStream = stream;
    if (options?.videoElement) {
      options.videoElement.srcObject = stream;
      options.videoElement.play().catch(() => {});
    }

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
    }

    webRecordedChunks = [];
    webMediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    webMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        webRecordedChunks.push(e.data);
      }
    };

    webRecordingStartTime = Date.now();
    webElapsedSeconds = 0;
    webMediaRecorder.start(1000); // chunk every 1s

    clearInterval(webRecordingTimer);
    webRecordingTimer = setInterval(() => {
      webElapsedSeconds = Math.floor((Date.now() - webRecordingStartTime) / 1000);
      notifyStatusListeners({
        isRecording: true,
        elapsedSeconds: webElapsedSeconds,
        currentFile: 'Live Recording (Road Camera)',
        isDualMode: webIsDualMode,
        dualSupported: dualCheck.supported,
        fallbackReason: webDualFallbackReason,
      });
    }, 1000);

    notifyStatusListeners({
      isRecording: true,
      elapsedSeconds: 0,
      currentFile: 'Live Recording (Road Camera)',
      isDualMode: webIsDualMode,
      dualSupported: dualCheck.supported,
      fallbackReason: webDualFallbackReason,
    });

    return {
      success: true,
      message: 'Dashcam recording started',
      isDualMode: webIsDualMode,
      dualSupported: dualCheck.supported,
      fallbackReason: webDualFallbackReason,
    };
  } catch (err: any) {
    console.error('Web dashcam recording error:', err);
    return { success: false, message: err?.message || 'Could not access camera/microphone.' };
  }
}

export async function stopDashcamRecording(): Promise<{ success: boolean; clip?: DashcamClip }> {
  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.stopRecording();
      return { success: res.stopped };
    } catch (err) {
      console.error('Native stop recording error', err);
      return { success: false };
    }
  }

  // Web stop
  return new Promise((resolve) => {
    if (!webMediaRecorder || webMediaRecorder.state === 'inactive') {
      clearInterval(webRecordingTimer);
      notifyStatusListeners({ isRecording: false, elapsedSeconds: 0, isDualMode: false });
      resolve({ success: false });
      return;
    }

    const durationSec = Math.max(1, Math.floor((Date.now() - webRecordingStartTime) / 1000));
    clearInterval(webRecordingTimer);

    webMediaRecorder.onstop = async () => {
      try {
        const mimeType = webMediaRecorder?.mimeType || 'video/mp4';
        const blob = new Blob(webRecordedChunks, { type: mimeType });

        // Release camera tracks
        if (webMediaStream) {
          webMediaStream.getTracks().forEach((track) => track.stop());
          webMediaStream = null;
        }

        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const filename = `dashcam_rear_${timestampStr}.mp4`;
        const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const storedItem: StoredWebClip = {
          id: filename,
          filename,
          sizeBytes: blob.size,
          durationSeconds: durationSec,
          dateFormatted,
          timestamp: now.getTime(),
          cameraType: 'rear',
          pairId: timestampStr,
          blob,
        };

        await saveWebClipToDB(storedItem);

        const clip: DashcamClip = {
          id: storedItem.id,
          filename: storedItem.filename,
          path: URL.createObjectURL(blob),
          sizeBytes: storedItem.sizeBytes,
          durationSeconds: storedItem.durationSeconds,
          dateFormatted: storedItem.dateFormatted,
          timestamp: storedItem.timestamp,
          cameraType: 'rear',
          pairId: timestampStr,
          blobUrl: URL.createObjectURL(blob),
        };

        notifyStatusListeners({ isRecording: false, elapsedSeconds: 0, isDualMode: false });
        resolve({ success: true, clip });
      } catch (err) {
        console.error('Error saving web clip', err);
        resolve({ success: false });
      } finally {
        webRecordedChunks = [];
        webMediaRecorder = null;
      }
    };

    webMediaRecorder.stop();
  });
}

export async function getDashcamStatus(): Promise<DashcamStatus> {
  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.getStatus();
      return {
        isRecording: res.isRecording,
        elapsedSeconds: res.elapsedSeconds,
        currentFile: res.currentFile,
        currentRearFile: res.currentRearFile,
        currentFrontFile: res.currentFrontFile,
        isDualMode: res.isDualMode,
        dualSupported: res.dualSupported,
        fallbackReason: res.fallbackReason,
      };
    } catch {
      return { isRecording: false, elapsedSeconds: 0 };
    }
  }

  return {
    isRecording: !!(webMediaRecorder && webMediaRecorder.state === 'recording'),
    elapsedSeconds: webElapsedSeconds,
    currentFile: webMediaRecorder ? 'Live Recording (Road Camera)' : undefined,
    isDualMode: webIsDualMode,
    dualSupported: false,
    fallbackReason: webDualFallbackReason,
  };
}

export async function listDashcamClips(): Promise<DashcamClip[]> {
  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.listClips();
      return res.clips || [];
    } catch (e) {
      console.warn('Native listClips error', e);
      return [];
    }
  }

  // Web Clips from IndexedDB
  try {
    const stored = await getWebClipsFromDB();
    return stored.map((s) => ({
      id: s.id,
      filename: s.filename,
      path: URL.createObjectURL(s.blob),
      sizeBytes: s.sizeBytes,
      durationSeconds: s.durationSeconds,
      dateFormatted: s.dateFormatted,
      timestamp: s.timestamp,
      cameraType: s.cameraType || (s.filename.includes('_front_') ? 'front' : s.filename.includes('_rear_') ? 'rear' : 'single'),
      pairId: s.pairId,
      blobUrl: URL.createObjectURL(s.blob),
    }));
  } catch (err) {
    console.warn('Failed to retrieve web clips', err);
    return [];
  }
}

export async function deleteDashcamClip(clip: DashcamClip): Promise<boolean> {
  if (isNativeDashcamAvailable()) {
    try {
      const res = await NativeDashcam.deleteClip({ path: clip.path, filename: clip.filename });
      return res.success;
    } catch {
      return false;
    }
  }

  try {
    await deleteWebClipFromDB(clip.id);
    return true;
  } catch {
    return false;
  }
}

export async function playDashcamClip(clip: DashcamClip): Promise<void> {
  if (isNativeDashcamAvailable()) {
    try {
      await NativeDashcam.playClip({ path: clip.path, filename: clip.filename });
      return;
    } catch (e) {
      console.warn('Native playClip error', e);
    }
  }

  // For web, if it has a blobUrl, open in new tab or trigger download
  if (clip.blobUrl) {
    window.open(clip.blobUrl, '_blank');
  }
}

export function subscribeDashcamStatus(listener: (status: DashcamStatus) => void): () => void {
  webStatusListeners.push(listener);
  return () => {
    webStatusListeners = webStatusListeners.filter((l) => l !== listener);
  };
}

function notifyStatusListeners(status: DashcamStatus) {
  webStatusListeners.forEach((l) => {
    try {
      l(status);
    } catch {}
  });
}
