// ESLint v9+ flat config format
import { fileURLToPath } from 'url';
import path from 'path';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    // Ignore patterns (from .eslintignore)
    {
        ignores: ['scripts', 'coverage', '.eslintrc.js', 'ios', 'android', 'dist/*'],
    },
    // Main config (from .eslintrc.js)
    ...compat.config({
        root: true,
        extends: ['expo'],
        plugins: ['unused-imports', '@tanstack/query', 'jest', 'react-compiler'],
        rules: {
            'unused-imports/no-unused-imports': 'error',
            'no-return-await': 'error',
            'prefer-const': 'error',
            'object-shorthand': 'error',
            'react-compiler/react-compiler': 'error',
        },
        overrides: [
            {
                files: ['**/*.ts', '**/*.tsx'],
                parser: '@typescript-eslint/parser',
                parserOptions: {
                    project: './tsconfig.json',
                    tsconfigRootDir: __dirname,
                },
                rules: {
                    '@typescript-eslint/no-unused-vars': [
                        'warn',
                        {
                            varsIgnorePattern: '^_',
                        },
                    ],
                    'unused-imports/no-unused-vars': [
                        'error',
                        {
                            vars: 'all',
                            varsIgnorePattern: '^_',
                            args: 'after-used',
                            argsIgnorePattern: '^_',
                        },
                    ],
                    '@typescript-eslint/no-non-null-assertion': 'error',
                    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
                },
            },
            {
                files: ['*.js'],
                env: {
                    node: true,
                    jest: true,
                },
            },
        ],
    }),
];
