import { useState } from 'react';
import { apiClient } from '../api/client';
import type { RgbControl, RgbPowerRequest } from '../types/api';

export function RgbControl() {
  const [mode, setMode] = useState<'static' | 'rainbow' | 'music'>('static');
  const [color, setColor] = useState('#FF5500');
  const [brightness, setBrightness] = useState(75);
  const [power, setPower] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTurnOn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const control: RgbControl = {
        mode,
        brightness,
        power,
        ...(mode === 'static' && { color }),
      };
      const response = await apiClient.turnOnRgb(control);
      setMessage(response.message || 'RGB подсветка включена');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при включении RGB');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnOff = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.turnOffRgb();
      setMessage(response.message || 'RGB подсветка выключена');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при выключении RGB');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPower = async () => {
    setLoading(true);
    setMessage('');
    try {
      const request: RgbPowerRequest = { power, brightness };
      const response = await apiClient.setRgbPower(request);
      setMessage(response.message || 'Мощность RGB обновлена');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при изменении мощности');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Управление RGB подсветкой</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Включение/Выключение</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleTurnOn}
              disabled={loading}
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Режим</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="static">Статический</option>
                <option value="rainbow">Радуга</option>
                <option value="music">Музыка</option>
              </select>
            </div>

            {mode === 'static' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-md"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Яркость: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

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

            <button
              onClick={handleSetPower}
              disabled={loading}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
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

