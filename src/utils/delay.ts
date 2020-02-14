import Worker from 'worker-loader!./delay-runner'

export function scheduler(data?: any | object, cb?: any): void {
  const worker = new Worker()
  if (data.time) {
    worker.addEventListener('message', cb)
    worker.postMessage(data)
  } else {
    worker.terminate()
    worker.removeEventListener('message', cb)
    const error: any = console.trace(
      '%c Cannot set update schedule without setting time!',
      'background: red; color: white; padding: .2rem .3rem; border-radius: 5px; font-weight:bold'
    )
    throw new Error(error)
  }
}
