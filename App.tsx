import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StaffView } from './components/StaffView';
import { TemplateCreator } from './components/TemplateCreator';
import { OlympicGenerator } from './components/OlympicGenerator';
import { LoginScreen } from './components/LoginScreen';
import { ScreenType, UserRole, OperationalEvent } from './types';
import { MOCK_EVENTS } from './constants';
import { useLocalStorageState } from './utils/persistedState';

const LS_KEYS = {
  isAuthenticated: 'vvfm:auth:isAuthenticated',
  role: 'vvfm:auth:role',
  activeScreen: 'vvfm:ui:activeScreen',
  selectedDate: 'vvfm:ui:selectedDate',
  events: 'vvfm:data:events',
} as const;

const App: React.FC = () => {
  // Persisted state (LocalStorage)
  const [isAuthenticated, setIsAuthenticated] = useLocalStorageState<boolean>(LS_KEYS.isAuthenticated, false);
  const [activeScreen, setActiveScreen] = useLocalStorageState<ScreenType>(LS_KEYS.activeScreen, 'DASHBOARD');
  const [currentRole, setCurrentRole] = useLocalStorageState<UserRole>(LS_KEYS.role, 'COMPILATORE_A');
  const [events, setEvents] = useLocalStorageState<OperationalEvent[]>(LS_KEYS.events, MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useLocalStorageState<string>(LS_KEYS.selectedDate, '2026-02-17');

  // Non persistito: è solo “orologio” UI
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const dayName = now.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase();
      const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      setCurrentDate(`${dayName} ${formatted} • ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setActiveScreen('DASHBOARD');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveScreen('DASHBOARD');
  };

  const handleSaveEvent = (newEvent: OperationalEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedDate(newEvent.date);
    setActiveScreen('DASHBOARD');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-full w-full font-sans antialiased text-slate-700">
      <Layout 
        activeScreen={activeScreen} 
        setScreen={setActiveScreen} 
        role={currentRole} 
        setRole={setCurrentRole} // Nota: In un'app reale il ruolo non cambierebbe manualmente dopo il login
        onLogout={handleLogout}
        date={currentDate}
        events={events}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      >
        {activeScreen === 'DASHBOARD' && (
          <Dashboard
            events={events}
            setEvents={setEvents}
            role={currentRole}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {activeScreen === 'STAFF' && <StaffView />}
        {activeScreen === 'CREAZIONE' && <TemplateCreator onSave={handleSaveEvent} defaultDate={selectedDate} />}
        {activeScreen === 'GENERATORE' && <OlympicGenerator />}
      </Layout>
    </div>
  );
};

export default App;
