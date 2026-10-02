import { type TranslitCodePointRange } from './rule';

export const TRANSLIT_CODEPOINTS_LATIN_LETTERS: ReadonlyArray<TranslitCodePointRange> = [
    // Basic Latin
    { start: 0x0041, end: 0x005A },
    { start: 0x0061, end: 0x007A },
    // Latin-1 Supplement
    { start: 0x00C0, end: 0x00D6 },
    { start: 0x00D8, end: 0x00F6 },
    { start: 0x00F8, end: 0x00FF },
    // Latin Extended-A
    { start: 0x0100, end: 0x017F },
    // Latin Extended-B
    { start: 0x0180, end: 0x024F },
    // Latin Extended Additional
    { start: 0x1E00, end: 0x1EFF },
    // Latin Extended-C
    { start: 0x2C60, end: 0x2C7B },
    { start: 0x2C7E, end: 0x2C7F },
    // Latin Extended-D
    { start: 0xA722, end: 0xA76F },
    { start: 0xA771, end: 0xA787 },
    { start: 0xA78B, end: 0xA7DD },
    { start: 0xA7E2, end: 0xA7E2 },
    { start: 0xA7F5, end: 0xA7F7 },
    { start: 0xA7FA, end: 0xA7FF },
    // Latin Extended-E
    { start: 0xAB30, end: 0xAB5A },
    { start: 0xAB60, end: 0xAB64 },
    { start: 0xAB66, end: 0xAB68 },
    { start: 0xAB6C, end: 0xAB6D },
    // Alphabetic Presentation Forms
    { start: 0xFB00, end: 0xFB06 },
    // Halfwidth and Fullwidth Forms
    { start: 0xFF21, end: 0xFF3A },
    { start: 0xFF41, end: 0xFF5A },
    // Latin Extended-F
    // - none included, they're all modifiers
    // Latin Extended-G
    { start: 0x1DF00, end: 0x1DF81 },
    { start: 0x1DF90, end: 0x1DF96 },
    { start: 0x1DFD0, end: 0x1DFD0 },
];

export const TRANSLIT_CODEPOINTS_CYRILLIC_LETTERS: ReadonlyArray<TranslitCodePointRange> = [
    // Cyrillic
    { start: 0x0400, end: 0x0482 },
    { start: 0x048A, end: 0x04FF },
    // Cyrillic Supplement
    { start: 0x0500, end: 0x052F },
    // Cyrillic Extended-C
    // XXX: why did the unicode consortium order blocks like this??? at least
    //      extended latin blocks are in alphabetical order
    { start: 0x1C80, end: 0x1C8A },
    // Cyrillic Extended-A
    // - none included, they're all combining characters
    // Cyrillic Extended-B
    { start: 0xA640, end: 0xA66E },
    { start: 0xA680, end: 0xA69B },
    // Cyrillic Extended-D
    // - none included, they're all modifiers and superscript/subscript
]