import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { TemperatureStatus } from '../types/api';

export function TemperatureControl() {
  const [value, setValue] = useState(1.0);
  const [current, setCurrent] = useState<TemperatureStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrent = async () => {
    try {
      const data = await apiClient.getCurrentTemperature();
      setCurrent(data);
    } catch (err) {
      console.error('Failed to fetch temperature:', err);
    }
  };

  const handleIncrease = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.increaseTemperature({ value });
      setMessage(`Температура повышена на ${value}°C. Текущая: ${response.current_temperature}°C`);
      fetchCurrent();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при повышении температуры');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.decreaseTemperature({ value });
      setMessage(`Температура понижена на ${value}°C. Текущая: ${response.current_temperature}°C`);
      fetchCurrent();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при понижении температуры');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Управление температурой</h1>

      {current && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Текущая температура</h2>
          <div className="text-4xl font-bold text-red-600 mb-2">
            {current.temperature}°C
          </div>
          <div className="text-sm text-gray-600">
            Статус: {current.status === 'heating' ? 'Нагрев' : current.status === 'cooling' ? 'Охлаждение' : 'Стабильно'}
            {current.target_temperature && ` | Целевая: ${current.target_temperature}°C`}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Изменение температуры</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Значение изменения (°C)
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleIncrease}
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : `Повысить на ${value}°C`}
            </button>
            <button
              onClick={handleDecrease}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : `Понизить на ${value}°C`}
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

