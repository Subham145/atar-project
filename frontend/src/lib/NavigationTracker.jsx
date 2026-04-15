import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationTracker: 
 * Pehle ye Base44 ke analytics handle karta tha.
 * Ab ye sirf page change hone par scroll top par le jata hai.
 */
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Har page change par page ke top par le jaye
    window.scrollTo(0, 0);
    
    // Yahan humne base44.logUserInApp() wali line hata di hai 
    // kyunki hum ab local backend use kar rahe hain.
    console.log("Navigated to:", location.pathname);
  }, [location]);

  return null; // Yeh component screen par kuch dikhata nahi hai
}