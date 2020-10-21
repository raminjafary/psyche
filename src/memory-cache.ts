import { makePointer, Buffer } from './utils'

interface CacheApi {
  set(key: string, value: any): void
  get(key: string): any
  destroy(): void
  moveToFront(pointer: number): MemoryCache
  has(key: string): boolean
  track?(key: string, value: any, cache?: boolean): MemoryCache
}
export class MemoryCache implements CacheApi {
  private next: Buffer
  private k: Array<string>
  private v: Array<number>
  private items: any
  private previous: Buffer
  private size: number
  private tail: number
  private head: number

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
    return new MemoryCache(capacity)
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
  destroy(): void {
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

  track(key: string, value: any, cache = false): MemoryCache {
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
      (this as any)[key] = value
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
