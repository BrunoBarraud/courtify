import crypto from 'crypto';

// The encryption key should be 32 bytes (256 bits) long. 
// In production MUST come from an environment variable (e.g. 64-char hex string)
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    // If it's a hex string, convert it. If it's raw, pad/slice it to 32 bytes.
    return Buffer.from(envKey.padEnd(32, '0').slice(0, 32));
  }
  // Fallback for dev ONLY. Do NOT use a static fallback in production!
  console.warn('WARNING: Using fallback encryption key. Set ENCRYPTION_KEY in .env!');
  return Buffer.from('default_dev_encryption_key_32_by_'); // 32 chars
};

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

export function decrypt(textHex: string, ivHex: string) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(Buffer.from(textHex, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
