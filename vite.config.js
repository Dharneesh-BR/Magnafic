import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function netlifyFunctionsDevPlugin() {
  return {
    name: 'netlify-functions-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions', async (request, response) => {
        const requestUrl = new URL(request.url || '/', 'http://localhost')
        const functionName = requestUrl.pathname.replace(/^\/+/, '').split('/')[0]

        if (!/^[a-z0-9-]+$/i.test(functionName)) {
          response.statusCode = 404
          response.end(JSON.stringify({ error: 'Function not found.' }))
          return
        }

        const functionPath = resolve(process.cwd(), 'netlify', 'functions', `${functionName}.js`)

        if (!existsSync(functionPath)) {
          response.statusCode = 404
          response.end(JSON.stringify({ error: 'Function not found.' }))
          return
        }

        try {
          const body = await new Promise((resolveBody, rejectBody) => {
            const chunks = []
            request.on('data', (chunk) => chunks.push(chunk))
            request.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
            request.on('error', rejectBody)
          })
          const functionModule = await import(
            `${pathToFileURL(functionPath).href}?updated=${Date.now()}`
          )
          const result = await functionModule.handler({
            httpMethod: request.method,
            headers: request.headers,
            body: body || null,
            path: `/.netlify/functions/${functionName}`,
            rawUrl: `http://${request.headers.host}/.netlify/functions/${functionName}${requestUrl.search}`,
            queryStringParameters: Object.fromEntries(requestUrl.searchParams),
          }, {})

          response.statusCode = result?.statusCode || 200
          Object.entries(result?.headers || {}).forEach(([name, value]) => {
            response.setHeader(name, value)
          })
          response.end(result?.body || '')
        } catch (error) {
          console.error(`Local Netlify Function "${functionName}" failed:`, error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Local function execution failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), netlifyFunctionsDevPlugin()],
  }
})
