'use strict';
// Small, generic helpers for writing Markdown.
//
//   import { escapeMarkdown, table } from './utils/markdown.js';
//   table(['Name', 'Value'], [['a', '1'], ['b', '22']]);
//   // | Name | Value |
//   // | ---- | ----- |
//   // | a    | 1     |
//   // | b    | 22    |

/**
 * Escapes the characters Markdown would otherwise interpret (including '|', for use in table cells).
 * @param {string} text
 * @returns {string}
 */
export function escapeMarkdown(text) {
    return text.replace(/([\\`*_[\]<>|])/g, String.raw`\$1`);
}

// Display width of a cell in a monospace editor: emoji take two columns, variation selectors and
// zero-width joiners none, other characters one (counted per code point, not per UTF-16 code unit)
const width = (text) =>
    [...text].reduce((sum, char) => {
        if (char === '\uFE0F' || char === '\u200D') return sum;
        return sum + (/\p{Extended_Pictographic}/u.test(char) ? 2 : 1);
    }, 0);

const pad = (text, size) => text + ' '.repeat(size - width(text));

/**
 * A Markdown table with padded, aligned columns. Cells are written as given: escape them first
 * (escapeMarkdown) where needed, and keep them on one line.
 * @param {string[]} headers
 * @param {string[][]} rows - each row has as many cells as there are headers; missing cells are empty
 * @returns {string} the table, without a trailing newline
 */
export function table(headers, rows) {
    const cells = rows.map((row) => headers.map((_, i) => row[i] ?? ''));
    // A separator needs at least three dashes
    const sizes = headers.map((header, i) => Math.max(3, width(header), ...cells.map((row) => width(row[i]))));
    const line = (row) => `| ${row.map((cell, i) => pad(cell, sizes[i])).join(' | ')} |`;
    return [line(headers), line(sizes.map((size) => '-'.repeat(size))), ...cells.map(line)].join('\n');
}
