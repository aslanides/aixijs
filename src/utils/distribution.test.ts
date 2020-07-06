import { Beta } from "./distribution"

test('Beta distribution is sane', () => {
  const beta = new Beta(100, 100)
  expect(beta.mean()).toBe(0.5)
})