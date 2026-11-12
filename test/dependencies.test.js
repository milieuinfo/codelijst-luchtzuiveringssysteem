// De generator controleert datasets op hun klasse (constructor.name === 'Dataset'). Datasets die
// wij maken (SHACL-shapes in variables.js, de dataset voor de validatie in 03_…) moeten dus van
// dezelfde @zazuko/env-node komen als die van de generator. Met env-node 3.x faalt create_skos met
// 'TypeError: Expected a Dataset'.
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import rdf from '@zazuko/env-node';

const require = createRequire(import.meta.url);
const eigen = require('../package.json').dependencies['@zazuko/env-node'];
const generator = require('@milieuinfo/maven-metadata-generator-npm/package.json').dependencies['@zazuko/env-node'];

describe('@zazuko/env-node', () => {
    it("is the same version as the generator's", () => {
        expect(eigen, 'update @zazuko/env-node only together with the generator').toBe(generator);
    });

    it('creates datasets the generator accepts', () => {
        expect(rdf.dataset().constructor.name).toBe('Dataset');
    });
});
