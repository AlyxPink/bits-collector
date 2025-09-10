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
  - Generators: Automated pixel collectors with levels and rates (costs from config)
  - Powerups: Multiplicative speed boosts (multipliers from config)
  - Breakthroughs: Upgrades that overcome production soft caps (effects from config)
  - Accumulator system for fractional bit collection
  - Auto-tick runs using configurable interval

- **`game.ts`**: Game statistics tracking (clicks, conversions, playtime)

- **`audio.ts`**: Sound effect management with user preference persistence

- **`saveManager.ts`**: Centralized save/load functionality

- **`inputController.ts`**: Keyboard and gamepad input handling

### Configuration Architecture

The game uses a centralized configuration system to eliminate hardcoded values and ensure maintainability:

- **`src/lib/config/`**: Centralized game configuration module
  - **`gameConfig.ts`**: Master export file that re-exports all configurations
  - **`types.ts`**: TypeScript interfaces for all configuration structures
  - **`generators.config.ts`**: Generator costs, rates, and multipliers
  - **`converters.config.ts`**: Auto-converter settings and parameters
  - **`lumen.config.ts`**: Lumen system upgrade configurations
  - **`mechanics.config.ts`**: Game mechanics (soft caps, thresholds, milestones)

**Architecture Pattern**: `Configuration → Stores → Components`
- Stores import configuration values instead of hardcoding them
- Components continue using store methods (API unchanged)
- Single source of truth for all game balance parameters
- Type-safe configuration with compile-time validation

**Configuration Module Structure**:
```
src/lib/config/
├── types.ts              # TypeScript interfaces for all config structures
├── gameConfig.ts         # Master export file (import from here)
├── generators.config.ts  # Generator costs: baseCost, costMultiplier, baseRate
├── converters.config.ts  # Auto-converter: costs, rates, maxLevels, unlock requirements
├── lumen.config.ts       # Lumen upgrades: costs, effects, descriptions
└── mechanics.config.ts   # Soft caps, thresholds, milestones, formulas
```

**Usage Pattern**:
```typescript
// In stores - import from master config
import { GENERATOR_CONFIG, POWERUP_CONFIG } from "$lib/config/gameConfig";

// Use config values instead of hardcoding
const baseCost = GENERATOR_CONFIG.red.baseCost; // Instead of: baseCost: 10
```

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
- Powerup multipliers stack multiplicatively (from config: 2x * 5x = 10x)
- Soft cap system uses fractional powers (from mechanics config) to reduce production efficiency
- Breakthrough upgrades extend soft cap thresholds by multiplicative factors (from config)
- Configuration is resolved at build time with zero runtime performance cost
- Config changes automatically propagate through stores to UI components
- Tree-shakeable imports ensure optimal bundle size for unused configurations

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

## Code Quality Standards

This project maintains high code quality standards through systematic architecture and best practices:

### Configuration Management
- **Single Source of Truth**: All game constants defined in `src/lib/config/`
- **No Hardcoded Values**: Game balance parameters must not be hardcoded in stores or components
- **Type Safety**: All configuration objects use TypeScript interfaces
- **Naming Conventions**: Configuration constants use `SCREAMING_SNAKE_CASE`

### Architecture Principles
- **Separation of Concerns**: Clean layers: Config → Store → Component
- **DRY Principle**: No duplicate values across the codebase
- **Encapsulation**: Components never directly access configuration
- **API Stability**: Store method signatures remain unchanged when config changes

### Code Organization
- **Feature-Based Config**: Related configurations grouped in dedicated files
- **Master Export Pattern**: Single import point (`gameConfig.ts`) with re-exports
- **Logical File Structure**: Clear naming and single responsibility per file
- **SvelteKit Conventions**: Proper use of `$lib` aliases and module organization

### Performance Standards
- **Zero Runtime Cost**: Configuration resolved at build time
- **Tree-Shaking Friendly**: Named exports enable dead code elimination
- **Build Optimization**: Static imports for optimal Vite bundling
- **Memory Efficiency**: Singleton configuration objects

### Quality Gates
- All code must pass `bun run check` before completion
- TypeScript strict mode enforced
- No magic numbers in business logic
- Full type coverage for all configuration objects

## Best Practices

### Configuration Management
- **Always use config**: Never hardcode game balance values in stores or components
- **Import from master**: Import configurations from `$lib/config/gameConfig` only
- **Type interfaces**: Create TypeScript interfaces for all configuration objects
- **Group logically**: Related configurations belong in the same config file
- **Document parameters**: Use JSDoc comments to explain complex configuration values

### Code Organization
- **Components → Stores → Config**: Maintain clean architectural layers
- **No direct config access**: Components must never import configuration directly
- **Preserve store APIs**: Store method signatures should remain stable when config changes
- **Feature-based files**: Organize config files by game system or feature area

### Development Workflow
1. **Config First**: Add new game parameters to configuration before implementing features
2. **Type Safety**: Define interfaces in `types.ts` before creating config objects
3. **Validation**: Run `bun run check` after any configuration changes
4. **Documentation**: Update CLAUDE.md when adding new configuration systems

### Balance Changes
- **Single Location**: All balance tweaks happen in config files only
- **Test Changes**: Use `bun run dev` to verify balance changes work correctly
- **Version Control**: Config changes should be atomic commits for easy rollback
- **Documentation**: Document major balance changes in commit messages