const ctx: Worker = self as any

ctx.addEventListener('message', (e: Event | any) => {
  const timeKind = e.data.time.match(/[\d\.]+|\D+/g)
  if (e.data.time) {
    let count = 0
    console.log(
      `%c Scheduler initilized ${
        e.data.title ? 'for' + ' ' + e.data.title : ''
      } and resolves after ${Math.floor(+timeKind[0])} seconds `,
      'background: #42c3ab; color: white; padding: .2rem .3rem; margin-bottom:.3rem; border-radius: 5px; font-weight:bold'
    )
    const timerid = setInterval(() => {
      count += e.data.count || 1000
      const ms = count % 1000
      const s = Math.floor(count / 1000) % 60
      const m = Math.floor(count / 60000) % 60
      const time = m + ':' + s + ':' + ms
      const cd =
        timeKind[1] === 's'
          ? s
          : timeKind[1] === 'm'
          ? m
          : timeKind[1] === 'ms'
          ? ms
          : m
      self.postMessage(time, null)
      if (cd > +timeKind[0]) {
        delete e.data.time
        delete e.data.count
        const payload = { ...e.data, state: 'done' }
        self.postMessage(payload, null)
        clearInterval(timerid)
        ;(ctx as any).close()
        console.log(
          `%c Scheduler ${
            e.data.title ? 'for' + ' ' + e.data.title : ''
          } is resolved`,
          'background: #42c3ab; color: white; padding: .2rem .3rem; margin-bottom:.3rem; border-radius: 5px; font-weight:bold'
        )
      }
    }, e.data.count)
  } else {
    ;(ctx as any).close()
  }
})
