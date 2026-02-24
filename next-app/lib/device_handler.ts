"use client";

import { getPreference, setPreference } from "@/global/functions/capacitor_preferences";
import {ECDH_KEY_ALG} from "@/lib/encryption_handler";
import {arrayBufferToBase64, base64ToArrayBuffer} from "@/lib/utils";

const DEVICE_PUBLIC_KEY_PREF = "device_public_key";
const DEVICE_PRIVATE_KEY_PREF = "device_private_key";

const KEY_USAGE: KeyUsage[] = ["deriveBits", "deriveKey"];

/**
 * Generates a new X25519 key pair for this device, stores the private and public
 * keys in local preferences (private key never leaves the device). Returns the
 * raw public key as base64 for registering the device with the backend.
 */
export async function createDeviceKeys(): Promise<{ publicKeyBase64: string }> {
  const pair = await crypto.subtle.generateKey(
    ECDH_KEY_ALG,
    true,
    KEY_USAGE
  );

  const [publicKeyRaw, privateKeyPkcs8] = await Promise.all([
    crypto.subtle.exportKey("raw", pair.publicKey),
    crypto.subtle.exportKey("pkcs8", pair.privateKey),
  ]);

  const publicKeyBase64 = arrayBufferToBase64(publicKeyRaw);
  const privateKeyBase64 = arrayBufferToBase64(privateKeyPkcs8);

  await Promise.all([
    setPreference(DEVICE_PUBLIC_KEY_PREF, publicKeyBase64),
    setPreference(DEVICE_PRIVATE_KEY_PREF, privateKeyBase64),
  ]);

  return { publicKeyBase64 };
}

/**
 * Returns whether this device has stored key material (and is ready for E2EE).
 */
export async function hasStoredDeviceKeys(): Promise<boolean> {
  const pub = await getPreference(DEVICE_PUBLIC_KEY_PREF);
  const priv = await getPreference(DEVICE_PRIVATE_KEY_PREF);
  return Boolean(pub && priv);
}

/**
 * Returns the stored public key as base64, or null if none.
 */
export async function getStoredPublicKeyBase64(): Promise<string | null> {
  const value = await getPreference(DEVICE_PUBLIC_KEY_PREF);
  return value ?? null;
}

/**
 * Merges device public key (and optional device_name, device_type) into the given
 * object. Use before sending auth/login or auth/logout so the backend receives device info.
 */
export async function injectDeviceInfo<T extends Record<string, unknown>>(
  obj: T
): Promise<T & { public_key?: string; device_name?: string; device_type?: string }> {
  const publicKey = await getStoredPublicKeyBase64();
  return {
    ...obj,
    ...(publicKey ? { public_key: publicKey } : {}),
  } as T & { public_key?: string; device_name?: string; device_type?: string };
}

/**
 * Imports the stored key pair into CryptoKey objects for use by the encryption
 * handler. Call only when hasStoredDeviceKeys() is true.
 */
export async function getDeviceKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const pubB64 = await getPreference(DEVICE_PUBLIC_KEY_PREF);
  const privB64 = await getPreference(DEVICE_PRIVATE_KEY_PREF);

  if (!pubB64 || !privB64) {
    throw new Error("Device keys not found. Call createDeviceKeys() first.");
  }

  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(pubB64),
      ECDH_KEY_ALG,
      true,
      []
    ),
    crypto.subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(privB64),
      ECDH_KEY_ALG,
      true,
      KEY_USAGE
    ),
  ]);

  return { publicKey, privateKey };
}
