import { ImageResponse } from "next/og";

/**
 * Apple touch icon.
 *
 * iOS will not render an SVG touch icon, so the one raster we need is generated
 * here at build time with Next's built-in `ImageResponse` — no image pipeline,
 * no extra dependency, and nothing binary checked into the repository.
 *
 * The artwork is the same original ShieldQuest mark as `public/icon.svg`, drawn
 * full-bleed because iOS applies its own corner mask. Keep the two in sync.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<path d="M256 92 L402 137 L402 262 C402 346 344 407 256 435 C168 407 110 346 110 262 L110 137 Z" fill="#f2ae33"/>
<path d="M256 160 C220 160 192 189 192 224 C192 268 256 352 256 352 C256 352 320 268 320 224 C320 189 292 160 256 160 Z" fill="#0b2545"/>
<circle cx="256" cy="224" r="26" fill="#f2ae33"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b2545",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={164}
          height={164}
          alt=""
          src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
        />
      </div>
    ),
    size,
  );
}
