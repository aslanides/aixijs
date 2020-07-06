/* Jest + TypeScript guide cribbed from guide at [1].


[1] https://dev.to/muhajirdev/unit-testing-with-typescript-and-jest-2gln
*/

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
