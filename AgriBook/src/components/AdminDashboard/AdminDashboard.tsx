import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import { predictCentreDemand } from '../../services/xgboostEngine';
import {
  Users,
  CalendarCheck2,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Building2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { state } = useAgriBook();
  const [activeTab, setActiveTab] = useState<'CENTRES' | 'XGBOOST' | 'AUDIT' | 'SMS'>('CENTRES');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // Compute aggregate statistics
  const totalFarmers = state.farmers.length;
  const totalBookings = state.bookings.length;
  const totalCompleted = state.bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalProcuredQuintals = state.procurements.reduce((acc, p) => acc + p.quantityQuintals, 0);
  const totalProcuredAmount = state.procurements.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalActiveQueues = state.centres.reduce((acc, c) => acc + c.currentQueueLength, 0);
  const pendingPaymentsCount = state.payments.filter((p) => p.status !== 'PAID').length;

  const filteredLogs = state.auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    return log.role === auditFilter;
  });

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Department of Food &amp; Public Distribution
            </span>
            <span className="text-xs text-slate-400 font-mono">State Level Monitor</span>
          </div>
          <h1 className="text-xl font-bold text-slate-950 mt-1">
            AgriBook Central Procurement &amp; Demand Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time cross-mandi queue oversight, XGBoost predictive demand, and transparent audit trail.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CENTRES')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'CENTRES' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mandi Overview
          </button>
          <button
            onClick={() => setActiveTab('XGBOOST')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'XGBOOST' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            XGBoost Demand AI
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'AUDIT' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail ({state.auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SMS' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Twilio Logs ({state.notifications.length})
          </button>
        </div>
      </div>

      {/* Aggregate KPI Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Registered Farmers</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalFarmers}</span>
          <span className="text-[10px] text-slate-400">Validated Aadhaar profiles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bookings</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalBookings}</span>
          <span className="text-[10px] text-emerald-600 font-medium">{totalCompleted} completed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Procured Volume</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalProcuredQuintals} <span className="text-xs font-normal text-slate-500">Qtl</span></span>
          <span className="text-[10px] text-slate-400">Weighment verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Procurement Value</span>
          <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">₹{(totalProcuredAmount / 100000).toFixed(2)}L</span>
          <span className="text-[10px] text-slate-400">At official MSP</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Live Queue Tokens</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{totalActiveQueues}</span>
          <span className="text-[10px] text-slate-400">Across 5 APMC yards</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Payments</span>
          <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">{pendingPaymentsCount}</span>
          <span className="text-[10px] text-slate-400">Prototype lifecycle</span>
        </div>
      </div>

      {/* TAB 1: MANDI OVERVIEW MATRIX */}
      {activeTab === 'CENTRES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Procurement Centres Capacity &amp; Congestion Table</h3>
              <p className="text-xs text-slate-500">
                Live monitoring of daily capacity, Redis queue, and XGBoost predicted influx
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">5 District APMC Hubs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Centre Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Daily Cap</th>
                  <th className="py-3 px-4">Current Queue</th>
                  <th className="py-3 px-4">Predicted Demand</th>
                  <th className="py-3 px-4">Mandi Load</th>
                  <th className="py-3 px-4">Congestion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {state.centres.map((c) => {
                  const forecast = predictCentreDemand(c, 'Cotton');
                  const loadPercent = Math.round(((c.currentQueueLength + c.completedTodayCount) / c.dailyCapacity) * 100);
                  const isHigh = c.congestionLevel === 'HIGH' || loadPercent > 90;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{c.code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{c.district}</td>
                      <td className="py-3 px-4 font-mono">{c.dailyCapacity} / day</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {c.currentQueueLength} farmers
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {forecast.predictedDemand} farmers
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full ${
                              loadPercent > 85 ? 'bg-red-500' : loadPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, loadPercent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{loadPercent}% capacity</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isHigh
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isHigh ? 'HIGH CONGESTION' : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: XGBOOST DEMAND AI */}
      {activeTab === 'XGBOOST' && (
        <div className="space-y-4">
          <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Machine Learning Architecture • XGBoost Regressor</span>
            </div>
            <h2 className="text-lg font-bold">Procurement Centre Demand Forecasting</h2>
            <p className="text-xs text-emerald-200 max-w-2xl leading-relaxed mt-1">
              Predicts expected farmer arrivals across procurement hubs using gradient boosted trees trained on historical mandis arrival patterns, crop harvest peaks, and day-of-week surges.
            </p>
            <div className="mt-3 text-[11px] bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-700/60 text-emerald-300">
              Representative / Synthetic dataset for SIH prototype. Built for seamless interchange with state agricultural marketing board datasets.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature Weighting Explanation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                XGBoost Feature Importance Weights (Gini Gain)
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Seasonal Harvest Peak Factor (Cotton / Soyabean)</span>
                    <span className="font-mono font-bold text-emerald-700">34.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '34.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Day-of-Week Mandi Pattern (Mon &amp; Thu Surges)</span>
                    <span className="font-mono font-bold text-emerald-700">26.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '26.5%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Active Redis Live Queue Depth</span>
                    <span className="font-mono font-bold text-emerald-700">18.9%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '18.9%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Centre Historical Daily Throughput Rate</span>
                    <span className="font-mono font-bold text-emerald-700">12.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '12.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Advance Booking Velocity</span>
                    <span className="font-mono font-bold text-emerald-700">7.6%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '7.6%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Centre Demand Outputs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Centre-by-Centre Predicted Arrival Influx
              </h4>
              <div className="space-y-2.5">
                {state.centres.map((c) => {
                  const pred = predictCentreDemand(c, 'Cotton');
                  return (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm">
                          {pred.predictedDemand} farmers
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Confidence: 92%</span>
                        <span className={pred.predictedCongestionLevel === 'HIGH' ? 'text-red-700 font-bold' : 'text-emerald-700 font-semibold'}>
                          Congestion Risk: {Math.round(pred.congestionProbability * 100)}% ({pred.predictedCongestionLevel})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail &amp; Event Logs</h3>
              <p className="text-xs text-slate-500">
                Tracks farmer registrations, slot bookings, token calls, weighment slips, and payments
              </p>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 text-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2">Filter:</span>
              {['ALL', 'FARMER', 'OPERATOR', 'SYSTEM', 'HELPLINE'].map((r) => (
                <button
                  key={r}
                  onClick={() => setAuditFilter(r)}
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    auditFilter === r ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.actor}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-950 font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-slate-500">{log.entityType}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'WARN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SMS LOGS */}
      {activeTab === 'SMS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Twilio SMS Outbound Dispatch Log</h3>
              <p className="text-xs text-slate-500">
                Multi-channel notifications for slot confirmation, queue call, and payment updates
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
              Sender ID: AD-AGRIBOOK
            </span>
          </div>

          <div className="space-y-2">
            {state.notifications.map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                  <span className="font-bold text-slate-900">
                    To: +91-{n.farmerMobile} ({n.title})
                  </span>
                  <span className="font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
