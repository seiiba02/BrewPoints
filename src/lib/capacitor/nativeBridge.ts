'use client';

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Clipboard } from '@capacitor/clipboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export type CapacitorRuntimePlatform = 'ios' | 'android' | 'web';

/**
 * Returns whether the React app is currently executing inside a native
 * iOS or Android Capacitor shell.
 */
export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
}

/**
 * Returns the active Capacitor platform ('ios' | 'android' | 'web').
 */
export function getCapacitorPlatform(): CapacitorRuntimePlatform {
  if (typeof window === 'undefined') return 'web';
  const platform = Capacitor.getPlatform();
  if (platform === 'ios' || platform === 'android') return platform;
  return 'web';
}

const memoryAuthFallback = new Map<string, string>();

/**
 * Supabase Auth-compatible async key-value storage adapter backed by
 * @capacitor/preferences on iOS/Android, localStorage on Web, and in-memory Map in Node/SSR.
 */
export const CapacitorAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isCapacitorNative()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryAuthFallback.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isCapacitorNative()) {
      await Preferences.set({ key, value });
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryAuthFallback.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isCapacitorNative()) {
      await Preferences.remove({ key });
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    memoryAuthFallback.delete(key);
  },
};

/**
 * Triggers native tactile feedback via @capacitor/haptics on iOS/Android
 * (gracefully no-ops or uses navigator.vibrate on Web).
 */
export async function triggerFoundryHaptic(
  kind: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> {
  try {
    if (isCapacitorNative()) {
      switch (kind) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
      return;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(kind === 'heavy' || kind === 'success' ? 20 : 8);
    }
  } catch {
    // Ignore haptic errors on unsupported devices
  }
}

/**
 * Copies text to the device clipboard using @capacitor/clipboard on native
 * shells or navigator.clipboard on Web.
 */
export async function copyTextWithCapacitor(value: string): Promise<boolean> {
  try {
    if (isCapacitorNative()) {
      await Clipboard.write({ string: value });
      await triggerFoundryHaptic('light');
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Ignore clipboard write errors
  }
  return false;
}

/**
 * Reads text from the device clipboard using @capacitor/clipboard on native
 * shells or navigator.clipboard on Web.
 */
export async function readTextWithCapacitor(): Promise<string> {
  try {
    if (isCapacitorNative()) {
      const { value } = await Clipboard.read();
      return value?.trim() ?? '';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      return text.trim();
    }
  } catch {
    // Ignore clipboard read errors
  }
  return '';
}

/**
 * Configures the native iOS/Android StatusBar to match the BrewFlow theme.
 */
export async function configureFoundryStatusBar(
  color = '#111827',
  style: 'light' | 'dark' = 'light'
): Promise<void> {
  if (!isCapacitorNative()) return;
  try {
    await StatusBar.setStyle({ style: style === 'light' ? Style.Light : Style.Dark });
    if (getCapacitorPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color });
    }
  } catch {
    // Ignore status bar errors on non-supported platforms
  }
}

/**
 * Registers a listener for deep-link custom scheme URLs (`brewpoints://allocate?token=...`
 * and `brewpoints://redeem?token=...`) opened in the native Capacitor app.
 */
export function registerBrewPointsDeepLinkListener(
  onDeepLinkPayload: (uri: string) => void
): () => void {
  if (!isCapacitorNative()) {
    return () => {};
  }
  let removeFn: (() => void) | null = null;
  App.addListener('appUrlOpen', (event) => {
    if (event.url?.startsWith('brewpoints://')) {
      onDeepLinkPayload(event.url);
    }
  }).then((handle) => {
    removeFn = () => {
      void handle.remove();
    };
  });

  return () => {
    if (removeFn) removeFn();
  };
}
