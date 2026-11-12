import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readTextIfExists } from '../src/utils/files.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'files-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('readTextIfExists', () => {
    it('reads an existing file as UTF-8 text', () => {
        const bestand = path.join(tmp, 'tekst.txt');
        fs.writeFileSync(bestand, 'één\n');
        return expect(readTextIfExists(bestand)).resolves.toBe('één\n');
    });

    it('resolves with the fallback when the file does not exist', () =>
        Promise.all([
            expect(readTextIfExists(path.join(tmp, 'ontbreekt.txt'))).resolves.toBeNull(),
            expect(readTextIfExists(path.join(tmp, 'ontbreekt.txt'), '')).resolves.toBe(''),
        ]));

    it('still rejects on other errors', () => expect(readTextIfExists(tmp)).rejects.toThrow(/EISDIR/));
});
