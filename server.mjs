import http from 'node:http';
import next from 'next';
import httpProxy from 'http-proxy';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

const dev = process.argv.includes('--dev');
process.env.NODE_ENV = dev ? 'development' : 'production';
loadEnvConfig(process.cwd(), dev);

const hostname = process.env.HOST ?? '0.0.0.0';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const backendUrl = process.env.BACKEND_URL ?? 'https://api.traccar.infinitedebugger.com';

const app = next({ dev, hostname, port, webpack: true });
const handle = app.getRequestHandler();
const proxy = httpProxy.createProxyServer({
  target: backendUrl,
  changeOrigin: true,
  ws: true,
});

proxy.on('error', (error, request, response) => {
  console.error('Backend proxy error:', error.message);
  if (response && 'writeHead' in response && !response.headersSent) {
    response.writeHead(502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Backend is unavailable' }));
  }
});

await app.prepare();
const handleUpgrade = app.getUpgradeHandler();

const server = http.createServer((request, response) => {
  if (request.url?.startsWith('/api/')) {
    proxy.web(request, response);
  } else {
    handle(request, response);
  }
});

server.on('upgrade', (request, socket, head) => {
  if (request.url?.startsWith('/api/')) {
    proxy.ws(request, socket, head);
  } else {
    handleUpgrade(request, socket, head);
  }
});

server.listen(port, hostname, () => {
  console.log(`Traccar Web listening on http://${hostname}:${port}`);
  console.log(`Proxying /api to ${backendUrl}`);
});
