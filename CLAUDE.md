# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses **Bun** as the package manager and runtime. Use these commands:

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Check TypeScript and Svelte validity - RUN THIS BEFORE COMMITTING
bun run check

# Watch mode for type checking
bun run check:watch
```

**Important**: Always run `bun run check` to validate code before marking tasks as complete, not `bun run dev`.

## Project Architecture

This is an incremental/idle game built with SvelteKit, Svelte 5, and TailwindCSS v4. The game follows a clicker/idle game pattern where players collect RGB pixels to convert into white pixels for purchasing upgrades.

### Technology Stack
- **Framework**: SvelteKit with Svelte 5
- **Styling**: TailwindCSS v4 (using @tailwindcss/vite)
- **Language**: TypeScript
- **Deployment**: Cloudflare adapter
- **Audio**: Howler.js for sound effects
- **Runtime**: Bun

### Store Architecture

The game uses Svelte stores for reactive state management with localStorage persistence:

- **`pixels.ts`**: Core game currency (red, green, blue, white pixels)
  - Handles RGB pixel collection and conversion to white pixels
  - Provides `canConvert` derived store for UI reactivity

- **`upgrades.ts`**: Generators, powerups, and breakthrough systems
  - Generators: Automated pixel collectors with levels and rates
  - Powerups: Multiplicative speed boosts
  - Breakthroughs: Upgrades that overcome production soft caps
  - Accumulator system for fractional bit collection
  - Auto-tick runs every 100ms

- **`game.ts`**: Game statistics tracking (clicks, conversions, playtime)

- **`audio.ts`**: Sound effect management with user preference persistence

- **`saveManager.ts`**: Centralized save/load functionality

- **`inputController.ts`**: Keyboard and gamepad input handling

### Component Organization

```
src/lib/components/
├── ui/                    # Reusable UI components
│   ├── GameButton.svelte # Styled button component
│   └── GameCard.svelte    # Card container component
├── PixelButton.svelte     # RGB pixel clicker buttons
├── ConvertButton.svelte   # RGB to white conversion
├── WhitePixelDisplay.svelte # White pixel counter display
├── BuyingArea.svelte      # Main upgrade interface with tabs
├── GeneratorUpgrade.svelte # Generator purchase UI
├── PowerupUpgrade.svelte  # Speed multiplier purchase UI
├── BreakthroughUpgrade.svelte # Breakthrough upgrade UI
├── GeneratorIndicator.svelte # Active generators display
├── SettingsModal.svelte   # Game settings dialog
└── GameHeader.svelte      # Title and stats display
```

### Game Mechanics

1. **Core Loop**: Click RGB buttons → Collect 1+ of each color → Convert to white pixel
2. **Progression**: White pixels → Purchase generators → Generate bits automatically
3. **Soft Caps**: Production efficiency decreases at high rates (10, 100, 1000 bits/sec thresholds)
4. **Breakthroughs**: Overcome soft caps by purchasing breakthrough upgrades
5. **Multipliers**: Powerups multiply all generator rates exponentially
6. **Accumulator System**: Fractional bits accumulate over time to handle sub-1 rates

### Key Implementation Details

- All stores auto-save to localStorage on changes
- The game handles tab/window inactivity by calculating delta time
- Bit accumulator prevents loss of fractional bits between ticks
- Random generator distributes bits evenly across RGB colors
- Powerup multipliers stack multiplicatively (2x * 5x = 10x)
- Soft cap system uses fractional powers to reduce production efficiency at high rates
- Breakthrough upgrades extend soft cap thresholds by multiplicative factors

### Deployment Configuration

The project uses `@sveltejs/adapter-cloudflare` for deployment. The adapter is configured in `svelte.config.js` and handles static asset generation for Cloudflare Pages/Workers.

### CSS Architecture

The app uses TailwindCSS v4 with custom game-specific classes defined in `src/app.css`:
- `.pixel-button`: Base button styling with glow effects
- `.stats-label`: Consistent label styling
- Extensive use of CSS variables for theming

### Testing Approach

Run `bun run check` to validate:
- TypeScript type correctness
- Svelte component validity
- Import resolution
- Template syntax

No unit tests are currently configured, but the type checking provides baseline validation.