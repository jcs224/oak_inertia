# Inertia.js middleware for Oak framework

This middleware can be used to easily enable Inertia.js client libraries to interact with your Oak-based application. It checks for the Inertia header from the client on request, and modifies the response accordingly. Supports both the Deno CLI and Deno Deploy environments.

## Setup

```js
import { Application, Router } from 'https://deno.land/x/oak@v7.6.2/mod.ts'
import { Inertia } from 'https://deno.land/x/oak_inertia@v0.1.0/mod.ts'

// Instantiate Oak app
const app = new Application()

// Add Inertia middleware, and provide a template string. 
// Put '@inertia' somewhere in the body, which will be replaced by the Inertia bootstrapping frontend code
new Inertia(app, `
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
</html>`, 
// Optional function to determine Inertia version
() => {
  return Deno.env.get('OPTIONAL_INERTIA_VERSION')
})

// Use the Oak router
const router = new Router()

// use the 'inertia.render()' method now attached to the Oak context to render an Inertia page
router.get('/', (ctx, next) => {
  const componentName = 'HomePage'
  const payloadObject = {
    username: 'johndoe'
    email: 'jdizzle@example.com'
  }

  ctx.state.inertia.render(componentName, payloadObject)
})
```

## Features
- [x] Basic functionality
- [x] Version support
- [ ] Partial reload support