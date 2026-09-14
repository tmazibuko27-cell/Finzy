import { bondPrice, compoundValue, equityValue } from './models';

export type Lab = {
  slug: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: 'pulse-outline' | 'trending-up-outline' | 'business-outline';
  brief: string;
  prediction: string;
  choices: string[];
  correct: number;
  explanation: string;
  control: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  scenario: number;
  output: string;
  calculate: (input: number) => number;
  assumption: string;
  insight: string;
  check: string;
  checkChoices: string[];
  checkCorrect: number;
  takeaway: string;
  source: { title: string; url: string };
};

// Original, hypothetical teaching examples. Editorial review remains a launch gate.
export const LABS: Lab[] = [
  {
    slug: 'rate-shock', number: '01', category: 'FIXED INCOME', title: 'The rate shock',
    subtitle: 'Move the yield. Watch the price.', accent: '#B8F36D', icon: 'pulse-outline',
    brief: 'You hold a $1,000 bond paying $50 each year, with five years left. The market now demands a 7% yield instead of 5%.',
    prediction: 'What happens to the price of your bond?',
    choices: ['It rises above $1,000', 'It falls below $1,000', 'It stays at $1,000'], correct: 1,
    explanation: 'Its payments are fixed. A higher required yield discounts those same future payments more heavily, lowering their value today.',
    control: 'Market yield', unit: '%', min: 0, max: 10, step: 0.5, initial: 5, scenario: 7,
    output: 'Bond price', calculate: (value) => bondPrice(value),
    assumption: '$1,000 face value · 5% annual coupon · 5 years remaining. Annual payments, no default, taxes, fees or accrued interest.',
    insight: 'The $50 coupon stays fixed as you move the yield. Price does the adjusting.',
    check: 'Now the market yield falls to 3%. Where does this bond trade?',
    checkChoices: ['Above its $1,000 face value', 'Below its $1,000 face value', 'Exactly at $1,000'], checkCorrect: 0,
    takeaway: 'For fixed cash flows, price and required yield move in opposite directions.',
    source: { title: 'Investor.gov · Corporate bonds', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products' },
  },
  {
    slug: 'time-is-capital', number: '02', category: 'COMPOUNDING', title: 'Time is capital',
    subtitle: 'See what an extra decade changes.', accent: '#A7C7FF', icon: 'trending-up-outline',
    brief: 'A hypothetical $1,000 grows at a constant 7% a year. You reinvest all growth and never add more money.',
    prediction: 'After 20 years, is the balance more than $3,000?',
    choices: ['Yes, growth earns more growth', 'No, it only adds $70 each year'], correct: 0,
    explanation: 'Each year’s growth joins the balance for the next year. At this assumed rate, $1,000 becomes about $3,870 after 20 years.',
    control: 'Time invested', unit: ' years', min: 0, max: 40, step: 5, initial: 10, scenario: 20,
    output: 'Hypothetical balance', calculate: (value) => compoundValue(value),
    assumption: '$1,000 starting balance · constant 7% annual compounding · no contributions, withdrawals, fees or taxes. This is a mathematical illustration, not a return forecast.',
    insight: 'Compare years 10–20 with years 20–30. The same decade adds more dollars to a larger balance.',
    check: 'At a constant positive rate, which decade adds more dollars?',
    checkChoices: ['Years 0–10', 'Years 20–30', 'Every decade adds the same amount'], checkCorrect: 1,
    takeaway: 'Compounding grows from both the original capital and accumulated growth. Actual investment returns vary and can be negative.',
    source: { title: 'Investor.gov · Compound interest', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
  },
  {
    slug: 'the-equity-bridge', number: '03', category: 'DEAL MECHANICS', title: 'Who gets the value?',
    subtitle: 'Bridge enterprise value to equity.', accent: '#E3BBFF', icon: 'business-outline',
    brief: 'A fictional company has an enterprise value of $1,000 million and $100 million in cash. Its debt rises from $200 million to $400 million. Hold enterprise value and cash fixed.',
    prediction: 'What happens to the implied equity value?',
    choices: ['It increases by $200 million', 'It decreases by $200 million', 'It does not change'], correct: 1,
    explanation: 'In this simplified bridge, equity value equals enterprise value minus debt plus cash. More debt leaves less value attributable to equity, with the other inputs fixed.',
    control: 'Debt', unit: 'm', min: 0, max: 800, step: 100, initial: 200, scenario: 400,
    output: 'Equity value ($m)', calculate: (value) => equityValue(1000, value, 100),
    assumption: 'All figures in USD millions. EV = $1,000m; cash = $100m. Ignores preferred stock, minority interests and other claims. Extra debt proceeds are not retained as cash.',
    insight: 'EV − debt + cash = equity value. This isolates one input; it does not model a complete financing transaction.',
    check: 'If the company borrows $100m and keeps all of it as cash, with EV unchanged, what happens to equity value?',
    checkChoices: ['It rises by $100m', 'It falls by $100m', 'It stays unchanged in this bridge'], checkCorrect: 2,
    takeaway: 'Debt and cash both matter. Borrowing cash alone does not change this simplified equity bridge because the two effects offset.',
    source: { title: 'CFI · Enterprise value', url: 'https://corporatefinanceinstitute.com/resources/valuation/what-is-enterprise-value-ev/' },
  },
];

export function getLab(slug: string | undefined): Lab | undefined {
  return LABS.find((lab) => lab.slug === slug);
}
