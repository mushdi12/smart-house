import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { HumidityStatus } from '../types/api';

export function HumidityControl() {
  const [value, setValue] = useState(5.0);
  const [current, setCurrent] = useState<HumidityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrent = async () => {
    try {
      const data = await apiClient.getCurrentHumidity();
      setCurrent(data);
    } catch (err) {
      console.error('Failed to fetch humidity:', err);
    }
  };

  const handleIncrease = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.increaseHumidity({ value });
      setMessage(`Влажность повышена на ${value}%. Текущая: ${response.current_humidity}%`);
      fetchCurrent();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при повышении влажности');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.decreaseHumidity({ value });
      setMessage(`Влажность понижена на ${value}%. Текущая: ${response.current_humidity}%`);
      fetchCurrent();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при понижении влажности');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Управление влажностью</h1>

      {current && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Текущая влажность</h2>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {current.humidity}%
          </div>
          <div className="text-sm text-gray-600">
            Статус: {current.status === 'increasing' ? 'Повышение' : current.status === 'decreasing' ? 'Понижение' : 'Стабильно'}
            {current.target_humidity && ` | Целевая: ${current.target_humidity}%`}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Изменение влажности</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Значение изменения (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleIncrease}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : `Повысить на ${value}%`}
            </button>
            <button
              onClick={handleDecrease}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : `Понизить на ${value}%`}
            </button>
          </div>
          {message && (
            <div className={`p-3 rounded ${message.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

