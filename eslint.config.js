'use strict';
// ESLint-configuratie (flat config). Lint alle JavaScript en Markdown van het project.
// Opmaak van JavaScript is de taak van Prettier: eslint-config-prettier zet regels uit die ermee botsen.
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import prettier from 'eslint-config-prettier';
import n from 'eslint-plugin-n';
import packageJson from 'eslint-plugin-package-json';
import globals from 'globals';

const JS = ['**/*.js'];

export default [
    {
        // gegenereerd, extern of met geheimen (git-ignored); CHANGELOG.md wordt gegenereerd
        ignores: [
            'node_modules/',
            'target/',
            'temp/',
            'validation*/',
            'coverage/',
            'src/utils/setenv*.js',
            'CHANGELOG.md',
            // verwachte uitvoer van de tests, zoals gegenereerd
            'test/__snapshots__/',
        ],
    },

    // JavaScript
    { files: JS, ...js.configs.recommended },
    { files: JS, ...n.configs['flat/recommended-module'] },
    {
        files: JS,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            // process.exit() kapt de uitvoer af: zet process.exitCode = 1
            'n/no-process-exit': 'error',
            'n/prefer-node-protocol': 'error',
            // geen gepubliceerde package: devDependencies mogen overal geïmporteerd worden
            'n/no-unpublished-import': 'off',
            // git enkel via src/utils/git.js
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'node:child_process',
                            message: 'Roep git aan via src/utils/git.js (één functie per git-commando).',
                        },
                        {
                            name: 'child_process',
                            message: 'Roep git aan via src/utils/git.js (één functie per git-commando).',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/utils/git.js'],
        rules: { 'no-restricted-imports': 'off' },
    },
    { files: JS, ...prettier },

    // package.json: geldige velden, vaste volgorde van de sleutels, enkel exacte versies
    packageJson.configs.recommended,
    {
        files: ['package.json'],
        rules: {
            'package-json/order-properties': 'error',
            'package-json/restrict-dependency-ranges': ['error', { rangeType: 'pin' }],
        },
    },

    // Markdown (GitHub Flavored, voor de tabellen)
    ...markdown.configs.recommended.map((config) => ({ ...config, language: 'markdown/gfm' })),
];
