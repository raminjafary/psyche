import { MemoryCache, storageCache } from '../../src'

const cache = MemoryCache.of(2)

fetch('https://jsonplaceholder.typicode.com/posts?userId=1', {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
})
  .then((json) => json.json())
  .then((data) => {
    storageCache.sessionStorage.setItem('data', data)
    cache.set('data2', data)
    cache.track(
      'data',
      storageCache.sessionStorage.getItem('data', (data: any) => {
        return data
      }),
      true
    )
    storageCache.sessionStorage.setItem('todoOne', data)
    cache.set('todoTwo', data)
  })
