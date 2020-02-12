import { getStorageType, serialize } from './utils'
import { scheduler } from './utils/scheduler'

interface Data {
  key: string
  cb?: Function
  value?: any
  maxAge?: number
  size?: number
}
interface StorageApi {
  getItem(key: string, cb?: Function): Data
  setItem(key: string, value: any, maxAge: number, size?: number): Data
  removeItem(key: string, cb?: Function): Data
  clear(): void
}
class StorageC implements StorageApi {
  public isExpired: boolean = false
  constructor(private type: Storage | string) {}

  getItem(key: string, cb?: Function): any | Data {
    const storage = getStorageType(this.type)

    let obj = storage.getItem(key)
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
        const ds: any = obj[i]
        if (!ds) continue
        let data = ds.data,
          exp = ds.exp
        if (Number(exp) && exp > 0) {
          if (new Date().getTime() > exp) {
            this.isExpired = true
            trashArr.push(ds)
            continue
          }
        }
        if (cb) remainedData = cb(data, this.isExpired)
      }
      if (trashArr.length) {
        this.removeItem(key)
      }
      return remainedData
    }
  }
  clear(): void {
    try {
      getStorageType(this.type).clear()
    } catch (error) {
      console.log(
        `%c Cannot clear ${this.type}`,
        'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
      )
    }
  }
  setItem(
    key: string,
    value: any,
    maxAge: number = 1 * 60 * 60 * 1000,
    size: number = 1
  ): any | Data {
    const storage = getStorageType(this.type)
    const ts = new Date().getTime(),
      exp = maxAge > 0 ? ts + maxAge : -1

    let data = {
      ts: ts,
      exp: exp,
      data: value
    }

    let obj: any = storage.getItem(key)

    if (obj) {
      try {
        obj = JSON.parse(obj)
      } catch (error) {
        storage.removeItem(key)
        return this.setItem(key, value)
      }
      if (obj.length >= size) {
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
    return storage.setItem(key, serialize(obj))
  }
  schedule(
    count: number = 1000,
    limit: string = '1m',
    data: any | object,
    cb: Function
  ) {
    const payload = { count, limit, ...data }
    scheduler(payload, (e: any) => {
      if (e.data.state === 'done') {
        cb(e.data)
      }
    })
  }
  removeItem(key: string, cb?: Function): any | Data {
    const storage = getStorageType(this.type)
    if (!cb) {
      storage.removeItem(key)
      return
    }
    let obj: any = storage.getItem(key)
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
      return storage.setItem(key, serialize(itemKeeper))
    }
  }
}

class SessionStorage {
  static storage: StorageC
  static create() {
    if (window && 'sessionStorage' in window) {
      if (!this.storage) this.storage = new StorageC(sessionStorage)
      return this.storage
    }
    console.trace(
      `%c sessionStorage is not defined`,
      'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
    )
    throw new Error(`sessionStorage is not defined`)
  }
}

class LocalStorage {
  static storage: StorageC
  static create() {
    if (window && 'localStorage' in window) {
      if (!this.storage) this.storage = new StorageC(localStorage)
      return this.storage
    }
    console.trace(
      `%c localStorage is not defined`,
      'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
    )
    throw new Error(`localStorage is not defined`)
  }
}

export const storageCache = {
  sessionStorage: SessionStorage.create(),
  localStorage: LocalStorage.create()
}
