import { MemoryCache, storageCache } from '../src'
import { scheduleUpdate } from '../src/utils/schedule'
import { AsyncCache } from '../src/scheduler'

const data = [
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
        city: 'dsvsdv',
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
  }
]

const cache = MemoryCache.of(2).watchCache((c: MemoryCache) => {
  console.log(c)
})

// storageCache.sessionStorage.setItem('data', data)
// cache.set('datsa', data)
// cache.track(
//   'data',
//   storageCache.sessionStorage.getItem('data', (data: any, exp: number) => {
//     return data
//   }),
//   true
// )
// storageCache.sessionStorage.getItem('data', (data: any, exp: number) => {
//   return data
// })

scheduleUpdate(
  { count: 1000, time: '10s', title: 'Clear memory and storage', data },
  (e: any) => {
    if (e.data.state === 'done') {
      console.log(e.data)
      cache.destroy()
      storageCache.sessionStorage.clear()
    }
  }
)
const userPosts = new AsyncCache(async function userPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1')
  const data = res.json()
  return data
})
;(async () => {
  const data = await userPosts.proxy()
  console.log('---DATA COMES FROM ASYNC/AWAIT---\n', data)
  storageCache.sessionStorage.setItem('todoOne', data)
})()

const postTwo = new AsyncCache((id: number) => {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    .then((res: any) => res.json())
    .then((json: any) => json)
})
postTwo.proxy(2).then(data => {
  console.log('---DATA COMES FROM PROMISE---\n', data)
  cache.set('todoTwo', data)
}, console.error)
