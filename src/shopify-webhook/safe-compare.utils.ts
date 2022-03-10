import { timingSafeEqual } from 'crypto';

export default function safeCompare(strA: any, strB: any) {
  if (typeof strA === typeof strB) {
    let buffA: Buffer;
    let buffB: Buffer;

    if (typeof strA === 'object' && typeof strB === 'object') {
      buffA = Buffer.from(JSON.stringify(strA));
      buffB = Buffer.from(JSON.stringify(strB));
    } else {
      buffA = Buffer.from(strA);
      buffB = Buffer.from(strB);
    }

    if (buffA.length === buffB.length) {
      return timingSafeEqual(buffA, buffB);
    }
  }
  return false;
}
