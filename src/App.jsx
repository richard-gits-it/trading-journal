import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, X, Edit2, Trash2, Filter, Search } from 'lucide-react';

const TradingJournal = () => {
  const [trades, setTrades] = useState([]);

  const [showNewTrade, setShowNewTrade] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [editingTrade, setEditingTrade] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Load trades from JSON file on component mount
  useEffect(() => {
    const loadTrades = async () => {
      try {
        // First, try to load from localStorage
        const localData = await fetch('/api/trades');
        if (localData) {
          const data = JSON.parse(localData);
          setTrades(data.trades || []);
          console.log('Trades loaded from localStorage');
          return;
        }

        // If not in localStorage, try to fetch from file
        const response = await fetch('/trades.json');
        if (response.ok) {
          const data = await response.json();
          setTrades(data.trades || []);
          console.log('Trades loaded from file');
        } else {
          // If file doesn't exist, initialize with sample trade
          setTrades([
            {
              id: 1,
              date: '2025-11-03',
              time: '09:30 AM',
              symbol: 'ES',
              side: 'BUY',
              quantity: 2,
              entryPrice: 4585.50,
              exitPrice: 4592.25,
              status: 'WIN',
              pnl: 337.50,
              pnlPercent: 0.37,
              rrRatio: 2.25,
              tags: ['Breakout', 'Morning'],
              notes: 'Clean breakout above resistance. Good volume confirmation.',
              confidence: 8,
              setup: 'Resistance Breakout',
              target: 4595,
              stopLoss: 4582,
              screenshots: []
            },
            {
              id: 2,
              date: '2025-11-03',
              time: '02:15 PM',
              symbol: 'NQ',
              side: 'SELL',
              quantity: 1,
              entryPrice: 16234.75,
              exitPrice: 16198.50,
              status: 'WIN',
              pnl: 181.25,
              pnlPercent: 0.22,
              rrRatio: 1.8,
              tags: ['Reversal', 'Afternoon'],
              notes: 'Bearish divergence on 15min. Perfect entry at resistance.',
              confidence: 7,
              setup: 'Divergence',
              target: 16200,
              stopLoss: 16255,
              screenshots: []
            },
            {
              id: 3,
              date: '2025-11-05',
              time: '10:45 AM',
              symbol: 'MGC',
              side: 'BUY',
              quantity: 3,
              entryPrice: 2658.40,
              exitPrice: 2651.20,
              status: 'LOSS',
              pnl: -108.00,
              pnlPercent: -0.27,
              rrRatio: 2.0,
              tags: ['Fakeout', 'Gold'],
              notes: 'Got stopped out. False breakout, should have waited for confirmation.',
              confidence: 6,
              setup: 'Support Bounce',
              target: 2672,
              stopLoss: 2652,
              screenshots: []
            },
            {
              id: 4,
              date: '2025-11-06',
              time: '09:15 AM',
              symbol: 'CL',
              side: 'BUY',
              quantity: 2,
              entryPrice: 76.85,
              exitPrice: 77.45,
              status: 'WIN',
              pnl: 600.00,
              pnlPercent: 0.78,
              rrRatio: 3.0,
              tags: ['Oil', 'Scalp'],
              notes: 'Strong momentum after inventory report. Quick scalp.',
              confidence: 9,
              setup: 'News Momentum',
              target: 77.50,
              stopLoss: 76.65,
              screenshots: []
            },
            {
              id: 5,
              date: '2025-11-07',
              time: '11:20 AM',
              symbol: 'ES',
              side: 'SELL',
              quantity: 1,
              entryPrice: 4598.25,
              exitPrice: 4612.50,
              status: 'LOSS',
              pnl: -71.25,
              pnlPercent: -0.31,
              rrRatio: 1.5,
              tags: ['Loss', 'Reversal'],
              notes: 'Wrong direction. Market had more strength than expected.',
              confidence: 5,
              setup: 'Failed Reversal',
              target: 4585,
              stopLoss: 4608,
              screenshots: []
            },
            {
              id: 6,
              date: '2025-11-08',
              time: '01:30 PM',
              symbol: 'NQ',
              side: 'BUY',
              quantity: 2,
              entryPrice: 16345.25,
              exitPrice: 16389.75,
              status: 'WIN',
              pnl: 445.00,
              pnlPercent: 0.27,
              rrRatio: 2.2,
              tags: ['Tech', 'Momentum'],
              notes: 'Tech sector strength. Rode the wave nicely.',
              confidence: 8,
              setup: 'Trend Following',
              target: 16390,
              stopLoss: 16325,
              screenshots: []
            },
            {
              id: 7,
              date: '2025-11-11',
              time: '10:00 AM',
              symbol: 'MGC',
              side: 'SELL',
              quantity: 4,
              entryPrice: 2672.30,
              exitPrice: 2668.80,
              status: 'WIN',
              pnl: 140.00,
              pnlPercent: 0.13,
              rrRatio: 1.75,
              tags: ['Gold', 'Scalp'],
              notes: 'Quick scalp on gold weakness. Tight stops worked well.',
              confidence: 7,
              setup: 'Range Fade',
              target: 2669,
              stopLoss: 2674,
              screenshots: []
            },
            {
              id: 8,
              date: '2025-11-12',
              time: '09:45 AM',
              symbol: 'ES',
              side: 'BUY',
              quantity: 3,
              entryPrice: 4612.75,
              exitPrice: 4625.50,
              status: 'WIN',
              pnl: 506.25,
              pnlPercent: 0.28,
              rrRatio: 2.5,
              tags: ['Breakout', 'Morning'],
              notes: 'Gap and go strategy. Perfect execution.',
              confidence: 9,
              setup: 'Gap Fill',
              target: 4628,
              stopLoss: 4607,
              screenshots: []
            },
            {
              id: 9,
              date: '2025-11-13',
              time: '02:00 PM',
              symbol: 'CL',
              side: 'SELL',
              quantity: 1,
              entryPrice: 78.20,
              exitPrice: 77.65,
              status: 'WIN',
              pnl: 275.00,
              pnlPercent: 0.70,
              rrRatio: 2.75,
              tags: ['Oil', 'Reversal'],
              notes: 'Overbought on hourly. Nice reversal trade.',
              confidence: 8,
              setup: 'Overbought Fade',
              target: 77.60,
              stopLoss: 78.40,
              screenshots: []
            },
            {
              id: 10,
              date: '2025-11-14',
              time: '10:30 AM',
              symbol: 'NQ',
              side: 'BUY',
              quantity: 1,
              entryPrice: 16402.50,
              exitPrice: 16385.25,
              status: 'LOSS',
              pnl: -86.25,
              pnlPercent: -0.21,
              rrRatio: 2.0,
              tags: ['Tech', 'Loss'],
              notes: 'Stopped out. Entered too early before support confirmed.',
              confidence: 6,
              setup: 'Support Bounce',
              target: 16445,
              stopLoss: 16385,
              screenshots: []
            },
            {
              id: 11,
              date: '2025-11-15',
              time: '11:15 AM',
              symbol: 'ES',
              side: 'SELL',
              quantity: 2,
              entryPrice: 4635.25,
              exitPrice: 4628.75,
              status: 'WIN',
              pnl: 162.50,
              pnlPercent: 0.14,
              rrRatio: 1.6,
              tags: ['Scalp', 'Midday'],
              notes: 'Quick scalp during lunch lull. In and out.',
              confidence: 7,
              setup: 'Range Trade',
              target: 4627,
              stopLoss: 4639,
              screenshots: []
            },
            {
              id: 12,
              date: '2025-11-18',
              time: '09:20 AM',
              symbol: 'MGC',
              side: 'BUY',
              quantity: 5,
              entryPrice: 2681.50,
              exitPrice: 2687.20,
              status: 'WIN',
              pnl: 285.00,
              pnlPercent: 0.21,
              rrRatio: 2.85,
              tags: ['Gold', 'Momentum'],
              notes: 'Dollar weakness drove gold higher. Strong move.',
              confidence: 8,
              setup: 'Dollar Correlation',
              target: 2690,
              stopLoss: 2678,
              screenshots: []
            },
            {
              id: 13,
              date: '2025-11-19',
              time: '01:45 PM',
              symbol: 'CL',
              side: 'BUY',
              quantity: 2,
              entryPrice: 77.90,
              exitPrice: 78.85,
              status: 'WIN',
              pnl: 950.00,
              pnlPercent: 1.22,
              rrRatio: 3.17,
              tags: ['Oil', 'Breakout'],
              notes: 'Big win! Supply concerns pushed oil higher rapidly.',
              confidence: 9,
              setup: 'News Breakout',
              target: 79.00,
              stopLoss: 77.60,
              screenshots: []
            },
            {
              id: 14,
              date: '2025-11-20',
              time: '10:15 AM',
              symbol: 'NQ',
              side: 'SELL',
              quantity: 2,
              entryPrice: 16478.25,
              exitPrice: 16495.75,
              status: 'LOSS',
              pnl: -175.00,
              pnlPercent: -0.21,
              rrRatio: 1.75,
              tags: ['Tech', 'Loss'],
              notes: 'Bad read. Tech was stronger than anticipated.',
              confidence: 5,
              setup: 'Failed Resistance',
              target: 16445,
              stopLoss: 16495,
              screenshots: []
            },
            {
              id: 15,
              date: '2025-11-21',
              time: '09:50 AM',
              symbol: 'ES',
              side: 'BUY',
              quantity: 2,
              entryPrice: 4645.50,
              exitPrice: 4658.25,
              status: 'WIN',
              pnl: 318.75,
              pnlPercent: 0.27,
              rrRatio: 2.55,
              tags: ['Breakout', 'Morning'],
              notes: 'Market gapping higher on positive sentiment.',
              confidence: 8,
              setup: 'Gap Continuation',
              target: 4660,
              stopLoss: 4640,
              screenshots: []
            },
            {
              id: 16,
              date: '2025-11-22',
              time: '11:00 AM',
              symbol: 'MGC',
              side: 'SELL',
              quantity: 3,
              entryPrice: 2693.80,
              exitPrice: 2689.40,
              status: 'WIN',
              pnl: 132.00,
              pnlPercent: 0.16,
              rrRatio: 2.2,
              tags: ['Gold', 'Reversal'],
              notes: 'Resistance rejection. Clean reversal pattern.',
              confidence: 7,
              setup: 'Resistance Fade',
              target: 2688,
              stopLoss: 2696,
              screenshots: []
            },
            {
              id: 17,
              date: '2025-11-25',
              time: '10:05 AM',
              symbol: 'ES',
              side: 'BUY',
              quantity: 1,
              entryPrice: 4652.25,
              exitPrice: 4647.50,
              status: 'LOSS',
              pnl: -23.75,
              pnlPercent: -0.10,
              rrRatio: 1.9,
              tags: ['Small Loss', 'Scalp'],
              notes: 'Tight stop worked as planned. Small controlled loss.',
              confidence: 6,
              setup: 'Support Test',
              target: 4662,
              stopLoss: 4647,
              screenshots: []
            },
            {
              id: 18,
              date: '2025-11-26',
              time: '02:30 PM',
              symbol: 'NQ',
              side: 'BUY',
              quantity: 2,
              entryPrice: 16512.50,
              exitPrice: 16545.75,
              status: 'WIN',
              pnl: 332.50,
              pnlPercent: 0.20,
              rrRatio: 2.65,
              tags: ['Tech', 'Afternoon'],
              notes: 'Late day rally. Tech leading the market higher.',
              confidence: 8,
              setup: 'Trend Continuation',
              target: 16550,
              stopLoss: 16500,
              screenshots: []
            },
            {
              id: 19,
              date: '2025-11-27',
              time: '09:35 AM',
              symbol: 'CL',
              side: 'SELL',
              quantity: 1,
              entryPrice: 79.45,
              exitPrice: 79.10,
              status: 'WIN',
              pnl: 175.00,
              pnlPercent: 0.44,
              rrRatio: 1.75,
              tags: ['Oil', 'Scalp'],
              notes: 'Quick oil scalp. Profit taking after yesterday run.',
              confidence: 7,
              setup: 'Profit Taking',
              target: 79.00,
              stopLoss: 79.65,
              screenshots: []
            },
            {
              id: 20,
              date: '2025-11-28',
              time: '01:15 PM',
              symbol: 'ES',
              side: 'SELL',
              quantity: 2,
              entryPrice: 4668.75,
              exitPrice: 4662.25,
              status: 'WIN',
              pnl: 162.50,
              pnlPercent: 0.14,
              rrRatio: 2.17,
              tags: ['Reversal', 'Holiday'],
              notes: 'Pre-holiday profit taking. Light volume helped.',
              confidence: 7,
              setup: 'Holiday Fade',
              target: 4660,
              stopLoss: 4672,
              screenshots: []
            }
          ]);
          console.log('Initialized with sample trade');
        }
      } catch (error) {
        console.error('Error loading trades:', error);
        // Initialize with sample trade on error
        setTrades([
          {
            id: 1,
            date: '2025-11-03',
            time: '09:30 AM',
            symbol: 'ES',
            side: 'BUY',
            quantity: 2,
            entryPrice: 4585.50,
            exitPrice: 4592.25,
            status: 'WIN',
            pnl: 337.50,
            pnlPercent: 0.37,
            rrRatio: 2.25,
            tags: ['Breakout', 'Morning'],
            notes: 'Clean breakout above resistance. Good volume confirmation.',
            confidence: 8,
            setup: 'Resistance Breakout',
            target: 4595,
            stopLoss: 4582,
            screenshots: []
          },
          {
            id: 2,
            date: '2025-11-03',
            time: '02:15 PM',
            symbol: 'NQ',
            side: 'SELL',
            quantity: 1,
            entryPrice: 16234.75,
            exitPrice: 16198.50,
            status: 'WIN',
            pnl: 181.25,
            pnlPercent: 0.22,
            rrRatio: 1.8,
            tags: ['Reversal', 'Afternoon'],
            notes: 'Bearish divergence on 15min. Perfect entry at resistance.',
            confidence: 7,
            setup: 'Divergence',
            target: 16200,
            stopLoss: 16255,
            screenshots: []
          },
          {
            id: 3,
            date: '2025-11-05',
            time: '10:45 AM',
            symbol: 'MGC',
            side: 'BUY',
            quantity: 3,
            entryPrice: 2658.40,
            exitPrice: 2651.20,
            status: 'LOSS',
            pnl: -108.00,
            pnlPercent: -0.27,
            rrRatio: 2.0,
            tags: ['Fakeout', 'Gold'],
            notes: 'Got stopped out. False breakout, should have waited for confirmation.',
            confidence: 6,
            setup: 'Support Bounce',
            target: 2672,
            stopLoss: 2652,
            screenshots: []
          },
          {
            id: 4,
            date: '2025-11-06',
            time: '09:15 AM',
            symbol: 'CL',
            side: 'BUY',
            quantity: 2,
            entryPrice: 76.85,
            exitPrice: 77.45,
            status: 'WIN',
            pnl: 600.00,
            pnlPercent: 0.78,
            rrRatio: 3.0,
            tags: ['Oil', 'Scalp'],
            notes: 'Strong momentum after inventory report. Quick scalp.',
            confidence: 9,
            setup: 'News Momentum',
            target: 77.50,
            stopLoss: 76.65,
            screenshots: []
          },
          {
            id: 5,
            date: '2025-11-07',
            time: '11:20 AM',
            symbol: 'ES',
            side: 'SELL',
            quantity: 1,
            entryPrice: 4598.25,
            exitPrice: 4612.50,
            status: 'LOSS',
            pnl: -71.25,
            pnlPercent: -0.31,
            rrRatio: 1.5,
            tags: ['Loss', 'Reversal'],
            notes: 'Wrong direction. Market had more strength than expected.',
            confidence: 5,
            setup: 'Failed Reversal',
            target: 4585,
            stopLoss: 4608,
            screenshots: []
          },
          {
            id: 6,
            date: '2025-11-08',
            time: '01:30 PM',
            symbol: 'NQ',
            side: 'BUY',
            quantity: 2,
            entryPrice: 16345.25,
            exitPrice: 16389.75,
            status: 'WIN',
            pnl: 445.00,
            pnlPercent: 0.27,
            rrRatio: 2.2,
            tags: ['Tech', 'Momentum'],
            notes: 'Tech sector strength. Rode the wave nicely.',
            confidence: 8,
            setup: 'Trend Following',
            target: 16390,
            stopLoss: 16325,
            screenshots: []
          },
          {
            id: 7,
            date: '2025-11-11',
            time: '10:00 AM',
            symbol: 'MGC',
            side: 'SELL',
            quantity: 4,
            entryPrice: 2672.30,
            exitPrice: 2668.80,
            status: 'WIN',
            pnl: 140.00,
            pnlPercent: 0.13,
            rrRatio: 1.75,
            tags: ['Gold', 'Scalp'],
            notes: 'Quick scalp on gold weakness. Tight stops worked well.',
            confidence: 7,
            setup: 'Range Fade',
            target: 2669,
            stopLoss: 2674,
            screenshots: []
          },
          {
            id: 8,
            date: '2025-11-12',
            time: '09:45 AM',
            symbol: 'ES',
            side: 'BUY',
            quantity: 3,
            entryPrice: 4612.75,
            exitPrice: 4625.50,
            status: 'WIN',
            pnl: 506.25,
            pnlPercent: 0.28,
            rrRatio: 2.5,
            tags: ['Breakout', 'Morning'],
            notes: 'Gap and go strategy. Perfect execution.',
            confidence: 9,
            setup: 'Gap Fill',
            target: 4628,
            stopLoss: 4607,
            screenshots: []
          },
          {
            id: 9,
            date: '2025-11-13',
            time: '02:00 PM',
            symbol: 'CL',
            side: 'SELL',
            quantity: 1,
            entryPrice: 78.20,
            exitPrice: 77.65,
            status: 'WIN',
            pnl: 275.00,
            pnlPercent: 0.70,
            rrRatio: 2.75,
            tags: ['Oil', 'Reversal'],
            notes: 'Overbought on hourly. Nice reversal trade.',
            confidence: 8,
            setup: 'Overbought Fade',
            target: 77.60,
            stopLoss: 78.40,
            screenshots: []
          },
          {
            id: 10,
            date: '2025-11-14',
            time: '10:30 AM',
            symbol: 'NQ',
            side: 'BUY',
            quantity: 1,
            entryPrice: 16402.50,
            exitPrice: 16385.25,
            status: 'LOSS',
            pnl: -86.25,
            pnlPercent: -0.21,
            rrRatio: 2.0,
            tags: ['Tech', 'Loss'],
            notes: 'Stopped out. Entered too early before support confirmed.',
            confidence: 6,
            setup: 'Support Bounce',
            target: 16445,
            stopLoss: 16385,
            screenshots: []
          },
          {
            id: 11,
            date: '2025-11-15',
            time: '11:15 AM',
            symbol: 'ES',
            side: 'SELL',
            quantity: 2,
            entryPrice: 4635.25,
            exitPrice: 4628.75,
            status: 'WIN',
            pnl: 162.50,
            pnlPercent: 0.14,
            rrRatio: 1.6,
            tags: ['Scalp', 'Midday'],
            notes: 'Quick scalp during lunch lull. In and out.',
            confidence: 7,
            setup: 'Range Trade',
            target: 4627,
            stopLoss: 4639,
            screenshots: []
          },
          {
            id: 12,
            date: '2025-11-18',
            time: '09:20 AM',
            symbol: 'MGC',
            side: 'BUY',
            quantity: 5,
            entryPrice: 2681.50,
            exitPrice: 2687.20,
            status: 'WIN',
            pnl: 285.00,
            pnlPercent: 0.21,
            rrRatio: 2.85,
            tags: ['Gold', 'Momentum'],
            notes: 'Dollar weakness drove gold higher. Strong move.',
            confidence: 8,
            setup: 'Dollar Correlation',
            target: 2690,
            stopLoss: 2678,
            screenshots: []
          },
          {
            id: 13,
            date: '2025-11-19',
            time: '01:45 PM',
            symbol: 'CL',
            side: 'BUY',
            quantity: 2,
            entryPrice: 77.90,
            exitPrice: 78.85,
            status: 'WIN',
            pnl: 950.00,
            pnlPercent: 1.22,
            rrRatio: 3.17,
            tags: ['Oil', 'Breakout'],
            notes: 'Big win! Supply concerns pushed oil higher rapidly.',
            confidence: 9,
            setup: 'News Breakout',
            target: 79.00,
            stopLoss: 77.60,
            screenshots: []
          },
          {
            id: 14,
            date: '2025-11-20',
            time: '10:15 AM',
            symbol: 'NQ',
            side: 'SELL',
            quantity: 2,
            entryPrice: 16478.25,
            exitPrice: 16495.75,
            status: 'LOSS',
            pnl: -175.00,
            pnlPercent: -0.21,
            rrRatio: 1.75,
            tags: ['Tech', 'Loss'],
            notes: 'Bad read. Tech was stronger than anticipated.',
            confidence: 5,
            setup: 'Failed Resistance',
            target: 16445,
            stopLoss: 16495,
            screenshots: []
          },
          {
            id: 15,
            date: '2025-11-21',
            time: '09:50 AM',
            symbol: 'ES',
            side: 'BUY',
            quantity: 2,
            entryPrice: 4645.50,
            exitPrice: 4658.25,
            status: 'WIN',
            pnl: 318.75,
            pnlPercent: 0.27,
            rrRatio: 2.55,
            tags: ['Breakout', 'Morning'],
            notes: 'Market gapping higher on positive sentiment.',
            confidence: 8,
            setup: 'Gap Continuation',
            target: 4660,
            stopLoss: 4640,
            screenshots: []
          },
          {
            id: 16,
            date: '2025-11-22',
            time: '11:00 AM',
            symbol: 'MGC',
            side: 'SELL',
            quantity: 3,
            entryPrice: 2693.80,
            exitPrice: 2689.40,
            status: 'WIN',
            pnl: 132.00,
            pnlPercent: 0.16,
            rrRatio: 2.2,
            tags: ['Gold', 'Reversal'],
            notes: 'Resistance rejection. Clean reversal pattern.',
            confidence: 7,
            setup: 'Resistance Fade',
            target: 2688,
            stopLoss: 2696,
            screenshots: []
          },
          {
            id: 17,
            date: '2025-11-25',
            time: '10:05 AM',
            symbol: 'ES',
            side: 'BUY',
            quantity: 1,
            entryPrice: 4652.25,
            exitPrice: 4647.50,
            status: 'LOSS',
            pnl: -23.75,
            pnlPercent: -0.10,
            rrRatio: 1.9,
            tags: ['Small Loss', 'Scalp'],
            notes: 'Tight stop worked as planned. Small controlled loss.',
            confidence: 6,
            setup: 'Support Test',
            target: 4662,
            stopLoss: 4647,
            screenshots: []
          },
          {
            id: 18,
            date: '2025-11-26',
            time: '02:30 PM',
            symbol: 'NQ',
            side: 'BUY',
            quantity: 2,
            entryPrice: 16512.50,
            exitPrice: 16545.75,
            status: 'WIN',
            pnl: 332.50,
            pnlPercent: 0.20,
            rrRatio: 2.65,
            tags: ['Tech', 'Afternoon'],
            notes: 'Late day rally. Tech leading the market higher.',
            confidence: 8,
            setup: 'Trend Continuation',
            target: 16550,
            stopLoss: 16500,
            screenshots: []
          },
          {
            id: 19,
            date: '2025-11-27',
            time: '09:35 AM',
            symbol: 'CL',
            side: 'SELL',
            quantity: 1,
            entryPrice: 79.45,
            exitPrice: 79.10,
            status: 'WIN',
            pnl: 175.00,
            pnlPercent: 0.44,
            rrRatio: 1.75,
            tags: ['Oil', 'Scalp'],
            notes: 'Quick oil scalp. Profit taking after yesterday run.',
            confidence: 7,
            setup: 'Profit Taking',
            target: 79.00,
            stopLoss: 79.65,
            screenshots: []
          },
          {
            id: 20,
            date: '2025-11-28',
            time: '01:15 PM',
            symbol: 'ES',
            side: 'SELL',
            quantity: 2,
            entryPrice: 4668.75,
            exitPrice: 4662.25,
            status: 'WIN',
            pnl: 162.50,
            pnlPercent: 0.14,
            rrRatio: 2.17,
            tags: ['Reversal', 'Holiday'],
            notes: 'Pre-holiday profit taking. Light volume helped.',
            confidence: 7,
            setup: 'Holiday Fade',
            target: 4660,
            stopLoss: 4672,
            screenshots: []
          }
        ]);
      }
    };

    loadTrades();
  }, []);

  // Save trades to JSON file whenever trades change
  useEffect(() => {
    if (trades.length > 0) {
      const saveTrades = async () => {
        try {
          const dataStr = JSON.stringify({ trades }, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          
          // Create download link for the JSON file
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'trades.json';
          
          // Store in localStorage as backup
          localStorage.setItem('tradingJournalTrades', dataStr);
          
          console.log('Trades saved to localStorage');
        } catch (error) {
          console.error('Error saving trades:', error);
        }
      };

      saveTrades();
    }
  }, [trades]);
  
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
  const handleSubmitTrade = () => {
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
        id: editingTrade ? editingTrade.id : trades.length + 1,
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
        setTrades(trades.map(t => t.id === editingTrade.id ? trade : t));
        setEditingTrade(null);
      } else {
        setTrades([trade, ...trades]);
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
  const deleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
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

  // Export trades to JSON file
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

  // Import trades from JSON file
  const importTrades = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.trades && Array.isArray(data.trades)) {
            setTrades(data.trades);
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
              {parseFloat(stats.totalPnL) >= 0 ? '+' : ''}{((parseFloat(stats.totalPnL) / 219.04) * 100).toFixed(2)}%
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
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

            {/* Performance Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
              <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getPerformanceData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <Line type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
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
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                              WIN
                            </span>
                          )}
                          {trade.status === 'LOSS' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                              LOSS
                            </span>
                          )}
                          {!trade.status && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                              OPEN
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editTrade(trade)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit trade"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTrade(trade.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete trade"
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
          </>
        )}

        {activeView === 'trades' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Trades</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search symbol..."
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Entry/Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Setup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {trades
                    .filter(t => !filterSymbol || t.symbol.toLowerCase().includes(filterSymbol.toLowerCase()))
                    .map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-700/20 transition-colors">
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
                            <button
                              onClick={() => editTrade(trade)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit trade"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTrade(trade.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete trade"
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
        )}

        {activeView === 'calendar' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{getMonthName(currentMonth)} {currentYear}</h3>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date().getMonth());
                    setCurrentYear(new Date().getFullYear());
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid with Weekly Summary */}
            <div className="grid grid-cols-8 gap-2">
              {/* Day Headers */}
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', ''].map((day, idx) => (
                <div key={day + idx} className="text-center text-xs font-semibold text-slate-400 py-2">
                  {day}
                </div>
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
                            {isToday && (
                              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Today</span>
                            )}
                          </div>

                          {dayTrades.length > 0 && (
                            <div>
                              <div className={`text-base font-bold ${
                                dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
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
                          <div className={`text-base font-bold text-center ${
                            weekPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
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
      </div>

      {/* New Trade Modal */}
      {showNewTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold">{editingTrade ? 'Edit Trade' : 'New Trade'}</h2>
              <button
                onClick={() => {
                  setShowNewTrade(false);
                  setEditingTrade(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
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
                    <label className="block text-sm font-medium text-slate-400 mb-2">Market</label>
                    <select
                      value={newTrade.market || 'FUTURES'}
                      onChange={(e) => setNewTrade({...newTrade, market: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>FUTURES</option>
                      <option>STOCKS</option>
                      <option>OPTIONS</option>
                      <option>FOREX</option>
                      <option>CRYPTO</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={newTrade.symbol}
                      onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                      placeholder="e.g., MGC"
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
                        className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                          newTrade.side === 'BUY'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setNewTrade({...newTrade, side: 'SELL'})}
                        className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                          newTrade.side === 'SELL'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
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

                  <div>
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

              {/* Price Info */}
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* P&L & RR Display */}
              {newTrade.pnl !== '' && (
                <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold mb-4 text-blue-400">Trade Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">P&L</div>
                      <div className={`text-2xl font-bold ${
                        parseFloat(newTrade.pnl) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(newTrade.pnl) < 0 ? '-' : ''}${Math.abs(parseFloat(newTrade.pnl || 0)).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Return %</div>
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
                      <div className="text-sm text-slate-400 mb-1">Risk/Reward Ratio</div>
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
                      <div className="text-xs text-slate-500 mt-1">
                        (Entry→Target) ÷ (Entry→Stop)
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
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                    <input
                      type="text"
                      value={newTrade.tags?.join(', ')}
                      onChange={(e) => setNewTrade({...newTrade, tags: e.target.value.split(',').map(t => t.trim())})}
                      placeholder="Scalp, Momentum, Support"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
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
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    
                    {/* Screenshot Previews */}
                    {newTrade.screenshots && newTrade.screenshots.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-slate-400 mb-2">Screenshots ({newTrade.screenshots.length})</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {newTrade.screenshots.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-slate-600"
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
                    <label className="block text-sm font-medium text-slate-400 mb-2">
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
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowNewTrade(false);
                    setEditingTrade(null);
                  }}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
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

      {/* Date Trades Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
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
              <button
                onClick={() => setSelectedDate(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
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
                    {getTradesForDate(selectedDate).map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-700/20 transition-colors">
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
                          <div className="text-xs text-slate-500">
                            {(trade.pnlPercent || 0).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.status === 'WIN' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                              WIN
                            </span>
                          )}
                          {trade.status === 'LOSS' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                              LOSS
                            </span>
                          )}
                          {!trade.status && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                              OPEN
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDate(null);
                                editTrade(trade);
                              }}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit trade"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteTrade(trade.id);
                                if (getTradesForDate(selectedDate).length === 1) {
                                  setSelectedDate(null);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete trade"
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
        </div>
      )}
    </div>
  );
};

export default TradingJournal;
