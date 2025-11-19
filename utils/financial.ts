import { CalculationResult, CalculatorState, MonthlyDataPoint, StepUpFrequency, YearlyResult, CalculatorMode } from "../types";

/**
 * CORE FINANCIAL ENGINE
 * 
 * Methodology: Iterative Calculation (Annuity Due)
 * 
 * This calculator uses the "Annuity Due" method, which is the standard for SIP (Systematic Investment Plans).
 * - Investments are assumed to happen at the BEGINNING of the month.
 * - Interest for the month is calculated on (Opening Balance + Investment for that month).
 * 
 * Compliance:
 * - Matches standard Future Value (FV) formulas used by financial regulators.
 * - Supports irregular cash flows (Parallel Injections) which standard FV formulas cannot handle easily.
 * - Precision: Uses floating point arithmetic. For display, rounded to nearest Integer/Decimal.
 */

export const calculateSIP = (state: CalculatorState): CalculationResult => {
    const {
        mode,
        monthlyInvestment,
        lumpsumInvestment,
        annualInterestRate,
        durationYears,
        stepUpAmount,
        stepUpFrequency,
        additionalLumpsums
    } = state;

    const totalMonths = durationYears * 12;
    // Monthly Rate (r) = Annual Rate / 12 / 100
    const monthlyRate = annualInterestRate / 12 / 100;

    // Initialize based on mode
    let currentBalance = 0;
    let totalInvested = 0;
    
    // If Lumpsum mode, we start with the principal. 
    // If SIP/StepUp, we start with 0 but add installment in loop.
    let currentMonthlyInstallment = mode === CalculatorMode.LUMPSUM ? 0 : monthlyInvestment;
    
    // For Lumpsum mode, the initial amount is added at T=0 (conceptually) or Month 1 start.
    // We'll treat it as added immediately before the first month's interest.
    if (mode === CalculatorMode.LUMPSUM) {
        currentBalance = lumpsumInvestment;
        totalInvested = lumpsumInvestment;
    }
    
    const monthlyData: MonthlyDataPoint[] = [];
    const yearlyBreakdown: YearlyResult[] = [];

    // Helper to check if we have lumpsums for a specific month index (1-based global index)
    const getAdditionalLumpsumsForMonth = (monthIndex: number) => {
        // Calculate current year and month within year
        const currentYear = Math.ceil(monthIndex / 12);
        const currentMonthInYear = ((monthIndex - 1) % 12) + 1;
        
        return additionalLumpsums
            .filter(l => l.year === currentYear && l.month === currentMonthInYear)
            .reduce((sum, l) => sum + l.amount, 0);
    };

    // --- ITERATIVE CALCULATION LOOP ---
    // Simulates the cash flow month-by-month for maximum accuracy.
    for (let m = 1; m <= totalMonths; m++) {
        // Apply Step-up logic only if in STEP_UP mode
        if (mode === CalculatorMode.STEP_UP && m > 1) {
             if (stepUpFrequency === StepUpFrequency.MONTHLY) {
                 currentMonthlyInstallment += stepUpAmount;
             } else if (stepUpFrequency === StepUpFrequency.YEARLY) {
                 // Increase only if it's the start of a new year
                 if ((m - 1) % 12 === 0) {
                     currentMonthlyInstallment += stepUpAmount;
                 }
             }
        }

        const additionalLumpsum = getAdditionalLumpsumsForMonth(m);
        
        // LOGIC: Beginning of Period (BOP) / Annuity Due
        // 1. Money hits the account (Installment + Extra Injections).
        // 2. This total amount (Opening + New Money) sits for the month.
        // 3. Interest is applied on the whole sum at the end of the month.
        
        const investmentThisMonth = currentMonthlyInstallment + additionalLumpsum;
        
        const openingBalance = currentBalance;
        const balanceAfterDeposit = openingBalance + investmentThisMonth;
        
        // Apply interest for the month
        // Formula: A = P * r
        const interestForMonth = balanceAfterDeposit * monthlyRate;
        
        // Closing Balance
        currentBalance = balanceAfterDeposit + interestForMonth;
        
        totalInvested += investmentThisMonth;

        // Record Data for Charts/Tables
        monthlyData.push({
            monthIndex: m,
            year: Math.ceil(m / 12),
            invested: totalInvested,
            value: currentBalance,
            installment: currentMonthlyInstallment
        });

        // Year End Snapshot
        if (m % 12 === 0 || m === totalMonths) {
            yearlyBreakdown.push({
                year: Math.ceil(m / 12),
                investedAmount: totalInvested,
                totalValue: currentBalance,
                interestEarned: currentBalance - totalInvested
            });
        }
    }

    return {
        totalInvested,
        totalWealth: currentBalance,
        totalGain: currentBalance - totalInvested,
        monthlyData,
        yearlyBreakdown
    };
};

export const generateCSV = (result: CalculationResult): string => {
    const safe = (val: any) => String(val).replace(/,/g, '');

    let csv = 'GrowthStack Investment Report - Generated by [Owner ID: USER-ID-OWNER-V1-SECURE-7782]\n\n';
    
    // Summary Section
    csv += 'SUMMARY\n';
    csv += 'Total Invested,Total Wealth,Total Gain\n';
    csv += `${Math.round(result.totalInvested)},${Math.round(result.totalWealth)},${Math.round(result.totalGain)}\n\n`;

    // Yearly Breakdown
    csv += 'YEARLY BREAKDOWN\n';
    csv += 'Year,Invested Amount,Interest Earned,Total Value\n';
    result.yearlyBreakdown.forEach(row => {
        csv += `${row.year},${Math.round(row.investedAmount)},${Math.round(row.interestEarned)},${Math.round(row.totalValue)}\n`;
    });
    csv += '\n';

    // Monthly Breakdown
    csv += 'MONTHLY BREAKDOWN\n';
    csv += 'Month,Year,Monthly Installment,Total Invested,Total Value\n';
    result.monthlyData.forEach(row => {
        csv += `${row.monthIndex},${row.year},${Math.round(row.installment)},${Math.round(row.invested)},${Math.round(row.value)}\n`;
    });

    return csv;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatCompactCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(amount);
};