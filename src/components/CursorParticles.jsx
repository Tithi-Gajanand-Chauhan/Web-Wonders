import { useEffect } from 'react';

const COLORS = [
  '#8b5cf6', // Cyber Purple
  '#ec4899', // Electric Pink
  '#06b6d4', // Neon Teal
  '#f59e0b', // Amber Gold
  '#10b981'  // Emerald Green
];

export default function CursorParticles() {
  useEffect(() => {
    let lastTime = 0;
    const throttleMs = 20; // Spawn particle every 20ms of movement to prevent clutter

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;

      // Create particle element
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';

      // Random size (between 4px and 10px)
      const size = Math.random() * 6 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random color & matching glow shadow
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

      // Position particle exactly under cursor (accounting for scroll)
      particle.style.left = `${e.pageX}px`;
      particle.style.top = `${e.pageY}px`;

      // Generate random drift coordinates (random angle & distance)
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60 + 20; // 20px to 80px drift
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);

      // Append to body and schedule cleanup
      document.body.appendChild(particle);
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 700); // Must match animation duration in CSS (0.7s)
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null; // This component operates invisibly by injecting elements
}
