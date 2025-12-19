import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Edit2, Trash2, Sun, Moon } from 'lucide-react';
import { SignIn, SignedIn, SignedOut, UserButton, useUser, useClerk } from '@clerk/clerk-react';

const API_URL = '/api/trades';

const TradingJournal = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [editingTrade, setEditingTrade] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [statsFilterTags, setStatsFilterTags] = useState([]);
  const [statsFilterSetup, setStatsFilterSetup] = useState('all');
  const [tradingMode, setTradingMode] = useState('live'); // 'live' or 'backtest'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    exitDate: '',
    exitTime: '',
    symbol: '',
    side: 'BUY',
    quantity: 1,
    entryPrice: '',
    exitPrice: '',
    target: '',
    stopLoss: '',
    pnl: '',
    tags: [],
    notes: '',
    confidence: 5,
    setup: '',
    screenshots: [],
    market: 'FUTURES'
  });

  // Theme configuration
  const themes = {
    dark: {
      mainBg: 'from-black via-zinc-900 to-black',
      sidebarBg: 'bg-zinc-900/95',
      cardBg: 'bg-zinc-900/90',
      inputBg: 'bg-zinc-800/80',
      modalBg: 'bg-zinc-900',
      border: 'border-zinc-800/50',
      borderSolid: 'border-zinc-700',
      text: 'text-white',
      textMuted: 'text-zinc-400',
      textDim: 'text-zinc-500',
      hover: 'hover:bg-zinc-800/70',
      hoverCard: 'hover:bg-zinc-800/30',
      chartGrid: '#27272a',
      chartAxis: '#71717a',
      chartLine: '#3b82f6',
      tooltipBg: '#18181b',
      tooltipBorder: '#27272a',
      tooltipText: '#fff'
    },
    light: {
      mainBg: 'from-slate-50 via-white to-slate-50',
      sidebarBg: 'bg-white/90',
      cardBg: 'bg-white',
      inputBg: 'bg-slate-50',
      modalBg: 'bg-white',
      border: 'border-slate-200',
      borderSolid: 'border-slate-300',
      text: 'text-slate-900',
      textMuted: 'text-slate-600',
      textDim: 'text-slate-500',
      hover: 'hover:bg-slate-100',
      hoverCard: 'hover:bg-slate-50',
      chartGrid: '#e2e8f0',
      chartAxis: '#64748b',
      chartLine: '#3b82f6',
      tooltipBg: '#ffffff',
      tooltipBorder: '#e2e8f0',
      tooltipText: '#0f172a'
    }
  };

  const t = themes[theme];

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const loadTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          'x-user-id': user?.id,
          'x-trading-mode': tradingMode
        }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedTrades = data.trades.map(t => ({
          id: t.id,
          date: t.date,
          time: t.time,
          exitDate: t.exit_date || '',
          exitTime: t.exit_time || '',
          symbol: t.symbol,
          side: t.side,
          quantity: t.quantity,
          entryPrice: parseFloat(t.entry_price),
          exitPrice: parseFloat(t.exit_price),
          status: t.status,
          pnl: parseFloat(t.pnl),
          pnlPercent: parseFloat(t.pnl_percent),
          rrRatio: parseFloat(t.rr_ratio),
          tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : (t.tags || []),
          notes: t.notes,
          confidence: t.confidence,
          setup: t.setup,
          target: parseFloat(t.target),
          stopLoss: parseFloat(t.stop_loss),
          screenshots: typeof t.screenshots === 'string' ? JSON.parse(t.screenshots) : (t.screenshots || []),
          mode: t.mode || 'live'
        }));
        setTrades(formattedTrades);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadTrades();
    }
  }, [user?.id, tradingMode]);

  const calculateStats = () => {
    const completedTrades = trades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
    const wins = trades.filter(t => t.status === 'WIN');
    const losses = trades.filter(t => t.status === 'LOSS');
    
    const totalPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = completedTrades.length > 0 ? (wins.length / completedTrades.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losses.length : 0;
    
    return {
      totalTrades: completedTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: winRate.toFixed(0),
      totalPnL: totalPnL.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      openTrades: trades.filter(t => !t.status).length
    };
  };

  const stats = calculateStats();

  const handleSubmitTrade = async () => {
    try {
      const entry = parseFloat(newTrade.entryPrice) || 0;
      const exit = parseFloat(newTrade.exitPrice) || 0;
      const target = parseFloat(newTrade.target) || 0;
      const stopLoss = parseFloat(newTrade.stopLoss) || 0;
      const manualPnL = parseFloat(newTrade.pnl) || 0;
      const qty = parseFloat(newTrade.quantity) || 1;

      let rrRatio = 0;
      if (entry > 0 && stopLoss > 0 && target > 0) {
        const risk = Math.abs(entry - stopLoss);
        const reward = Math.abs(entry - target);
        rrRatio = risk > 0 ? reward / risk : 0;
      }

      const pnlPercent = entry > 0 && qty > 0 ? (manualPnL / (entry * qty)) * 100 : 0;

      const trade = {
        ...newTrade,
        pnl: manualPnL,
        pnlPercent: isNaN(pnlPercent) ? 0 : pnlPercent,
        rrRatio: isNaN(rrRatio) ? 0 : rrRatio,
        status: manualPnL !== 0 ? (manualPnL > 0 ? 'WIN' : 'LOSS') : '',
        quantity: qty,
        entryPrice: entry,
        exitPrice: exit,
        target: target,
        stopLoss: stopLoss,
        mode: tradingMode
      };

      if (editingTrade) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
            'x-trading-mode': tradingMode
          },
          body: JSON.stringify({ ...trade, id: editingTrade.id })
        });
        setEditingTrade(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
            'x-trading-mode': tradingMode
          },
          body: JSON.stringify(trade)
        });
      }

      await loadTrades();
      setShowNewTrade(false);
      setNewTrade({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        exitDate: '',
        exitTime: '',
        symbol: '',
        side: 'BUY',
        quantity: 1,
        entryPrice: '',
        exitPrice: '',
        target: '',
        stopLoss: '',
        pnl: '',
        tags: [],
        notes: '',
        confidence: 5,
        setup: '',
        screenshots: [],
        market: 'FUTURES'
      });
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade');
    }
  };

  const deleteTrade = async (id) => {
    try {
      await fetch(`${API_URL}?id=${id}`, { 
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id,
          'x-trading-mode': tradingMode
        }
      });
      await loadTrades();
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const editTrade = (trade) => {
    setNewTrade({
      ...trade,
      exitDate: trade.exitDate || '',
      exitTime: trade.exitTime || '',
      tags: trade.tags || [],
      screenshots: trade.screenshots || [],
      market: trade.market || 'FUTURES'
    });
    setEditingTrade(trade);
    setShowNewTrade(true);
  };

  const exportTrades = () => {
    const dataStr = JSON.stringify({ trades }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTrades = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.trades && Array.isArray(data.trades)) {
            for (const trade of data.trades) {
              await fetch(API_URL, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-user-id': user?.id
                },
                body: JSON.stringify(trade)
              });
            }
            await loadTrades();
            alert('Trades imported successfully!');
          }
        } catch (error) {
          console.error('Error importing:', error);
          alert('Error importing trades');
        }
      };
      reader.readAsText(file);
    }
  };

  const getPerformanceData = () => {
    let cumulative = 0;
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA - dateB;
    });
    
    return sortedTrades.map(trade => {
      cumulative += trade.pnl || 0;
      return {
        date: trade.date,
        pnl: parseFloat(cumulative.toFixed(2))
      };
    });
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  const getTradesForDate = (dateStr) => trades.filter(t => t.date === dateStr);
  const getDailyPnL = (dateStr) => getTradesForDate(dateStr).reduce((sum, t) => sum + (t.pnl || 0), 0);
  const formatCalendarDate = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getMonthName = (month) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
  
  // Get unique tags from all trades
  const getAllTags = () => {
    const tagsSet = new Set();
    trades.forEach(trade => {
      if (trade.tags && Array.isArray(trade.tags)) {
        trade.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };

  // Get unique setups from all trades
  const getAllSetups = () => {
    const setupsSet = new Set();
    trades.forEach(trade => {
      if (trade.setup) {
        setupsSet.add(trade.setup);
      }
    });
    return Array.from(setupsSet).sort();
  };

  // Get filtered trades based on stats filters
  const getFilteredTrades = () => {
    return trades.filter(trade => {
      const matchesTags = statsFilterTags.length === 0 || 
        (trade.tags && trade.tags.some(tag => statsFilterTags.includes(tag)));
      const matchesSetup = statsFilterSetup === 'all' || 
        trade.setup === statsFilterSetup;
      return matchesTags && matchesSetup;
    });
  };

  // Calculate stats for filtered trades
  const calculateFilteredStats = () => {
    const filteredTrades = getFilteredTrades();
    const completedTrades = filteredTrades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
    const wins = filteredTrades.filter(t => t.status === 'WIN');
    const losses = filteredTrades.filter(t => t.status === 'LOSS');
    
    const totalPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = completedTrades.length > 0 ? (wins.length / completedTrades.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losses.length : 0;
    
    const bestTrade = completedTrades.length > 0 
      ? Math.max(...completedTrades.map(t => t.pnl || 0))
      : 0;
    const worstTrade = completedTrades.length > 0 
      ? Math.min(...completedTrades.map(t => t.pnl || 0))
      : 0;
    
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
    
    return {
      totalTrades: completedTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: winRate.toFixed(0),
      totalPnL: totalPnL.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      bestTrade: bestTrade.toFixed(2),
      worstTrade: worstTrade.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      openTrades: filteredTrades.filter(t => !t.status).length
    };
  };
  
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <>
      <SignedOut>
        <div className={`min-h-screen bg-gradient-to-br ${t.mainBg} ${t.text} flex items-center justify-center p-4`}>
          <div className={`${t.cardBg} backdrop-blur-sm rounded-2xl p-8 border ${t.border} shadow-2xl`}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-4 shadow-lg">
                TJ
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Trading Journal
              </h1>
              <p className={`${t.textMuted} text-sm`}>Sign in to access your trades</p>
            </div>
            <SignIn 
              routing="hash" 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
                  card: theme === 'dark' ? 'bg-zinc-900' : 'bg-white',
                  headerTitle: theme === 'dark' ? 'text-white' : 'text-slate-900',
                  headerSubtitle: theme === 'dark' ? 'text-zinc-400' : 'text-slate-600',
                  socialButtonsBlockButton: theme === 'dark' ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200',
                  formFieldLabel: theme === 'dark' ? 'text-zinc-300' : 'text-slate-700',
                  formFieldInput: theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900',
                  footerActionLink: 'text-blue-500 hover:text-blue-400'
                }
              }}
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {loading ? (
          <div className={`min-h-screen bg-gradient-to-br ${t.mainBg} ${t.text} flex items-center justify-center`}>
            <div className="text-2xl">Loading...</div>
          </div>
        ) : (
          <div className={`min-h-screen bg-gradient-to-br ${t.mainBg} ${t.text}`}>
            {/* Fixed Left Sidebar */}
            <div className={`w-64 ${t.sidebarBg} border-r ${t.border} backdrop-blur-sm flex flex-col fixed h-screen z-50`}>
              <div className={`p-6 border-b ${t.border}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                    TJ
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Trading Journal
                  </h1>
                </div>
                
                <div className={`${t.cardBg} rounded-lg p-4 shadow-sm`}>
                  <div className={`text-sm ${t.textMuted}`}>Total P&L</div>
                  <div className={`text-2xl font-bold ${parseFloat(stats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(stats.totalPnL) < 0 ? '-' : ''}${Math.abs(parseFloat(stats.totalPnL)).toFixed(2)}
                  </div>
                  <div className={`text-xs ${t.textDim} mt-1`}>
                    {parseFloat(stats.totalPnL) >= 0 ? '+' : ''}{stats.totalTrades > 0 ? ((parseFloat(stats.totalPnL) / (stats.totalTrades * 100)) * 100).toFixed(2) : '0.00'}%
                  </div>
                </div>

                {/* Trading Mode Toggle */}
                <div className={`mt-4 ${t.cardBg} rounded-lg p-3 border ${tradingMode === 'backtest' ? 'border-orange-500/50' : t.border}`}>
                  <div className={`text-xs ${t.textMuted} mb-2 flex items-center justify-between`}>
                    <span>Trading Mode</span>
                    {tradingMode === 'backtest' && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">
                        BACKTEST
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTradingMode('live')}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        tradingMode === 'live'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                          : `${t.inputBg} ${t.textMuted} ${t.hover}`
                      }`}
                    >
                      🟢 Live
                    </button>
                    <button
                      onClick={() => setTradingMode('backtest')}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                        tradingMode === 'backtest'
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : `${t.inputBg} ${t.textMuted} ${t.hover}`
                      }`}
                    >
                      🧪 Backtest
                    </button>
                  </div>
                </div>

                {/* New Trade Button */}
                <button
                  onClick={() => setShowNewTrade(true)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  New Trade
                </button>
              </div>

              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { id: 'trades', label: 'Trades', icon: '📝' },
                    { id: 'calendar', label: 'Calendar', icon: '📅' },
                    { id: 'stats', label: 'Stats', icon: '📈' }
                  ].map(view => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeView === view.id
                          ? 'bg-blue-600 text-white font-semibold shadow-lg'
                          : `${t.textMuted} ${t.hover}`
                      }`}
                    >
                      <span className="text-xl">{view.icon}</span>
                      <span>{view.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              <div className={`p-4 border-t ${t.border} relative`}>
                {/* Profile Area - Clickable */}
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-3 p-3 rounded-lg ${t.hover} cursor-pointer transition-all`}
                >
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10',
                        userButtonPopoverCard: theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200',
                        userButtonPopoverActionButton: theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-100',
                        userButtonPopoverActionButtonText: theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{user?.fullName || user?.firstName || 'User'}</div>
                    <div className={`text-xs ${t.textMuted}`}>View menu</div>
                  </div>
                  <span className={`text-sm ${t.textMuted}`}>{showProfileMenu ? '▲' : '▼'}</span>
                </div>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    
                    {/* Menu Content */}
                    <div className={`absolute bottom-full left-4 right-4 mb-2 ${t.cardBg} border ${t.border} rounded-xl shadow-2xl z-50 overflow-hidden`}>
                      <div className="p-2 space-y-1">
                        {/* Export */}
                        <button
                          onClick={() => {
                            exportTrades();
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${t.hover} transition-colors text-left`}
                        >
                          <span className="text-xl">📤</span>
                          <div>
                            <div className="font-semibold">Export Trades</div>
                            <div className={`text-xs ${t.textMuted}`}>Download as JSON</div>
                          </div>
                        </button>

                        {/* Import */}
                        <label className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${t.hover} transition-colors cursor-pointer`}>
                          <input 
                            type="file" 
                            accept=".json" 
                            onChange={(e) => {
                              importTrades(e);
                              setShowProfileMenu(false);
                            }} 
                            className="hidden" 
                          />
                          <span className="text-xl">📥</span>
                          <div>
                            <div className="font-semibold">Import Trades</div>
                            <div className={`text-xs ${t.textMuted}`}>JSON format only</div>
                          </div>
                        </label>

                        {/* Theme Toggle */}
                        <button
                          onClick={() => {
                            toggleTheme();
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${t.hover} transition-colors text-left`}
                        >
                          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
                          <div>
                            <div className="font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</div>
                            <div className={`text-xs ${t.textMuted}`}>Switch theme</div>
                          </div>
                        </button>

                        {/* Divider */}
                        <div className={`border-t ${t.border} my-1`}></div>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            signOut();
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-left`}
                        >
                          <span className="text-xl">🚪</span>
                          <div>
                            <div className="font-semibold text-red-400">Logout</div>
                            <div className={`text-xs ${t.textMuted}`}>Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-6 overflow-auto">
              {/* Backtest Mode Banner */}
              {tradingMode === 'backtest' && (
                <div className="mb-6 bg-gradient-to-r from-orange-900/30 to-orange-800/30 border border-orange-500/50 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🧪</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-400">Backtest Mode Active</div>
                        <div className={`text-sm ${t.textMuted}`}>
                          All trades are simulated. Your live account is unaffected.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setTradingMode('live')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      Switch to Live
                    </button>
                  </div>
                </div>
              )}

              {activeView === 'dashboard' && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${t.textMuted} text-sm`}>Win Rate</span>
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-400">{stats.winRate}%</div>
                      <div className={`text-xs ${t.textDim} mt-1`}>{stats.wins} wins / {stats.losses} losses</div>
                    </div>

                    <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${t.textMuted} text-sm`}>Total Trades</span>
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold">{stats.totalTrades}</div>
                      <div className={`text-xs ${t.textDim} mt-1`}>{stats.openTrades} open positions</div>
                    </div>

                    <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${t.textMuted} text-sm`}>Avg Win</span>
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">${stats.avgWin}</div>
                      <div className={`text-xs ${t.textDim} mt-1`}>per winning trade</div>
                    </div>

                    <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${t.textMuted} text-sm`}>Avg Loss</span>
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-red-400">${stats.avgLoss}</div>
                      <div className={`text-xs ${t.textDim} mt-1`}>per losing trade</div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className={`lg:col-span-2 ${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>
                      <div className="w-full overflow-x-auto">
                        <div style={{ minWidth: '600px' }}>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getPerformanceData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                              <XAxis 
                                dataKey="date" 
                                stroke={t.chartAxis}
                                tick={{ fontSize: 12, fill: t.chartAxis }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis 
                                stroke={t.chartAxis}
                                tick={{ fill: t.chartAxis }}
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  backgroundColor: t.tooltipBg,
                                  border: `1px solid ${t.tooltipBorder}`,
                                  borderRadius: '8px',
                                  color: t.tooltipText
                                }}
                                labelStyle={{ color: t.tooltipText }}
                                itemStyle={{ color: t.tooltipText }}
                                formatter={(value) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'P&L']}
                              />
                              <Line type="monotone" dataKey="pnl" stroke={t.chartLine} strokeWidth={2} dot={{ fill: t.chartLine, r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                      <h3 className="text-lg font-semibold mb-4">Win/Loss Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Wins', value: parseInt(stats.wins), fill: '#10b981' },
                              { name: 'Losses', value: parseInt(stats.losses), fill: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: t.tooltipBg,
                              border: `1px solid ${t.tooltipBorder}`,
                              borderRadius: '8px',
                              color: t.tooltipText
                            }}
                            itemStyle={{ color: t.tooltipText }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center mt-2">
                        <div className="text-3xl font-bold text-green-400">{stats.winRate}%</div>
                        <div className={`text-sm ${t.textMuted}`}>Win Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Trades Table */}
                  <div className={`${t.cardBg} backdrop-blur-sm rounded-xl border ${t.border} shadow-lg overflow-hidden`}>
                    <div className={`p-6 border-b ${t.border}`}>
                      <h3 className="text-lg font-semibold">Recent Trades</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${t.inputBg}`}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Symbol</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Side</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Qty</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Entry</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Exit</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>P&L</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase tracking-wider`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${t.border}`}>
                          {trades.slice(0, 10).map((trade) => (
                            <tr key={trade.id} className={t.hoverCard + ' transition-colors'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-blue-400 font-semibold">{trade.symbol}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.side}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">${(trade.entryPrice || 0).toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {(trade.pnl || 0) < 0 ? '-' : ''}${Math.abs(trade.pnl || 0).toFixed(2)}
                                </div>
                                <div className={`text-xs ${t.textDim}`}>
                                  {(trade.pnlPercent || 0).toFixed(2)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {trade.status === 'WIN' && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">WIN</span>}
                                {trade.status === 'LOSS' && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">LOSS</span>}
                                {!trade.status && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">OPEN</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button onClick={() => editTrade(trade)} className="text-blue-400 hover:text-blue-300">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteTrade(trade.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeView === 'trades' && (
                <div className={`${t.cardBg} backdrop-blur-sm rounded-xl border ${t.border} shadow-lg`}>
                  <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
                    <h3 className="text-lg font-semibold">All Trades</h3>
                    <input
                      type="text"
                      placeholder="Search symbol..."
                      value={filterSymbol}
                      onChange={(e) => setFilterSymbol(e.target.value)}
                      className={`${t.inputBg} border ${t.border} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={t.inputBg}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Date</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Symbol</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Side</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Entry/Exit</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>P&L</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Setup</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Notes</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.border}`}>
                        {trades
                          .filter(t => !filterSymbol || t.symbol.toLowerCase().includes(filterSymbol.toLowerCase()))
                          .map((trade) => (
                            <tr key={trade.id} className={t.hoverCard}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {trade.date}
                                <div className={`text-xs ${t.textDim}`}>{trade.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-blue-400 font-semibold">{trade.symbol}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.side}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div>${trade.entryPrice?.toFixed(2)}</div>
                                {trade.exitPrice && <div className={t.textMuted}>${trade.exitPrice.toFixed(2)}</div>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {trade.pnl < 0 ? '-' : ''}${Math.abs(trade.pnl).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">{trade.setup}</div>
                                <div className="flex gap-1 mt-1">
                                  {trade.tags?.map((tag, i) => (
                                    <span key={i} className={`px-2 py-0.5 ${t.inputBg} rounded text-xs`}>{tag}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <div className={`text-sm ${t.textMuted} truncate`}>{trade.notes}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button onClick={() => editTrade(trade)} className="text-blue-400 hover:text-blue-300">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteTrade(trade.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeView === 'calendar' && (
                <div className={`${t.cardBg} backdrop-blur-sm rounded-xl border ${t.border} shadow-lg p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">{getMonthName(currentMonth)} {currentYear}</h3>
                    <div className="flex gap-2">
                      <button onClick={previousMonth} className={`px-4 py-2 ${t.inputBg} ${t.hover} border ${t.border} rounded-lg`}>←</button>
                      <button
                        onClick={() => {
                          setCurrentMonth(new Date().getMonth());
                          setCurrentYear(new Date().getFullYear());
                        }}
                        className={`px-4 py-2 ${t.inputBg} ${t.hover} border ${t.border} rounded-lg`}
                      >
                        Today
                      </button>
                      <button onClick={nextMonth} className={`px-4 py-2 ${t.inputBg} ${t.hover} border ${t.border} rounded-lg`}>→</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-2">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', ''].map((day, idx) => (
                      <div key={day + idx} className={`text-center text-xs font-semibold ${t.textMuted} py-2`}>{day}</div>
                    ))}

                    {(() => {
                      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
                      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
                      const totalCells = firstDay + daysInMonth;
                      const weeks = Math.ceil(totalCells / 7);
                      const allCells = [];

                      for (let week = 0; week < weeks; week++) {
                        const weekCells = [];
                        let weekPnL = 0;
                        let weekTrades = 0;

                        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                          const cellIndex = week * 7 + dayOfWeek;
                          
                          if (cellIndex < firstDay || cellIndex >= firstDay + daysInMonth) {
                            weekCells.push(
                              <div key={`empty-${cellIndex}`} className={`${t.inputBg} rounded-lg p-3 h-24`}></div>
                            );
                          } else {
                            const day = cellIndex - firstDay + 1;
                            const dateStr = formatCalendarDate(currentYear, currentMonth, day);
                            const dayTrades = getTradesForDate(dateStr);
                            const dailyPnL = getDailyPnL(dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            weekPnL += dailyPnL;
                            weekTrades += dayTrades.length;

                            weekCells.push(
                              <div
                                key={day}
                                onClick={() => dayTrades.length > 0 && setSelectedDate(dateStr)}
                                className={`rounded-lg p-3 h-24 transition-all flex flex-col justify-between ${
                                  dayTrades.length > 0
                                    ? dailyPnL >= 0
                                      ? 'bg-emerald-900/30 border border-emerald-700/50 cursor-pointer hover:bg-emerald-800/40'
                                      : 'bg-red-900/30 border border-red-700/50 cursor-pointer hover:bg-red-800/40'
                                    : `${t.cardBg} border ${t.border}`
                                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                              >
                                <div className="flex items-start justify-between">
                                  <span className="text-lg font-semibold">{day}</span>
                                  {isToday && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Today</span>}
                                </div>
                                {dayTrades.length > 0 && (
                                  <div>
                                    <div className={`text-base font-bold ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {dailyPnL < 0 ? '-' : ''}${Math.abs(dailyPnL).toFixed(2)}
                                    </div>
                                    <div className={`text-xs ${t.textMuted}`}>
                                      {dayTrades.length} Trade{dayTrades.length > 1 ? 's' : ''}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }

                        weekCells.push(
                          <div
                            key={`week-${week}`}
                            className={`rounded-lg p-3 h-24 flex flex-col justify-center ${
                              weekTrades > 0
                                ? weekPnL >= 0
                                  ? 'bg-emerald-800/40 border border-emerald-600'
                                  : 'bg-red-800/40 border border-red-600'
                                : `${t.inputBg} border ${t.border}`
                            }`}
                          >
                            {weekTrades > 0 ? (
                              <>
                                <div className={`text-base font-bold text-center ${weekPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {weekPnL < 0 ? '-' : ''}${Math.abs(weekPnL).toFixed(2)}
                                </div>
                                <div className={`text-xs ${t.textMuted} text-center mt-1`}>
                                  {weekTrades} Trade{weekTrades > 1 ? 's' : ''}
                                </div>
                              </>
                            ) : (
                              <div className={`text-xs ${t.textDim} text-center`}>No trades</div>
                            )}
                          </div>
                        );

                        allCells.push(...weekCells);
                      }
                      return allCells;
                    })()}
                  </div>

                  {/* Monthly Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(() => {
                      const monthTrades = trades.filter(t => {
                        const tradeDate = new Date(t.date);
                        return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
                      });
                      const monthPnL = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                      const winTrades = monthTrades.filter(t => t.pnl > 0);
                      const lossTrades = monthTrades.filter(t => t.pnl < 0);
                      const winRate = monthTrades.length > 0 ? (winTrades.length / monthTrades.length) * 100 : 0;

                      return (
                        <>
                          <div className={`${t.inputBg} rounded-lg p-4`}>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Monthly P&L</div>
                            <div className={`text-2xl font-bold ${monthPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {monthPnL < 0 ? '-' : ''}${Math.abs(monthPnL).toFixed(2)}
                            </div>
                          </div>
                          <div className={`${t.inputBg} rounded-lg p-4`}>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Total Trades</div>
                            <div className="text-2xl font-bold">{monthTrades.length}</div>
                          </div>
                          <div className={`${t.inputBg} rounded-lg p-4`}>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Win Rate</div>
                            <div className="text-2xl font-bold text-green-400">{winRate.toFixed(0)}%</div>
                          </div>
                          <div className={`${t.inputBg} rounded-lg p-4`}>
                            <div className={`text-sm ${t.textMuted} mb-1`}>W/L Ratio</div>
                            <div className="text-2xl font-bold">{winTrades.length}/{lossTrades.length}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeView === 'stats' && (
                <div className="space-y-6">
                  {/* Filter Controls */}
                  <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-6">Performance Analytics</h3>
                    
                    {/* Tag Filter - Multi-select */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className={`block text-sm font-medium ${t.textMuted}`}>Filter by Tags</label>
                        {statsFilterTags.length > 0 && (
                          <button
                            onClick={() => setStatsFilterTags([])}
                            className={`text-xs ${t.textMuted} ${t.hover} px-2 py-1 rounded transition-colors`}
                          >
                            Clear Tags
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getAllTags().length > 0 ? (
                          getAllTags().map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                if (statsFilterTags.includes(tag)) {
                                  setStatsFilterTags(statsFilterTags.filter(t => t !== tag));
                                } else {
                                  setStatsFilterTags([...statsFilterTags, tag]);
                                }
                              }}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statsFilterTags.includes(tag)
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                  : `${t.inputBg} ${t.textMuted} ${t.hover}`
                              }`}
                            >
                              {tag}
                            </button>
                          ))
                        ) : (
                          <div className={`text-sm ${t.textMuted} italic`}>No tags found. Add tags to your trades to use this filter.</div>
                        )}
                      </div>
                    </div>

                    {/* Setup Filter - Single select */}
                    <div>
                      <label className={`block text-sm font-medium ${t.textMuted} mb-3`}>Filter by Setup</label>
                      <select
                        value={statsFilterSetup}
                        onChange={(e) => setStatsFilterSetup(e.target.value)}
                        className={`w-full md:w-auto ${t.inputBg} border ${t.border} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="all">All Setups</option>
                        {getAllSetups().map(setup => (
                          <option key={setup} value={setup}>{setup}</option>
                        ))}
                      </select>
                    </div>

                    {/* Active Filters Display */}
                    {(statsFilterTags.length > 0 || statsFilterSetup !== 'all') && (
                      <div className="mt-6 pt-6 border-t border-zinc-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${t.textMuted} font-semibold`}>Active Filters:</span>
                          {statsFilterTags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
                              {tag}
                              <button 
                                onClick={() => setStatsFilterTags(statsFilterTags.filter(t => t !== tag))} 
                                className="hover:text-blue-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {statsFilterSetup !== 'all' && (
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-2">
                              Setup: {statsFilterSetup}
                              <button onClick={() => setStatsFilterSetup('all')} className="hover:text-cyan-300">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setStatsFilterTags([]);
                              setStatsFilterSetup('all');
                            }}
                            className={`px-3 py-1 ${t.inputBg} ${t.hover} rounded-lg text-sm transition-colors font-medium`}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  {(() => {
                    const filteredStats = calculateFilteredStats();
                    return (
                      <>
                        {/* Primary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Total P&L</span>
                              <div className={`w-10 h-10 ${parseFloat(filteredStats.totalPnL) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-lg flex items-center justify-center`}>
                                <DollarSign className={`w-5 h-5 ${parseFloat(filteredStats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                              </div>
                            </div>
                            <div className={`text-3xl font-bold ${parseFloat(filteredStats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {parseFloat(filteredStats.totalPnL) < 0 ? '-' : ''}${Math.abs(parseFloat(filteredStats.totalPnL)).toFixed(2)}
                            </div>
                            <div className={`text-xs ${t.textDim} mt-1`}>From {filteredStats.totalTrades} trades</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Win Rate</span>
                              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-green-400">{filteredStats.winRate}%</div>
                            <div className={`text-xs ${t.textDim} mt-1`}>{filteredStats.wins} wins / {filteredStats.losses} losses</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Total Trades</span>
                              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📊</span>
                              </div>
                            </div>
                            <div className="text-3xl font-bold">{filteredStats.totalTrades}</div>
                            <div className={`text-xs ${t.textDim} mt-1`}>{filteredStats.openTrades} open positions</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>W/L Ratio</span>
                              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-xl">⚖️</span>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-cyan-400">
                              {filteredStats.wins}:{filteredStats.losses}
                            </div>
                            <div className={`text-xs ${t.textDim} mt-1`}>Wins to losses</div>
                          </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Avg Win</span>
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-emerald-400">${filteredStats.avgWin}</div>
                            <div className={`text-xs ${t.textDim} mt-1`}>Per winning trade</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Avg Loss</span>
                              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-red-400">${filteredStats.avgLoss}</div>
                            <div className={`text-xs ${t.textDim} mt-1`}>Per losing trade</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Best Trade</span>
                              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-xl">🏆</span>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-green-400">${filteredStats.bestTrade}</div>
                            <div className={`text-xs ${t.textDim} mt-1`}>Largest winner</div>
                          </div>

                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`${t.textMuted} text-sm`}>Worst Trade</span>
                              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-xl">💔</span>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-red-400">
                              {parseFloat(filteredStats.worstTrade) < 0 ? '-' : ''}${Math.abs(parseFloat(filteredStats.worstTrade)).toFixed(2)}
                            </div>
                            <div className={`text-xs ${t.textDim} mt-1`}>Largest loser</div>
                          </div>
                        </div>

                        {/* Profit Factor */}
                        <div className={`${t.cardBg} backdrop-blur-sm rounded-xl p-6 border ${t.border} shadow-lg`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Profit Factor</h3>
                            <div className="text-3xl font-bold text-blue-400">{filteredStats.profitFactor}</div>
                          </div>
                          <div className={`text-sm ${t.textMuted}`}>
                            Profit Factor = (Avg Win × Wins) ÷ (Avg Loss × Losses)
                            {parseFloat(filteredStats.profitFactor) > 2 && (
                              <span className="ml-2 text-green-400">• Excellent</span>
                            )}
                            {parseFloat(filteredStats.profitFactor) > 1.5 && parseFloat(filteredStats.profitFactor) <= 2 && (
                              <span className="ml-2 text-cyan-400">• Good</span>
                            )}
                            {parseFloat(filteredStats.profitFactor) > 1 && parseFloat(filteredStats.profitFactor) <= 1.5 && (
                              <span className="ml-2 text-yellow-400">• Average</span>
                            )}
                            {parseFloat(filteredStats.profitFactor) <= 1 && parseFloat(filteredStats.profitFactor) > 0 && (
                              <span className="ml-2 text-red-400">• Needs Improvement</span>
                            )}
                          </div>
                        </div>

                        {/* Filtered Trades List */}
                        {(statsFilterTags.length > 0 || statsFilterSetup !== 'all') && (
                          <div className={`${t.cardBg} backdrop-blur-sm rounded-xl border ${t.border} shadow-lg overflow-hidden`}>
                            <div className={`p-6 border-b ${t.border}`}>
                              <h3 className="text-lg font-semibold">
                                Filtered Trades ({getFilteredTrades().length})
                              </h3>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className={`${t.inputBg}`}>
                                  <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Date</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Symbol</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Setup</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Side</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>P&L</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Status</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${t.textMuted} uppercase`}>Tags</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${t.border}`}>
                                  {getFilteredTrades().slice(0, 20).map((trade) => (
                                    <tr key={trade.id} className={t.hoverCard}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.date}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-blue-400 font-semibold">{trade.symbol}</span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.setup || '-'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                          trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {trade.side}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {trade.pnl < 0 ? '-' : ''}${Math.abs(trade.pnl).toFixed(2)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        {trade.status === 'WIN' && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">WIN</span>}
                                        {trade.status === 'LOSS' && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">LOSS</span>}
                                        {!trade.status && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">OPEN</span>}
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                          {trade.tags?.map((tag, i) => (
                                            <span key={i} className={`px-2 py-0.5 ${t.inputBg} rounded text-xs`}>{tag}</span>
                                          ))}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* New Trade Modal */}
            {showNewTrade && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className={`${t.modalBg} rounded-2xl max-w-4xl w-full my-8 border ${t.borderSolid} shadow-2xl`}>
                  <div className={`${t.modalBg} border-b ${t.borderSolid} p-6 flex items-center justify-between rounded-t-2xl`}>
                    <h2 className="text-2xl font-bold">{editingTrade ? 'Edit Trade' : 'New Trade'}</h2>
                    <button
                      onClick={() => {
                        setShowNewTrade(false);
                        setEditingTrade(null);
                      }}
                      className={`${t.textMuted} hover:text-white transition-colors`}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* General Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">General</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Market</label>
                          <select
                            value={newTrade.market || 'FUTURES'}
                            onChange={(e) => setNewTrade({...newTrade, market: e.target.value})}
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          >
                            <option>FUTURES</option>
                            <option>STOCKS</option>
                            <option>OPTIONS</option>
                            <option>FOREX</option>
                            <option>CRYPTO</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Symbol</label>
                          <input
                            type="text"
                            value={newTrade.symbol}
                            onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                            placeholder="e.g., MGC"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Setup</label>
                          <input
                            type="text"
                            value={newTrade.setup}
                            onChange={(e) => setNewTrade({...newTrade, setup: e.target.value})}
                            placeholder="e.g., Support Bounce"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Side</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setNewTrade({...newTrade, side: 'BUY'})}
                              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                                newTrade.side === 'BUY'
                                  ? 'bg-green-600 text-white'
                                  : `${t.inputBg} ${t.textMuted} ${t.hover}`
                              }`}
                            >
                              BUY
                            </button>
                            <button
                              onClick={() => setNewTrade({...newTrade, side: 'SELL'})}
                              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                                newTrade.side === 'SELL'
                                  ? 'bg-red-600 text-white'
                                  : `${t.inputBg} ${t.textMuted} ${t.hover}`
                              }`}
                            >
                              SELL
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Quantity</label>
                          <input
                            type="number"
                            value={newTrade.quantity}
                            onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>
                      </div>

                      {/* Entry and Exit Date/Time in separate row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Entry Date & Time</label>
                          <input
                            type="datetime-local"
                            value={`${newTrade.date}T${newTrade.time}`}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split('T');
                              setNewTrade({...newTrade, date, time});
                            }}
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Exit Date & Time (Optional)</label>
                          <input
                            type="datetime-local"
                            value={newTrade.exitDate && newTrade.exitTime ? `${newTrade.exitDate}T${newTrade.exitTime}` : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                const [exitDate, exitTime] = e.target.value.split('T');
                                setNewTrade({...newTrade, exitDate, exitTime});
                              } else {
                                setNewTrade({...newTrade, exitDate: '', exitTime: ''});
                              }
                            }}
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">Pricing & P&L</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Entry Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTrade.entryPrice}
                            onChange={(e) => setNewTrade({...newTrade, entryPrice: e.target.value})}
                            placeholder="0.00"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Exit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTrade.exitPrice}
                            onChange={(e) => setNewTrade({...newTrade, exitPrice: e.target.value})}
                            placeholder="0.00"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Target</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTrade.target}
                            onChange={(e) => setNewTrade({...newTrade, target: e.target.value})}
                            placeholder="0.00"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Stop Loss</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTrade.stopLoss}
                            onChange={(e) => setNewTrade({...newTrade, stopLoss: e.target.value})}
                            placeholder="0.00"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>P&L (Manual)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTrade.pnl}
                            onChange={(e) => setNewTrade({...newTrade, pnl: e.target.value})}
                            placeholder="0.00"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* P&L & RR Display */}
                    {newTrade.pnl !== '' && (
                      <div className={`${t.inputBg} rounded-lg p-6 border ${t.borderSolid}`}>
                        <h3 className="text-lg font-semibold mb-4 text-blue-400">Trade Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <div className={`text-sm ${t.textMuted} mb-1`}>P&L</div>
                            <div className={`text-2xl font-bold ${
                              parseFloat(newTrade.pnl) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${parseFloat(newTrade.pnl || 0).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Return %</div>
                            <div className={`text-2xl font-bold ${
                              (newTrade.entryPrice && parseFloat(newTrade.pnl) / (parseFloat(newTrade.entryPrice) * (parseFloat(newTrade.quantity) || 1)) * 100) >= 0
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {newTrade.entryPrice && parseFloat(newTrade.entryPrice) > 0
                                ? ((parseFloat(newTrade.pnl) / (parseFloat(newTrade.entryPrice) * (parseFloat(newTrade.quantity) || 1))) * 100).toFixed(2)
                                : '0.00'}%
                            </div>
                          </div>
                          <div>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Risk/Reward Ratio</div>
                            <div className="text-2xl font-bold text-blue-400">
                              {(() => {
                                const entry = parseFloat(newTrade.entryPrice) || 0;
                                const target = parseFloat(newTrade.target) || 0;
                                const stopLoss = parseFloat(newTrade.stopLoss) || 0;
                                
                                if (entry > 0 && stopLoss > 0 && target > 0) {
                                  const risk = Math.abs(entry - stopLoss);
                                  const reward = Math.abs(entry - target);
                                  const rr = risk > 0 ? reward / risk : 0;
                                  return rr.toFixed(2);
                                }
                                return '-';
                              })()}
                            </div>
                            <div className={`text-xs ${t.textDim} mt-1`}>
                              (Entry→Target) ÷ (Entry→Stop)
                            </div>
                          </div>
                          <div>
                            <div className={`text-sm ${t.textMuted} mb-1`}>Trade Duration</div>
                            <div className="text-2xl font-bold text-cyan-400">
                              {(() => {
                                if (!newTrade.date || !newTrade.time || !newTrade.exitDate || !newTrade.exitTime) {
                                  return '-';
                                }
                                
                                try {
                                  const entryDateTime = new Date(`${newTrade.date}T${newTrade.time}`);
                                  const exitDateTime = new Date(`${newTrade.exitDate}T${newTrade.exitTime}`);
                                  
                                  if (isNaN(entryDateTime.getTime()) || isNaN(exitDateTime.getTime())) {
                                    return '-';
                                  }
                                  
                                  const diffMs = exitDateTime - entryDateTime;
                                  
                                  if (diffMs < 0) {
                                    return 'Invalid';
                                  }
                                  
                                  const diffMinutes = Math.floor(diffMs / 60000);
                                  const days = Math.floor(diffMinutes / 1440);
                                  const hours = Math.floor((diffMinutes % 1440) / 60);
                                  const minutes = diffMinutes % 60;
                                  
                                  if (days > 0) {
                                    return `${days}d ${hours}h ${minutes}m`;
                                  } else if (hours > 0) {
                                    return `${hours}h ${minutes}m`;
                                  } else {
                                    return `${minutes}m`;
                                  }
                                } catch (error) {
                                  return '-';
                                }
                              })()}
                            </div>
                            <div className={`text-xs ${t.textDim} mt-1`}>
                              Entry to Exit
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Journal */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">Journal</h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Tags</label>
                          <input
                            type="text"
                            value={newTrade.tags?.join(', ')}
                            onChange={(e) => setNewTrade({...newTrade, tags: e.target.value.split(',').map(t => t.trim())})}
                            placeholder="Scalp, Momentum, Support"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.text}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>Notes</label>
                          <textarea
                            value={newTrade.notes}
                            onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                            onPaste={(e) => {
                              const items = e.clipboardData.items;
                              for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf('image') !== -1) {
                                  e.preventDefault();
                                  const blob = items[i].getAsFile();
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setNewTrade({
                                      ...newTrade,
                                      screenshots: [...newTrade.screenshots, event.target.result]
                                    });
                                  };
                                  reader.readAsDataURL(blob);
                                }
                              }
                            }}
                            rows="4"
                            placeholder="Trade notes, strategy, what worked/didn't work... (Paste images with Ctrl+V)"
                            className={`w-full ${t.inputBg} border ${t.borderSolid} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${t.text}`}
                          />
                          
                          {/* Screenshot Previews */}
                          {newTrade.screenshots && newTrade.screenshots.length > 0 && (
                            <div className="mt-3">
                              <div className={`text-sm ${t.textMuted} mb-2`}>Screenshots ({newTrade.screenshots.length})</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {newTrade.screenshots.map((img, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={img}
                                      alt={`Screenshot ${index + 1}`}
                                      className={`w-full h-24 object-cover rounded-lg border ${t.borderSolid}`}
                                    />
                                    <button
                                      onClick={() => {
                                        const newScreenshots = newTrade.screenshots.filter((_, i) => i !== index);
                                        setNewTrade({...newTrade, screenshots: newScreenshots});
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${t.textMuted} mb-2`}>
                            Confidence: {newTrade.confidence}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={newTrade.confidence}
                            onChange={(e) => setNewTrade({...newTrade, confidence: parseInt(e.target.value)})}
                            className="w-full"
                          />
                          <div className={`flex justify-between text-xs ${t.textDim} mt-1`}>
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex justify-end gap-3 pt-4 border-t ${t.borderSolid}`}>
                      <button
                        onClick={() => {
                          setShowNewTrade(false);
                          setEditingTrade(null);
                        }}
                        className={`px-6 py-2.5 ${t.inputBg} ${t.hover} rounded-lg font-semibold transition-colors`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitTrade}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
                      >
                        {editingTrade ? 'Update Trade' : 'Save Trade'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SignedIn>
    </>
  );
};

export default TradingJournal;
