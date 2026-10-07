export function getNumericCodePointUnitCount(codePoint: number) {
  return String.fromCodePoint(codePoint).length;
}

export function getCodePointUnitCount(str: string, idx: number) {
  const codePoint = str.codePointAt(idx);
  if (codePoint === undefined) return 0;
  return getNumericCodePointUnitCount(codePoint);
}

export function hasCodePointsInUnitWindow(str: string, idx: number, windowSize: number) {
  let units = getCodePointUnitCount(str, idx);
  idx += units;

  while (units < windowSize) {
    const nextUnits = getCodePointUnitCount(str, idx);
    units += nextUnits;
    idx += nextUnits;
  }

  return units === windowSize;
}
