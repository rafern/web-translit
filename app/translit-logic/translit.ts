import { type TranslitCompiledRules } from './rule';
import { hasCodePointsInUnitWindow } from './unicode';

export const enum TranslitResultWarnCtxType {
    AmbiguousMapping,
    AmbiguousCapitalisation,
    NoMatch,
}

export type TranslitResultWarnCtx = {
    type: TranslitResultWarnCtxType.AmbiguousMapping;
    candidates: Array<string>;
} | {
    type: TranslitResultWarnCtxType.AmbiguousCapitalisation;
} | {
    type: TranslitResultWarnCtxType.NoMatch;
}

export interface TranslitResultWarn {
    start: number;
    end: number;
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
    let out: string = '';
    const warns: Array<TranslitResultWarn> = [];

    // XXX must normalize to decomposed form so that accented letters can get
    //     transliterated properly
    input = input.normalize('NFD');
    const len = input.length;
    for (let i = 0, rem = len; i < len;) {
        let matched = false;
        for (const bucket of rules.buckets) {
            const inLen = bucket.inLen;

            if (inLen > rem) continue;
            if (!hasCodePointsInUnitWindow(input, i, inLen)) continue;

            const end = i + inLen;
            const inWindow = input.substring(i, end);
            const inWindowLower = inWindow.toLowerCase();

            for (const rule of bucket.rules) {
                if (rule.in === inWindowLower) {
                    switch(getWindowCase(inWindow)) {
                        case LetterCase.Upper:
                            out += rule.out.toUpperCase();
                            break;
                        case LetterCase.Unknown:
                            warns.push({
                                start: i,
                                end,
                                context: {
                                    type: TranslitResultWarnCtxType.AmbiguousCapitalisation,
                                }
                            });
                            // fall through
                        case LetterCase.Lower:
                            out += rule.out;
                    }

                    matched = true;
                    i += inLen;
                    rem -= inLen;

                    // TODO keep going to detect ambiguous matches
                    // TODO make it optional for faster matches?
                    break;
                }
            }

            if (matched) break;
        }

        if (!matched) {
            const codePoint = input[i].codePointAt(0)!;
            for (const range of rules.inCodePointRanges) {
                if (range.start > codePoint) break;

                if (codePoint >= range.start && codePoint < range.end) {
                    const warnCount = warns.length;
                    let needsWarn = true;
                    if (warnCount > 0) {
                        const lastWarn = warns[warnCount - 1];
                        if (lastWarn.end === i && lastWarn.context.type === TranslitResultWarnCtxType.NoMatch) {
                            lastWarn.end = i + 1;
                            needsWarn = false;
                        }
                    }

                    if (needsWarn) {
                        warns.push({
                            start: i,
                            end: i + 1,
                            context: {
                                type: TranslitResultWarnCtxType.NoMatch,
                            }
                        });
                    }
                    break;
                }
            }

            out += input[i++];
            rem--;
        }
    }

    const ranges: Array<TranslitResultRange> = [
        { start: 0, end: out.length, warnIdxs: [] },
    ];

    const warnCount = warns.length;
    for (let w = 0; w < warnCount; w++) {
        const warn = warns[w];

        for (let r = 0; r < ranges.length; r++) {
            const range = ranges[r];
            if (warn.end <= range.start) break;

            /// XXX modifying ranges array as its being iterated. it's fine in
            //      this case since i mutate the element in the current index
            //      instead of replacing, and insertions are done AFTER this
            //      index
            tryCutRange(ranges, r, warn.start);
            tryCutRange(ranges, r, warn.end);

            if (range.start >= warn.start && range.end <= warn.end) {
                range.warnIdxs.push(w);
            }
        }
    }

    return { text: out, warns, ranges };
}