# Project Overview: Bits Collector

"Bits Collector" is an incremental/idle game built with SvelteKit and TypeScript. The game features mechanics around collecting "pixels," utilizing generators and converters, and managing various upgrades. Styling is handled by Tailwind CSS, and the project uses Vite for development and bundling. It is configured for deployment to Cloudflare Pages. Audio effects are managed with `howler.js`.

## Technologies Used:
*   **Framework:** SvelteKit
*   **Language:** TypeScript
*   **Bundler:** Vite
*   **Styling:** Tailwind CSS
*   **Audio:** howler.js
*   **Deployment:** Cloudflare Pages

## Building and Running

### Development
To start the development server:
```bash
npm run dev
```
Or, to start the server and open the app in a new browser tab:
```bash
npm run dev -- --open
```

### Building
To create a production-ready build of the application:
```bash
npm run build
```

### Previewing
To preview the production build locally:
```bash
npm run preview
```

### Type Checking
To run type checks:
```bash
npm run check
```
To run type checks in watch mode:
```bash
npm run check:watch
```

## Development Conventions

*   **Language:** All new code should be written in TypeScript.
*   **Framework:** Adhere to SvelteKit conventions for page routing, components, and stores.
*   **Styling:** Utilize Tailwind CSS for styling. Custom CSS should be added via `@layer` directives in `src/app.css` if necessary.
*   **State Management:** Svelte's `writable` stores are used for managing application state.
*   **Configuration:** Game-related configurations (generators, converters, lumen, etc.) are centralized in `src/lib/config/`.
*   **Components:** Reusable Svelte components are located in `src/lib/components/`.
*   **File Naming:** Follow standard SvelteKit and TypeScript naming conventions.
