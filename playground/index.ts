import { Cache } from '../src'

const cache = Cache.of(2)

fetch('https://jsonplaceholder.typicode.com/posts?userId=1')
  .then((json) => json.json())
  .then((data) => {
    cache.set('post', data)
  })

console.log(cache)
