import { type TranslitCodePointBlockGroup } from './block';
import { type TranslitRules } from './rule';
import packageSchema from './package.schema.json';
import Ajv, { type JSONSchemaType } from 'ajv';

const ajv = new Ajv();
// HACK: need to force Ajv to accept the schema. not sure if it's because of
//       limitations in the TypeScript type system, or if it's because importing
//       a JSON doesn't treat the import as if it were declared "as const".
//       either way this is sub-optimal and WILL PROBABLY LEAD TO A BUG IN THE
//       FUTURE. turning package.schema.json into a ts file which exports the
//       contents of the json as a const record is also not a solution, because
//       then Ajv complains about properties such as "nullable" not being
//       declared, even though it doesn't make sense in the context of this
//       schema
const _validatePackage = ajv.compile(packageSchema as unknown as JSONSchemaType<TranslitPackage>);

export interface TranslitPackage {
    id: string;
    name: string;
    description?: string;
    blockGroups?: Record<string, TranslitCodePointBlockGroup>;
    rules?: Record<string, TranslitRules>;
}

export function validatePackage(json: unknown): TranslitPackage {
    if (_validatePackage(json)) {
        return json;
    } else {
        throw new Error(`Invalid package: ${_validatePackage.errors}`);
    }
}

export function parsePackage(str: string): TranslitPackage {
    return validatePackage(JSON.parse(str));
}