import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, UserRole } from '../types.ts';
import { ChevronRightIcon } from '../components/icons.tsx';
import NeonStatusIcon from '../components/NeonStatusIcon.tsx';

const Login: React.FC = () => {
  const { login, users } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMultiUserMode, setIsMultiUserMode] = useState(false);
  const [businessStatus, setBusinessStatus] = useState<'Open' | 'Closed'>('Closed');

  const greetings = useMemo(() => ['Hello', 'Hola', 'Bonjour', 'Ciao', 'Olá', 'Guten Tag', 'こんにちは', '你好', '안녕하세요', 'Здравствуйте', 'Marhaba'], []);
  const [greeting, setGreeting] = useState(greetings[0]);

  useEffect(() => {
      const storedSettings = localStorage.getItem('app_settings');
      if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setIsMultiUserMode(parsed.multiUserMode === true);
          setBusinessStatus(parsed.businessStatus || 'Closed');
      }
      
      let currentIndex = 0;
      const intervalId = setInterval(() => {
          currentIndex = (currentIndex + 1) % greetings.length;
          setGreeting(greetings[currentIndex]);
      }, 2500);

      return () => clearInterval(intervalId);
  }, [greetings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(emailOrUsername, password);
    if (!success) {
      setError('Invalid username or password.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if(user) {
        setEmailOrUsername(user.username);
        setPassword(user.password || 'password123');
    }
  };

  const operationalRoles = [UserRole.Bartender, UserRole.Kitchen, UserRole.Waiter, UserRole.Security];
  const devRoles = [UserRole.Developer, UserRole.SuperDeveloper];
  const displayRoles = Object.values(UserRole).filter(role => !devRoles.includes(role));


  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://videos.pexels.com/video-files/3831828/3831828-hd_1920_1080_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center p-8 gap-16 h-full">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold font-display text-white leading-tight">
            Management<span className="text-primary">Pro</span>
          </h1>
          <p className="text-white font-mono tracking-[0.3em] text-lg md:text-xl mt-2 animate-fade-in" style={{ animationDelay: '200ms' }}>RUN IT ALL</p>
          <p className="text-lg md:text-xl text-white mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>The all-in-one restaurant management system. Seamlessly integrated for modern hospitality.</p>
           <div className="mt-6 flex items-center justify-center md:justify-start gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <p className="text-lg text-light-text">Current Status:</p>
              <NeonStatusIcon status={businessStatus} />
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3">
          <div className="bg-dark-card/50 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-primary/10">
            <h2 key={greeting} className="text-6xl font-dancing-script text-center mb-4 h-16 animate-reveal animate-flicker-color-change">
              {greeting}
            </h2>
            <p className="text-center text-medium-text mb-8">{isMultiUserMode ? 'Manager/Owner Sign In' : 'Sign in to your dashboard'}</p>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-medium-text text-sm font-bold mb-2" htmlFor="username">
                  Email or Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="e.g., owner@managementpro.app"
                  required
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-medium-text text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-medium-text"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
               {error && <p className="text-danger text-xs text-center mb-4">{error}</p>}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                Login <ChevronRightIcon className="w-5 h-5" />
              </button>
            </form>
            {!isMultiUserMode && <div className="mt-8">
              <p className="text-center text-medium-text text-sm mb-4">Or use a demo account (click to fill):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {displayRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleQuickLogin(role)}
                    className="bg-dark-card border border-dark-border hover:border-primary text-light-text text-xs font-semibold py-2 px-2 rounded-md transition duration-200"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;