module.exports = {
  'moduleFileExtensions': [
    'js',
    'ts',
    'tsx'
  ],
  'transform': {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'ts-jest'
  },
  'testRegex': [
    '.*\\.test\\.tsx?$'
  ],
  moduleNameMapper: {
    d3: '<rootDir>/test/mockD3.ts',
    '^(.*)/Page$': '<rootDir>/test/mockPage.tsx'
  },
  setupFiles: ['<rootDir>/test/setup.ts']
}