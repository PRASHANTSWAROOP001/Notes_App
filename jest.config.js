const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/*.test.(ts|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};

module.exports = config;