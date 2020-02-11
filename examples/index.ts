import { MemoryCache, storageCache } from '../src'
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
  // c.destroy()
})

storageCache.sessionStorage.setItem('data', data)
cache.set('datsa', data)
cache.track(
  'data',
  storageCache.sessionStorage.getItem('data', (data: any, exp: number) => {
    return data
  }),
  true
)
// cache.destroy()
