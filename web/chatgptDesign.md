# UI Implementation Task: Verification Code Zoom Callout Component

## Context & Objective
We need to enhance the verification route (`/verify`) in our Next.js codebase. The objective is to guide users visually on where to find their "Verification Code" on the Chainalyse Financial Passport Report. We will implement an interactive or static visual callout overlay that highlights and magnifies the specific top-left metadata section of the document.

The component should display the document, dim the overall background slightly, and display a high-visibility, magnified "lens" focused directly on the **Verification Code** text row.

---

## Component Specifications (Next.js & Tailwind CSS)

### 1. Component File
Create a new component at `@/components/VerificationGuide.tsx` (or your preferred components directory).

```tsx
import React from 'react';
import Image from 'next/image';

interface VerificationGuideProps {
  imageSrc: string; // Path or URL to the Chainalyse report image
}

export const VerificationGuide: React.FC<VerificationGuideProps> = ({ imageSrc }) => {
  return (
    <div className="relative w-full max-w-[650px] mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      
      {/* Wrapper containing the baseline image and overlays */}
      <div className="relative w-full overflow-hidden rounded-lg">
        
        {/* Base Document Image */}
        <div className="relative w-full aspect-[1/1.41]">
          <Image
            src={imageSrc}
            alt="Chainalyse Passport Report Guide"
            fill
            sizes="(max-width: 650px) 100vw, 650px"
            priority
            className="object-contain"
          />
        </div>

        {/* Dimming overlay layer to draw focus to the callout */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300" />

        {/* Zoom Callout Container (Positioned absolutely over the target area) */}
        <div className="absolute top-[21%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          
          {/* Zoom Cutout Lens */}
          <div className="w-[280px] h-[75px] border-[3px] border-[#ff9900] rounded-lg overflow-hidden bg-white shadow-2xl ring-4 ring-orange-500/20">
            
            {/* Magnified Duplicate Image */}
            <div className="relative w-[340%] h-[340%] origin-top-left">
              <Image
                src={imageSrc}
                alt="Zoomed Detail"
                fill
                sizes="1000px"
                className="object-contain absolute"
                style={{
                  // Fine-tune these pixel percentage/pixel transformations based on final asset aspect ratios
                  top: '-13%', 
                  left: '-5%',
                }}
              />
            </div>
          </div>

          {/* Visual Indicator Arrow & Label */}
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#ff9900] mt-1" />
          
          <span className="mt-1 inline-flex items-center px-3 py-1 rounded bg-[#ff9900] text-xs font-bold text-white uppercase tracking-wider shadow-md">
            Find Your Code Here
          </span>
        </div>

      </div>
      
      <p className="mt-3 text-center text-sm text-gray-500 font-medium">
        Your Verification Code is located near the top left of the document wrapper.
      </p>
    </div>
  );
};

export default VerificationGuide;
```

---

## Implementation Instructions for the Agent

1. **Verify Asset Configuration:** Ensure the target image asset is stored locally within the `public/` directory (e.g., `public/images/wallet-report-sample.jpg`) or fetched via a trusted remote domain configured inside `next.config.js`.
2. **Coordinate Tuning:** Depending on the exact margin cuts and dimensions of the finalized passport asset file, tweak the absolute top/left coordinates (`top-[21%] left-[32%]`) as well as the sub-image relative positioning (`top: '-13%', left: '-5%'`) to ensure the text `Verification Code: REP-SAMPLE-000001` falls square in the center of the zoom viewport frame.
3. **Integration:** Mount `<VerificationGuide imageSrc="/images/wallet-report-sample.jpg" />` directly adjacent to or natively embedded inside the token lookup input form on the verification page file layout (`app/verify/page.tsx` or `pages/verify.tsx`).
