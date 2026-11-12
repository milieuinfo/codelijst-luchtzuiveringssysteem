import { describe, expect, it } from 'vitest';
import { escapeMarkdown, table } from '../src/utils/markdown.js';

describe('escapeMarkdown', () => {
    it('escapes Markdown characters, including the table pipe', () => {
        expect(escapeMarkdown('a|b *c* _d_ `e` [f] <g> \\')).toBe('a\\|b \\*c\\* \\_d\\_ \\`e\\` \\[f\\] \\<g\\> \\\\');
    });

    it('leaves plain text alone', () => {
        expect(escapeMarkdown('Gewone tekst, 1.2')).toBe('Gewone tekst, 1.2');
    });
});

describe('table', () => {
    it('pads and aligns the columns', () => {
        expect(
            table(
                ['Name', 'Value'],
                [
                    ['a', '1'],
                    ['bb', '22'],
                ],
            ),
        ).toBe(['| Name | Value |', '| ---- | ----- |', '| a    | 1     |', '| bb   | 22    |'].join('\n'));
    });

    it('uses at least three dashes and fills missing cells', () => {
        expect(table(['A', 'B'], [['x']])).toBe(['| A   | B   |', '| --- | --- |', '| x   |     |'].join('\n'));
    });

    it('counts an emoji as two columns', () => {
        const [header, , row] = table(['Status'], [['🆕 x']]).split('\n');
        expect(header).toBe('| Status |');
        expect(row).toBe('| 🆕 x   |');
    });
});
