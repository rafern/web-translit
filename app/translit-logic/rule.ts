import type { TranslitPackage } from "./package";

export type TranslitRule = [input: string, output: string];

// TODO a decision tree would be faster for big rulesets
export interface TranslitRules {
    name: string,
    description: string,
    map: ReadonlyArray<TranslitRule>;
    // these are just for knowing when to show errors. for example, if a ruleset
    // uses latin as the input, then the whole latin LETTERS code point ranges
    // are specified as inputs. this way the transliteration logic knows to show
    // a warning when a latin letter is used without mapping to anything else,
    // without also showing warnings for punctuation, numbers, an unrelated
    // script like traditional chinese that you don't want to transliterate,
    // etc...
    inBlockGroups: ReadonlyArray<string>;
    // output ranges are provided for the same reason as above, as rules are
    // intended to be somewhat reversible (there will probably be conflicts but
    // the software should let you do it)
    outBlockGroups: ReadonlyArray<string>;
}

export interface TranslitRuleBucket {
    inLen: number;
    rules: ReadonlyArray<TranslitRule>;
}

export interface TranslitCompiledCodePointRange {
    // ranges are NOT inclusive at the end index, but are at the start index
    start: number;
    end: number;
}

export interface TranslitCompiledRules {
    buckets: ReadonlyArray<TranslitRuleBucket>;
    inCodePointRanges: ReadonlyArray<TranslitCompiledCodePointRange>;
    outCodePointRanges: ReadonlyArray<TranslitCompiledCodePointRange>;
};

function compileCodePointRanges(blockGroups: ReadonlyArray<string>, packages: Record<string, TranslitPackage>): Array<TranslitCompiledCodePointRange> {
    const compiled: Array<TranslitCompiledCodePointRange> = [];

    for (const namespacedBlockGroupID of blockGroups) {
        const colonIdx = namespacedBlockGroupID.indexOf(':');
        if (colonIdx === -1) {
            throw new Error(`Invalid block group ID "${namespacedBlockGroupID}"`);
        }

        const packageID = namespacedBlockGroupID.substring(0, colonIdx);
        const pkg = packages[packageID];
        if (!pkg) {
            throw new Error(`Package with ID "${packageID}" not found`);
        }

        const blockGroupID = namespacedBlockGroupID.substring(colonIdx + 1);
        const blockGroup = pkg.blockGroups?.[blockGroupID];
        if (!blockGroup) {
            throw new Error(`Package "${packageID}" has no block group "${blockGroupID}"`);
        }

        for (const block of blockGroup.blocks) {
            for (const range of block.ranges) {
                const newRange: TranslitCompiledCodePointRange = {
                    start: range[0],
                    end: range[1] + 1,
                };

                let needsPush = true;
                for (let c = 0; c < compiled.length; c++) {
                    const compRange = compiled[c];
                    if (newRange.end < compRange.start) {
                        compiled.splice(c, 0, newRange);
                        needsPush = false;
                        break;
                    }

                    if (newRange.start > compRange.end) continue;

                    compRange.start = Math.min(compRange.start, newRange.start);
                    compRange.end = Math.max(compRange.end, newRange.end);
                    needsPush = false;

                    // XXX hard to understand code (sorry). this tries to merge the
                    //     current range with the next range, until it can't anymore
                    let otherRange: TranslitCompiledCodePointRange;
                    while (c + 1 < compiled.length && (otherRange = compiled[c + 1]).start <= compRange.end) {
                        compRange.end = Math.max(compRange.end, otherRange.end);
                        compiled.splice(c + 1, 1);
                    }

                    break;
                }

                if (needsPush) {
                    compiled.push(newRange);
                }
            }
        }
    }

    return compiled;
}

export function compileRules(rules: TranslitRules, packages: Record<string, TranslitPackage>): TranslitCompiledRules {
    type BuilderBucket = { inLen: number, rules: Array<TranslitRule> };
    const buckets: Array<BuilderBucket> = [];

    for (const rule of rules.map) {
        // XXX use decomposed form for better matching (e.g. this way a latin
        //     A with an accent will be able to be transliterated to another
        //     script, also with an accent, without having to make rules for
        //     every variation of the base letter)
        const ruleNorm: TranslitRule = [
            rule[0].normalize('NFD'),
            rule[1].normalize('NFD')
        ];

        const inLen = ruleNorm[0].length;
        let bucket: BuilderBucket | undefined;
        let bucketInsertPos = 0;
        for (; bucketInsertPos < buckets.length; bucketInsertPos++) {
            const bucketCandid = buckets[bucketInsertPos];
            if (bucketCandid.inLen <= inLen) {
                if (bucketCandid.inLen == inLen) bucket = bucketCandid;
                break;
            }
        }

        if (bucket) {
            bucket.rules.push(ruleNorm);
        } else {
            bucket = { inLen, rules: [ruleNorm] };
            buckets.splice(bucketInsertPos, 0, bucket);
        }
    }

    return {
        buckets,
        inCodePointRanges: compileCodePointRanges(rules.inBlockGroups, packages),
        outCodePointRanges: compileCodePointRanges(rules.outBlockGroups, packages),
    };
}

export function invertRules(rules: TranslitRules): TranslitRules {
    const invertedMap: Array<TranslitRule> = [];
    for (const rule of rules.map) {
        invertedMap.push([ rule[1], rule[0] ]);
    }

    return {
        name: `Inverse of "${rules.name}"`,
        description: `Naive inversion of the "${rules.name}" rules. Original description:\n${rules.description}`,
        map: invertedMap,
        // TODO: clone?
        inBlockGroups: rules.outBlockGroups,
        outBlockGroups: rules.inBlockGroups,
    };
}