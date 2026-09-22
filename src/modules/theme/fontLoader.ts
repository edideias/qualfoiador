/**
 * Dynamically loads Google Fonts into document head.
 */

const loadedFonts = new Set<string>();

export const AVAILABLE_GOOGLE_FONTS = [
  'Plus Jakarta Sans',
  'Manrope',
  'Inter',
  'Sora',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Urbanist',
  'Montserrat',
  'Poppins',
];

export function ensureFontLoaded(fontFamily: string) {
  if (typeof document === 'undefined' || !fontFamily) return;
  if (loadedFonts.has(fontFamily)) return;

  // Format font name for Google Fonts API (replace spaces with +)
  const fontName = fontFamily.trim();
  const formattedName = fontName.replace(/\s+/g, '+');

  const linkId = `google-font-${fontName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (document.getElementById(linkId)) {
    loadedFonts.add(fontName);
    return;
  }

  try {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontName);
  } catch (err) {
    console.warn(`Could not load font ${fontName}:`, err);
  }
}
