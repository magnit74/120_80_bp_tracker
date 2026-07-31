---
name: Premium Health Concierge
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#594141'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#8c7071'
  outline-variant: '#e0bfbf'
  surface-tint: '#b02a3e'
  primary: '#7b001f'
  on-primary: '#ffffff'
  primary-container: '#9e1b32'
  on-primary-container: '#ffb0b3'
  inverse-primary: '#ffb3b5'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#383b3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f5253'
  on-tertiary-container: '#c3c5c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#8f0c28'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 80px
  card-padding: 32px
---

## Brand & Style
The brand personality is authoritative yet empathetic, positioning itself as a high-end health concierge. It moves away from the utility-first nature of Material Design toward a sophisticated, editorial aesthetic. The design style is **Glassmorphism**, characterized by translucent layers, soft background blurs, and high-precision typography. The emotional response should be one of calm, exclusivity, and clinical excellence.

The UI avoids heavy solids, instead using light-refracting surfaces and "airy" white space to evoke a sense of cleanliness and modern medical luxury.

## Colors
The palette is rooted in a "Medical Luxury" spectrum.
- **Primary (Soft Crimson):** A muted, deep red used sparingly for key actions, status indicators, and branding elements. It should feel clinical and urgent, yet sophisticated.
- **Secondary (Deep Charcoal):** Used for primary text and structural grounding. It provides the high-contrast "ink" against the glass surfaces.
- **Tertiary (Pure White/Alabaster):** The base for all glass layers and background surfaces.
- **Neutral:** Mid-tone greys used for secondary information and subtle borders.

The "Glass" effect is achieved through high-transparency whites and subtle blurs, ensuring legibility while maintaining a light, ethereal quality.

## Typography
The system utilizes **Inter** exclusively to maintain a systematic and clean appearance. The "premium" feel is achieved through **tighter tracking** (letter-spacing) on headings and a wide range of weights. 

- **Headlines:** Use Bold and Semi-Bold weights with significant negative tracking to create a "locked-in" editorial look.
- **Body:** Standard weights with generous line heights for maximum readability.
- **Labels:** Small caps or all-caps with increased letter-spacing are used for metadata and categorization to provide a distinct hierarchy from body text.

## Layout & Spacing
The layout follows a **fluid grid** with "airy" margins to reinforce the premium nature of the service.
- **Desktop:** A 12-column grid with wide 64px outer margins.
- **Mobile:** A 4-column grid with 20px margins.
- **Rhythm:** Spacing follows a strict 8px base unit, but component internal padding (especially cards) is expanded to `32px` to provide a "breathable" luxury feel. Section gaps are intentionally large to separate different medical contexts clearly.

## Elevation & Depth
Depth is expressed through **Glassmorphism** and layering rather than traditional drop shadows.
- **Surfaces:** Use `backdrop-filter: blur(20px)` combined with a semi-transparent white fill (`rgba(255, 255, 255, 0.7)`).
- **Inner Shadows:** Cards and inputs feature a subtle, soft inner shadow (`inset 0 2px 4px rgba(0,0,0,0.02)`) to give the appearance of "etched" or "pressed" glass.
- **Borders:** Surfaces are defined by 1px solid borders in a very light, high-transparency white to catch "light" at the edges.
- **Stacking:** Higher elevation is represented by increased blur intensity and slightly higher opacity, creating a physical sense of stacking translucent sheets.

## Shapes
The shape language is **Rounded**, using consistent radii to soften the clinical precision of the typography. 
- **Standard Elements:** 8px (0.5rem) for buttons and small inputs.
- **Cards & Containers:** 16px (1rem) for primary layout containers and health cards.
- **Visual Continuity:** All glass layers must share the same corner radius when nested to maintain the "molded" aesthetic.

## Components
- **Buttons:** Primary buttons use the Soft Crimson fill with white text. Secondary buttons are "Ghost" style with a glass background and deep charcoal text. All buttons have a subtle inner glow on hover.
- **Cards:** The centerpiece of the system. Cards feature a 32px internal padding ("airy" margins), a 1px white border, and a 20px backdrop blur. They appear to float over the background.
- **Inputs:** Minimalist fields with a soft grey bottom border that transforms into a Crimson border on focus. Backgrounds are slightly more opaque than standard glass layers for legibility.
- **Lists:** Clean, border-less rows separated by generous whitespace. Use the "Label-sm" typography for list headers.
- **Chips/Badges:** Small, pill-shaped glass elements with Crimson text for status (e.g., "Confirmed," "High Priority").
- **Health-Specific:** "Metric Displays" use the Headline-xl size for data points, paired with a small, uppercase label below to emphasize the data's importance.