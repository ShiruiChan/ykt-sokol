import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const RouteProgress = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Анимация "загрузки" при изменении маршрута
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Симуляция задержки загрузки

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-50">
      <div className="w-full h-full bg-blue-600 animate-pulse"></div>
    </div>
  );
};

export default RouteProgress;