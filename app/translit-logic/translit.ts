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

const enum Uppercasedness {
    Lower,
    Upper,
    Neither,
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
                        // TODO handle uppercasedness
                        out += rule.out;
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