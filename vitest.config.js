'use strict';
// Vitest-configuratie. test/setup.js zet de huidige map op src/, net als bij de scripts: de paden in
// source/config.yml zijn relatief t.o.v. src/. Daarvoor zijn forks nodig (process.chdir werkt niet
// in worker threads).
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        setupFiles: ['test/setup.js'],
        pool: 'forks',
        // variables.js laadt bij het importeren de SHACL-shapes; de generatie en validatie duren even
        testTimeout: 60000,
        hookTimeout: 120000,
    },
});
