import { compileRules, type TranslitRules } from './rule';

export const enum TranslitResultWarnCtxType {
    AmbiguousMapping,
    AmbiguousCapitalisation,
}

export type TranslitResultWarnCtx = {
    type: TranslitResultWarnCtxType.AmbiguousMapping;
    candidates: Array<string>;
} | {
    type: TranslitResultWarnCtxType.AmbiguousCapitalisation;
}

export interface TranslitResultWarn {
    start: number;
    end: number;
    context: TranslitResultWarnCtx;
}

export interface TranslitResult {
    text: string;
    warns: Array<TranslitResultWarn>;
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

export function translit(input: string, rules: TranslitRules): TranslitResult {
    let out: string = '';
    let compRules = compileRules(rules);
    const warns: Array<TranslitResultWarn> = [];

    const len = input.length;
    // TODO ranges with warnings (for squiggly lines and reasons on hover)
    for (let i = 0, rem = len; i < len;) {
        let matched = false;
        for (const bucket of compRules) {
            const inLen = bucket.inLen;
            if (inLen <= rem) {
                for (const rule of bucket.rules) {
                    const end = i + inLen;
                    const inWindow = input.substring(i, end);
                    if (rule.in == inWindow.toLowerCase()) {
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
        }

        if (!matched) {
            out += input[i++];
            rem--;
            // TODO add warning for no match? what about numbers and symbols?
        }
    }

    return { text: out, warns };
}