import { Expense } from '@/lib/hooks/useExpenses'

export interface Balance {
  userId: string
  userName: string
  netBalance: number // Positive = owed money, Negative = owes money
}

export interface Settlement {
  from: string // user ID
  fromName: string
  to: string // user ID
  toName: string
  amount: number
}

/**
 * Calculate net balances for all members
 * Net balance = total paid - total owed
 */
export function calculateBalances(
  expenses: Expense[],
  members: Array<{ id: string; name: string }>
): Balance[] {
  const balances = new Map<string, { name: string; paid: number; owed: number }>()

  // Initialize balances for all members
  members.forEach(member => {
    balances.set(member.id, {
      name: member.name,
      paid: 0,
      owed: 0,
    })
  })

  // Calculate totals
  expenses.forEach(expense => {
    // Add to amount paid by payer
    const payer = balances.get(expense.paid_by)
    if (payer) {
      payer.paid += expense.amount
    }

    // Add to amounts owed by each split participant
    expense.expense_splits.forEach(split => {
      const participant = balances.get(split.user_id)
      if (participant) {
        participant.owed += split.amount
      }
    })
  })

  // Convert to Balance array with net balances
  return Array.from(balances.entries()).map(([userId, data]) => ({
    userId,
    userName: data.name,
    netBalance: data.paid - data.owed,
  }))
}

/**
 * Calculate minimum number of settlements to balance all debts
 * Uses a greedy algorithm to match debtors with creditors
 */
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = []

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter(b => b.netBalance > 0.01) // Ignore tiny amounts
    .map(b => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance) // Largest creditor first

  const debtors = balances
    .filter(b => b.netBalance < -0.01) // Ignore tiny amounts
    .map(b => ({ ...b, netBalance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.netBalance - a.netBalance) // Largest debtor first

  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]

    const settlementAmount = Math.min(creditor.netBalance, debtor.netBalance)

    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.userId,
        fromName: debtor.userName,
        to: creditor.userId,
        toName: creditor.userName,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimals
      })
    }

    creditor.netBalance -= settlementAmount
    debtor.netBalance -= settlementAmount

    if (creditor.netBalance < 0.01) i++
    if (debtor.netBalance < 0.01) j++
  }

  return settlements
}
