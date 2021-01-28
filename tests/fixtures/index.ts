import { Cache } from '../../src'

const cache = Cache.of(2)

cache.set('post', [])

console.log(cache)
