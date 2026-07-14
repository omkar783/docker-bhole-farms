# Premium Organic Farm Banner

## Goal
Create a reusable `PageBanner` component that replaces all inline hero sections across the 7 public website pages (Home, Products, About, Gallery, Blog, Contact, FAQ) with a consistent premium/cinematic design.

## Component API

```tsx
interface PageBannerProps {
  backgroundImage: string;
  badge?: string;
  heading: string;
  highlightedWord?: string;
  highlightedGradient?: string;
  subtitle: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  rightImage?: string;
  rightImageAlt?: string;
  showRatingCard?: boolean;
  showTrustBadges?: boolean;
}
```

## Decoration Layers (bottom→top)
1. Background image (full-bleed, gentle zoom)
2. Dark gradient overlay (black/70 → black/40 → transparent)
3. Vignette radial gradient on edges
4. Sunlight rays (animated diagonal)
5. Glow circles (backdrop-blur soft blobs)
6. Floating leaves (4 positions, different float speeds)
7. Tiny glowing particles (8 dots with staggered pulse)
8. Content: left text column + optional right image + optional glass rating card
9. SVG organic wave divider at bottom

## Per-Page Configuration

| Page | bg | heading | highlight | subtitle | right image | primary CTA | secondary CTA |
|------|----|---------|-----------|----------|-------------|-------------|---------------|
| Home | Drone orchard golden hour | Fresh from | Our Farm | 100% organic produce | farm scene | Explore Products | Visit Farm |
| Products | Mango basket display | Our | Products | Handpicked organic produce | mango basket | Shop Now | Visit Farm |
| About | Farmer sunrise orchard | About Bhole | Farms | Rooted in tradition | farmer portrait | Our Story | Explore Products |
| Gallery | Farm scenery harvest | Our | Gallery | A glimpse into farm life | photo collage | Plan Your Visit | View Products |
| Blog | Farmer writing notes | Stories from | Bhole Farms | Updates from the farm | notebook + mangoes | Read Our Blog | Visit Farm |
| Contact | Mango basket rustic table | Contact | Us | We'd love to hear from you | basket + leaves | Get in Touch | WhatsApp Us |
| FAQ | Orchard background | Frequently Asked | Questions | Everything you need to know | — | Ask a Question | Explore Products |

## Implementation Steps
1. Add CSS keyframes (ray, leaf-drift-alt) and utility classes to globals.css
2. Create `src/components/shared/page-banner.tsx` — the reusable component
3. Replace inline `<section className="relative min-h-[...] flex items-center overflow-hidden">` hero blocks in all 7 pages
4. Build + verify

## Component Architecture
- "use client" component using framer-motion for fade-up, image zoom, parallax
- Static decorations (leaves, glow blobs, particles) use CSS animations, not JS, for perf
- Wave divider is an inline SVG at the bottom
- Rating card uses existing `.glass` CSS class
- All Tailwind classes for styling (no CSS modules needed)
