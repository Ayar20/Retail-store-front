import React, { useEffect, useRef } from 'react';
import { Sale } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
  isNewSale?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  onClose,
  isNewSale = false,
}) => {
  const { settings } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNewSale) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }
  }, [isNewSale]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const lines = [
      '==========================================',
      `           ${settings.storeName.toUpperCase()}`,
      `         ${settings.tagline}`,
      `       ${settings.address}`,
      `           Tel: ${settings.phone}`,
      '==========================================',
      `Receipt No:  ${sale.receiptNumber}`,
      `Date/Time:   ${formatDateTime(sale.timestamp)}`,
      `Cashier:     ${sale.cashierName}`,
      sale.customerName ? `Customer:    ${sale.customerName}` : '',
      '------------------------------------------',
      'ITEM                       QTY    TOTAL',
      '------------------------------------------',
      ...sale.items.map(item => {
        const name = item.name.slice(0, 24).padEnd(25, ' ');
        const qty = String(item.quantity).padStart(3, ' ');
        const total = formatCurrency(item.total, settings.currencySymbol).padStart(10, ' ');
        return `${name}${qty}${total}`;
      }),
      '------------------------------------------',
      `Subtotal:                    ${formatCurrency(sale.subtotal, settings.currencySymbol).padStart(11, ' ')}`,
      sale.discount > 0 ? `Discount:                   -${formatCurrency(sale.discount, settings.currencySymbol).padStart(11, ' ')}` : '',
      settings.taxEnabled ? `Tax (${sale.taxRatePercent}%):                ${formatCurrency(sale.tax, settings.currencySymbol).padStart(11, ' ')}` : '',
      '==========================================',
      `TOTAL:                       ${formatCurrency(sale.total, settings.currencySymbol).padStart(11, ' ')}`,
      '==========================================',
      `Payment Method:              ${sale.paymentMethod.toUpperCase()}`,
      sale.paymentMethod === 'cash' ? `Tendered:                    ${formatCurrency(sale.amountTendered, settings.currencySymbol).padStart(11, ' ')}` : '',
      sale.paymentMethod === 'cash' ? `Change:                      ${formatCurrency(sale.changeGiven, settings.currencySymbol).padStart(11, ' ')}` : '',
      '------------------------------------------',
      `  ${settings.receiptFooterNote}`,
      '==========================================',
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${sale.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header (Screen Only) */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-neutral-900 text-sm">
              {isNewSale ? 'Sale Completed Successfully' : 'Receipt Details'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Thermal Receipt Slip */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div
            ref={receiptRef}
            className="bg-neutral-50/70 border border-neutral-200/80 rounded-lg p-5 font-mono text-xs text-neutral-800 shadow-inner"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-300">
              <h2 className="font-bold text-base tracking-tight text-neutral-900 font-display">
                {settings.storeName}
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">{settings.tagline}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-neutral-500">Tel: {settings.phone}</p>
            </div>

            {/* Metadata info */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px] text-neutral-600">
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span className="font-semibold text-neutral-900">{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDateTime(sale.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="text-neutral-900">{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="py-2.5 border-b border-dashed border-neutral-300">
              <div className="grid grid-cols-12 font-semibold text-neutral-700 text-[11px] pb-1.5 border-b border-neutral-200">
                <span className="col-span-7">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Total</span>
              </div>
              <div className="divide-y divide-neutral-100 pt-1">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-1.5 text-[11px] items-start">
                    <div className="col-span-7 pr-1">
                      <div className="font-medium text-neutral-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">
                        {formatCurrency(item.unitPrice, settings.currencySymbol)} each
                      </div>
                    </div>
                    <span className="col-span-2 text-center tabular-nums text-neutral-700">
                      {item.quantity}
                    </span>
                    <span className="col-span-3 text-right tabular-nums font-medium text-neutral-900">
                      {formatCurrency(item.total, settings.currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Calculation */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(sale.subtotal, settings.currencySymbol)}
                </span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span className="tabular-nums">
                    -{formatCurrency(sale.discount, settings.currencySymbol)}
                  </span>
                </div>
              )}

              {settings.taxEnabled && (
                <div className="flex justify-between text-neutral-600">
                  <span>Sales Tax ({sale.taxRatePercent}%)</span>
                  <span className="tabular-nums">
                    {formatCurrency(sale.tax, settings.currencySymbol)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-1.5 text-sm font-bold text-neutral-900 border-t border-neutral-300">
                <span>TOTAL</span>
                <span className="tabular-nums text-base">
                  {formatCurrency(sale.total, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Payment & Change breakdown */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px] text-neutral-600">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase text-neutral-800">
                  {sale.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              {sale.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Amount Tendered:</span>
                    <span className="tabular-nums">
                      {formatCurrency(sale.amountTendered, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-neutral-900">
                    <span>Change Returned:</span>
                    <span className="tabular-nums text-emerald-600">
                      {formatCurrency(sale.changeGiven, settings.currencySymbol)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center text-[10px] text-neutral-500">
              <p>{settings.receiptFooterNote}</p>
              <p className="mt-1 text-neutral-400">POS Ref: #{sale.id.slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Modal Actions (Screen Only) */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save .TXT</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            {isNewSale ? 'Start Next Sale' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
