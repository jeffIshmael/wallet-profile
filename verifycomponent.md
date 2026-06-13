Good progress! Two remaining issues:

1. **Highlight** is on "Attestation Hash" row — needs to move up one row to "Verification Code:"
2. **Lens is still blank** — the zoom math uses `containerWidth` (the full image container ~460px) but should use `lensSize.width` (300px) as the scale base

Here are the fixes:

**1. Fix the `top` value** — move up ~1.5%:

```typescript
top: {
  highlight: { top: 23.2, left: 3.5, width: 93, height: 1.35 },
  ...
}
```

**2. Fix the lens zoom math** — the `scaledW` should be based on `lensSize.width`, not `containerWidth`:

```tsx
// WRONG — scales the full container width, image becomes huge
const scaledW = scale * containerWidth;

// RIGHT — scales relative to the lens box width
const scaledW = scale * lensSize.width;
```

So in `LensCallout`, replace these lines:

```tsx
const scaledW = scale * lensSize.width;   // ← change this (was containerWidth)
const scaledH = scaledW * IMAGE_ASPECT;
const marginLeft = halfW - (center.x / 100) * scaledW;
const marginTop = halfH - (center.y / 100) * scaledH;
```

And since `containerWidth` is no longer needed, you can remove the prop, the `useRef`, the `useEffect`, and the `ResizeObserver` entirely — simplifying back to the cleaner version:

```tsx
// Remove containerWidth prop from LensCallout signature
function LensCallout({ imageSrc, hotspot }: { imageSrc: string; hotspot: Hotspot }) {

// Remove from VerificationGuide:
// - const [containerWidth, setContainerWidth] = useState(0);
// - const containerRef = useRef<HTMLDivElement>(null);
// - the entire useEffect block

// Remove ref={containerRef} from the div
// Remove containerWidth from <LensCallout ... />
```

The root issue all along was that `scaledW = scale * containerWidth` made the image ~3000px wide inside a 300px lens — so the region being shown was always way off-center and appeared white/blank.