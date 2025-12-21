# Favicon Generation Instructions

This file contains instructions for generating the required favicon files from `public/logo.png`.

## Required Files

Generate the following favicon files and place them in the `public/` directory:

1. **favicon.ico** - Multi-size ICO file containing:
   - 16x16 pixels
   - 32x32 pixels
   - 48x48 pixels

2. **icon.svg** - Scalable vector icon (SVG format)

3. **icon-192x192.png** - PNG icon for Android (192x192 pixels)

4. **icon-512x512.png** - PNG icon for Android (512x512 pixels)

5. **apple-icon.png** - PNG icon for iOS (180x180 pixels)

6. **icon-light-32x32.png** - PNG icon for light mode (32x32 pixels)

7. **icon-dark-32x32.png** - PNG icon for dark mode (32x32 pixels)

## Tools for Generation

You can use online tools like:
- https://realfavicongenerator.net/
- https://favicon.io/
- https://www.favicon-generator.org/

Or use image editing software like:
- Photoshop
- GIMP
- ImageMagick (command line)

## Steps

1. Start with `public/logo.png` as the source image
2. Resize and optimize for each required size
3. For light/dark variants, adjust colors accordingly:
   - Light mode: Use original logo colors
   - Dark mode: Use inverted or adjusted colors for visibility
4. Save all files to the `public/` directory
5. Ensure files are optimized for web (compressed PNG, proper ICO format)

## Verification

After generating files, verify they appear correctly:
- Browser tab favicon
- Mobile home screen icon
- PWA manifest icons

