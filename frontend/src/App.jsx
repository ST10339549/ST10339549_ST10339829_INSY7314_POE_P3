import React, { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import PaymentPortal from './components/PaymentPortal';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('register'); // 'register', 'login', 'payment'

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setView('payment');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const renderView = () => {
    switch (view) {
      case 'register':
        return <RegistrationForm onSwitch={setView} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} onSwitch={setView} />;
      case 'payment':
        return user ? <PaymentPortal user={user} onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} onSwitch={setView} />;
      default:
        return <RegistrationForm onSwitch={setView} />;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Secure Payments Portal</h1>
          <p className="text-slate-400">International Banking Made Safe</p>
        </div>
        {renderView()}
      </div>
    </div>
  );
}

export default App;