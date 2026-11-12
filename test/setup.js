// De scripts en de paden in source/config.yml gaan uit van src/ als huidige map. Elk testbestand
// start daarom in src/, ongeacht waar vitest gestart wordt (ook in de sandbox van Stryker).
import path from 'node:path';

process.chdir(path.join(import.meta.dirname, '..', 'src'));
