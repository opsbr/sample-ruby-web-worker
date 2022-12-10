const stringToInt32Array = (s: string) => {
  const original = new TextEncoder().encode(s);
  const originalPlusNullByteLength = original.buffer.byteLength + 1;
  const paddingByteLength = Int32Array.BYTES_PER_ELEMENT - (originalPlusNullByteLength % Int32Array.BYTES_PER_ELEMENT);
  const uint8Array = new Uint8Array(originalPlusNullByteLength + paddingByteLength);
  uint8Array.set(original);
  uint8Array.set(new Uint8Array(paddingByteLength + 1), original.buffer.byteLength);
  return new Int32Array(uint8Array.buffer);
}

const int32ArrayToString = (a: Int32Array) => {
  const uint8Array = new Uint8Array(a.buffer);
  const endIndex = uint8Array.findIndex((elm) => elm === 0);
  return new TextDecoder().decode(uint8Array.slice(0, endIndex));
}

export const writeResponse = (response: string, array: Int32Array) => {
  const encoded = stringToInt32Array(response);
  array.set(encoded, 1);
  Atomics.store(array, 0, encoded.length);
  Atomics.notify(array, 0);
}

export const waitResponse = (array: Int32Array) => {
  const result = Atomics.wait(array, 0, 0);
  if (result === "ok") {
    const length = Atomics.load(array, 0);
    const value = int32ArrayToString(array.slice(1, length + 1));
    return value + "\n";
  } else {
    Atomics.store(array, 0, 0);
    return "";
  }
}
