export default class Inertia {
  constructor(oakApp, template) {
    oakApp.use(async (ctx, next) => {
      this.template = template

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
    const inertiaObject = {
      component,
      props: payload,
      url: this.context.request.url.pathname,
      version: 'EwKHZIw0jAJtZu4ErKGp'
    }

    if (this.context.request.headers.has('X-Inertia')) {
      this.context.response.headers.set('Content-Type', 'application/json')
      this.context.response.headers.set('Vary', 'Accept')
      this.context.response.headers.set('X-Inertia', true)
      this.context.response.body = JSON.stringify(inertiaObject)
    } else {
      this.context.response.headers.set('Content-Type', 'text/html; charset=utf-8')
      this.context.response.body = this._processTemplate(inertiaObject)
    }
  }
}