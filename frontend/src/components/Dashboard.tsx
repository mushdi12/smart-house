import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { HealthStatus } from '../types/api';

export function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await apiClient.getHealth();
        setHealth(data);
      } catch (err) {
        console.error('Failed to fetch health:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: 'Температура', link: '/temperature', icon: '🌡️', color: 'bg-red-500' },
    { title: 'Влажность', link: '/humidity', icon: '💧', color: 'bg-blue-500' },
    { title: 'Ворота', link: '/gate', icon: '🚪', color: 'bg-gray-500' },
    { title: 'Напряжение', link: '/voltage', icon: '⚡', color: 'bg-yellow-500' },
    { title: 'RGB подсветка', link: '/rgb', icon: '💡', color: 'bg-purple-500' },
    { title: 'Вентилятор', link: '/fan', icon: '🌀', color: 'bg-green-500' },
    { title: 'Датчик движения', link: '/motion', icon: '👁️', color: 'bg-indigo-500' },
  ];

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Статус системы</h2>
            <div className="flex items-center">
              <span
                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  health?.status === 'healthy'
                    ? 'bg-green-500'
                    : health?.status === 'degraded'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="capitalize">{health?.status || 'Неизвестно'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${card.color} text-white text-3xl p-3 rounded-lg mr-4`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

