// Rough portrait layout of a module on a rectangular roof face.
// 0.2 m clearance on every edge and 20 mm gaps between modules; ignores obstructions on purpose.
export function fitModules(faceLength, faceHeight, product, { edge = 0.2, gap = 0.02 } = {}) {
  const modW = product.compare.width_mm / 1000;
  const modL = product.compare.length_mm / 1000;
  const cols = Math.max(0, Math.floor((faceLength - 2 * edge + gap) / (modW + gap)));
  const rows = Math.max(0, Math.floor((faceHeight - 2 * edge + gap) / (modL + gap)));
  const count = cols * rows;
  return { cols, rows, count, kwp: (count * product.compare.power_w) / 1000 };
}
