import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface DocumentationProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-200 dark:border-slate-700">
                    <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold leading-6 text-slate-900 dark:text-white flex items-center gap-2" id="modal-title">
                                <ShieldCheck className="text-indigo-600 dark:text-indigo-400" />
                                Methodology & Compliance
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mt-6 space-y-8 text-slate-600 dark:text-slate-300">
                            
                            {/* Regulatory Disclaimer */}
                            <section className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-2">Regulatory Disclaimer</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300 text-justify">
                                    This calculator is an educational tool designed to assist with financial planning. The results provided are estimates based on the inputs and assumed rates of return. Mutual Fund investments are subject to market risks; read all scheme-related documents carefully. 
                                    This tool follows the "Future Value of Annuity Due" logic widely accepted by financial institutions but does not guarantee future performance. Returns are not assured. 
                                    <br/><br/>
                                    <strong>Compliance:</strong> The calculations adhere to standard mathematical formulas for compound interest.
                                </p>
                            </section>

                            {/* Universal Logic */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">1. Auditable Core Formula</h4>
                                <p className="mb-3 text-sm">
                                    GrowthStack uses a month-by-month <strong>Iterative Annuity Due</strong> calculation method. This is the "Gold Standard" for accuracy as it simulates the actual cash flow of a bank account or mutual fund folio.
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
                                    <strong>For each month m:</strong><br/>
                                    Monthly_Rate (r) = Annual_Rate / 12 / 100<br/>
                                    Total_Investment_In = SIP_Amount + Any_Lumpsum_Injection<br/>
                                    Opening_Balance = Previous_Month_Closing_Balance<br/>
                                    <br/>
                                    <strong>Closing_Balance = (Opening_Balance + Total_Investment_In) × (1 + r)</strong>
                                </div>
                                <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                                    *Note: (1+r) is applied to the sum of opening balance AND new investment, implying investment is made at the start of the month (Annuity Due).
                                </p>
                            </section>

                            {/* Simple SIP & Step Up */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">2. Verification Formulas (Back-Testing)</h4>
                                <p className="text-sm mb-3">
                                    You can back-test our results using Excel or a financial calculator using these standard formulas:
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                        <h5 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Fixed SIP (Excel Function)</h5>
                                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                            =FV(rate/12, months, -sip_amount, 0, 1)
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            *Type 1 denotes payment at beginning of period.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                        <h5 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Lumpsum (Excel Function)</h5>
                                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                            =FV(rate/12, months, 0, -lumpsum_amount, 0)
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Parallel Injections */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">3. Parallel Lumpsum Logic</h4>
                                <p className="text-sm">
                                    Parallel injections are treated as separate cash flows. If you add ₹50,000 in Month 18, it is added to the corpus exactly at Month 18 and starts compounding from Month 18 to End of Duration. This uses the principle of superposition in time-value of money.
                                </p>
                            </section>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                        <button 
                            type="button" 
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 sm:ml-3 sm:w-auto transition-colors"
                            onClick={onClose}
                        >
                            Acknowledge & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};