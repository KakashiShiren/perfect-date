import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);

  // Throttled mouse and scroll tracking for optimal performance
  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePosition({
            x: (e.clientX / window.innerWidth) * 100,
            y: (e.clientY / window.innerHeight) * 100,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate parallax offsets - minimal computation
  const parallaxX = (mousePosition.x - 50) * 0.02;
  const parallaxY = (mousePosition.y - 50) * 0.02;
  const scrollParallax = scrollY * 0.05;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft radial gradient following mouse - GPU accelerated with transform */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x}%, ${mousePosition.y}%) translate(-50%, -50%)`,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />

      {/* Lightweight gradient blobs - GPU accelerated with transform only */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.15]"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
          filter: 'blur(60px)',
          transform: `translate(${20 + parallaxX}%, ${10 + parallaxY + scrollParallax}%)`,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />

      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full opacity-[0.15]"
        style={{
          background: 'linear-gradient(225deg, #f472b6 0%, #d946ef 100%)',
          filter: 'blur(60px)',
          transform: `translate(${70 - parallaxX * 0.8}%, ${30 + parallaxY * 1.2 + scrollParallax * 0.8}%)`,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
          delay: 3,
        }}
      />

      <motion.div
        className="absolute w-[550px] h-[550px] rounded-full opacity-[0.12]"
        style={{
          background: 'linear-gradient(45deg, #fbbf24 0%, #fb923c 100%)',
          filter: 'blur(70px)',
          transform: `translate(${50 + parallaxX * 0.5}%, ${70 - parallaxY * 0.8 - scrollParallax * 0.3}%)`,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.06, 1],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
          delay: 6,
        }}
      />
    </div>
  );
}