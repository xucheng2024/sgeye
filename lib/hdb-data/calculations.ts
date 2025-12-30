/**
 * Calculation functions for HDB data
 * Affordability, mortgage, lease risk calculations
 */

import { FINANCIAL_CONSTANTS, LEASE_THRESHOLDS } from '../constants'
import type { LeaseRiskLevel } from './types'

// Calculate affordability
export function calculateAffordability(
  monthlyIncome: number,
  downPayment: number,
  loanYears: number,
  interestRate: number,
  otherDebts: number = 0
): {
  maxMonthlyPayment: number
  maxLoanAmount: number
  maxPropertyPrice: number
  maxPropertyPriceByBudget: number
  constraints: {
    msr: number
    tdsr: number
    ltv: number
  }
} {
  // MSR: Mortgage Servicing Ratio
  const maxMonthlyPaymentMSR = monthlyIncome * FINANCIAL_CONSTANTS.MSR_LIMIT

  // TDSR: Total Debt Servicing Ratio
  const maxMonthlyPaymentTDSR = monthlyIncome * FINANCIAL_CONSTANTS.TDSR_LIMIT - otherDebts

  // Take the stricter constraint
  const maxMonthlyPayment = Math.min(maxMonthlyPaymentMSR, maxMonthlyPaymentTDSR)

  // Calculate max loan amount from monthly payment (annuity formula)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanYears * 12

  let maxLoanAmount = 0
  if (monthlyRate > 0) {
    maxLoanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate)
  } else {
    maxLoanAmount = maxMonthlyPayment * numPayments
  }

  // LTV: Loan-to-Value (for resale flats)
  const maxPropertyPriceByLTV = downPayment / (1 - FINANCIAL_CONSTANTS.LTV_RESALE)

  // Max property price = loan + downpayment, but also constrained by LTV
  const maxPropertyPriceByBudget = maxLoanAmount + downPayment
  const maxPropertyPrice = Math.min(maxPropertyPriceByBudget, maxPropertyPriceByLTV)

  return {
    maxMonthlyPayment,
    maxLoanAmount,
    maxPropertyPrice,
    maxPropertyPriceByBudget, // Loan capacity limit
    constraints: {
      msr: maxMonthlyPaymentMSR,
      tdsr: maxMonthlyPaymentTDSR,
      ltv: maxPropertyPriceByLTV,
    },
  }
}

// Calculate monthly mortgage payment
export function calculateMonthlyMortgage(
  loanAmount: number,
  loanYears: number,
  interestRate: number
): number {
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanYears * 12

  if (monthlyRate === 0) {
    return loanAmount / numPayments
  }

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  )
}

// Compute Lease Risk from raw data
export function computeLeaseRisk(input: {
  medianRemainingLease: number
  pctTxBelow60: number
  pctTxBelow55: number
}): { level: LeaseRiskLevel; reasons: string[] } {
  const reasons: string[] = []
  const { medianRemainingLease, pctTxBelow60, pctTxBelow55 } = input

  // Baseline by median
  let score = 0

  if (medianRemainingLease < LEASE_THRESHOLDS.CRITICAL) {
    score += 3
    reasons.push(`Median remaining lease is below ${LEASE_THRESHOLDS.CRITICAL} years`)
  } else if (medianRemainingLease < LEASE_THRESHOLDS.HIGH) {
    score += 2
    reasons.push(`Median remaining lease is below ${LEASE_THRESHOLDS.HIGH} years`)
  } else if (medianRemainingLease < LEASE_THRESHOLDS.MODERATE) {
    score += 1
    reasons.push(`Median remaining lease is below ${LEASE_THRESHOLDS.MODERATE} years`)
  }

  // Concentration checks
  if (pctTxBelow55 >= LEASE_THRESHOLDS.PCT_BELOW_55_HIGH) {
    score += 2
    reasons.push(`High share of transactions below ${LEASE_THRESHOLDS.CRITICAL} years`)
  } else if (pctTxBelow55 >= LEASE_THRESHOLDS.PCT_BELOW_55_MODERATE) {
    score += 1
    reasons.push(`Meaningful share of transactions below ${LEASE_THRESHOLDS.CRITICAL} years`)
  }

  if (pctTxBelow60 >= LEASE_THRESHOLDS.PCT_BELOW_60_WARNING) {
    score += 1
    reasons.push(`Majority of transactions below ${LEASE_THRESHOLDS.HIGH} years`)
  }

  // Map score → level
  let level: LeaseRiskLevel = 'low'
  if (score >= 5) level = 'critical'
  else if (score >= 3) level = 'high'
  else if (score >= 1) level = 'moderate'

  return { level, reasons }
}

