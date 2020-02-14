/** Inspired by greenlet library
 *  @param {Function} asyncFn  An ssync function to run in a Worker.
 *  @public
 */
export class AsyncCache {
  id: number = 0
  prosmiseKeeper: any = {}
  script: string = ''
  worker: Worker
  start: number
  end: number
  constructor(private asyncFn: Function) {
    this.createInlineScript()
    this.createWorker()
  }

  createInlineScript() {
    this.start = performance.now()
    this.script =
      '$=' +
      this.asyncFn +
      ';onmessage=' +
      ((e: any) => {
        Promise.resolve(e.data[1])
          .then((fn: any) => $.apply($, fn))
          .then(
            (transferable: string) => {
              postMessage(
                [e.data[0], 0, transferable],
                ([transferable] as any).filter(
                  (x: ArrayBuffer | any) =>
                    x instanceof ArrayBuffer ||
                    x instanceof MessagePort ||
                    (self.ImageBitmap && x instanceof ImageBitmap)
                )
              )
            },
            (error: any) => postMessage([e.data[0], 1, '' + error], null)
          )
      })
  }
  createWorker() {
    const workerURL = URL.createObjectURL(new Blob([this.script]))
    this.worker = new Worker(workerURL)
    this.worker.addEventListener('message', (e: any) => {
      this.prosmiseKeeper[e.data[0]][e.data[1]](e.data[2])
      this.prosmiseKeeper[e.data[0]] = null
    })
    this.end = performance.now()
    // console.log(`${(this.end - this.start).toFixed(2)}ms`)
  }
  proxy(...args: any) {
    let _this = this
    return new Promise(function(...c) {
      _this.prosmiseKeeper[++_this.id] = c
      _this.worker.postMessage(
        [_this.id, args],
        args.filter(
          (x: ArrayBuffer | any) =>
            x instanceof ArrayBuffer ||
            x instanceof MessagePort ||
            (self.ImageBitmap && x instanceof ImageBitmap)
        )
      )
    })
  }
}
