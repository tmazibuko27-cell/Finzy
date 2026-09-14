/** Deterministic educational models. Rates are percentages; currency is USD. */
export function bondPrice(yieldPercent: number, years = 5, couponPercent = 5, face = 1000): number {
  if (![yieldPercent, years, couponPercent, face].every(Number.isFinite) || yieldPercent < 0 ||
      !Number.isInteger(years) || years < 1 || couponPercent < 0 || face <= 0) {
    throw new Error('Invalid bond assumptions');
  }
  const rate = yieldPercent / 100;
  let price = 0;
  for (let year = 1; year <= years; year++) price += face * couponPercent / 100 / (1 + rate) ** year;
  return price + face / (1 + rate) ** years;
}

export function compoundValue(years: number, annualPercent = 7, principal = 1000): number {
  if (![years, annualPercent, principal].every(Number.isFinite) || years < 0 || annualPercent < -100 || principal < 0) {
    throw new Error('Invalid compounding assumptions');
  }
  return principal * (1 + annualPercent / 100) ** years;
}

export function equityValue(enterpriseValue: number, debt: number, cash: number): number {
  if (![enterpriseValue, debt, cash].every(Number.isFinite) || enterpriseValue < 0 || debt < 0 || cash < 0) {
    throw new Error('Invalid valuation assumptions');
  }
  return enterpriseValue - debt + cash;
}
