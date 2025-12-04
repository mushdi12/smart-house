import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { MotionStatus, MotionNotificationSettings } from '../types/api';

export function MotionControl() {
  const [status, setStatus] = useState<MotionStatus | null>(null);
  const [notifyPhone, setNotifyPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [triggerRgb, setTriggerRgb] = useState(false);
  const [rgbPower, setRgbPower] = useState(70);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status) {
      setNotifyPhone(status.notify_phone);
      setPhoneNumber(status.phone_number || '');
      setTriggerRgb(status.trigger_rgb);
      setRgbPower(status.rgb_power || 70);
    }
  }, [status]);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.getMotionStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch motion status:', err);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.enableMotionSensor({
        trigger_rgb: triggerRgb,
        sensitivity: 'medium',
      });
      setMessage(response.message || 'Датчик движения включен');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при включении датчика');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.disableMotionSensor();
      setMessage(response.message || 'Датчик движения выключен');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при выключении датчика');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setMessage('');
    try {
      const settings: MotionNotificationSettings = {
        notify_phone: notifyPhone,
        phone_number: phoneNumber,
        trigger_rgb: triggerRgb,
        rgb_power: rgbPower,
      };
      const response = await apiClient.configureMotionNotifications(settings);
      setMessage(response.message || 'Настройки уведомлений сохранены');
      fetchStatus();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Датчик движения</h1>

      {status && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус</h2>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-800">
              {status.enabled ? 'Включен' : 'Выключен'}
            </div>
            <div className="text-sm text-gray-600">
              Уведомления на телефон: {status.notify_phone ? 'Включены' : 'Выключены'}
            </div>
            <div className="text-sm text-gray-600">
              Автозапуск RGB: {status.trigger_rgb ? 'Включен' : 'Выключен'}
            </div>
            {status.last_event && (
              <div className="text-sm text-gray-600">
                Последнее событие: {new Date(status.last_event).toLocaleString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Управление</h2>
          <div className="flex gap-4">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Включить'}
            </button>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Выполнение...' : 'Выключить'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Настройки уведомлений</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyPhone"
                checked={notifyPhone}
                onChange={(e) => setNotifyPhone(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="notifyPhone" className="text-sm font-medium text-gray-700">
                Отправлять уведомления на телефон
              </label>
            </div>

            {notifyPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+79991234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="triggerRgb"
                checked={triggerRgb}
                onChange={(e) => setTriggerRgb(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="triggerRgb" className="text-sm font-medium text-gray-700">
                Включать RGB при обнаружении движения
              </label>
            </div>

            {triggerRgb && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Мощность RGB при автозапуске: {rgbPower}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={rgbPower}
                  onChange={(e) => setRgbPower(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={handleSaveNotifications}
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить настройки'}
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

