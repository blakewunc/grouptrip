'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Expense } from '@/lib/hooks/useExpenses'
import { formatDistanceToNow } from 'date-fns'

interface ExpenseListProps {
  expenses: Expense[]
  currentUserId: string
  onDelete: (expenseId: string) => void
}

export function ExpenseList({ expenses, currentUserId, onDelete }: ExpenseListProps) {
  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-700'

    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-700',
      drinks: 'bg-purple-100 text-purple-700',
      accommodation: 'bg-blue-100 text-blue-700',
      transportation: 'bg-green-100 text-green-700',
      activities: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700',
    }

    const key = category.toLowerCase()
    return colors[key] || 'bg-gray-100 text-gray-700'
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[#A99985]">No expenses yet</p>
          <p className="mt-2 text-sm text-[#A99985]">Add an expense to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{expense.description}</CardTitle>
                  {expense.category && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1">
                  Paid by {expense.profiles.display_name || expense.profiles.email} •{' '}
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </CardDescription>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#252323]">${expense.amount.toFixed(2)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-[#F5F1ED] p-3">
              <p className="mb-2 text-xs font-medium text-[#A99985]">SPLIT BREAKDOWN</p>
              <div className="space-y-1">
                {expense.expense_splits.map((split) => (
                  <div key={split.id} className="flex justify-between text-sm">
                    <span className="text-[#252323]">
                      {split.profiles.display_name || split.profiles.email}
                      {split.user_id === currentUserId && ' (You)'}
                    </span>
                    <span className="font-medium text-[#252323]">${split.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
