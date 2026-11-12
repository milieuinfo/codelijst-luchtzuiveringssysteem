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
        // Coverage van de code in src/ (pnpm run test zet ze aan). coverage/lcov.info leest Sonar in
        // (zie de stage Sonar scan in Jenkinsfile.groovy); de HTML-versie staat in coverage/lcov-report/index.html.
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            exclude: ['src/utils/setenv*.js', 'src/99_deploy_latest.js'],
            reporter: ['text', 'lcov'],
            reportsDirectory: 'coverage',
        },
    },
});
