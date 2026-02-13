import { TextEncoder, TextDecoder } from 'node:util';

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});