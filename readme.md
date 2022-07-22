# Inertia.js middleware for Oak framework

This middleware can be used to easily enable Inertia.js client libraries to interact with your Oak-based application. It checks for the Inertia header from the client on request, and modifies the response accordingly. Supports both the Deno CLI and Deno Deploy environments.

## Setup

```js
import { Application, Router } from 'https://deno.land/x/oak/mod.ts'
import { Inertia } from 'https://deno.land/x/oak_inertia/mod.ts'

// Instantiate Oak app
const app = new Application()

// Provide a template string
// Put '@inertia' somewhere in the body, which will be replaced by the Inertia bootstrapping frontend code
Inertia.template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deno and Inertia app</title>
</head>
<body>
  @inertia
</body>
</html>`

// Optional function to determine Inertia version
Inertia.checkVersion = () => {
  return Deno.env.get('OPTIONAL_INERTIA_VERSION')
}

// Add Inertia middleware to global Oak middleware stack
app.use(Inertia.initMiddleware())

// Use the Oak router
const router = new Router()

// use the 'inertia.render()' method now attached to the Oak context to render an Inertia page
router.get('/', (ctx, next) => {
  const componentName = 'HomePage'
  const payloadObject = {
    username: 'johndoe',
    email: 'jdizzle@example.com'
  }

  ctx.state.inertia.render(componentName, payloadObject)
})
```

## SSR

Because React and Deno both use similar JavaScript functionality, SSR on initial page load is pretty feasible to achieve!

Full instructions aren't available yet on how to do this, but for now, here is an optional argument to inject custom server-side code into the initial template.

### Example Oak route with SSR string
```ts
// Make sure you have React loaded in Deno
import React from 'https://cdn.skypack.dev/react@17.0.2'
import { renderToString } from 'https://cdn.skypack.dev/react-dom@17.0.2/cjs/react-dom-server.browser.production.min.js'

// Import a server-side render-able component
import ReactPage from './Pages/ReactPage.tsx'

// Example Oak route with SSR string
router.get('/', (ctx, next) => {
  const componentName = 'HomePage'
  const payloadObject = {
    username: 'johndoe',
    email: 'jdizzle@example.com'
  }

  ctx.state.inertia.render(componentName, payloadObject, renderToString(<ReactPage { ...payloadObject } />))
})
```