import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TemperatureControl } from './components/TemperatureControl';
import { HumidityControl } from './components/HumidityControl';
import { GateControl } from './components/GateControl';
import { VoltageMonitor } from './components/VoltageMonitor';
import { RgbControl } from './components/RgbControl';
import { FanControl } from './components/FanControl';
import { MotionControl } from './components/MotionControl';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="temperature" element={<TemperatureControl />} />
          <Route path="humidity" element={<HumidityControl />} />
          <Route path="gate" element={<GateControl />} />
          <Route path="voltage" element={<VoltageMonitor />} />
          <Route path="rgb" element={<RgbControl />} />
          <Route path="fan" element={<FanControl />} />
          <Route path="motion" element={<MotionControl />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

