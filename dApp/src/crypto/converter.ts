import { Buffer } from 'buffer';
/* eslint-disable @typescript-eslint/ban-ts-comment, no-bitwise */
// @ts-ignore (no type definitions for crc are available)
import crc from 'crc';

export const uint8ArrayToBigInt = (array: Uint8Array): bigint => {
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
  if (typeof view.getBigUint64 === 'function') {
    return view.getBigUint64(0);
  }
  const high = BigInt(view.getUint32(0));
  const low = BigInt(view.getUint32(4));

  return (high << BigInt(32)) + low;
};

export const arrayBufferToArrayOfNumber = (
  buffer: ArrayBuffer
): Array<number> => {
  const typedArray = new Uint8Array(buffer);
  return Array.from(typedArray);
};

export const arrayOfNumberToUint8Array = (
  numbers: Array<number>
): Uint8Array => new Uint8Array(numbers);

export const arrayOfNumberToArrayBuffer = (
  numbers: Array<number>
): ArrayBuffer => arrayOfNumberToUint8Array(numbers).buffer;

export const numberToArrayBuffer = (
  value: number,
  byteLength: number
): ArrayBuffer => {
  const buffer = new ArrayBuffer(byteLength);
  new DataView(buffer).setUint32(byteLength - 4, value);
  return buffer;
};

export const asciiStringToByteArray = (text: string): Array<number> => Array.from(text).map((c) => c.charCodeAt(0));

export const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

// 4 bytes
export const calculateCrc32 = (bytes: Uint8Array): Uint8Array => {
  const checksumArrayBuf = new ArrayBuffer(4);
  const view = new DataView(checksumArrayBuf);
  view.setUint32(0, crc.crc32(Buffer.from(bytes)), false);
  return Buffer.from(checksumArrayBuf);
};

export type AccountIdentifier = string;
