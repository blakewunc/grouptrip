import { roundMoney } from './currency'

export type SplitType = 'equal' | 'custom' | 'none'

export interface BudgetSplit {
  userId: string
  amount: number
}

/**
 * Calculate equal split among members
 * @param totalCost - Total amount to split
 * @param memberCount - Number of members
 */
export function calculateEqualSplit(totalCost: number, memberCount: number): number {
  if (memberCount === 0) return 0
  return roundMoney(totalCost / memberCount)
}

/**
 * Validate custom splits sum to total cost
 * @param splits - Array of custom splits
 * @param totalCost - Expected total
 */
export function validateCustomSplits(splits: BudgetSplit[], totalCost: number): boolean {
  const sum = splits.reduce((acc, split) => acc + split.amount, 0)
  return Math.abs(roundMoney(sum) - roundMoney(totalCost)) < 0.01 // Allow 1 cent tolerance
}

/**
 * Calculate per-person budget breakdown
 * @param categories - Budget categories with costs and split types
 * @param memberCount - Number of trip members
 */
export interface BudgetCategory {
  id: string
  name: string
  estimatedCost: number
  splitType: SplitType
  customSplits?: BudgetSplit[]
}

export function calculatePerPersonBudget(
  categories: BudgetCategory[],
  memberCount: number,
  userId?: string
): number {
  if (memberCount === 0) return 0

  return categories.reduce((total, category) => {
    if (category.splitType === 'none') {
      return total
    }

    if (category.splitType === 'equal') {
      return total + calculateEqualSplit(category.estimatedCost, memberCount)
    }

    if (category.splitType === 'custom' && category.customSplits && userId) {
      const userSplit = category.customSplits.find(s => s.userId === userId)
      return total + (userSplit?.amount || 0)
    }

    return total
  }, 0)
}

/**
 * Calculate total budget from categories
 */
export function calculateTotalBudget(categories: BudgetCategory[]): number {
  return roundMoney(
    categories.reduce((sum, category) => sum + category.estimatedCost, 0)
  )
}
