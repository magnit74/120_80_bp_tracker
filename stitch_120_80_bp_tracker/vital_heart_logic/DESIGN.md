---
name: Vital Heart Logic
colors:
  surface: '#fff8f7'
  surface-dim: '#f1d3d0'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e7'
  surface-container-high: '#ffe2de'
  surface-container-highest: '#f9dcd9'
  on-surface: '#271816'
  on-surface-variant: '#5b403d'
  inverse-surface: '#3e2c2a'
  inverse-on-surface: '#ffedeb'
  outline: '#8f6f6c'
  outline-variant: '#e4beba'
  surface-tint: '#ba1a20'
  primary: '#af101a'
  on-primary: '#ffffff'
  primary-container: '#d32f2f'
  on-primary-container: '#fff2f0'
  inverse-primary: '#ffb3ac'
  secondary: '#685b5d'
  on-secondary: '#ffffff'
  secondary-container: '#f0dee0'
  on-secondary-container: '#6e6163'
  tertiary: '#4d586c'
  on-tertiary: '#ffffff'
  tertiary-container: '#657085'
  on-tertiary-container: '#f1f4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#930010'
  secondary-fixed: '#f0dee0'
  secondary-fixed-dim: '#d3c3c4'
  on-secondary-fixed: '#22191b'
  on-secondary-fixed-variant: '#4f4446'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#fff8f7'
  on-background: '#271816'
  surface-variant: '#f9dcd9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 12px
---

## Brand & Style

The design system is engineered to provide a sense of precision, reliability, and clinical authority while maintaining a compassionate, user-friendly interface. It targets a health-conscious demographic in the USA, ranging from young adults managing fitness to seniors monitoring chronic conditions.

The aesthetic follows a **Corporate / Modern** healthcare approach with a **Tactile** twist. It utilizes soft depth, high-clarity data visualization, and an organized informational hierarchy. The emotional goal is to reduce "white coat hypertension" by using soft rose-tinted surfaces that feel more approachable than sterile hospital blue, while the primary medical red maintains the necessary urgency for critical health data.

## Colors

The color system is rooted in medical semiotics. 
- **Primary Red (#D32F2F):** Used for key actions, brand identity, and alerts. It must be used sparingly to prevent user fatigue.
- **Secondary Rose (#FDEBED):** Acts as a soft container fill. It softens the interface, making the app feel less like a clinical tool and more like a wellness companion.
- **Neutral/Text (#1E293B):** A deep slate ensures high legibility and professional contrast against white and rose backgrounds.
- **Semantic Colors:** Green is reserved strictly for "Normal" (Systolic <120) readings, while Amber signifies "Elevated" or "Hypertension Stage 1."

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, systematic tone. 

- **Numerical Data:** For blood pressure readings (e.g., 120/80), use `display-lg` with tight letter spacing to emphasize the data.
- **Hierarchy:** Use `headline-md` for card titles and `label-lg` for category headers to ensure clear scannability.
- **Readability:** Body text is set with generous line height (1.5x) to accommodate users who may have visual impairments or require high-clarity clinical instructions.

## Layout & Spacing

The layout utilizes a **Fluid Grid** model optimized for mobile-first healthcare delivery. 

- **Grid:** A 4-column grid for mobile and an 8-column grid for tablet.
- **Safe Areas:** Standard 20px side margins ensure content does not hit the edge of the device, providing a "breathable" feel.
- **Rhythm:** An 8pt linear scale governs all padding and margins. Vertical rhythm should be strictly maintained between data cards (16px spacing) to allow the eye to distinguish between different health metrics.
- **Density:** High information density is permitted within cards, provided it is balanced by generous external margins.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to create a structured hierarchy.

- **Surface Levels:** The primary background is `Neutral-50` (#F8F9FA). Cards sit on `Surface-Level 1` (Pure White) with a very soft, diffused shadow (0px 4px 20px, 4% opacity of Primary Red) to give them a slight "lift."
- **Interactive Depth:** When a card is pressed, it should "sink" slightly, reducing shadow blur. 
- **Glassmorphism:** Reserved specifically for the **Bottom Navigation Bar** and **Modal Overlays**, using a 20px backdrop blur and a 1px semi-transparent white border to maintain context of the underlying data while focusing the user's attention.

## Shapes

The shape language is consistently **Rounded (Level 2)**. 

- **Standard Cards:** Use 16px (`rounded-lg`) corner radius to evoke a friendly and modern feel.
- **Small Components:** Inputs and small buttons use 8px (`rounded-md`).
- **Interactive Elements:** Floating Action Buttons (FAB) for "Add Reading" should be fully rounded (pill-shaped) to distinguish them as the primary app trigger.
- **Visual Consistency:** Avoid sharp 0px corners entirely to maintain the "human-centric" medical aesthetic.

## Components

- **Primary Button:** High-saturation Primary Red fill with white text. High-contrast, 56px height for accessibility.
- **Measurement Cards:** White background, 16px radius, featuring a colored vertical accent bar on the left indicating the health status (Green/Amber/Red).
- **Chips:** Used for filtering history (e.g., "7 Days", "30 Days"). Use the Secondary Rose background with Primary Red text for the active state.
- **Input Fields:** Outlined style with a subtle grey border that turns Primary Red on focus. Labels should persist above the field when active.
- **Bottom Navigation:** Fixed position, frosted glass effect. Icons should be "thinline" 2px stroke weight, with the active state utilizing a Primary Red tint and a small dot indicator below the icon.
- **Data Visualization:** Line charts should use a smooth bezier curve (2px width) in Primary Red, with shaded areas underneath using a 10% opacity gradient of the same color.