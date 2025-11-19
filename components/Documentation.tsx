import React from 'react';
import { X } from 'lucide-react';

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
                            <h3 className="text-2xl font-bold leading-6 text-slate-900 dark:text-white" id="modal-title">
                                Calculation Methodology
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mt-6 space-y-8 text-slate-600 dark:text-slate-300">
                            
                            {/* Universal Logic */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">1. Universal Core Formula</h4>
                                <p className="mb-3 text-sm">
                                    GrowthStack uses a month-by-month iterative calculation method for all modes. This ensures accuracy when dealing with complex scenarios like Step-Ups or mid-term lumpsum injections.
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
                                    Month_End_Value = (Opening_Balance + Invest_Amount) × (1 + r)
                                </div>
                                <ul className="list-disc list-inside mt-2 text-xs sm:text-sm space-y-1 ml-2">
                                    <li><strong>r</strong>: Monthly Interest Rate = Annual Rate / 12 / 100</li>
                                    <li><strong>Opening_Balance</strong>: Value carried over from previous month.</li>
                                    <li><strong>Invest_Amount</strong>: SIP Installment + Any Lumpsums for that month.</li>
                                </ul>
                            </section>

                            {/* Simple SIP & Step Up */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">2. Simple SIP & Step-Up SIP</h4>
                                <p className="text-sm mb-3">
                                    For a standard SIP, the investment amount remains constant. For Step-Up, the amount increases based on your frequency setting.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                        <h5 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Standard SIP Formula (Approximation)</h5>
                                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                            FV = P × [((1 + r)^n - 1) / r] × (1 + r)
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                        <h5 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Step-Up Logic</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            If Frequency = Yearly: <br/>
                                            Month 1-12: P<br/>
                                            Month 13-24: P + StepUp<br/>
                                            Month 25-36: P + (2 × StepUp)...
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Lumpsum */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">3. Lumpsum Investment</h4>
                                <p className="text-sm mb-2">
                                    In Lumpsum mode, a single large investment is made at the start (Year 0).
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
                                    FV = P × (1 + r)^n
                                </div>
                                <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                                    Where <strong>n</strong> is total months (Years × 12).
                                </p>
                            </section>

                            {/* Parallel Injections */}
                            <section>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">4. Parallel Lumpsum Injections</h4>
                                <p className="text-sm">
                                    Additional lumpsums are added directly to the investment pool in the specific month designated. They immediately start earning compound interest from that month onwards alongside your existing corpus.
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
                            Close Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};