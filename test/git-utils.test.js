'use strict';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as git from '../src/utils/git.js';
import {
    bestandInRevisie,
    datumVanRevisie,
    laatsteReleaseTag,
    releaseTagsInGeschiedenis,
    versieVanTag,
} from '../src/utils/git-utils.js';

// git zelf wordt niet aangeroepen: de commando's uit git.js worden gesimuleerd
vi.mock('../src/utils/git.js', () => ({
    tag: vi.fn(),
    show: vi.fn(),
    mergeBase: vi.fn(),
    log: vi.fn(),
}));

const ID = 'codelijst-luchtzuiveringssysteem';

beforeEach(() => {
    vi.resetAllMocks();
});

describe('versieVanTag', () => {
    it('strips the artifactId', () => {
        expect(versieVanTag(ID, `${ID}-0.2.1`)).toBe('0.2.1');
    });

    it('keeps a tag of another artifact', () => {
        expect(versieVanTag(ID, 'v1.0.0')).toBe('v1.0.0');
    });
});

describe('releaseTagsInGeschiedenis', () => {
    it('keeps only ancestors of HEAD, oldest first', () => {
        git.tag.mockResolvedValue(`${ID}-0.3.0\n${ID}-0.2.0\n${ID}-0.1.0\n`);
        // 0.3.0 staat op een andere branch
        git.mergeBase.mockImplementation((_, revisie) =>
            revisie.endsWith('0.3.0') ? Promise.reject(new Error('exit 1')) : Promise.resolve(''),
        );
        return releaseTagsInGeschiedenis(ID).then((tags) => {
            expect(tags).toEqual([`${ID}-0.1.0`, `${ID}-0.2.0`]);
        });
    });
});

describe('laatsteReleaseTag', () => {
    it('returns the highest release tag in the history', () => {
        git.tag.mockResolvedValue(`${ID}-0.2.0\n${ID}-0.1.0\n`);
        git.mergeBase.mockResolvedValue('');
        return expect(laatsteReleaseTag(ID)).resolves.toBe(`${ID}-0.2.0`);
    });

    it('fails with a hint when there are no tags', () => {
        git.tag.mockResolvedValue('');
        return expect(laatsteReleaseTag(ID)).rejects.toThrow(/git fetch --tags/);
    });
});

describe('bestandInRevisie', () => {
    it('makes the path relative to the current directory', () => {
        git.show.mockResolvedValue('inhoud');
        return bestandInRevisie('v1', 'main/x.nt').then((inhoud) => {
            expect(inhoud).toBe('inhoud');
            expect(git.show).toHaveBeenCalledWith('v1:./main/x.nt');
        });
    });

    it('fails with a clear message when the file does not exist', () => {
        git.show.mockRejectedValue(new Error('fatal'));
        return expect(bestandInRevisie('v1', './x.nt')).rejects.toThrow('./x.nt does not exist in v1.');
    });
});

describe('datumVanRevisie', () => {
    it('returns the commit date without the line ending', () => {
        git.log.mockResolvedValue('2026-01-02\n');
        return datumVanRevisie('v1').then((datum) => {
            expect(datum).toBe('2026-01-02');
            expect(git.log).toHaveBeenCalledWith('-1', '--format=%cs', 'v1');
        });
    });
});
