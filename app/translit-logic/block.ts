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
