// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

export function pushError(outErrors: Array<string>, e: unknown) {
  if (typeof e === "string") {
    outErrors.push(e);
  } else if (e instanceof Error) {
    outErrors.push(e.message);
  } else {
    outErrors.push(`${e}`);
  }
}
