import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { GateStatus } from '../types/api';

export function GateControl() {
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<GateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.getGateStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch gate status:', err);
    }
  };

  const handleRaise = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.raiseGate({ speed });
      setMessage(response.message || 'Команда на поднятие ворот отправлена');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при поднятии ворот');
    } finally {
      setLoading(false);
    }
  };

  const handleLower = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.lowerGate({ speed });
      setMessage(response.message || 'Команда на опускание ворот отправлена');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при опускании ворот');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      raised: 'Подняты',
      lowered: 'Опущены',
      raising: 'Поднимаются',
      lowering: 'Опускаются',
      stopped: 'Остановлены',
      error: 'Ошибка',
    };
    return statusMap[status || ''] || status;
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Управление воротами</h1>

      {status && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус ворот</h2>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-800">
              {getStatusText(status.status)}
            </div>
            <div className="text-sm text-gray-600">
              Позиция: {status.position}%
            </div>
            {status.last_action && (
              <div className="text-sm text-gray-600">
                Последнее действие: {status.last_action === 'raise' ? 'Поднятие' : 'Опускание'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Управление</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Скорость (1-100)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600 mt-1">{speed}</div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleRaise}
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Поднять ворота'}
            </button>
            <button
              onClick={handleLower}
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Опустить ворота'}
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

