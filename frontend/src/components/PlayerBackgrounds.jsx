import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Background effect: Gradient Orbs (original default)
 */
const GradientOrbs = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-black to-black" />
    {isPlaying && (
      <>
        <motion.div
          className="absolute w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full blur-[80px] md:blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(6, 182, 212, 0.15) 40%, transparent 70%)',
            left: '5%',
            top: '10%'
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[250px] sm:w-[350px] md:w-[450px] h-[250px] sm:h-[350px] md:h-[450px] rounded-full blur-[60px] md:blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
            right: '5%',
            bottom: '20%'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </>
    )}
  </div>
);

/**
 * Background effect: Starfield
 */
const Starfield = ({ isPlaying }) => {
  const stars = useRef(
    Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-indigo-950/40 via-black to-black">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={isPlaying ? {
            opacity: [0.2, 0.9, 0.2],
            scale: [1, 1.5, 1],
          } : { opacity: 0.3, scale: 1 }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Shooting stars when playing */}
      {isPlaying && (
        <>
          <motion.div
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ boxShadow: '0 0 6px 2px rgba(255,255,255,0.6)' }}
            animate={{
              x: ['-10vw', '110vw'],
              y: ['10vh', '60vh'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-cyan-300 rounded-full"
            style={{ boxShadow: '0 0 6px 2px rgba(103,232,249,0.6)' }}
            animate={{
              x: ['110vw', '-10vw'],
              y: ['20vh', '70vh'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 7, delay: 3, ease: 'linear' }}
          />
        </>
      )}
    </div>
  );
};

/**
 * Background effect: Fireworks (Canvas-based)
 */
const Fireworks = ({ isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  const createFirework = useCallback((canvas) => {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height * 0.6;
    const hue = Math.random() * 360;
    const count = 30 + Math.floor(Math.random() * 30);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.01 + Math.random() * 0.015,
        hue: hue + Math.random() * 30 - 15,
        size: 1.5 + Math.random() * 1.5,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastFirework = 0;
    const interval = 1200;

    const animate = (time) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      if (isPlaying && time - lastFirework > interval) {
        createFirework(canvas);
        lastFirework = time;
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.life -= p.decay;

        if (p.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.fill();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, createFirework]);

  return (
    <div className="absolute inset-0 bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

/**
 * Background effect: Aurora
 */
const Aurora = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black">
    {isPlaying && (
      <>
        <motion.div
          className="absolute w-[150%] h-[40%] top-[5%] -left-[25%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(34, 197, 94, 0.15) 30%, rgba(6, 182, 212, 0.2) 50%, rgba(139, 92, 246, 0.15) 70%, transparent 100%)',
            filter: 'blur(40px)',
            borderRadius: '50%',
          }}
          animate={{
            x: ['-5%', '10%', '-5%'],
            scaleX: [1, 1.2, 1],
            skewX: [0, 5, -5, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[120%] h-[35%] top-[15%] -left-[10%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.12) 30%, rgba(236, 72, 153, 0.15) 50%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)',
            filter: 'blur(50px)',
            borderRadius: '50%',
          }}
          animate={{
            x: ['5%', '-8%', '5%'],
            scaleX: [1, 1.15, 1],
            skewX: [0, -3, 3, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-[100%] h-[25%] top-[25%] left-[5%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 40%, rgba(16, 185, 129, 0.12) 60%, transparent 100%)',
            filter: 'blur(35px)',
            borderRadius: '50%',
          }}
          animate={{
            x: ['-3%', '6%', '-3%'],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </>
    )}
    {!isPlaying && (
      <div
        className="absolute w-[120%] h-[30%] top-[10%] -left-[10%] opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(34, 197, 94, 0.1) 40%, rgba(6, 182, 212, 0.1) 60%, transparent 100%)',
          filter: 'blur(40px)',
          borderRadius: '50%',
        }}
      />
    )}
  </div>
);

/**
 * Background effect: Particles (floating bubbles)
 */
const Particles = ({ isPlaying }) => {
  const particles = useRef(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 5,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      hue: Math.random() * 60 + 140, // cyan to purple range
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-purple-950/30 via-black to-black">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `hsla(${p.hue}, 70%, 50%, 0.3)`,
            boxShadow: `0 0 ${p.size}px hsla(${p.hue}, 70%, 50%, 0.2)`,
          }}
          animate={isPlaying ? {
            y: [`${p.y}vh`, `${p.y - 30}vh`, `${p.y}vh`],
            x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 10}%`, `${p.x}%`],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          } : {
            y: `${p.y}vh`,
            opacity: 0.15,
            scale: 1,
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Background effect: Waves
 */
const Waves = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-blue-950/30 via-black to-black">
    {[0, 1, 2, 3].map(i => (
      <motion.div
        key={i}
        className="absolute w-[200%] left-[-50%]"
        style={{
          bottom: `${i * 8}%`,
          height: '120px',
          background: `linear-gradient(180deg, transparent, hsla(${180 + i * 30}, 70%, 40%, ${isPlaying ? 0.12 : 0.05}) 50%, transparent)`,
          borderRadius: '50%',
        }}
        animate={isPlaying ? {
          x: ['-10%', '10%', '-10%'],
          scaleY: [1, 1.3, 1],
        } : {}}
        transition={{
          duration: 4 + i * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.5,
        }}
      />
    ))}
  </div>
);

/**
 * Background effect: Neon Glow - bright colorful pulsing neon lights
 */
const NeonGlow = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900">
    {isPlaying && (
      <>
        <motion.div
          className="absolute w-[60%] h-[2px] top-[20%] left-[20%]"
          style={{ background: 'linear-gradient(90deg, transparent, #f472b6, #c084fc, transparent)', boxShadow: '0 0 20px #f472b6, 0 0 40px #c084fc' }}
          animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[2px] h-[50%] top-[25%] left-[15%]"
          style={{ background: 'linear-gradient(180deg, transparent, #22d3ee, #a78bfa, transparent)', boxShadow: '0 0 15px #22d3ee, 0 0 30px #a78bfa' }}
          animate={{ opacity: [0.4, 1, 0.4], scaleY: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute w-[40%] h-[2px] bottom-[30%] right-[15%]"
          style={{ background: 'linear-gradient(90deg, transparent, #34d399, #fbbf24, transparent)', boxShadow: '0 0 20px #34d399, 0 0 40px #fbbf24' }}
          animate={{ opacity: [0.3, 1, 0.3], scaleX: [1, 0.8, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-[2px] h-[40%] top-[30%] right-[20%]"
          style={{ background: 'linear-gradient(180deg, transparent, #fb923c, #f43f5e, transparent)', boxShadow: '0 0 15px #fb923c, 0 0 30px #f43f5e' }}
          animate={{ opacity: [0.5, 1, 0.5], scaleY: [1.1, 0.9, 1.1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </>
    )}
    {!isPlaying && (
      <div className="absolute w-[60%] h-[2px] top-[20%] left-[20%] opacity-20"
        style={{ background: 'linear-gradient(90deg, transparent, #f472b6, #c084fc, transparent)' }}
      />
    )}
  </div>
);

/**
 * Background effect: Sunset - warm gradient with floating light
 */
const Sunset = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden"
    style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 20%, #0f3460 40%, #e94560 70%, #f5a623 90%, #ffd700 100%)' }}
  >
    <div className="absolute inset-0 bg-black/40" />
    {isPlaying && (
      <>
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, transparent 70%)', bottom: '15%', left: '30%' }}
          animate={{ x: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[150px] h-[150px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)', bottom: '25%', right: '25%' }}
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-[80px] h-[80px] rounded-full"
          style={{ background: 'radial-gradient(circle, #ffd700 0%, #f5a623 50%, transparent 70%)', boxShadow: '0 0 60px rgba(255, 215, 0, 0.4)', bottom: '20%', left: '50%', marginLeft: '-40px' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </>
    )}
  </div>
);

/**
 * Background effect: Rainbow Flow - flowing rainbow colors
 */
const RainbowFlow = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    {isPlaying && (
      <>
        <motion.div
          className="absolute inset-[-50%] w-[200%] h-[200%]"
          style={{ background: 'conic-gradient(from 0deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2), rgba(234,179,8,0.2), rgba(34,197,94,0.2), rgba(59,130,246,0.2), rgba(168,85,247,0.2), rgba(236,72,153,0.2), rgba(239,68,68,0.2))' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map((color, i) => (
          <motion.div
            key={i}
            className="absolute w-[250px] h-[250px] rounded-full blur-[80px]"
            style={{
              background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 50 : -50), 0],
              y: [0, (i % 2 === 0 ? -30 : 30), 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </>
    )}
    {!isPlaying && (
      <div className="absolute inset-0 opacity-20"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(59,130,246,0.15), rgba(168,85,247,0.15))' }}
      />
    )}
  </div>
);

/**
 * Background effect: Sakura (Cherry Blossoms) - falling petals
 */
const Sakura = ({ isPlaying }) => {
  const petals = useRef(
    Array.from({ length: 35 }, () => ({
      x: Math.random() * 100,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 6,
      sway: Math.random() * 40 - 20,
      rotation: Math.random() * 360,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b4e 30%, #4a2040 60%, #1a1a2e 100%)' }}
    >
      <div className="absolute w-[400px] h-[400px] top-[10%] left-[20%] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 70%)' }}
      />
      {isPlaying && petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.7,
            background: 'radial-gradient(ellipse, rgba(251, 207, 232, 0.9) 0%, rgba(244, 114, 182, 0.6) 100%)',
            borderRadius: '50% 0 50% 0',
          }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [`${p.x}%`, `${p.x + p.sway}%`],
            rotate: [p.rotation, p.rotation + 360],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Background effect: Lightning Storm - dramatic flashes
 */
const Lightning = ({ isPlaying }) => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    let timeout;
    const doFlash = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      timeout = setTimeout(doFlash, 2000 + Math.random() * 3000);
    };
    timeout = setTimeout(doFlash, 1000);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950/60 to-black">
      <motion.div
        className="absolute w-[80%] h-[30%] top-0 left-[10%] rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(ellipse, rgba(100, 116, 139, 0.4) 0%, transparent 70%)' }}
        animate={isPlaying ? { x: ['-5%', '5%', '-5%'] } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[60%] h-[25%] top-[5%] left-[30%] rounded-full blur-[50px]"
        style={{ background: 'radial-gradient(ellipse, rgba(71, 85, 105, 0.5) 0%, transparent 70%)' }}
        animate={isPlaying ? { x: ['3%', '-3%', '3%'] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {flash && <div className="absolute inset-0 bg-white/20" />}
      {isPlaying && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] bg-gradient-to-b from-blue-200/60 to-transparent"
          style={{ left: `${5 + i * 4.5}%`, height: `${20 + (i % 5) * 8}px` }}
          animate={{ y: ['-10vh', '110vh'] }}
          transition={{ duration: 0.6 + (i % 4) * 0.1, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

/**
 * Background effect: Lava Lamp - slow moving blobs
 */
const LavaLamp = ({ isPlaying }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-orange-950/40 via-red-950/30 to-black">
    {[
      { color: 'rgba(239, 68, 68, 0.4)', size: 200, x: '20%', y: '60%', dx: 30, dy: -80, dur: 8 },
      { color: 'rgba(249, 115, 22, 0.35)', size: 160, x: '60%', y: '70%', dx: -40, dy: -60, dur: 10 },
      { color: 'rgba(234, 179, 8, 0.3)', size: 140, x: '40%', y: '30%', dx: 20, dy: 50, dur: 9 },
      { color: 'rgba(236, 72, 153, 0.35)', size: 180, x: '70%', y: '40%', dx: -30, dy: -40, dur: 11 },
      { color: 'rgba(251, 146, 60, 0.3)', size: 120, x: '30%', y: '50%', dx: 40, dy: 30, dur: 7 },
    ].map((blob, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-[40px]"
        style={{
          width: blob.size,
          height: blob.size,
          background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
          left: blob.x,
          top: blob.y,
        }}
        animate={isPlaying ? {
          x: [0, blob.dx, 0],
          y: [0, blob.dy, 0],
          scale: [1, 1.4, 1],
          borderRadius: ['50%', '40% 60% 50% 50%', '50%'],
        } : { scale: 1 }}
        transition={{ duration: blob.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
      />
    ))}
  </div>
);

// Available backgrounds registry
export const BACKGROUNDS = [
  { id: 'orbs', name: 'Gradient Orbs', component: GradientOrbs },
  { id: 'aurora', name: 'Aurora', component: Aurora },
  { id: 'fireworks', name: 'Fireworks', component: Fireworks },
  { id: 'starfield', name: 'Starfield', component: Starfield },
  { id: 'particles', name: 'Particles', component: Particles },
  { id: 'waves', name: 'Waves', component: Waves },
  { id: 'neon', name: 'Neon Glow', component: NeonGlow },
  { id: 'sunset', name: 'Sunset', component: Sunset },
  { id: 'rainbow', name: 'Rainbow Flow', component: RainbowFlow },
  { id: 'sakura', name: 'Sakura', component: Sakura },
  { id: 'lightning', name: 'Lightning', component: Lightning },
  { id: 'lava', name: 'Lava Lamp', component: LavaLamp },
];

/**
 * Background selector button for FullPlayer header
 */
export function BackgroundSelector({ current, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-[60]">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        title="Switch background effect"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.76 4.76l-.71-.71" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full mt-2 right-0 z-[70] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 min-w-[160px] max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.id}
                onClick={(e) => { e.stopPropagation(); onChange(bg.id); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                  current === bg.id
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {current === bg.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                <span className={current === bg.id ? '' : 'ml-3.5'}>{bg.name}</span>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

/**
 * Render the selected background
 */
export function PlayerBackground({ backgroundId, isPlaying }) {
  const bg = BACKGROUNDS.find(b => b.id === backgroundId) || BACKGROUNDS[0];
  const Component = bg.component;
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Component isPlaying={isPlaying} />
    </div>
  );
}
