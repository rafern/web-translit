// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

// range is inclusive at both start and end indices
export type TranslitCodePointBlockRange = [start: number, end: number];

export interface TranslitCodePointBlock {
  name: string;
  ranges: ReadonlyArray<TranslitCodePointBlockRange>;
}

export interface TranslitCodePointBlockGroup {
  name: string;
  note?: string;
  blocks: ReadonlyArray<TranslitCodePointBlock>;
}
