import crypto from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

export const createSalt = () => crypto.randomBytes(16).toString('hex');

export const hashPassword = (password, salt) =>
  crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');

export const verifyPassword = (password, salt, expectedHash) =>
  crypto.timingSafeEqual(
    Buffer.from(hashPassword(password, salt), 'hex'),
    Buffer.from(expectedHash, 'hex'),
  );

export const createToken = (size = 32) => crypto.randomBytes(size).toString('hex');
