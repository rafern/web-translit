// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

export function fancyJoin(
  array: ReadonlyArray<string>,
  transformer: (s: string) => string,
): string {
  if (array.length <= 1) return transformer(array[0]);

  let out = "";
  const arrayLenM1 = array.length - 1;
  for (let a = 0; a < arrayLenM1; a++) {
    if (a > 0) out += ", ";
    out += transformer(array[a]);
  }

  return out + " or " + transformer(array[arrayLenM1]);
}

export function extractNewlines(str: string): Array<number> {
  const newlines: Array<number> = [];
  let idx = 0;
  while ((idx = str.indexOf("\n", idx)) !== -1) {
    newlines.push(idx++);
  }

  return newlines;
}

export function charIdxToPos(
  idx: number,
  newlines: ReadonlyArray<number>,
): [line: number, col: number] {
  const newlineCount = newlines.length;
  if (newlineCount === 0) return [1, idx + 1];

  let line = newlineCount;
  for (let l = 0; l < newlineCount; l++) {
    if (newlines[l] >= idx) {
      line = l;
      break;
    }
  }

  const lastLineStart = line > 0 ? newlines[line - 1] + 1 : 0;
  return [line + 1, idx - lastLineStart + 1];
}

export function fancyCharIdx(idx: number, newlines: ReadonlyArray<number>): string {
  const [line, col] = charIdxToPos(idx, newlines);
  return `L${line}:C${col}`;
}

export function fancyCharIdxRange(
  startIdx: number,
  endIdx: number,
  newlines: ReadonlyArray<number>,
): string {
  // FIXME this needs to somehow do columns based on graphemes, not code units
  //       or code points. transliterate "y" to "й" to see why (the range says
  //       it spans 2 characters but it looks like one due to the accent)
  const [sLine, sCol] = charIdxToPos(startIdx, newlines);
  const [eLine, eCol] = charIdxToPos(endIdx - 1, newlines);

  if (sLine === eLine) {
    if (sCol === eCol) {
      return `L${sLine}:C${sCol}`;
    } else {
      return `L${sLine}:C[${sCol} - ${eCol}]`;
    }
  } else {
    return `L${sLine}:C${sCol} - L${eLine}:C${eCol}`;
  }
}
