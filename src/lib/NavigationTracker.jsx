import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// NavigationTracker - logs page views (base44 logging removed)
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Optionally log navigation for analytics
    console.log('Navigated to:', location.pathname);
  }, [location]);

  return null;
}