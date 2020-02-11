import { makePointer, watch } from './utils'

type Buffer = Uint8Array | Uint16Array | Uint32Array | Float64Array

interface CacheApi {
  set(key: string, value: any): void
  get(key: string): any
  clear(): void
  moveToFront(pointer: number): MemoryCache
  has(key: string): boolean
  track?(key: string, value: any, cache?: boolean): MemoryCache
  checkAlloc(): void
  watchCache(cb: Function): any
}
export class MemoryCache implements CacheApi {
  private next: Buffer
  private k: Array<string>
  private v: Array<number>
  private items: object | any
  private previous: Buffer
  private size: number
  private tail: number
  private head: number
  private static instance: any

  constructor(public capacity?: number) {
    this.capacity = capacity

    if (typeof this.capacity !== 'number' || this.capacity <= 0) {
      throw new Error('capacity should be positive number.')
    }
    const PointerArray = makePointer(capacity)
    this.next = new PointerArray(capacity)
    this.previous = new PointerArray(capacity)
    this.k = new Array(capacity)
    this.v = new Array(capacity)
    this.size = 0
    this.head = 0
    this.tail = 0
    this.items = {}
  }
  static of(capacity: number) {
    MemoryCache.instance = new MemoryCache(capacity)
    return MemoryCache.instance
  }

  watchCache(cb: any): any {
    console.log(
      `%c ${this.constructor.name} is updated`,
      'background: #42c3ab; color: white; padding: .2rem .3rem; margin-bottom:.3rem; border-radius: 5px; font-weight:bold',
      MemoryCache.instance
    )
    this.checkAlloc()
    return watch(MemoryCache.instance, cb)
  }
  get cacheSize() {
    return this.size
  }
  set cacheSize(val) {
    const error: any = console.trace(
      '%c Cannot set cache size manually!',
      'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
    )
    throw new Error(error)
  }
  destroy() {
    // this.clear()
    MemoryCache.instance.__proto__ = null
    MemoryCache.instance = null
    delete MemoryCache.instance
    console.log(MemoryCache.instance)
  }
  clear(): void {
    this.size = 0
    this.head = 0
    this.tail = 0
    this.capacity = 0
    this.k = new Array(this.capacity)
    this.v = new Array(this.capacity)
    this.items = {}
    this.next = new Uint8Array()
    this.previous = new Uint8Array()
  }
  checkAlloc(): void {
    if (this.size >= this.capacity) {
      const error: any = console.trace(
        '%c memory allocation exceeded!',
        'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
      )
      throw new Error(error)
    } else {
      console.log(
        `%c ${this.capacity -
          this.size} bit remaind to exceed the full capacity of ${
          this.capacity
        } bit allocated memeory cache`,
        'background: orange; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
      )
    }
  }

  moveToFront(pointer: number): MemoryCache {
    const oldhead = this.head

    if (this.head === pointer) return this

    const prev = this.previous[pointer],
      next = this.next[pointer]

    if (this.tail === pointer) {
      this.tail = prev
    } else {
      this.previous[next] = prev
    }
    this.next[prev] = next
    this.previous[oldhead] = pointer
    this.head = pointer
    this.next[pointer] = oldhead
    return this
  }

  set(key: string, value: any): void {
    let pointer = this.items[key]

    if (typeof pointer !== 'undefined') {
      this.moveToFront(pointer)
      this.v[pointer] = value
      return
    }

    if (this.size < this.capacity) {
      pointer = this.size++
    } else {
      pointer = this.tail
      this.tail = this.previous[pointer]
      delete this.items[this.k[pointer]]
    }

    this.items[key] = pointer
    this.k[pointer] = key
    this.v[pointer] = value

    this.next[pointer] = this.head
    this.previous[this.head] = pointer
    this.head = pointer
  }
  has(key: string): boolean {
    return key in this.items
  }

  get(key: string): number {
    const pointer = this.items[key]
    if (typeof pointer === 'undefined') return null
    this.moveToFront(pointer)
    return this.v[pointer]
  }

  track(key: string, value: any, cache: boolean = false): MemoryCache {
    if (this.has(key)) {
      const error: any = console.trace(
        `%c the key ${key} is already exists on the instance ${this.constructor.name}`,
        'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
      )
      throw new Error(error)
    }
    if (cache) {
      this.set(key, value)
      this.get(key)
    } else {
      ;(this as any)[key] = value
      return this
    }
  }
  *[Symbol.iterator]() {
    let pointer = this.head
    let i = 0
    while (i < this.size) {
      yield [this.k[pointer], this.v[pointer]]
      pointer = this.next[pointer]
      i++
    }
  }
}
