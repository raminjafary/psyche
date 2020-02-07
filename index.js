const MAX_8BIT_INTEGER = Math.pow(2, 8) - 1
const MAX_16BIT_INTEGER = Math.pow(2, 16) - 1
const MAX_32BIT_INTEGER = Math.pow(2, 32) - 1

function makePointer(size) {
  const maxIndex = size - 1

  if (maxIndex <= MAX_8BIT_INTEGER) return Uint8Array
  if (maxIndex <= MAX_16BIT_INTEGER) return Uint16Array
  if (maxIndex <= MAX_32BIT_INTEGER) return Uint32Array
  return Float64Array
}

function getStorageType(type) {
  switch (type) {
    case 'sessionStorage':
      return sessionStorage
    case 'localStorage':
      return localStorage
    default:
      return sessionStorage
  }
}

class ReactiveCache {
  constructor(Keys, Values, capacity) {
    if (arguments.length < 2) {
      capacity = Keys
      Keys = null
      Values = null
    }
    this.capacity = capacity

    if (typeof this.capacity !== 'number' || this.capacity <= 0) {
      throw new Error('capacity should be positive number.')
    }
    const PointerArray = makePointer(capacity)
    this.next = new PointerArray(capacity)
    this.previous = new PointerArray(capacity)
    this.k =
      typeof Keys === 'function' ? new Keys(capacity) : new Array(capacity)
    this.v =
      typeof Values === 'function' ? new Values(capacity) : new Array(capacity)
    this.size = 0
    this.head = 0
    this.tail = 0
    this.items = {}
  }

  clear() {
    this.size = 0
    this.head = 0
    this.tail = 0
    this.k = null
    this.v = null
    this.items = {}
  }

  moveToFront(pointer) {
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

  set(key, value) {
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
  has(key) {
    return key in this.items
  }

  get(key) {
    const pointer = this.items[key]
    if (typeof pointer === 'undefined') return null
    this.moveToFront(pointer)
    return this.v[pointer]
  }
  getStorage(key, cb, type) {
    const storge = getStorageType(type)

    let obj = storge.getItem(key)
    let trashArr = [],
      remainedData

    if (obj) {
      try {
        obj = JSON.parse(obj)
      } catch (error) {
        storage.removeItem(obj)
        return
      }
      for (let i = 0; i < obj.length; i++) {
        const ds = obj[i]
        if (!ds) continue
        let data = ds.data,
          exp = ds.exp
        if (Number(exp) && exp > 0) {
          if (new Date().getTime() > exp) {
            trashArr.push(ds)
            continue
          }
        }
        if (cb) remainedData = cb(data)
      }
      if (trashArr.length) {
        this.removeStorage(key, 'sessionStorage')
      }
      return remainedData
    }
  }
  setStorage(key, value, maxAge, type) {
    const storage = getStorageType(type)
    const ts = new Date().getTime(),
      exp = maxAge > 0 ? ts + maxAge : -1

    let data = {
      ts: ts,
      exp: exp,
      data: value
    }

    let obj = storage.getItem(key)
    if (obj) {
      try {
        obj = JSON.parse(obj)
      } catch (error) {
        storage.removeItem(key)
        return this.setStorage(key, value)
      }
      if (obj.length > this.size) {
        obj.shift()
      }
      obj.push(data)
    } else {
      obj = [
        {
          ts: ts,
          exp: exp,
          data: value
        }
      ]
    }
    return storage.setItem(key, this.serialize(obj))
  }

  removeStorage(key, type, cb) {
    const storage = getStorageType(type)
    if (!cb) {
      storage.removeItem(key)
      return
    }
    let obj = storage.getItem(key)
    let itemKeeper = []
    if (obj) {
      try {
        obj = JSON.parse(obj)
      } catch (error) {
        storage.removeItem(key)
        return
      }
      for (let i = 0; i < obj.length; i++) {
        let ds = obj[i]
        if (!ds) continue
        let data = ds.data
        if (!cb(data)) {
          itemKeeper.push(ds)
        }
      }
      return storage.setItem(key, this.serialize(itemKeeper))
    }
  }

  serialize(obj, ind) {
    return JSON.stringify(
      obj,
      (k, v) => {
        if (v === undefined) {
          return null
        }
        return v
      },
      ind
    )
  }
  makeReactive(key, value, cache = false) {
    if (this.has(key)) {
      throw new Error(
        console.trace(
          `%c the key ${key} is already exists on the instance ${this.constructor.name}`,
          'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
        )
      )
    }
    if (key && cache) {
      console.log(key)
      this.set(key, value)
    } else this[key] = value
  }
  watchCache(object, cb) {
    const handler = {
      get(target, property, receiver) {
        const desc = Object.getOwnPropertyDescriptor(target, property)
        const value = Reflect.get(target, property, receiver)

        if (desc && !desc.writable && !desc.configurable) return value
        try {
          return new Proxy(target[property], handler)
        } catch (err) {
          return Reflect.get(target, property, receiver)
        }
      },
      defineProperty(target, property, descriptor) {
        cb()
        return Reflect.defineProperty(target, property, descriptor)
      },
      deleteProperty(target, property) {
        cb()
        return Reflect.deleteProperty(target, property)
      }
    }

    return new Proxy(object, handler)
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

let data = [
  {
    cards: [
      {
        city: 'متل قو (سلمانشهر)',
        stars: 0,
        imageUrl:
          'https://jabamacdn.com/image/256x170/jabama-images/image_1259233a-521f-4a87-ba63-e7aefdd84a79.jpg',
        title: 'ویلا سه خوابه استخردار شب نشین (3) متل قو (سلمانشهر)',
        state: 'مازندران',
        rate: 0,
        ratesCount: 0,
        boardPrice: 10000000,
        salesPrice: 7500000,
        discount: 25,
        url: 'villa/6c58ef9fb7',
        order: 2
      },
      {
        city: 'متل قو (سلمانشهر)',
        stars: 0,
        imageUrl:
          'https://jabamacdn.com/image/256x170/jabama-images/image_1259233a-521f-4a87-ba63-e7aefdd84a79.jpg',
        title: 'ویلا سه خوابه استخردار شب نشین (3) متل قو (سلمانشهر)',
        state: 'مازندران',
        rate: 0,
        ratesCount: 0,
        boardPrice: 10000000,
        salesPrice: 7500000,
        discount: 25,
        url: 'villa/6c58ef9fb7',
        order: 2
      }
    ],
    title: 'مقاصد محبوب',
    product: 10,
    area: 12,
    webUrl: '',
    appUrl: 'https://www.jabama.com/',
    order: 2
  },
  {
    cards: [
      {
        city: 'متل قو (سلمانشهر)',
        stars: 0,
        imageUrl:
          'https://jabamacdn.com/image/256x170/jabama-images/image_1259233a-521f-4a87-ba63-e7aefdd84a79.jpg',
        title: 'ویلا سه خوابه استخردار شب نشین (3) متل قو (سلمانشهر)',
        state: 'مازندران',
        rate: 0,
        ratesCount: 0,
        boardPrice: 10000000,
        salesPrice: 7500000,
        discount: 25,
        url: 'villa/6c58ef9fb7',
        order: 2
      },
      {
        city: 'متل قو (سلمانشهر)',
        stars: 0,
        imageUrl:
          'https://jabamacdn.com/image/256x170/jabama-images/image_1259233a-521f-4a87-ba63-e7aefdd84a79.jpg',
        title: 'ویلا سه خوابه استخردار شب نشین (3) متل قو (سلمانشهر)',
        state: 'مازندران',
        rate: 0,
        ratesCount: 0,
        boardPrice: 10000000,
        salesPrice: 7500000,
        discount: 25,
        url: 'villa/6c58ef9fb7',
        order: 2
      }
    ],
    title: 'تخفیف های هیجان انگیز',
    product: 11,
    area: 12,
    webUrl: '',
    appUrl: 'https://www.jabama.com/',
    order: 2
  }
]

const cache = new ReactiveCache(4)

const reactiveCache = cache.watchCache(cache, () => {
  console.clear()
  console.log(
    `%c ${cache.constructor.name} is updated`,
    'background: #42c3ab; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
  )
  console.dir(cache)
  if (cache.size === cache.capacity)
    throw new Error(
      console.clear(),
      console.trace(
        '%c memory allocation exceeded!',
        'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
      )
    )
  else {
    console.log(
      `%c ${cache.capacity -
        cache.size} bit remaind to exceed the full capacity of ${
        cache.capacity
      } bit allocated memeory cache`,
      'background: orange; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
    )
  }
})

// reactiveCache.setStorage('data', data, 0.01 * 60 * 60 * 1000, 'sessionStorage')
reactiveCache.makeReactive(
  'storage',
  reactiveCache.getStorage('data', data => data, 'sessionStorage')
)

reactiveCache.set('data', data)
// reactiveCache.getStorage('data', data => console.log(data), 'sessionStorage')
