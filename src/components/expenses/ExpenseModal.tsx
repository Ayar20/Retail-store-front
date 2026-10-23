import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { toDateInputValue } from '../../utils/formatters';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  expense?: Expense | null;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent & Lease',
  'Utilities & Power',
  'Inventory Restock',
  'Staff & Wages',
  'Packaging & Supplies',
  'Maintenance & Repairs',
  'Marketing & Ads',
  'Taxes & Licenses',
  'POS & Software Fees',
  'Miscellaneous',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose }) => {
  const { addExpense, updateExpense, settings } = useStore();
  const isEditing = !!expense;

  const [date, setDate] = useState(expense?.date || toDateInputValue(new Date()));
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category || 'Utilities & Power'
  );
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState<string>(expense ? String(expense.amount) : '25000');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'card'>(
    expense?.paymentMethod || 'bank_transfer'
  );
  const [payee, setPayee] = useState(expense?.payee || '');
  const [referenceNo, setReferenceNo] = useState(expense?.referenceNo || '');
  const [notes, setNotes] = useState(expense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Description is required');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    const payload = {
      date,
      category,
      description: description.trim(),
      amount: Number(numAmount.toFixed(2)),
      paymentMethod,
      payee: payee.trim() || 'General Vendor',
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (isEditing && expense) {
      updateExpense(expense.id, payload);
    } else {
      addExpense(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              {isEditing ? 'Edit Expense Record' : 'Log Store Expense'}
            </h3>
            <p className="text-xs text-neutral-500">
              Record operational outflows, bills, payroll, or stock purchases.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date and Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Date Incurred *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Amount ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Paid Via
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              >
                <option value="bank_transfer">Bank Transfer / EFT</option>
                <option value="card">Business Debit / Credit Card</option>
                <option value="cash">Petty Cash</option>
              </select>
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Description / Reason *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Electric & Commercial Refrigeration Power Bill"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            />
          </div>

          {/* Payee / Vendor & Invoice Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Payee / Vendor
              </label>
              <input
                type="text"
                value={payee}
                onChange={e => setPayee(e.target.value)}
                placeholder="e.g. Metro Power & Light"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Invoice / Reference #
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                placeholder="e.g. INV-88219"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional billing terms, authorization info, etc."
              className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            >
              {isEditing ? 'Save Expense' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
