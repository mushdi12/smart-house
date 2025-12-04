import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  TemperatureControl,
  TemperatureResponse,
  TemperatureStatus,
  HumidityControl,
  HumidityResponse,
  HumidityStatus,
  GateControl,
  GateResponse,
  GateStatus,
  VoltageHistory,
  VoltageCurrent,
  VoltageStats,
  RgbControl,
  RgbPowerRequest,
  RgbResponse,
  FanControl,
  FanResponse,
  FanStatus,
  MotionAutomation,
  MotionNotificationSettings,
  MotionResponse,
  MotionStatus,
  HealthStatus,
  MessageResponse,
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к каждому запросу
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Обработка ошибок авторизации (опциональная авторизация)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Авторизация опциональна, не редиректим на логин
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.client.post<LoginResponse>('/auth/login', credentials);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async logout(): Promise<MessageResponse> {
    const { data } = await this.client.post<MessageResponse>('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return data;
  }

  // Temperature
  async increaseTemperature(control: TemperatureControl): Promise<TemperatureResponse> {
    const { data } = await this.client.post<TemperatureResponse>('/temperature/increase', control);
    return data;
  }

  async decreaseTemperature(control: TemperatureControl): Promise<TemperatureResponse> {
    const { data } = await this.client.post<TemperatureResponse>('/temperature/decrease', control);
    return data;
  }

  async getCurrentTemperature(): Promise<TemperatureStatus> {
    const { data } = await this.client.get<TemperatureStatus>('/temperature/current');
    return data;
  }

  // Humidity
  async increaseHumidity(control: HumidityControl): Promise<HumidityResponse> {
    const { data } = await this.client.post<HumidityResponse>('/humidity/increase', control);
    return data;
  }

  async decreaseHumidity(control: HumidityControl): Promise<HumidityResponse> {
    const { data } = await this.client.post<HumidityResponse>('/humidity/decrease', control);
    return data;
  }

  async getCurrentHumidity(): Promise<HumidityStatus> {
    const { data } = await this.client.get<HumidityStatus>('/humidity/current');
    return data;
  }

  // Gate
  async raiseGate(control?: GateControl): Promise<GateResponse> {
    const { data } = await this.client.post<GateResponse>('/gate/raise', control || {});
    return data;
  }

  async lowerGate(control?: GateControl): Promise<GateResponse> {
    const { data } = await this.client.post<GateResponse>('/gate/lower', control || {});
    return data;
  }

  async getGateStatus(): Promise<GateStatus> {
    const { data } = await this.client.get<GateStatus>('/gate/status');
    return data;
  }

  // Voltage
  async getVoltageHistory(params?: {
    from?: string;
    to?: string;
    interval?: 'minute' | 'hour' | 'day';
    limit?: number;
  }): Promise<VoltageHistory> {
    const { data } = await this.client.get<VoltageHistory>('/voltage/history', { params });
    return data;
  }

  async getCurrentVoltage(): Promise<VoltageCurrent> {
    const { data } = await this.client.get<VoltageCurrent>('/voltage/current');
    return data;
  }

  async getVoltageStats(params?: { from?: string; to?: string }): Promise<VoltageStats> {
    const { data } = await this.client.get<VoltageStats>('/voltage/stats', { params });
    return data;
  }

  // RGB
  async turnOnRgb(control: RgbControl): Promise<RgbResponse> {
    const { data } = await this.client.post<RgbResponse>('/rgb/on', control);
    return data;
  }

  async turnOffRgb(): Promise<RgbResponse> {
    const { data } = await this.client.post<RgbResponse>('/rgb/off');
    return data;
  }

  async setRgbPower(request: RgbPowerRequest): Promise<RgbResponse> {
    const { data } = await this.client.post<RgbResponse>('/rgb/power', request);
    return data;
  }

  // Fan
  async turnOnFan(control: FanControl): Promise<FanResponse> {
    const { data } = await this.client.post<FanResponse>('/fan/on', control);
    return data;
  }

  async turnOffFan(): Promise<FanResponse> {
    const { data } = await this.client.post<FanResponse>('/fan/off');
    return data;
  }

  async setFanPower(control: FanControl): Promise<FanResponse> {
    const { data } = await this.client.post<FanResponse>('/fan/power', control);
    return data;
  }

  async getFanStatus(): Promise<FanStatus> {
    const { data } = await this.client.get<FanStatus>('/fan/status');
    return data;
  }

  // Motion
  async enableMotionSensor(automation?: MotionAutomation): Promise<MotionResponse> {
    const { data } = await this.client.post<MotionResponse>('/motion/enable', automation || {});
    return data;
  }

  async disableMotionSensor(): Promise<MotionResponse> {
    const { data } = await this.client.post<MotionResponse>('/motion/disable');
    return data;
  }

  async configureMotionNotifications(settings: MotionNotificationSettings): Promise<MotionResponse> {
    const { data } = await this.client.post<MotionResponse>('/motion/notifications', settings);
    return data;
  }

  async getMotionStatus(): Promise<MotionStatus> {
    const { data } = await this.client.get<MotionStatus>('/motion/status');
    return data;
  }

  // Health
  async getHealth(): Promise<HealthStatus> {
    const { data } = await this.client.get<HealthStatus>('/health');
    return data;
  }
}

export const apiClient = new ApiClient();

