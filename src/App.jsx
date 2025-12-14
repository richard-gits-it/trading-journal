import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  const loadTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
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
          tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : (t.tags || []),
          notes: t.notes,
          confidence: t.confidence,
          setup: t.setup,
          target: parseFloat(t.target),
          stopLoss: parseFloat(t.stop_loss),
          screenshots: typeof t.screenshots === 'string' ? JSON.parse(t.screenshots) : (t.screenshots || [])
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
    loadTrades();
  }, []);

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

  // Handle trade submission
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
        stopLoss: stopLoss
      };

      if (editingTrade) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...trade, id: editingTrade.id })
        });
        setEditingTrade(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade)
        });
      }

      await loadTrades();
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
      alert('Error saving trade');
    }
  };

  // Delete trade
  const deleteTrade = async (id) => {
    try {
      await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      await loadTrades();
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
            for (const trade of data.trades) {
              await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

  // Performance chart data
  const getPerformanceData = () => {
    let cumulative = 0;
    // Sort trades by date in ascending order (oldest first)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Fixed Left Sidebar */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 backdrop-blur-sm flex flex-col fixed h-screen z-50">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg">
              TJ
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Trading Journal
            </h1>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-sm text-slate-400">Total P&L</div>
            <div className={`text-2xl font-bold ${parseFloat(stats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(stats.totalPnL) < 0 ? '-' : ''}${Math.abs(parseFloat(stats.totalPnL)).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {parseFloat(stats.totalPnL) >= 0 ? '+' : ''}{stats.totalTrades > 0 ? ((parseFloat(stats.totalPnL) / (stats.totalTrades * 100)) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
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

        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={() => setShowNewTrade(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={exportTrades}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              📤 Export
            </button>
            <label className="flex-1">
              <input type="file" accept=".json" onChange={importTrades} className="hidden" />
              <div className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer">
                📥 Import
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content with left margin */}
      <div className="ml-64 p-6 overflow-auto">
        {activeView === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Win Rate</span>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400">{stats.winRate}%</div>
                <div className="text-xs text-slate-500 mt-1">{stats.wins} wins / {stats.losses} losses</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Total Trades</span>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{stats.totalTrades}</div>
                <div className="text-xs text-slate-500 mt-1">{stats.openTrades} open positions</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Avg Win</span>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-400">${stats.avgWin}</div>
                <div className="text-xs text-slate-500 mt-1">per winning trade</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Avg Loss</span>
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-400">${stats.avgLoss}</div>
                <div className="text-xs text-slate-500 mt-1">per losing trade</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Performance Chart - Takes 2 columns */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>
                <div className="w-full overflow-x-auto">
                  <div style={{ minWidth: '600px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getPerformanceData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#cbd5e1' }}
                          formatter={(value) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'P&L']}
                        />
                        <Line type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Win/Loss Doughnut Chart */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
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
                    >
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <div className="text-3xl font-bold text-green-400">{stats.winRate}%</div>
                  <div className="text-sm text-slate-400">Win Rate</div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold">Recent Trades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Side</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Entry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">P&L</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {trades.slice(0, 10).map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-700/20 transition-colors">
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
                          <div className="text-xs text-slate-500">
                            {(trade.pnlPercent || 0).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.status === 'WIN' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">WIN</span>
                          )}
                          {trade.status === 'LOSS' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">LOSS</span>
                          )}
                          {!trade.status && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">OPEN</span>
                          )}
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Trades</h3>
              <input
                type="text"
                placeholder="Search symbol..."
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entry/Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Setup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {trades
                    .filter(t => !filterSymbol || t.symbol.toLowerCase().includes(filterSymbol.toLowerCase()))
                    .map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-700/20">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {trade.date}
                          <div className="text-xs text-slate-500">{trade.time}</div>
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
                          {trade.exitPrice && <div className="text-slate-400">${trade.exitPrice.toFixed(2)}</div>}
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
                              <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-slate-400 truncate">{trade.notes}</div>
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{getMonthName(currentMonth)} {currentYear}</h3>
              <div className="flex gap-2">
                <button onClick={previousMonth} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">←</button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date().getMonth());
                    setCurrentYear(new Date().getFullYear());
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Today
                </button>
                <button onClick={nextMonth} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">→</button>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', ''].map((day, idx) => (
                <div key={day + idx} className="text-center text-xs font-semibold text-slate-400 py-2">{day}</div>
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
                        <div key={`empty-${cellIndex}`} className="bg-slate-900/30 rounded-lg p-3 h-24"></div>
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
                              : 'bg-slate-800/30 border border-slate-700/30'
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
                              <div className="text-xs text-slate-400">
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
                          : 'bg-slate-700/30 border border-slate-600/30'
                      }`}
                    >
                      {weekTrades > 0 ? (
                        <>
                          <div className={`text-base font-bold text-center ${weekPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {weekPnL < 0 ? '-' : ''}${Math.abs(weekPnL).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400 text-center mt-1">
                            {weekTrades} Trade{weekTrades > 1 ? 's' : ''}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 text-center">No trades</div>
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
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Monthly P&L</div>
                      <div className={`text-2xl font-bold ${monthPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {monthPnL < 0 ? '-' : ''}${Math.abs(monthPnL).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Total Trades</div>
                      <div className="text-2xl font-bold">{monthTrades.length}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-green-400">{winRate.toFixed(0)}%</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">W/L Ratio</div>
                      <div className="text-2xl font-bold">{winTrades.length}/{lossTrades.length}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* New Trade Modal */}
      {showNewTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-2xl font-bold">{editingTrade ? 'Edit Trade' : 'New Trade'}</h2>
              <button onClick={() => { setShowNewTrade(false); setEditingTrade(null); }} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={newTrade.symbol}
                      onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                      placeholder="e.g., ES"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Setup</label>
                    <input
                      type="text"
                      value={newTrade.setup}
                      onChange={(e) => setNewTrade({...newTrade, setup: e.target.value})}
                      placeholder="e.g., Support Bounce"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Side</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewTrade({...newTrade, side: 'BUY'})}
                        className={`flex-1 py-2.5 rounded-lg font-semibold ${
                          newTrade.side === 'BUY' ? 'bg-green-600 text-white' : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setNewTrade({...newTrade, side: 'SELL'})}
                        className={`flex-1 py-2.5 rounded-lg font-semibold ${
                          newTrade.side === 'SELL' ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={`${newTrade.date}T${newTrade.time}`}
                      onChange={(e) => {
                        const [date, time] = e.target.value.split('T');
                        setNewTrade({...newTrade, date, time});
                      }}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Pricing & P&L</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.entryPrice}
                      onChange={(e) => setNewTrade({...newTrade, entryPrice: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Exit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.exitPrice}
                      onChange={(e) => setNewTrade({...newTrade, exitPrice: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Target</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.target}
                      onChange={(e) => setNewTrade({...newTrade, target: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.stopLoss}
                      onChange={(e) => setNewTrade({...newTrade, stopLoss: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">P&L (Manual)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.pnl}
                      onChange={(e) => setNewTrade({...newTrade, pnl: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Journal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                    <input
                      type="text"
                      value={newTrade.tags?.join(', ')}
                      onChange={(e) => setNewTrade({...newTrade, tags: e.target.value.split(',').map(t => t.trim())})}
                      placeholder="Scalp, Momentum"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                    <textarea
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                      rows="4"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Confidence: {newTrade.confidence}</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={newTrade.confidence}
                      onChange={(e) => setNewTrade({...newTrade, confidence: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => { setShowNewTrade(false); setEditingTrade(null); }}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTrade}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold"
                >
                  {editingTrade ? 'Update Trade' : 'Save Trade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Trades Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </h2>
                <div className="text-sm text-slate-400 mt-1">
                  {getTradesForDate(selectedDate).length} Trade{getTradesForDate(selectedDate).length !== 1 ? 's' : ''}
                  {' · '}
                  <span className={getDailyPnL(selectedDate) >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {getDailyPnL(selectedDate) < 0 ? '-' : ''}${Math.abs(getDailyPnL(selectedDate)).toFixed(2)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {getTradesForDate(selectedDate).map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.time}</td>
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
                        <div className="text-xs text-slate-500">{(trade.pnlPercent || 0).toFixed(2)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trade.status === 'WIN' && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">WIN</span>}
                        {trade.status === 'LOSS' && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">LOSS</span>}
                        {!trade.status && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">OPEN</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedDate(null); editTrade(trade); }} className="text-blue-400 hover:text-blue-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              deleteTrade(trade.id);
                              if (getTradesForDate(selectedDate).length === 1) setSelectedDate(null);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
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
        </div>
      )}
    </div>
  );
};

export default TradingJournal;
