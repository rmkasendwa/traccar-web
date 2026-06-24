# [Traccar Web Interface](https://www.traccar.org)

## Overview

Traccar is open source server for various GPS tracking devices. This repository contains web interface for the Traccar platform. For back-end checkout [main Traccar repository](https://github.com/tananaev/traccar).

The app uses the Next.js App Router, TypeScript, Tailwind CSS, React, Redux, and MapLibre.

## Development

Copy `.env.example` to `.env` and adjust the runtime settings:

```bash
PORT=3000
BACKEND_URL=http://localhost:8082
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

`PORT` controls the web server port. `BACKEND_URL` controls where HTTP and WebSocket
requests under `/api` are proxied, which keeps Traccar session cookies same-origin.
The npm scripts set the Next.js mode in JavaScript, so they work unchanged in
Windows Command Prompt, PowerShell, macOS, and Linux.

## Project Structure

```text
app/          Next.js routes, layouts, and route composition
components/   Shared UI primitives and application layouts
controllers/  Global side effects and runtime controllers
features/     Domain-specific pages, components, hooks, and utilities
lib/          Shared adapters, API helpers, and non-UI utilities
providers/    Application-wide providers and context setup
store/        Redux store, slices, reducers, and middleware
types/        Shared TypeScript declarations
public/       Static assets
```

## Production

```bash
npm run build
npm start
```

Production also reads `PORT` and `BACKEND_URL` from `.env`.

## Docker

Build and run the production image:

```bash
docker build -t traccar-web .
docker run --rm \
  -p 3000:3000 \
  -e PORT=3000 \
  -e BACKEND_URL=https://api.traccar.infinitedebugger.com \
  traccar-web
```

Or use Docker Compose:

```bash
PORT=3000 \
BACKEND_URL=https://api.traccar.infinitedebugger.com \
docker compose up --build
```

The container runs the custom Next.js server, preserving same-origin HTTP and WebSocket
proxying for all `/api` requests.

## Team

- Anton Tananaev ([anton@traccar.org](mailto:anton@traccar.org))
- Andrey Kunitsyn ([andrey@traccar.org](mailto:andrey@traccar.org))

## License

    Apache License, Version 2.0

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
