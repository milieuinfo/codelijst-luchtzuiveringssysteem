'use strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { isMainModule } from '../src/utils/script.js';

const argv = process.argv;
afterEach(() => {
    process.argv = argv;
});

const metScript = (script) => {
    process.argv = [argv[0], script];
};
const bestand = path.resolve('03_validate_against_previous_release.js');
const url = pathToFileURL(bestand).href;

describe('isMainModule', () => {
    it('is true for the started script, also with a relative path', () => {
        metScript(bestand);
        expect(isMainModule(url)).toBe(true);
        metScript('./03_validate_against_previous_release.js');
        expect(isMainModule(url)).toBe(true);
    });

    it('is false for another module', () => {
        metScript(bestand);
        expect(isMainModule(pathToFileURL(path.resolve('04_create_changelog.js')).href)).toBe(false);
    });

    it('is false without a script, or when argv[1] is not an existing file', () => {
        process.argv = [argv[0]];
        expect(isMainModule(url)).toBe(false);
        metScript('geen-bestand');
        expect(isMainModule(url)).toBe(false);
    });
});
