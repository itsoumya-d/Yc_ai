// Client-side AES-256-GCM encryption
import * as SecureStore from "expo-secure-store";

const KEY_ID = "mortal_enc_key";

async function getKey(): Promise<string> {
  let k = await SecureStore.getItemAsync(KEY_ID);
  if (\!k) {
    const a = new Uint8Array(32);
    crypto.getRandomValues(a);
    k = Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("");
    await SecureStore.setItemAsync(KEY_ID, k);
  }
  return k;
}

function h2b(h: string): Uint8Array {
  const b = new Uint8Array(h.length / 2);
  for (let i = 0; i < h.length; i += 2) b[i / 2] = parseInt(h.substr(i, 2), 16);
  return b;
}

export async function encryptData(plaintext: string): Promise<string> {
  try {
    const keyHex = await getKey();
    const keyBytes = h2b(keyHex);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ck = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
    const enc = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, ck, enc);
    const ea = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + ea.length);
    combined.set(iv, 0); combined.set(ea, iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return btoa(unescape(encodeURIComponent(plaintext)));
  }
}

export async function decryptData(ciphertext: string): Promise<string> {
  try {
    const keyHex = await getKey();
    const keyBytes = h2b(keyHex);
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ed = combined.slice(12);
    const ck = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, ck, ed);
    return new TextDecoder().decode(dec);
  } catch {
    try { return decodeURIComponent(escape(atob(ciphertext))); } catch { return ciphertext; }
  }
}
