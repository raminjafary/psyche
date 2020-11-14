import { Cache } from '../../src'
import { deserialize, serialize } from '../../src/utils'

const cache = Cache.of(2)

fetch('https://jsonplaceholder.typicode.com/posts?userId=1', {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
})
  .then((json) => json.json())
  .then((data) => {
    cache.track('data', data, true)
    cache.set('post', data)
  })
