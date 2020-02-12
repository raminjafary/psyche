const ctx: Worker = self as any

ctx.addEventListener('message', (e: Event | any) => {
  const timeKind = e.data.limit.match(/[\d\.]+|\D+/g)
  if (e.data.count) {
    let startDate = new Date()
    let count = 0
    console.log(
      `%c Scheduling initilized ${
        e.data.title ? 'for' + ' ' + e.data.title : ''
      } and resolves after ${Math.floor(e.data.count)} seconds `,
      'background: #42c3ab; color: white; padding: .2rem .3rem; margin-bottom:.3rem; border-radius: 5px; font-weight:bold'
    )
    let timerid = setInterval(() => {
      count += e.data.count
      let ms = count % 1000
      let s = Math.floor(count / 1000) % 60
      let m = Math.floor(count / 60000) % 60
      let time = m + ':' + s + ':' + ms
      let cd =
        timeKind[1] === 's'
          ? s
          : timeKind[1] === 'm'
          ? m
          : timeKind[1] === 'ms'
          ? ms
          : m
      self.postMessage([time, startDate], null)
      if (cd > +timeKind[0]) {
        delete e.data.count
        let payload = { ...e.data, state: 'done' }
        self.postMessage(payload, null)
        clearInterval(timerid)
        ;(ctx as any).close()
        console.log(
          `%c Worker is done!`,
          'background: #42c3ab; color: white; padding: .2rem .3rem; margin-bottom:.3rem; border-radius: 5px; font-weight:bold'
        )
      }
    }, e.data.count)
  } else {
    ;(ctx as any).close()
  }
})
