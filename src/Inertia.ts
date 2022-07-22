import { Context } from 'https://deno.land/x/oak@v10.6.0/context.ts'
import { encode } from 'https://cdn.skypack.dev/html-entities@2.3.2'

export default class Inertia {
  static template : string
  static checkVersion: () => string

  static initMiddleware() {
    return async (ctx : Context, next : () => Promise<unknown>) => {
      var self = this

      let version: string = await this.checkVersion.call(undefined) ?? 'default'
      let shared: Record<string, unknown>

      ctx.state.inertia = {
        setShared(payload : Record<string, unknown>) {
          shared = payload
        },

        render(
          component : string, 
          payload : Record<string, unknown>, 
          ssrString? : string
        ) {
          const inertiaObject = {
            component,
            props: { ...shared, ...payload },
            url: ctx.request.url.pathname,
            version: ctx.request.headers.get('X-Inertia-Version') || version
          }
      
          if (
            ctx.request.headers.has('X-Inertia')
            && ctx.request.headers.has('X-Inertia-Version')
            && version === ctx.request.headers.get('X-Inertia-Version')
          ) {
            ctx.response.headers.set('Content-Type', 'application/json')
            ctx.response.headers.set('Vary', 'Accept')
            ctx.response.headers.set('X-Inertia', 'true')
            ctx.response.body = JSON.stringify(inertiaObject)
          } else {
            if (
              ctx.request.headers.has('X-Inertia-Version')
              && version !== ctx.request.headers.get('X-Inertia-Version')
            ) {
              ctx.response.status = 409
              ctx.response.headers.set('X-Inertia-Location', inertiaObject.url)
            } else {
              ctx.response.headers.set('Content-Type', 'text/html; charset=utf-8')
              ctx.response.body = self.processTemplate(inertiaObject, ssrString || null)
            }
          }
        }
      }

      await next()
    }
  }

  private static processTemplate(
    jsonPayload : Record<string, unknown>, 
    ssrString? : string | null
  ) {
    const parsedTemplate = this.template.replace(
      '@inertia', 
      /*html*/`<div id="app" data-page='${encode(JSON.stringify(jsonPayload))}'>${ ssrString || '' }</div>`
    )

    return parsedTemplate
  }
}