# IDOL SNAP CLUB · 4-Cut Photobooth

A mobile-first Next.js photobooth starter. Camera frames and photostrips are composited in the browser with Canvas; there is no upload endpoint, account system, or database.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Camera access requires HTTPS in production (localhost is permitted for development).

## Add your 20 transparent idol PNGs

Replace the placeholders in:

```text
public/members/member-01/cut-01.png ... cut-04.png
...
public/members/member-05/cut-01.png ... cut-04.png
```

Each cutout should be a transparent PNG designed on a **900 × 1200 portrait canvas**. The PNG is drawn as the top layer over the fan camera frame. Keep transparent pixels wherever the fan should remain visible. The composition should be designed together with the camera framing, not as a separate side-by-side card.

Replace each `profile.svg` with your own profile image if desired. Edit names, colours, backgrounds, sticker sets and camera defaults in `src/config/members.ts`.

## Composition model

The camera preview fills the stage, cropped with `object-fit: cover`, then zoom/offset controls are applied. The fixed idol PNG overlays it. On capture, `composeCut()` repeats the crop and draws the exact idol asset into a 900 × 1200 Canvas. Captures are stored as data URLs in React state. Four captures become a vertical PNG strip.

**Important asset note:** transparent idol assets are intentionally not fabricated. Until you add your 20 PNGs, the camera preview still works, but the idol overlay will be absent. Add assets with matching filenames.

## Browser notes

- Use Safari on iOS or Chrome on Android and grant camera permission.
- Deploy on Vercel with HTTPS.
- The camera is stopped when leaving capture or finishing.
- Images are kept in the current browser session only. Reloading the page clears them.
- The live preview is mirrored for selfie familiarity; captured output is mirrored too.
- Test crop alignment with your actual transparent cutouts. The default cutout canvas assumes the same 3:4 portrait frame as the live stage.

## Vercel

Push this folder to GitHub, import the repository into Vercel, and keep the default Next.js build settings. No environment variables are required.

## Current scope

Includes landing, member picker, live front-camera composition, crop/zoom controls, 3-second countdown, four sequential captures, per-cut retake, sticker placement/resize/rotation, strip preview, and PNG download.

The starter uses a simple touch-friendly sticker editor. For a production release, add keyboard accessibility for sticker movement, device-specific Safari QA, and drag testing with real member cutout assets.
