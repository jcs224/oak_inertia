export default class Inertia {
  constructor(oakApp, template, initialVersion = 'EwKHZIw0jAJtZu4ErKGp') {
    this.template = template
    this.version = initialVersion

    oakApp.use(async (ctx, next) => {

      ctx.state.inertia = this
      this.context = ctx
      await next()
    })
  }

  _processTemplate(jsonPayload) {
    const parsedTemplate = this.template.replace(
      '@inertia', 
      /*html*/`<div id="app" data-page='${JSON.stringify(jsonPayload)}'></div>`
    )

    return parsedTemplate
  }

  render(component, payload) {
    console.log('current: '+this.context.request.headers.get('X-Inertia-Version'))
    console.log('new: '+this.version)

    const inertiaObject = {
      component,
      props: payload,
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
      this.context.response.headers.set('X-Inertia', true)
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