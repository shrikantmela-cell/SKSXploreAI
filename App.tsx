import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CalculatorState, 
  StepUpFrequency, 
  LumpsumInjection,
  CalculatorMode 
} from './types';
import { calculateSIP, formatCurrency, formatCompactCurrency, generateCSV } from './utils/financial';
import { Documentation } from './components/Documentation';
import { InfoTooltip } from './components/InfoTooltip';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts';
import { 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  BookOpen, 
  DollarSign, 
  Calendar,
  Moon,
  Sun,
  Coins,
  BarChart3,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  // --- Dark Mode ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.theme === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [darkMode]);

  // --- Constants ---
  const DEFAULT_STATE: CalculatorState = {
    mode: CalculatorMode.STEP_UP,
    monthlyInvestment: 10000,
    lumpsumInvestment: 100000,
    annualInterestRate: 12,
    durationYears: 10,
    stepUpAmount: 1000,
    stepUpFrequency: StepUpFrequency.YEARLY,
    additionalLumpsums: []
  };

  // --- Calculator State ---
  const [state, setState] = useState<CalculatorState>(DEFAULT_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showDocs, setShowDocs] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(true);
  
  // newLumpsum now supports month
  const [newLumpsum, setNewLumpsum] = useState<{year: number, month: number, amount: number}>({
    year: 1,
    month: 6,
    amount: 50000
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // --- Calculations ---
  const result = useMemo(() => calculateSIP(state), [state]);

  // --- Handlers ---
  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    let cleanValue = Number(value);
    let newErrors = { ...errors };
    let isValid = true;

    // Input Validation Logic
    if (field === 'annualInterestRate') {
       if (cleanValue < 0 || cleanValue > 50) {
         newErrors[field] = 'Interest Rate must be between 0% and 50%';
         isValid = false;
       } else {
         delete newErrors[field];
       }
    } else if (field === 'durationYears') {
       if (cleanValue < 1 || cleanValue > 50) {
         newErrors[field] = 'Duration must be between 1 and 50 years';
         isValid = false;
       } else {
         delete newErrors[field];
       }
    } else if (['monthlyInvestment', 'lumpsumInvestment', 'stepUpAmount'].includes(field)) {
       if (cleanValue < 0) {
         newErrors[field] = 'Amount cannot be negative';
         isValid = false;
       } else if (cleanValue > 100000000) { // 10 Cr limit for sanity
         newErrors[field] = 'Amount exceeds calculator limit';
         isValid = false;
       } else {
         delete newErrors[field];
       }
    }

    setErrors(newErrors);
    setState(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleReset = () => {
      if (window.confirm('Are you sure you want to reset the calculator to default values?')) {
          setState(DEFAULT_STATE);
          setNewLumpsum({ year: 1, month: 6, amount: 50000 });
          setErrors({});
      }
  };

  const handleDownloadChart = () => {
      if (chartContainerRef.current) {
          const svg = chartContainerRef.current.querySelector('svg');
          if (svg) {
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const img = new Image();
              const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
              const url = URL.createObjectURL(svgBlob);

              img.onload = () => {
                  const rect = svg.getBoundingClientRect();
                  canvas.width = rect.width * 2; // 2x scale for better quality
                  canvas.height = rect.height * 2;
                  
                  if (ctx) {
                      ctx.scale(2, 2);
                      ctx.fillStyle = darkMode ? '#1e293b' : '#ffffff';
                      ctx.fillRect(0, 0, rect.width, rect.height);
                      ctx.drawImage(img, 0, 0, rect.width, rect.height);
                      
                      const pngUrl = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = "growthstack_chart.png";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                  }
                  URL.revokeObjectURL(url);
              };
              img.src = url;
          }
      }
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(result);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'growthstack_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addLumpsum = () => {
    const newEntry: LumpsumInjection = {
      id: Math.random().toString(36).substr(2, 9),
      ...newLumpsum
    };
    setState(prev => ({
      ...prev,
      additionalLumpsums: [...prev.additionalLumpsums, newEntry]
    }));
  };

  const removeLumpsum = (id: string) => {
    setState(prev => ({
      ...prev,
      additionalLumpsums: prev.additionalLumpsums.filter(l => l.id !== id)
    }));
  };

  // --- Custom Chart Tooltip ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const interestEarned = data.value - data.invested;
      
      return (
        <div className="bg-slate-800/95 backdrop-blur text-white p-4 rounded-lg shadow-xl border border-slate-700 text-sm animate-fade-in">
          <p className="font-bold mb-2 border-b border-slate-600 pb-1">
            Year {data.year} <span className="text-slate-400 font-normal text-xs ml-1">(Month {data.monthIndex})</span>
          </p>
          
          <div className="space-y-1.5">
            {state.mode !== CalculatorMode.LUMPSUM && (
               <div className="flex justify-between gap-8">
                <span className="text-slate-300">Monthly SIP:</span>
                <span className="font-mono text-indigo-300">{formatCurrency(data.installment)}</span>
               </div>
            )}
            
            <div className="flex justify-between gap-8">
              <span className="text-slate-300">Total Invested:</span>
              <span className="font-mono text-emerald-300">{formatCurrency(data.invested)}</span>
            </div>
            
            <div className="flex justify-between gap-8">
              <span className="text-slate-300">Interest Earned:</span>
              <span className="font-mono text-yellow-300">{formatCurrency(interestEarned)}</span>
            </div>
            
            <div className="pt-2 mt-1 border-t border-slate-600 flex justify-between gap-8">
              <span className="font-bold text-white">Total Value:</span>
              <span className="font-bold font-mono text-white">{formatCurrency(data.value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Helpers ---
  const getModeTitle = () => {
    switch(state.mode) {
      case CalculatorMode.LUMPSUM: return 'Lumpsum Calculator';
      case CalculatorMode.SIP: return 'SIP Calculator';
      case CalculatorMode.STEP_UP: return 'Step-Up SIP Calculator';
      default: return 'Calculator';
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Growth<span className="text-indigo-600 dark:text-indigo-400">Stack</span>
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              v1.2.0
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div title="Toggle Dark Mode">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div title="Reset Calculator to Defaults">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Reset Calculator"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            <button 
              onClick={() => setShowDocs(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
              title="View Calculation Formulas & Methodology"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">Methodology</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 relative overflow-hidden transition-colors duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={64} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invested</p>
                <InfoTooltip text="The total principal amount you will pay from your pocket over the entire duration." />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCompactCurrency(result.totalInvested)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{formatCurrency(result.totalInvested)}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 relative overflow-hidden transition-colors duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated Gains</p>
                <InfoTooltip text="The total wealth generated purely from compound interest (Wealth minus Principal)." />
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCompactCurrency(result.totalGain)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{formatCurrency(result.totalGain)}</p>
          </div>

          <div className="bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none p-6 relative overflow-hidden text-white transition-colors duration-300 group">
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500 dark:bg-indigo-600 rounded-full opacity-50 blur-2xl group-hover:blur-3xl transition-all"></div>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-indigo-100">Future Value</p>
                <div className="text-indigo-200">
                     <InfoTooltip text="The final maturity value of your investment at the end of the selected duration." />
                </div>
            </div>
            <p className="text-4xl font-bold">{formatCompactCurrency(result.totalWealth)}</p>
            <p className="text-xs text-indigo-200 mt-2 font-mono">{formatCurrency(result.totalWealth)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Mode Selector */}
            <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1 shadow-inner">
               {[
                 { id: CalculatorMode.SIP, label: 'SIP', icon: Calendar, tooltip: "Regular Monthly Investment" },
                 { id: CalculatorMode.STEP_UP, label: 'Step Up', icon: TrendingUp, tooltip: "SIP that increases every year" },
                 { id: CalculatorMode.LUMPSUM, label: 'Lumpsum', icon: Coins, tooltip: "One-time Investment" },
               ].map((m) => (
                 <button
                   key={m.id}
                   title={m.tooltip}
                   onClick={() => handleInputChange('mode', m.id)}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                     state.mode === m.id 
                       ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                   }`}
                 >
                   <m.icon size={16} />
                   <span className="hidden sm:inline">{m.label}</span>
                 </button>
               ))}
            </div>

            {/* Basic Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                {getModeTitle()}
              </h2>
              
              <div className="space-y-5">
                {/* Investment Amount Input - Changes based on mode */}
                {state.mode === CalculatorMode.LUMPSUM ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Total Lumpsum Investment (₹)
                      <InfoTooltip text="The single amount you wish to invest today." />
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={state.lumpsumInvestment}
                        onChange={(e) => handleInputChange('lumpsumInvestment', e.target.value)}
                        className={`w-full pl-8 pr-3 py-2 border ${errors.lumpsumInvestment ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'} bg-white dark:bg-slate-900 rounded-lg focus:ring-2 dark:text-white outline-none transition-all`}
                      />
                    </div>
                    {errors.lumpsumInvestment && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.lumpsumInvestment}</p>}
                    <input 
                      type="range" 
                      min="5000" 
                      max="10000000" 
                      step="5000" 
                      value={state.lumpsumInvestment}
                      onChange={(e) => handleInputChange('lumpsumInvestment', e.target.value)}
                      className="w-full mt-2 accent-indigo-600 dark:accent-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Investment (₹)
                      <InfoTooltip text="The amount you commit to saving every month." />
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={state.monthlyInvestment}
                        onChange={(e) => handleInputChange('monthlyInvestment', e.target.value)}
                        className={`w-full pl-8 pr-3 py-2 border ${errors.monthlyInvestment ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'} bg-white dark:bg-slate-900 rounded-lg focus:ring-2 dark:text-white outline-none transition-all`}
                      />
                    </div>
                    {errors.monthlyInvestment && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.monthlyInvestment}</p>}
                    <input 
                      type="range" 
                      min="500" 
                      max="100000" 
                      step="500" 
                      value={state.monthlyInvestment}
                      onChange={(e) => handleInputChange('monthlyInvestment', e.target.value)}
                      className="w-full mt-2 accent-indigo-600 dark:accent-indigo-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Exp. Return (%)
                        <InfoTooltip text="The expected annual rate of return. Equity Mutual Funds in India typically average 12-15% over 10+ years." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={state.annualInterestRate}
                          onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
                          className={`w-full pl-3 pr-8 py-2 border ${errors.annualInterestRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'} bg-white dark:bg-slate-900 rounded-lg focus:ring-2 dark:text-white outline-none transition-all`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                      </div>
                      {errors.annualInterestRate && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.annualInterestRate}</p>}
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Duration (Years)
                        <InfoTooltip text="How long you plan to stay invested. Longer duration leverages the power of compounding." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={state.durationYears}
                        onChange={(e) => handleInputChange('durationYears', e.target.value)}
                        className={`w-full px-3 py-2 border ${errors.durationYears ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'} bg-white dark:bg-slate-900 rounded-lg focus:ring-2 dark:text-white outline-none transition-all`}
                      />
                      {errors.durationYears && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.durationYears}</p>}
                   </div>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    step="1" 
                    value={state.durationYears}
                    onChange={(e) => handleInputChange('durationYears', e.target.value)}
                    className="w-full accent-indigo-600 dark:accent-indigo-500"
                  />
              </div>
            </section>

            {/* Step Up Settings (Only for Step Up Mode) */}
            {state.mode === CalculatorMode.STEP_UP && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Step-Up Configuration
                  <InfoTooltip text="Automatically increase your SIP amount periodically to match salary hikes and beat inflation." />
                </h2>

                <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Increment Amount (₹)
                         <InfoTooltip text="The fixed amount to add to your monthly SIP. E.g., If SIP is 5000 and Increment is 1000, next year SIP will be 6000." />
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={state.stepUpAmount}
                          onChange={(e) => handleInputChange('stepUpAmount', e.target.value)}
                          className={`w-full pl-8 pr-3 py-2 border ${errors.stepUpAmount ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500'} bg-white dark:bg-slate-900 rounded-lg focus:ring-2 dark:text-white outline-none`}
                        />
                      </div>
                      {errors.stepUpAmount && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.stepUpAmount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Increment Frequency
                        <InfoTooltip text="How often the SIP amount increases. Yearly is standard. Monthly is aggressive." />
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <button
                          className={`py-1.5 text-sm font-medium rounded-md transition-all ${state.stepUpFrequency === StepUpFrequency.YEARLY ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          onClick={() => handleInputChange('stepUpFrequency', StepUpFrequency.YEARLY)}
                        >
                          Yearly
                        </button>
                        <button
                          className={`py-1.5 text-sm font-medium rounded-md transition-all ${state.stepUpFrequency === StepUpFrequency.MONTHLY ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          onClick={() => handleInputChange('stepUpFrequency', StepUpFrequency.MONTHLY)}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                </div>
              </section>
            )}

            {/* Lumpsum Injections (Available for all modes to allow parallel inputs) */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
               <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <PlusCircle className="w-5 h-5 text-indigo-500" />
                 Parallel Injections
                 <InfoTooltip text="Add extra one-time investments (like bonuses) at specific dates. These get added to your pot and compound immediately." />
               </h2>

               <div className="space-y-4">
                 {/* Add New */}
                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                            Year
                            <InfoTooltip text="The year (from start) when you add this money." />
                        </label>
                        <select 
                          value={newLumpsum.year}
                          onChange={(e) => setNewLumpsum({...newLumpsum, year: Number(e.target.value)})}
                          className="w-full mt-1 text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        >
                          {Array.from({length: state.durationYears}, (_, i) => i + 1).map(y => (
                            <option key={y} value={y}>Year {y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                            Month
                             <InfoTooltip text="The specific month in that year." />
                        </label>
                        <select 
                          value={newLumpsum.month}
                          onChange={(e) => setNewLumpsum({...newLumpsum, month: Number(e.target.value)})}
                          className="w-full mt-1 text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Amount</label>
                        <input 
                          type="number"
                          min="0"
                          value={newLumpsum.amount}
                          onChange={(e) => setNewLumpsum({...newLumpsum, amount: Number(e.target.value)})}
                          className="w-full mt-1 text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="50000"
                        />
                    </div>
                    <button 
                      onClick={addLumpsum}
                      className="w-full py-2 bg-white dark:bg-slate-800 border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-md hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={16} /> Add Injection
                    </button>
                 </div>

                 {/* List */}
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                   {state.additionalLumpsums.length === 0 && (
                     <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2 italic">No extra injections added</p>
                   )}
                   {state.additionalLumpsums.map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCompactCurrency(item.amount)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Year {item.year}, {new Date(0, item.month - 1).toLocaleString('default', { month: 'short' })}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeLumpsum(item.id)}
                          title="Remove this injection"
                          className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>
                   ))}
                 </div>
               </div>
            </section>

          </div>

          {/* Right Column: Charts & Data */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300 relative">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Wealth Growth Projection
                    <InfoTooltip text="Visual representation of how your money grows over time. The purple area is your wealth, the grey area is your investment." />
                </h3>
                <div className="flex gap-2">
                    <div className="hidden md:flex text-xs text-slate-500 items-center mr-2">
                        <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-1"></span> Drag bottom bar to zoom
                    </div>
                    <button 
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Export Full Report as CSV"
                    >
                        <FileSpreadsheet size={14} /> <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    <button 
                        onClick={handleDownloadChart}
                        className="flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Save Chart Image as PNG"
                    >
                        <Download size={14} /> <span className="hidden sm:inline">Export Chart</span>
                    </button>
                </div>
              </div>
              <div className="h-[400px] w-full" ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={result.monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis 
                      dataKey="year" 
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickCount={Math.min(10, state.durationYears)}
                      stroke="#94a3b8"
                      tick={{fill: '#64748b', fontSize: 12}}
                      label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => (value / 100000).toFixed(1) + 'L'}
                      stroke="#94a3b8"
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="invested" 
                      name="Invested Amount" 
                      stroke="#94a3b8" 
                      fillOpacity={1} 
                      fill="url(#colorInvested)" 
                      strokeWidth={2}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Total Value" 
                      stroke="#4f46e5" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      strokeWidth={3}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Brush 
                        dataKey="year" 
                        height={30} 
                        stroke="#4f46e5"
                        fill={darkMode ? "#1e293b" : "#f8fafc"}
                        tickFormatter={(value) => `Y${value}`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Breakdown Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <button 
                  onClick={() => setShowYearly(!showYearly)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                 <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Yearly Breakdown
                        <InfoTooltip text="See how your money grows year by year." />
                     </h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detailed summary of your investment growth by year.</p>
                 </div>
                 {showYearly ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
              </button>

              {showYearly && (
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invested</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interest Earned</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {result.yearlyBreakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                            {row.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">
                            {formatCurrency(row.investedAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">
                            +{formatCurrency(row.interestEarned)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600 dark:text-indigo-400 font-bold">
                            {formatCurrency(row.totalValue)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              )}
            </div>

            {/* Monthly Breakdown Table (Collapsible) */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <button 
                  onClick={() => setShowMonthly(!showMonthly)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Monthly Breakdown
                        <InfoTooltip text="Granular view of every month's balance." />
                   </h3>
                   {showMonthly ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                </button>
                
                {showMonthly && (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto border-t border-slate-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Month</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invested</th>
                           <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {result.monthlyData.map((row) => (
                          <tr key={row.monthIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                               <span className="font-medium text-slate-900 dark:text-white">M{row.monthIndex}</span> <span className="text-xs text-slate-400">(Year {row.year})</span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">
                              {formatCurrency(row.invested)}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-indigo-600 dark:text-indigo-400 font-medium">
                              {formatCurrency(row.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

          </div>
        </div>
      </main>

      {/* Ownership Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
                 <p className="mb-1">© 2024 GrowthStack. All Rights Reserved.</p>
                 <p className="font-mono opacity-70">Owner ID: USER-ID-OWNER-V1-SECURE-7782</p>
             </div>
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    <ShieldCheck size={14} />
                    <span>Audited Financial Logic</span>
                 </div>
             </div>
         </div>
      </footer>

      <Documentation isOpen={showDocs} onClose={() => setShowDocs(false)} />
    </div>
  );
};

export default App;