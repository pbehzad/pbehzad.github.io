import { MENU_DROPLET_MAP } from './menuDropletMap';

/**
 * Static SVG filters for the menu control's optional glass droplet. Rendered
 * once by the shell; nothing here changes after first paint, which keeps
 * WebKit's filter snapshotting correct.
 *
 * - menu-droplet-light: specular rim computed from the control's own shape
 *   (a blurred alpha disc used as a height map), lit at a low angle from
 *   the upper left and, more faintly, the lower right, so the flat centre
 *   stays clear and only the rim catches light.
 * - menu-droplet-refract: displaces the backdrop inward near the rim with
 *   the generated map. Only Chromium renders SVG backdrop filters, so the
 *   stylesheet applies it there alone.
 */
export function MenuDropletDefs() {
  return (
    <svg className="ui-visually-hidden" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="menu-droplet-light"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="5"
            specularConstant="1.2"
            specularExponent="40"
            lightingColor="#ffffff"
            result="key"
          >
            <feDistantLight azimuth="225" elevation="26" />
          </feSpecularLighting>
          <feSpecularLighting
            in="height"
            surfaceScale="5"
            specularConstant="0.5"
            specularExponent="40"
            lightingColor="#ffffff"
            result="fill"
          >
            <feDistantLight azimuth="45" elevation="26" />
          </feSpecularLighting>
          <feMerge result="lights">
            <feMergeNode in="key" />
            <feMergeNode in="fill" />
          </feMerge>
          {/* Softens 8-bit height-map quantization, which reads as grain. */}
          <feGaussianBlur in="lights" stdDeviation="0.6" result="smooth" />
          <feComposite in="smooth" in2="SourceAlpha" operator="in" />
        </filter>

        <filter
          id="menu-droplet-refract"
          x="0"
          y="0"
          width="1"
          height="1"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feImage href={MENU_DROPLET_MAP} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.36" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
