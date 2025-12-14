import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Edit2, Trash2 } from 'lucide-react';

const API_URL = '/api/trades';

const TradingJournal = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [editingTrade, setEditingTrade] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
    screenshots: []
  });

  // Load trades from API
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      
      // Convert database format to app format
      const formattedTrades = data.trades.map(t => ({
        id: t.id,
        date: t.date,
        time: t.time,
        symbol: t.symbol,
        side: t.side,
        quantity: t.quantity,
        entryPrice: parseFloat(t.entry_price),
        exitPrice: parseFloat(t.exit_price),
        status: t.status,
        pnl: parseFloat(t.pnl),
        pnlPercent: parseFloat(t.pnl_percent),
        rrRatio: parseFloat(t.rr_ratio),
        tags: t.tags || [],
        notes: t.notes,
        confidence: t.confidence,
        setup: t.setup,
        target: parseFloat(t.target),
        stopLoss: parseFloat(t.stop_loss),
        screenshots: t.screenshots || []
      }));
      
      setTrades(formattedTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
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

  // Handle new trade submission
  const handleSubmitTrade = async () => {
    try {
      const entry = parseFloat(newTrade.entryPrice) || 0;
      const exit = parseFloat(newTrade.exitPrice) || 0;
      const target = parseFloat(newTrade.target) || 0;
      const stopLoss = parseFloat(newTrade.stopLoss) || 0;
      const manualPnL = parseFloat(newTrade.pnl) || 0;
      const qty = parseFloat(newTrade.quantity) || 1;

      // Calculate Risk/Reward Ratio
      let rrRatio = 0;
      if (entry > 0 && stopLoss > 0 && target > 0) {
        const risk = Math.abs(entry - stopLoss);
        const reward = Math.abs(entry - target);
        rrRatio = risk > 0 ? reward / risk : 0;
      }

      // Calculate percentage return
      const pnlPercent = entry > 0 && qty > 0
        ? (manualPnL / (entry * qty)) * 100
        : 0;

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
        stopLoss: stopLoss
      };

      if (editingTrade) {
        // Update existing trade
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...trade, id: editingTrade.id })
        });
        
        if (response.ok) {
          await loadTrades();
        }
        setEditingTrade(null);
      } else {
        // Create new trade
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade)
        });
        
        if (response.ok) {
          await loadTrades();
        }
      }

      setShowNewTrade(false);
      setNewTrade({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
        screenshots: []
      });
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error saving trade. Please check your inputs.');
    }
  };

  // Delete trade
  const deleteTrade = async (id) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadTrades();
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  // Edit trade
  const editTrade = (trade) => {
    setNewTrade({
      ...trade,
      tags: trade.tags || [],
      screenshots: trade.screenshots || []
    });
    setEditingTrade(trade);
    setShowNewTrade(true);
  };

  // Export trades
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

  // Import trades
  const importTrades = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.trades && Array.isArray(data.trades)) {
            // Upload each trade to database
            for (const trade of data.trades) {
              await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trade)
              });
            }
            await loadTrades();
            alert('Trades imported successfully!');
          } else {
            alert('Invalid file format. Please upload a valid trades JSON file.');
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error reading file. Please make sure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Performance chart data
  const getPerformanceData = () => {
    let cumulative = 0;
    return trades.slice().reverse().map(trade => {
      cumulative += trade.pnl || 0;
      return {
        date: trade.date,
        pnl: cumulative.toFixed(2)
      };
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getTradesForDate = (dateStr) => {
    return trades.filter(t => t.date === dateStr);
  };

  const getDailyPnL = (dateStr) => {
    const dayTrades = getTradesForDate(dateStr);
    return dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  };

  const formatCalendarDate = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 backdrop-blur-sm flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg">
              TJ
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Trading Journal
            </h1>
          </div>
          
          {/* Total P&L Card */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-sm text-slate-400">Total P&L</div>
            <div className={`text-2xl font-bold ${parseFloat(stats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(stats.totalPnL) < 0 ? '-' : ''}${Math.abs(parseFloat(stats.totalPnL)).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalTrades} trades
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
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
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* New Trade Button */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={() => setShowNewTrade(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </button>
          
          {/* Import/Export */}
          <div className="flex gap-2">
            <button
              onClick={exportTrades}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors"
              title="Export trades to JSON"
            >
              📤 Export
            </button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={importTrades}
                className="hidden"
              />
              <div className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer">
                📥 Import
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content - Dashboard, Trades, Calendar views would go here */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="text-center text-slate-400 mt-20">
          <h2 className="text-2xl font-bold mb-4">Trading Journal - Vercel Ready</h2>
          <p>Connected to Vercel Postgres Database</p>
          <p className="mt-2">Total Trades: {trades.length}</p>
        </div>
      </div>
    </div>
  );
};

export default TradingJournal;
