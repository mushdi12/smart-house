import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';
import type { VoltageCurrent, VoltageHistory, VoltageStats } from '../types/api';

export function VoltageMonitor() {
  const [current, setCurrent] = useState<VoltageCurrent | null>(null);
  const [history, setHistory] = useState<VoltageHistory | null>(null);
  const [stats, setStats] = useState<VoltageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [intervalType, setIntervalType] = useState<'minute' | 'hour' | 'day'>('hour');
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchData();
    const currentIntervalId = window.setInterval(fetchCurrent, 5000);
    return () => window.clearInterval(currentIntervalId);
  }, [intervalType, limit]);

  const fetchCurrent = async () => {
    try {
      const data = await apiClient.getCurrentVoltage();
      setCurrent(data);
    } catch (err) {
      console.error('Failed to fetch current voltage:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000); // 24 часа назад

      const [historyData, statsData] = await Promise.all([
        apiClient.getVoltageHistory({
          from: from.toISOString(),
          to: to.toISOString(),
          interval: intervalType,
          limit,
        }),
        apiClient.getVoltageStats({
          from: from.toISOString(),
          to: to.toISOString(),
        }),
      ]);

      setHistory(historyData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch voltage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = history?.data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('ru-RU'),
    voltage: point.voltage,
    current: point.current,
    power: point.power,
  })) || [];

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Мониторинг напряжения</h1>

      {current && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Текущие значения</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Напряжение</div>
              <div className="text-2xl font-bold text-yellow-600">{current.voltage} В</div>
            </div>
            {current.current && (
              <div>
                <div className="text-sm text-gray-600">Ток</div>
                <div className="text-2xl font-bold">{current.current} А</div>
              </div>
            )}
            {current.power && (
              <div>
                <div className="text-sm text-gray-600">Мощность</div>
                <div className="text-2xl font-bold">{current.power} Вт</div>
              </div>
            )}
            {current.frequency && (
              <div>
                <div className="text-sm text-gray-600">Частота</div>
                <div className="text-2xl font-bold">{current.frequency} Гц</div>
              </div>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статистика</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Минимум</div>
              <div className="text-xl font-bold">{stats.min} В</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Максимум</div>
              <div className="text-xl font-bold">{stats.max} В</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Среднее</div>
              <div className="text-xl font-bold">{stats.avg.toFixed(2)} В</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Измерений</div>
              <div className="text-xl font-bold">{stats.count}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">График изменения напряжения</h2>
          <div className="flex gap-4">
            <select
              value={intervalType}
              onChange={(e) => setIntervalType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="minute">По минутам</option>
              <option value="hour">По часам</option>
              <option value="day">По дням</option>
            </select>
            <input
              type="number"
              min="10"
              max="1000"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              placeholder="Лимит"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="voltage" stroke="#eab308" strokeWidth={2} name="Напряжение (В)" />
              {chartData.some((d) => d.current) && (
                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Ток (А)" />
              )}
              {chartData.some((d) => d.power) && (
                <Line type="monotone" dataKey="power" stroke="#10b981" strokeWidth={2} name="Мощность (Вт)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">Нет данных для отображения</div>
        )}
      </div>
    </div>
  );
}

