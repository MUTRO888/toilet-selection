# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

No test framework is configured.

## Project: 如厕精选 (Toilet Selection)

A web-based vertical short-video asset generator for Xiaohongshu/TikTok. Core concept: "Cyber Altar" — combining music (vinyl) with a toilet to create an absurd, trendy, aloof audiovisual ritual. Users paste an Apple Music link, and the page generates a 3D rendered scene for screen recording.

## Architecture

**Stack:** React 19 + Vite + react-three-fiber (R3F) + drei + zustand + CSS Modules

**Data flow:** User pastes Apple Music URL → `useMusicStore.parseAppleMusicLink()` → iTunes Search API (no backend, direct fetch) → extracts `trackName`, `artistName`, `artworkUrl100` (upscaled to 1024x1024) → store update triggers re-renders across 3D scene and UI.

**Layout:** Two-column desktop layout — left is an iPhone 13 frame (390×844px) containing the poster preview, right is a control panel with the URL input. The poster has three layers stacked via CSS: `Background` (z:-1) → `Canvas` (3D scene) → `Header`/`Marquee` (z:100 overlays).

### 3D Scene (src/components/Scene/)

All 3D components live inside a single R3F `<Canvas>` with transparent background (`gl.alpha: true`). The scene composes:

- **AlbumSleeve** — A flat box at z:-5 showing the cover art as a 3D "wall" backdrop
- **VinylRecord** — Cylinder with canvas-drawn label texture (grooves via torus rings). Rotates via **GroupRotation** (`useFrame` loop)
- **ToiletArt** — Procedural white porcelain toilet (tank + base + bowl + seat + lid) with gold trim accents. Built from primitive geometries (cylinders, boxes, torus). Sits at vinyl center as a "spindle weight"
- **CurvedText** — Per-character text rendered as planes along a circular arc. Each character gets its own canvas texture. Has adaptive font sizing for long titles
- **Lights** — Three-point lighting (key + fill + rim) + ambient + colored point light from below

The vinyl+toilet group is rotated `[PI/2, 0, 0]` so the disc faces the camera. Camera uses a low angle (worm's-eye view) for dramatic perspective.

### UI Layer (src/components/UI/)

- **Background** — Full-screen blurred album cover behind the canvas (CSS `filter: blur(60px)`), with a gradient fallback
- **Header** — "TOILET SELECTION / 如厕精选" in hollow stroke typography (transparent fill + `-webkit-text-stroke`)
- **Marquee** — Bottom ticker with monospace text animation
- **InputOverlay** — Form in control panel that triggers `parseAppleMusicLink`

### Key Constants (src/config/constants.js)

`SCENE.RECORD_RADIUS`, `COLORS.HIGHLIGHT (#ccff00)`, `SCENE.ROTATION_SPEED` — centralized scene params. Note: camera config in constants.js may diverge from actual App.jsx values.

## Design Rules

- **Composition:** Three-layer depth — blurred cover background → vinyl disc (midground) → toilet totem (foreground)
- **Camera:** Must be low-angle (微仰视). Never top-down god's-eye view. The vinyl should appear as an ellipse with visible thickness
- **Toilet:** Always a detailed geometric model (cylinders, boxes, torus) with porcelain + gold materials. Never simplify to a sphere or primitive
- **Title typography:** Hollow stroke style (`color: transparent` + `-webkit-text-stroke`) for the brand header
- **Highlight color:** `#ccff00` (neon yellow-green) used throughout for text, accents, decorative elements
- **Text on vinyl:** Inner-circle curved text must auto-adapt font size based on string length
