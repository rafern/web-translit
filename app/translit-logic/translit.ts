// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import { type TranslitCompiledRules } from "./rule";
import { getNumericCodePointUnitCount, hasCodePointsInUnitWindow } from "../utils/unicode";

export const enum TranslitResultWarnCtxType {
  AmbiguousMapping,
  AmbiguousCapitalisation,
  NoMatch,
}

export type TranslitResultWarnCtx =
  | {
      type: TranslitResultWarnCtxType.AmbiguousMapping;
      candidates: Array<string>;
    }
  | {
      type: TranslitResultWarnCtxType.AmbiguousCapitalisation;
    }
  | {
      type: TranslitResultWarnCtxType.NoMatch;
    };

export interface TranslitResultWarn {
  inStart: number;
  inEnd: number;
  outStart: number;
  outEnd: number;
  context: TranslitResultWarnCtx;
}

export interface TranslitResultRange {
  start: number;
  end: number;
  warnIdxs: Array<number>;
}

export interface TranslitResult {
  text: string;
  warns: Array<TranslitResultWarn>;
  ranges: Array<TranslitResultRange>;
}

const enum LetterCase {
  Lower,
  Upper,
  // for single letters: not a letter. for ranges: ambiguous (treat as lower)
  Unknown,
}

function getLetterCase(letter: string): LetterCase {
  if (letter == letter.toUpperCase()) {
    return letter == letter.toLowerCase() ? LetterCase.Unknown : LetterCase.Upper;
  } else {
    return LetterCase.Lower;
  }
}

function getWindowCase(window: string): LetterCase {
  let firstCase: LetterCase | undefined;
  let secondCase: LetterCase | undefined;

  for (const char of window) {
    const letterCase = getLetterCase(char);
    if (letterCase === LetterCase.Unknown) continue;

    if (firstCase === undefined) {
      firstCase = letterCase;
      continue;
    }

    if (secondCase === undefined) {
      if (firstCase === LetterCase.Lower && letterCase !== firstCase) {
        return LetterCase.Unknown;
      }

      secondCase = letterCase;
      continue;
    }

    if (secondCase !== letterCase) return LetterCase.Unknown;
  }

  return firstCase ?? LetterCase.Lower;
}

function tryCutRange(ranges: Array<TranslitResultRange>, rangeIdx: number, cutIdx: number) {
  const range = ranges[rangeIdx];
  if (cutIdx <= range.start || cutIdx >= range.end) return;

  ranges.splice(rangeIdx + 1, 0, {
    start: cutIdx,
    end: range.end,
    warnIdxs: [...range.warnIdxs],
  });

  range.end = cutIdx;
}

export function translit(input: string, rules: TranslitCompiledRules): TranslitResult {
  // TODO configurable warnings (for performance reasons)
  let out: string = "";
  const warns: Array<TranslitResultWarn> = [];

  // XXX must normalize to decomposed form so that accented letters can get
  //     transliterated properly
  input = input.normalize("NFD");
  const len = input.length;
  for (let i = 0, rem = len; i < len;) {
    const matches: Array<string> = [];
    let matchInLen = 0;

    for (const bucket of rules.buckets) {
      const inLen = bucket.inLen;

      if (inLen > rem) continue;
      if (!hasCodePointsInUnitWindow(input, i, inLen)) continue;

      const end = i + inLen;
      const inWindow = input.substring(i, end);
      const inWindowLower = inWindow.toLowerCase();

      for (const rule of bucket.rules) {
        if (rule[0] === inWindowLower) {
          // TODO allow overriding which one matches (use warning's
          //      input range to decide where to insert the override)
          const firstMatch = matches.length === 0;
          if (firstMatch) matchInLen = inLen;

          switch (getWindowCase(inWindow)) {
            case LetterCase.Upper:
              matches.push(rule[1].toUpperCase());
              break;
            case LetterCase.Unknown:
              if (firstMatch) {
                const outLen = out.length;
                warns.push({
                  inStart: i,
                  inEnd: end,
                  outStart: outLen,
                  outEnd: outLen + rule[1].length,
                  context: {
                    type: TranslitResultWarnCtxType.AmbiguousCapitalisation,
                  },
                });
              }
            // fall through
            case LetterCase.Lower:
              matches.push(rule[1]);
          }
        }
      }
    }

    if (matches.length === 0) {
      const codePoint = input[i].codePointAt(0)!;
      const inConsumeAmount = getNumericCodePointUnitCount(codePoint);

      for (const range of rules.codePointRanges) {
        if (range.start > codePoint) break;

        if (codePoint >= range.start && codePoint < range.end) {
          const warnCount = warns.length;
          let needsWarn = true;
          if (warnCount > 0) {
            const lastWarn = warns[warnCount - 1];
            if (
              lastWarn.inEnd === i &&
              lastWarn.context.type === TranslitResultWarnCtxType.NoMatch
            ) {
              lastWarn.inEnd = i + inConsumeAmount;
              needsWarn = false;
            }
          }

          if (needsWarn) {
            const outLen = out.length;
            warns.push({
              inStart: i,
              inEnd: i + inConsumeAmount,
              outStart: outLen,
              outEnd: outLen + inConsumeAmount,
              context: {
                type: TranslitResultWarnCtxType.NoMatch,
              },
            });
          }
          break;
        }
      }

      out += input.substring(i, i + inConsumeAmount);
      i += inConsumeAmount;
      rem -= inConsumeAmount;
    } else {
      if (matches.length > 1) {
        const outLen = out.length;
        warns.push({
          inStart: i,
          inEnd: i + matchInLen,
          outStart: outLen,
          outEnd: outLen + matches[0].length,
          context: {
            type: TranslitResultWarnCtxType.AmbiguousMapping,
            candidates: matches,
          },
        });
      }

      out += matches[0];
      i += matchInLen;
      rem -= matchInLen;
    }
  }

  const ranges: Array<TranslitResultRange> = [{ start: 0, end: out.length, warnIdxs: [] }];

  const warnCount = warns.length;
  for (let w = 0; w < warnCount; w++) {
    const warn = warns[w];

    for (let r = 0; r < ranges.length; r++) {
      const range = ranges[r];
      if (warn.outEnd <= range.start) break;

      /// XXX modifying ranges array as its being iterated. it's fine in
      //      this case since i mutate the element in the current index
      //      instead of replacing, and insertions are done AFTER this
      //      index
      tryCutRange(ranges, r, warn.outStart);
      tryCutRange(ranges, r, warn.outEnd);

      if (range.start >= warn.outStart && range.end <= warn.outEnd) {
        range.warnIdxs.push(w);
      }
    }
  }

  return { text: out, warns, ranges };
}
