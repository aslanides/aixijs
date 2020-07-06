import { MatrixDiscount } from "./discount"

test('Matrix discount behaves sanely.', () => {
  const discounts = [
    (t: number) => 1,
    (t: number) => 0.9**t,
    (t: number) => 1,
    (t: number) => 0.9**t,
  ]
  const discountFn = MatrixDiscount(discounts, [0, 1, 3, 4])
  expect(discountFn(0, 0)).toBe(1)
  expect(discountFn(1, 0)).toBe(1)
  expect(discountFn(1, 1)).toBe(0.9)
  expect(discountFn(2, 1)).toBe(0.9**2)
  expect(discountFn(3, 1)).toBe(0.9**3)
  expect(discountFn(3, 2)).toBe(0.9**3)
  expect(discountFn(3, 3)).toBe(1)
})