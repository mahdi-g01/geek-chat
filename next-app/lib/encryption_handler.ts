"use client";

import { getDeviceKeyPair } from "@/lib/device_handler";
import {arrayBufferToBase64, base64ToArrayBuffer} from "@/lib/utils";

export const ECDH_KEY_ALG = { name: "X25519", namedCurve: "X25519" } as const;
const HKDF_INFO = new TextEncoder().encode("geek-chat-e2ee-v1");
const AES_GCM_IV_LENGTH = 12;
const PAYLOAD_VERSION = 1;

export type EncryptedPayload = {
  v: number;
  nonce: string;
  ciphertext: string;
};

/**
 * Derives an AES-GCM key from ECDH shared secret (my private key + their public key base64).
 * Use this key for encryptMessage / decryptMessage. Call once per chat and reuse.
 */
export async function deriveSharedAesKey(otherPublicKeyBase64: string): Promise<CryptoKey> {
  const { privateKey } = await getDeviceKeyPair();
  const otherPublicKey = await crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(otherPublicKeyBase64),
    ECDH_KEY_ALG,
    true,
    []
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "X25519", public: otherPublicKey },
    privateKey,
    256
  );

  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedBits,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new ArrayBuffer(0),
      info: HKDF_INFO,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext with the shared AES key. Returns a JSON string of { v, nonce, ciphertext } (base64).
 */
export async function encryptMessage(sharedKey: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    sharedKey,
    encoded
  );

  const payload: EncryptedPayload = {
    v: PAYLOAD_VERSION,
    nonce: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
    ciphertext: arrayBufferToBase64(ciphertext),
  };
  return JSON.stringify(payload);
}

/**
 * Decrypts a payload string (JSON with v, nonce, ciphertext) using the shared AES key.
 */
export async function decryptMessage(sharedKey: CryptoKey, ciphertext: string): Promise<string> {
  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(ciphertext) as EncryptedPayload;
  } catch {
    throw new Error("encryption_handler: invalid encrypted payload");
  }

  if (payload.v !== PAYLOAD_VERSION || !payload.nonce || !payload.ciphertext) {
    throw new Error("encryption_handler: unsupported or malformed payload");
  }

  const iv = base64ToArrayBuffer(payload.nonce);
  const data = base64ToArrayBuffer(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as ArrayBuffer, tagLength: 128 },
    sharedKey,
    data as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Picks the other party's public key from chat encryption_property (the one that is not this device's).
 * Pass our public key base64 to determine which side we are; returns the other side's public key.
 */
export function getOtherPartyPublicKey(
  encryptionProperty: { initiator_public_key: string | null; responder_public_key: string | null },
  myPublicKeyBase64: string
): string | null {
  const init = encryptionProperty.initiator_public_key ?? "";
  const resp = encryptionProperty.responder_public_key ?? "";
  if (init === myPublicKeyBase64) return resp || null;
  if (resp === myPublicKeyBase64) return init || null;
  return null;
}
