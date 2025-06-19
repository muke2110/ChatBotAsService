// Analytics page for SaaS chatbot: overview, per-widget, and advanced analytics
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { analyticsAPI } from '../services/api';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [widgetsAnalytics, setWidgetsAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, widgetsRes] = await Promise.all([
          analyticsAPI.getOverview(),
          analyticsAPI.getAllWidgetsAnalytics()
        ]);
        setOverview(overviewRes.data);
        setWidgetsAnalytics(widgetsRes.data);
      } catch (e) {
        setOverview(null);
        setWidgetsAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper for daily queries chart
  const getDailyQueryData = () => {
    if (!widgetsAnalytics || !widgetsAnalytics.widgets) return [];
    // Aggregate daily stats from all widgets
    const daily = {};
    widgetsAnalytics.widgets.forEach(widget => {
      if (widget.dailyStats) {
        Object.entries(widget.dailyStats).forEach(([date, stats]) => {
          daily[date] = (daily[date] || 0) + (stats.total || 0);
        });
      }
    });
    // Sort by date
    return Object.entries(daily).sort(([a], [b]) => new Date(a) - new Date(b));
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <ChartBarIcon className="h-7 w-7 mr-2 text-primary-600" /> Analytics
          </h1>
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
          ) : (
            <>
              {/* Overview Cards */}
              {overview && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Plan</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{overview.plan.name} ({overview.plan.billingCycle})</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Max Queries</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{overview.maxQueries}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Used Queries</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{overview.totalQueries}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Remaining Queries</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{overview.remainingQueries}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Next Reset</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{overview.resetDate ? new Date(overview.resetDate).toLocaleString() : '-'}</div>
                  </div>
                </div>
              )}

              {/* Per-Widget Usage Table */}
              {overview && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2">Per-Widget Query Usage</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Widget</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Queries</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {overview.widgetQueryCounts.map((w) => (
                          <tr key={w.widgetId}>
                            <td className="px-4 py-2">{w.name}</td>
                            <td className="px-4 py-2">{w.queries}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* More Analytics: Success/Error Rates, Top Widgets, Daily Chart */}
              {widgetsAnalytics && (
                <>
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Success Rate</div>
                      <div className="text-lg font-semibold text-green-600">{widgetsAnalytics.summary?.totalSuccessRate ?? 0}%</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</div>
                      <div className="text-lg font-semibold text-blue-600">{widgetsAnalytics.summary?.avgResponseTime ?? 0} ms</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Queries</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{widgetsAnalytics.summary?.totalQueries ?? 0}</div>
                    </div>
                  </div>
                  {/* Top Widgets by Usage */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">Top Widgets by Query Usage</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Widget</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Queries</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Success Rate</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg. Response Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {widgetsAnalytics.widgets
                            .sort((a, b) => b.totalQueries - a.totalQueries)
                            .slice(0, 5)
                            .map((w) => (
                              <tr key={w.widgetId}>
                                <td className="px-4 py-2">{w.name}</td>
                                <td className="px-4 py-2">{w.totalQueries}</td>
                                <td className="px-4 py-2">{w.successRate}%</td>
                                <td className="px-4 py-2">{w.avgResponseTime} ms</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Daily Queries Bar Chart */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">Daily Queries (All Widgets)</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="flex items-end space-x-2 h-40">
                        {getDailyQueryData().map(([date, count]) => (
                          <div key={date} className="flex flex-col items-center justify-end" style={{ width: 24 }}>
                            <div
                              className="bg-primary-500 rounded-t"
                              style={{ height: `${Math.max(8, count * 8)}px`, minHeight: 8 }}
                              title={`${count} queries`}
                            ></div>
                            <span className="text-xs mt-1 text-gray-500 dark:text-gray-400" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>{date.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics; 