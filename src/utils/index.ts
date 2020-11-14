export const MAX_8BIT_INTEGER: number = Math.pow(2, 8) - 1
export const MAX_16BIT_INTEGER: number = Math.pow(2, 16) - 1
export const MAX_32BIT_INTEGER: number = Math.pow(2, 32) - 1

export type Buffer = Uint8Array | Uint16Array | Uint32Array | Float64Array
export type ArrayBuffer =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float64ArrayConstructor

export function makePointer(size?: number): ArrayBuffer {
  const maxIndex: number = size - 1

  if (maxIndex <= MAX_8BIT_INTEGER) return Uint8Array
  if (maxIndex <= MAX_16BIT_INTEGER) return Uint16Array
  if (maxIndex <= MAX_32BIT_INTEGER) return Uint32Array
  return Float64Array
}

export function serialize(
  obj: any,
  replacer: () => void | any = undefined,
  indentation: number = 1
): string {
  return JSON.stringify(
    obj,
    typeof replacer === 'function'
      ? replacer
      : (k, v) => {
          if (v) return v
        },
    indentation
  )
}

export function deserialize(
  obj: any,
  replacer: () => void | any = undefined
): string {
  return JSON.parse(
    obj,
    typeof replacer === 'function'
      ? replacer
      : (k, v) => {
          if (v) return v
        }
  )
}
