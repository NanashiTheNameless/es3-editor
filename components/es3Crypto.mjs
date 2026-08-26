const AES_KEY_BITS = 128;
const IV_BYTES = 16;
const PBKDF2_ITERATIONS = 100;

function getCrypto(cryptoApi) {
  if (!cryptoApi?.subtle)
    throw new Error('Web Crypto API is unavailable');

  return cryptoApi;
}

async function deriveKey(password, salt, usage, cryptoApi) {
  const crypto = getCrypto(cryptoApi);
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-1'
    },
    passwordKey,
    { name: 'AES-CBC', length: AES_KEY_BITS },
    false,
    [usage]
  );
}

function concatenate(first, second) {
  const combined = new Uint8Array(first.byteLength + second.byteLength);
  combined.set(first, 0);
  combined.set(second, first.byteLength);
  return combined;
}

export async function encryptEs3(data, password, cryptoApi = globalThis.crypto, suppliedIv) {
  const crypto = getCrypto(cryptoApi);
  const iv = suppliedIv
    ? new Uint8Array(suppliedIv)
    : crypto.getRandomValues(new Uint8Array(IV_BYTES));

  if (iv.byteLength !== IV_BYTES)
    throw new Error(`AES-CBC initialization vector must be ${IV_BYTES} bytes`);

  const key = await deriveKey(password, iv, 'encrypt', crypto);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  ));

  return concatenate(iv, encrypted);
}

export async function decryptEs3(data, password, cryptoApi = globalThis.crypto) {
  if (data.byteLength <= IV_BYTES)
    throw new Error('Encrypted ES3 data is too short');

  const crypto = getCrypto(cryptoApi);
  const iv = new Uint8Array(data.buffer, data.byteOffset, IV_BYTES);
  const encrypted = new Uint8Array(
    data.buffer,
    data.byteOffset + IV_BYTES,
    data.byteLength - IV_BYTES
  );
  const key = await deriveKey(password, iv, 'decrypt', crypto);

  return new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encrypted
  ));
}
