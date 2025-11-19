export enum StepUpFrequency {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}

export enum CalculatorMode {
    SIP = 'SIP',
    LUMPSUM = 'LUMPSUM',
    STEP_UP = 'STEP_UP'
}

export interface LumpsumInjection {
    id: string;
    year: number; // The year index (1-based) when the lumpsum is added
    month: number; // Specific month within that year (1-12)
    amount: number;
}

export interface CalculatorState {
    mode: CalculatorMode;
    monthlyInvestment: number;
    lumpsumInvestment: number; // Initial investment for Lumpsum mode
    annualInterestRate: number;
    durationYears: number;
    stepUpAmount: number;
    stepUpFrequency: StepUpFrequency;
    additionalLumpsums: LumpsumInjection[];
}

export interface YearlyResult {
    year: number;
    investedAmount: number;
    interestEarned: number;
    totalValue: number;
}

export interface MonthlyDataPoint {
    monthIndex: number;
    year: number;
    invested: number;
    value: number;
    installment: number; // The SIP installment amount for this specific month
}

export interface CalculationResult {
    totalInvested: number;
    totalWealth: number;
    totalGain: number;
    monthlyData: MonthlyDataPoint[];
    yearlyBreakdown: YearlyResult[];
}