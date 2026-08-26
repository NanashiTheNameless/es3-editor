import assert from 'node:assert/strict';
import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  webcrypto
} from 'node:crypto';
import test from 'node:test';

import { decryptEs3, encryptEs3 } from '../components/es3Crypto.mjs';

const password = 'pässword🔐';
const plaintext = Buffer.from('Synthetic ES3 compatibility fixture\n');
const iv = Uint8Array.from({ length: 16 }, (_, index) => index);

function encryptWithNode(data) {
  const key = pbkdf2Sync(password, iv, 100, 16, 'sha1');
  const cipher = createCipheriv('aes-128-cbc', key, iv);
  return Buffer.concat([Buffer.from(iv), cipher.update(data), cipher.final()]);
}

function decryptWithNode(data) {
  const fileIv = data.subarray(0, 16);
  const key = pbkdf2Sync(password, fileIv, 100, 16, 'sha1');
  const decipher = createDecipheriv('aes-128-cbc', key, fileIv);
  return Buffer.concat([decipher.update(data.subarray(16)), decipher.final()]);
}

test('Web Crypto encryption matches the previous Node-compatible ES3 format', async () => {
  const encrypted = await encryptEs3(plaintext, password, webcrypto, iv);
  assert.deepEqual(Buffer.from(encrypted), encryptWithNode(plaintext));
});

test('Web Crypto decrypts data produced by the previous implementation', async () => {
  const encrypted = encryptWithNode(plaintext);
  const decrypted = await decryptEs3(encrypted, password, webcrypto);
  assert.deepEqual(Buffer.from(decrypted), plaintext);
});

test('the previous implementation decrypts Web Crypto output', async () => {
  const encrypted = await encryptEs3(plaintext, password, webcrypto, iv);
  assert.deepEqual(decryptWithNode(Buffer.from(encrypted)), plaintext);
});

test('short encrypted input is rejected clearly', async () => {
  await assert.rejects(
    decryptEs3(new Uint8Array(16), password, webcrypto),
    /too short/
  );
});
