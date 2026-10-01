export interface TranslitRule {
    in: string;
    out: string;
}

// TODO a decision tree would be faster for big rulesets
export type TranslitRules = ReadonlyArray<TranslitRule>;

export interface TranslitRuleBucket {
    inLen: number;
    rules: TranslitRules;
}

export type TranslitCompiledRules = ReadonlyArray<TranslitRuleBucket>;

export function compileRules(rules: TranslitRules): TranslitCompiledRules {
    type BuilderBucket = { inLen: number, rules: Array<TranslitRule> };
    const buckets: Array<BuilderBucket> = [];

    for (const rule of rules) {
        const inLen = rule.in.length;
        let bucket: BuilderBucket | undefined;
        let bucketInsertPos = 0;
        for (const bucketCandid = buckets[bucketInsertPos]; bucketInsertPos < buckets.length; bucketInsertPos++) {
            if (bucketCandid.inLen <= inLen) {
                if (bucketCandid.inLen == inLen) bucket = bucketCandid;
                break;
            }
        }

        // TODO copy rule into bucket instead of ref into bucket?
        if (bucket) {
            bucket.rules.push(rule);
        } else {
            bucket = { inLen, rules: [rule] };
            buckets.splice(bucketInsertPos, 0, bucket);
        }
    }

    return buckets;
}