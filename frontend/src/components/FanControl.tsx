import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { FanStatus, FanControl } from '../types/api';

export function FanControl() {
  const [power, setPower] = useState(50);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [status, setStatus] = useState<FanStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.getFanStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch fan status:', err);
    }
  };

  const handleTurnOn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const control: FanControl = { power, mode };
      const response = await apiClient.turnOnFan(control);
      setMessage(response.message || 'Вентилятор включен');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при включении вентилятора');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnOff = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.turnOffFan();
      setMessage(response.message || 'Вентилятор выключен');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при выключении вентилятора');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPower = async () => {
    setLoading(true);
    setMessage('');
    try {
      const control: FanControl = { power, mode };
      const response = await apiClient.setFanPower(control);
      setMessage(response.message || 'Мощность вентилятора обновлена');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при изменении мощности');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Управление вентилятором</h1>

      {status && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус вентилятора</h2>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-800">
              {status.status === 'on' ? 'Включен' : 'Выключен'}
            </div>
            <div className="text-sm text-gray-600">Мощность: {status.power}%</div>
            {status.rpm && <div className="text-sm text-gray-600">Обороты: {status.rpm} об/мин</div>}
            {status.mode && <div className="text-sm text-gray-600">Режим: {status.mode}</div>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Включение/Выключение</h2>
          <div className="flex gap-4">
            <button
              onClick={handleTurnOn}
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Включить'}
            </button>
            <button
              onClick={handleTurnOff}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Выключить'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Настройки</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Мощность: {power}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Режим</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="manual">Ручной</option>
                <option value="auto">Автоматический</option>
              </select>
            </div>

            <button
              onClick={handleSetPower}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Обновление...' : 'Обновить мощность'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded ${message.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

