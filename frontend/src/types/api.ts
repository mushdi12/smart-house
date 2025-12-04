// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

// Temperature types
export interface TemperatureControl {
  value: number;
  unit?: 'celsius' | 'fahrenheit';
}

export interface TemperatureResponse {
  success: boolean;
  message?: string;
  current_temperature: number;
  previous_temperature?: number;
  timestamp: string;
}

export interface TemperatureStatus {
  temperature: number;
  unit: string;
  target_temperature?: number;
  status: 'heating' | 'cooling' | 'stable';
  timestamp: string;
}

// Humidity types
export interface HumidityControl {
  value: number;
  unit?: 'percent';
}

export interface HumidityResponse {
  success: boolean;
  message?: string;
  current_humidity: number;
  previous_humidity?: number;
  timestamp: string;
}

export interface HumidityStatus {
  humidity: number;
  unit: string;
  target_humidity?: number;
  status: 'increasing' | 'decreasing' | 'stable';
  timestamp: string;
}

// Gate types
export interface GateControl {
  speed?: number;
}

export interface GateResponse {
  success: boolean;
  action: 'raise' | 'lower';
  message?: string;
  status: 'raised' | 'lowered' | 'raising' | 'lowering' | 'stopped' | 'error';
  timestamp: string;
}

export interface GateStatus {
  status: 'raised' | 'lowered' | 'raising' | 'lowering' | 'stopped' | 'error';
  position: number;
  last_action?: 'raise' | 'lower' | 'stop';
  last_action_time?: string;
  timestamp: string;
}

// Voltage types
export interface VoltageDataPoint {
  timestamp: string;
  voltage: number;
  current?: number;
  power?: number;
}

export interface VoltageHistory {
  data: VoltageDataPoint[];
  total: number;
  from?: string;
  to?: string;
  interval?: string;
}

export interface VoltageCurrent {
  voltage: number;
  current?: number;
  power?: number;
  frequency?: number;
  timestamp: string;
}

export interface VoltageStats {
  min: number;
  max: number;
  avg: number;
  count: number;
  from?: string;
  to?: string;
}

// RGB types
export interface RgbControl {
  mode: 'static' | 'rainbow' | 'music';
  color?: string;
  brightness?: number;
  power?: number;
  duration_seconds?: number;
}

export interface RgbPowerRequest {
  power: number;
  brightness?: number;
  transition_ms?: number;
}

export interface RgbResponse {
  success: boolean;
  status: 'on' | 'off';
  mode?: string;
  color?: string;
  brightness?: number;
  power?: number;
  message?: string;
  timestamp: string;
}

// Fan types
export interface FanControl {
  power: number;
  mode?: 'manual' | 'auto';
  duration_seconds?: number;
}

export interface FanResponse {
  success: boolean;
  status: 'on' | 'off';
  power: number;
  mode?: string;
  message?: string;
  timestamp: string;
}

export interface FanStatus {
  status: 'on' | 'off';
  power: number;
  rpm?: number;
  mode?: string;
  timestamp: string;
}

// Motion sensor types
export interface MotionAutomation {
  sensitivity?: 'low' | 'medium' | 'high';
  trigger_rgb?: boolean;
  rgb_scene?: string;
  notification_level?: 'silent' | 'push' | 'call';
}

export interface MotionNotificationSettings {
  notify_phone: boolean;
  phone_number?: string;
  trigger_rgb?: boolean;
  rgb_power?: number;
}

export interface MotionResponse {
  success: boolean;
  message: string;
  settings?: Record<string, any>;
  timestamp: string;
}

export interface MotionStatus {
  enabled: boolean;
  notify_phone: boolean;
  phone_number?: string;
  trigger_rgb: boolean;
  rgb_power?: number;
  last_event?: string;
  timestamp: string;
}

// Health types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components?: Record<string, string>;
}

// Error type
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
}

