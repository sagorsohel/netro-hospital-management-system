/**
 * Dependency-free Code 128 (set B) barcode generator.
 * Any USB/Bluetooth barcode scanner can read the output.
 * Returns a plain SVG string so it works both in React and inside print HTML.
 */

const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

const START_B = 104;
const STOP = 106;

/** Module widths (bar, space, bar, ...) for a value encoded in Code 128-B. */
export const encodeCode128 = (value: string): number[] => {
  const codes: number[] = [START_B];
  for (const ch of value) {
    const c = ch.charCodeAt(0);
    if (c < 32 || c > 126) throw new Error(`Unsupported barcode character: ${ch}`);
    codes.push(c - 32);
  }
  let checksum = START_B;
  for (let i = 1; i < codes.length; i++) checksum += codes[i] * i;
  codes.push(checksum % 103, STOP);

  const widths: number[] = [];
  codes.forEach((code) => CODE128_PATTERNS[code].split('').forEach((w) => widths.push(Number(w))));
  return widths;
};

export interface BarcodeSvgOptions {
  height?: number;
  moduleWidth?: number;
  showText?: boolean;
  color?: string;
}

export const barcodeSvg = (value: string, opts: BarcodeSvgOptions = {}): string => {
  const { height = 48, moduleWidth = 1.6, showText = true, color = '#0f172a' } = opts;
  const widths = encodeCode128(value);
  const quiet = 10 * moduleWidth;
  const totalModules = widths.reduce((a, b) => a + b, 0);
  const width = totalModules * moduleWidth + quiet * 2;
  const textH = showText ? 14 : 0;

  let x = quiet;
  let rects = '';
  widths.forEach((w, i) => {
    const wPx = w * moduleWidth;
    if (i % 2 === 0) {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${wPx.toFixed(2)}" height="${height}" fill="${color}"/>`;
    }
    x += wPx;
  });

  const text = showText
    ? `<text x="${width / 2}" y="${height + 12}" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="11" letter-spacing="1" fill="${color}">${value}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(0)}" height="${height + textH}" viewBox="0 0 ${width.toFixed(2)} ${height + textH}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/>${rects}${text}</svg>`;
};
