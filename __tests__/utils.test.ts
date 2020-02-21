import {
  getStorageType,
  makePointer,
  MAX_8BIT_INTEGER,
  MAX_16BIT_INTEGER,
  MAX_32BIT_INTEGER,
  serialize,
  watch
} from '../src/utils'

describe('should test getStorageType function', () => {
  test('should return sessionStorage', () => {
    expect(getStorageType(sessionStorage)).toBe(sessionStorage)
    expect(getStorageType('sessionStorage')).toBe(sessionStorage)
  })

  test('should return localStorage', () => {
    expect(getStorageType(localStorage)).toBe(localStorage)
    expect(getStorageType('localStorage')).toBe(localStorage)
  })

  test('should default return sessionStorage', () => {
    expect(getStorageType()).toBe(sessionStorage)
  })
})

describe('should test makePointer function', () => {
  test('should default return Float64Array', () => {
    expect(makePointer()).toBe(Float64Array)
  })

  test('should return Uint16Array', () => {
    expect(makePointer(MAX_16BIT_INTEGER)).toBe(Uint16Array)
  })

  test('should return Uint8Array', () => {
    expect(makePointer(MAX_8BIT_INTEGER)).toBe(Uint8Array)
  })
  test('should return Uint8Array', () => {
    expect(makePointer(MAX_32BIT_INTEGER)).toBe(Uint32Array)
  })
})

describe('should test serialize function', () => {
  test('should stringified entity', () => {
    expect(serialize({ a: 1 }, 5)).toBe(JSON.stringify({ a: 1 }, null, 5))
  })
  test('should skip value null and undefined', () => {
    expect(serialize({ a: undefined, c: null, b: 5 })).toBe(
      JSON.stringify({ b: 5 })
    )
  })
})

describe('should test watch function', () => {
  const obj: any = { name: 'ramin', size: 1 }
  const proxy = watch(obj, (a: any) => console.log(a))

  test('should watch and return equal obj', () => {
    expect(proxy).toEqual(obj)
  })
  test('should watch and return equal obj when size changes', () => {
    proxy.size = 50
    proxy.name = 'vahid'
    expect(proxy).toEqual(obj)
  })
  test('should watch and delete size and return equal obj', () => {
    delete proxy.name
    delete proxy.size
    expect(proxy).toEqual(obj)
  })
  test('should watch and return readonly value without proxy wrapper', () => {
    const op = Object.defineProperty({ size: 2 }, 'size', {
      value: 0,
      writable: false,
      configurable: false
    })
    expect(watch(op, (a: any) => a)).toEqual(op)
  })
})
