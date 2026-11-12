'use strict';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { print } from '../src/utils/console.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('print.errorDetail', () => {
    it('writes an indented detail line to stderr, like print.error', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        print.errorDetail('uitleg');
        print.errorDetail('dieper', 2);
        expect(error.mock.calls).toEqual([['  uitleg'], ['    dieper']]);
        expect(log).not.toHaveBeenCalled();
    });
});
