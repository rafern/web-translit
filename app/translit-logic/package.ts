// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import { type TranslitCodePointBlockGroup } from "./block";
import { type TranslitRules } from "./rule";
import packageSchema from "./package.schema.json";
import Ajv, { type JSONSchemaType } from "ajv";
import { pushError } from "~/utils/error";

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

export const INVERTED_NAMESPACE = "inverted";

export interface TranslitPackage {
  id: string;
  name: string;
  description?: string;
  blockGroups?: Record<string, TranslitCodePointBlockGroup>;
  rules?: Record<string, TranslitRules>;
}

export type TranslitPackages = Record<string, TranslitPackage>;

export function validatePackage(json: unknown): TranslitPackage {
  if (_validatePackage(json)) {
    if (json.id === INVERTED_NAMESPACE) {
      throw new Error(`Illegal package ID "${json.id}"`);
    }

    return json;
  } else {
    throw new Error(`Invalid package: ${_validatePackage.errors}`);
  }
}

export function parsePackage(str: string): TranslitPackage {
  return validatePackage(JSON.parse(str));
}

export function maybeValidatePackageInto(
  outPackages: TranslitPackages,
  outErrors: Array<string>,
  json: unknown,
): boolean {
  let pkg: TranslitPackage;
  try {
    pkg = validatePackage(json);
  } catch (e) {
    pushError(outErrors, e);
    return false;
  }

  if (Object.hasOwn(outPackages, pkg.id)) {
    pushError(outErrors, `Package with ID "${pkg.id}" already exists`);
    return false;
  }

  outPackages[pkg.id] = pkg;
  return true;
}

export function maybeParsePackageInto(
  outPackages: TranslitPackages,
  outErrors: Array<string>,
  str: string,
): boolean {
  let json: unknown;
  try {
    json = JSON.parse(str);
  } catch (e) {
    pushError(outErrors, e);
    return false;
  }

  return maybeValidatePackageInto(outPackages, outErrors, json);
}
