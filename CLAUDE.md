# George Street Rummy Scorekeeper

Mobile-first, offline-capable scorekeeper for George Street Rummy.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (runs type-check + build) |
| `pnpm preview` | Preview production build |
| `pnpm test:unit` | Run unit tests (Vitest) |
| `pnpm test:unit --run` | Run tests once without watch mode |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint with auto-fix |
| `pnpm format` | Format code with Prettier |

## Icons

Icon components in `src/presentation/components/icons/`. When choosing icons:

| Element Type | Style | Naming |
|--------------|-------|--------|
| Actions (buttons, tappable) | Solid | `Icon{Name}` |
| State indicators (non-interactive) | Outline | `Icon{Name}Outline` |

Do not use Light, Thin, or Duotone styles.
