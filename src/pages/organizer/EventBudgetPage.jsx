// src/pages/organizer/EventBudgetPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  PieChart,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useEvent } from '@/hooks/useEvents';
import { useBudget, useBudgetItems, useUpdateBudget, useAddBudgetItem, useDeleteBudgetItem } from '@/hooks/useBudget';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: 'food', label: 'Food & Catering' },
  { value: 'venue', label: 'Venue' },
  { value: 'decor', label: 'Decoration' },
  { value: 'travel', label: 'Travel & Transport' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

function EventBudgetPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: budget, isLoading: budgetLoading } = useBudget(eventId);
  const updateBudgetMutation = useUpdateBudget();
  const addItemMutation = useAddBudgetItem();
  const deleteItemMutation = useDeleteBudgetItem();

  const [newItem, setNewItem] = useState({
    category: 'food',
    description: '',
    amount: '',
  });

  const budgetId = budget?.id;
  const { data: items, isLoading: itemsLoading } = useBudgetItems(budgetId);

  const loading = eventLoading || budgetLoading || itemsLoading;

  const totals = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalSpent: 0,
        byCategory: {},
      };
    }

    const byCategory = {};
    let totalSpent = 0;

    items.forEach((item) => {
      const amt = Number(item.amount || 0);
      totalSpent += amt;
      const cat = item.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += amt;
    });

    return { totalSpent, byCategory };
  }, [items]);

  const remaining = budget ? Number(budget.total_budget || 0) - totals.totalSpent : 0;

  const handleBudgetUpdate = (field, value) => {
    if (!budget) return;
    const updates = {};
    if (field === 'total_budget') {
      updates.total_budget = Number(value || 0);
    } else if (field === 'currency') {
      updates.currency = value;
    } else if (field === 'notes') {
      updates.notes = value;
    }
    updateBudgetMutation.mutate({ budgetId: budget.id, updates });
  };

  const handleAddItem = () => {
    if (!budget) return;
    if (!newItem.description || !newItem.amount) return;

    addItemMutation.mutate({
      budget_id: budget.id,
      category: newItem.category,
      description: newItem.description,
      amount: Number(newItem.amount),
    });

    setNewItem({
      category: 'food',
      description: '',
      amount: '',
    });
  };

  const handleDeleteItem = (itemId) => {
    if (!budget) return;
    deleteItemMutation.mutate({ itemId, budgetId: budget.id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Event Budget</h1>
          {event && (
            <p className="text-muted-foreground">
              {event.title} • {formatDate(event.date)}
            </p>
          )}
        </div>
      </div>

      {loading && <BudgetSkeleton />}

      {!loading && budget && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Summary & Total */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Overall Budget
                </CardTitle>
                <CardDescription>
                  Set your total planned budget and track spending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>Total Budget</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={budget.total_budget || ''}
                    onChange={(e) =>
                      handleBudgetUpdate('total_budget', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Currency</Label>
                  <Input
                    value={budget.currency || 'USD'}
                    onChange={(e) =>
                      handleBudgetUpdate('currency', e.target.value)
                    }
                  />
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-semibold">
                      {formatCurrency(totals.totalSpent, budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={remaining < 0 ? 'text-red-600 font-semibold' : 'font-semibold'}>
                      {formatCurrency(remaining, budget.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Budget Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any specific notes about budget, payment terms, vendor advances, etc."
                  value={budget.notes || ''}
                  onChange={(e) => handleBudgetUpdate('notes', e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Breakdown & Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Category Breakdown
                </CardTitle>
                <CardDescription>
                  How your budget is distributed across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items && items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const amount = totals.byCategory[cat.value] || 0;
                      if (amount === 0) return null;
                      return (
                        <Badge
                          key={cat.value}
                          variant="secondary"
                          className="flex items-center gap-2 text-xs"
                        >
                          {cat.label}
                          <span className="font-semibold">
                            {formatCurrency(amount, budget.currency)}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {(!items || items.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No budget items yet. Add your first expense below.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Items List & Add Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List */}
                {items && items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border bg-muted/40"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getCategoryLabel(item.category)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">
                            {formatCurrency(item.amount, budget.currency)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!items || items.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No budget items yet.
                  </p>
                )}

                <Separator className="my-2" />

                {/* Add new item */}
                <div className="space-y-2">
                  <Label>Add Expense</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <select
                        className="h-9 rounded border bg-background text-xs px-2"
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({ ...newItem, description: e.target.value })
                        }
                        placeholder="e.g., Catering advance"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.amount}
                        onChange={(e) =>
                          setNewItem({ ...newItem, amount: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={addItemMutation.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(value) {
  const found = CATEGORIES.find((c) => c.value === value);
  if (found) return found.label;
  return 'Other';
}

function BudgetSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default EventBudgetPage;