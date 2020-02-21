export const MAX_8BIT_INTEGER: number = Math.pow(2, 8) - 1
export const MAX_16BIT_INTEGER: number = Math.pow(2, 16) - 1
export const MAX_32BIT_INTEGER: number = Math.pow(2, 32) - 1

export type Buffer = Uint8Array | Uint16Array | Uint32Array | Float64Array
export type ArrayBuffer =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float64ArrayConstructor

export function getStorageType(type?: string | Storage): Storage {
  if (type !== null && typeof type === 'object') return type
  switch (type) {
    case 'sessionStorage':
      return sessionStorage
    case 'localStorage':
      return localStorage
    default:
      return sessionStorage
  }
}

export function makePointer(size?: number): ArrayBuffer {
  const maxIndex: number = size - 1

  if (maxIndex <= MAX_8BIT_INTEGER) return Uint8Array
  if (maxIndex <= MAX_16BIT_INTEGER) return Uint16Array
  if (maxIndex <= MAX_32BIT_INTEGER) return Uint32Array
  return Float64Array
}

export function serialize(obj: any, ind?: number): string {
  return JSON.stringify(
    obj,
    (k, v) => {
      if (v) return v
    },
    ind
  )
}

export function watch(object: any, cb: Function) {
  const handler = {
    get(target: any, property: any, receiver: any): string {
      const desc = Object.getOwnPropertyDescriptor(target, property)
      const value = Reflect.get(target, property, receiver)

      if (desc && !desc.writable && !desc.configurable) return value
      try {
        return new Proxy(target[property], handler)
      } catch (err) {
        return Reflect.get(target, property, receiver)
      }
    },
    defineProperty(target: any, property: any, descriptor: any) {
      if (property === 'size') cb(object)
      return Reflect.defineProperty(target, property, descriptor)
    },
    deleteProperty(target: any, property: any) {
      if (property === 'size') cb(object)
      return Reflect.deleteProperty(target, property)
    }
  }
  return new Proxy(object, handler)
}
