import Worker from 'worker-loader!../worker'

export function scheduler(data?: any | object, cb?: any): void {
  const worker = new Worker()
  if (data.count) {
    worker.addEventListener('message', cb)
    worker.postMessage(data)
  } else {
    worker.terminate()
    worker.removeEventListener('message', cb)
  }
}
