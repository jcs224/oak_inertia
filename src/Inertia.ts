import { Context } from 'https://deno.land/x/oak@v10.0.0/context.ts'

export default class Inertia {
  template: string
  checkVersionFunction: () => string
  shared: Record<string, unknown>
  version: string | null
  context: Context | null

  constructor(template : string, checkVersionFunction = () => {
    return 'EwKHZIw0jAJtZu4ErKGp'
  }) {
    this.template = template
    this.checkVersionFunction = checkVersionFunction
    this.shared = {}
    this.version = null
    this.context = null
  }

  initMiddleware() {
    return async (ctx : Context, next : () => Promise<unknown>) => {
      ctx.state.inertia = this
      this.version = await this.checkVersionFunction.call(undefined)
      this.context = ctx
      await next()
    }
  }

  _processTemplate(jsonPayload : Record<string, unknown>) {
    const parsedTemplate = this.template.replace(
      '@inertia', 
      /*html*/`<div id="app" data-page='${JSON.stringify(jsonPayload)}'></div>`
    )

    return parsedTemplate
  }

  setShared(payload : Record<string, unknown>) {
    this.shared = payload
  }

  render(component : string, payload : Record<string, unknown>) {
    if (this.context) {
      const inertiaObject = {
        component,
        props: { ...this.shared, ...payload },
        url: this.context.request.url.pathname,
        version: this.context.request.headers.get('X-Inertia-Version') || this.version
      }
  
      if (
        this.context.request.headers.has('X-Inertia')
        && this.context.request.headers.has('X-Inertia-Version')
        && this.version === this.context.request.headers.get('X-Inertia-Version')
      ) {
        this.context.response.headers.set('Content-Type', 'application/json')
        this.context.response.headers.set('Vary', 'Accept')
        this.context.response.headers.set('X-Inertia', 'true')
        this.context.response.body = JSON.stringify(inertiaObject)
      } else {
        if (
          this.context.request.headers.has('X-Inertia-Version')
          && this.version !== this.context.request.headers.get('X-Inertia-Version')
        ) {
          this.context.response.status = 409
          this.context.response.headers.set('X-Inertia-Location', inertiaObject.url)
        } else {
          this.context.response.headers.set('Content-Type', 'text/html; charset=utf-8')
          this.context.response.body = this._processTemplate(inertiaObject)
        }
      }
    }
  }
}