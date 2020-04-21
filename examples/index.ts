import { MemoryCache, storageCache } from '../src'
import { AsyncCache } from '../src/scheduler'

const cache = MemoryCache.of(2)

fetch('https://jsonplaceholder.typicode.com/posts?userId=1', {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})
  .then(json => json.json())
  .then(data => {
    storageCache.sessionStorage.setItem('data', data)
    cache.set('data2', data)
    cache.track(
      'data',
      storageCache.sessionStorage.getItem('data', (data: any) => {
        return data
      }),
      true
    )
  })

const userPosts = new AsyncCache(async function userPosts() {
  const res = await fetch(
    'https://jsonplaceholder.typicode.com/posts?userId=1',
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  const data = res.json()
  return data
})
;(async () => {
  const data = await userPosts.proxy()
  console.log('---DATA COMES FROM ASYNC/AWAIT---\n', data)
  storageCache.sessionStorage.setItem('todoOne', data)
})()

const postTwo = new AsyncCache((id: number) => {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
    .then((res: any) => res.json())
    .then((json: any) => json)
})
postTwo.proxy(2).then(data => {
  console.log('---DATA COMES FROM PROMISE---\n', data)
  cache.set('todoTwo', data)
}, console.error)
