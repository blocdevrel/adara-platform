/**
 * Pull raw PCM16 LE samples out of a WAV container (expo-audio iOS LINEARPCM).
 * Returns null when the file is not a readable PCM WAV (e.g. Android m4a).
 */

export function pcm16FromWav(buffer: ArrayBuffer): Uint8Array | null {
  const view = new DataView(buffer);
  if (buffer.byteLength < 44) return null;
  if (readFourCC(view, 0) !== "RIFF" || readFourCC(view, 8) !== "WAVE") return null;

  let offset = 12;
  let dataOffset = -1;
  let dataSize = 0;
  let audioFormat = -1;
  let bitsPerSample = -1;

  while (offset + 8 <= buffer.byteLength) {
    const id = readFourCC(view, offset);
    const size = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;

    if (id === "fmt ") {
      audioFormat = view.getUint16(chunkStart, true);
      bitsPerSample = view.getUint16(chunkStart + 14, true);
    } else if (id === "data") {
      dataOffset = chunkStart;
      dataSize = size;
      break;
    }

    offset = chunkStart + size + (size % 2);
  }

  if (dataOffset < 0 || audioFormat !== 1 || bitsPerSample !== 16) return null;
  return new Uint8Array(buffer, dataOffset, Math.min(dataSize, buffer.byteLength - dataOffset));
}

function readFourCC(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

/** Base64 without Node Buffer — works in RN / Hermes / web. */
export function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    let part = "";
    for (let j = 0; j < slice.length; j++) {
      part += String.fromCharCode(slice[j]!);
    }
    binary += part;
  }
  return globalThis.btoa(binary);
}
