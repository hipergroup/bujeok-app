'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TalismanSVG, { type TalismanSVGProps } from './TalismanSVG';

// ─── Particle type ───────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
  duration: number;
  delay: number;
  shape: 'circle' | 'diamond' | 'star';
}

// ─── Generate golden particles ───────────────────────────────────────
function generateParticles(count: number): Particle[] {
  const colors = ['#FFD700', '#FFC107', '#FFB300', '#FF8F00', '#FFECB3', '#FFF8E1'];
  const shapes: Particle['shape'][] = ['circle', 'diamond', 'star'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 10,
    y: 45 + (Math.random() - 0.5) * 10,
    size: 3 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: (360 / count) * i + (Math.random() - 0.5) * 30,
    distance: 120 + Math.random() * 200,
    duration: 1.2 + Math.random() * 1,
    delay: Math.random() * 0.4,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  }));
}

// ─── Single particle component ───────────────────────────────────────
function ParticleElement({ particle }: { particle: Particle }) {
  const rad = (particle.angle * Math.PI) / 180;
  const endX = particle.x + Math.cos(rad) * particle.distance;
  const endY = particle.y + Math.sin(rad) * particle.distance;

  return (
    <motion.div
      key={particle.id}
      initial={{
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 0,
        opacity: 1,
      }}
      animate={{
        x: `${endX}vw`,
        y: `${endY}vh`,
        scale: [0, 1.2, 0.8, 0],
        opacity: [0, 1, 0.8, 0],
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay + 0.3,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'diamond' ? '2px' : '0',
        transform: particle.shape === 'diamond' ? 'rotate(45deg)' : undefined,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Props ───────────────────────────────────────────────────────────
export interface TalismanRevealProps {
  /** Whether to show the reveal overlay */
  isOpen: boolean;
  /** Close the overlay */
  onClose: () => void;
  /** Talisman props to render */
  talismanProps: TalismanSVGProps;
  /** Called when user clicks download */
  onDownload?: () => void;
  /** Called when user clicks share */
  onShare?: () => void;
  /** Called when user clicks save / use talisman */
  onSave?: () => void;
  /** Enable sound effect (optional) */
  enableSound?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
//  TALISMAN REVEAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function TalismanReveal({
  isOpen,
  onClose,
  talismanProps,
  onDownload,
  onShare,
  onSave,
  enableSound = false,
}: TalismanRevealProps) {
  const [particles] = useState(() => generateParticles(40));
  const [showButtons, setShowButtons] = useState(false);
  const [showText, setShowText] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Play sound on open (optional)
  useEffect(() => {
    if (!isOpen) {
      setShowButtons(false);
      setShowText(false);
      return;
    }

    // Show completion text after scale animation
    const textTimer = setTimeout(() => setShowText(true), 800);
    // Show action buttons after 1.5s
    const buttonTimer = setTimeout(() => setShowButtons(true), 1500);

    // Optional sound effect
    if (enableSound && typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        // Simple chime sound
        const playNote = (freq: number, startTime: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        const now = ctx.currentTime;
        playNote(523, now, 0.3);        // C5
        playNote(659, now + 0.15, 0.3); // E5
        playNote(784, now + 0.3, 0.5);  // G5
        playNote(1047, now + 0.5, 0.8); // C6
      } catch {
        // Audio not available, silently skip
      }
    }

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, [isOpen, enableSound]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* ── Golden particles burst ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {particles.map((p) => (
              <ParticleElement key={p.id} particle={p} />
            ))}
          </div>

          {/* ── Glow pulse behind talisman ── */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: 340,
              height: 560,
              borderRadius: 24,
              background:
                talismanProps.style === 'traditional'
                  ? 'radial-gradient(ellipse, rgba(255,215,0,0.3) 0%, rgba(178,34,34,0.15) 50%, transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(255,215,0,0.2) 0%, rgba(100,100,255,0.1) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Talisman with spring scale-up ── */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 18,
              mass: 0.8,
            }}
            style={{
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
            }}
          >
            <TalismanSVG
              ref={svgRef}
              {...talismanProps}
              width={260}
              height={433}
            />
          </motion.div>

          {/* ── Completion text ── */}
          <AnimatePresence>
            {showText && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  marginTop: 24,
                  color: '#FFD700',
                  fontSize: 20,
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: 2,
                  textShadow: '0 0 20px rgba(255,215,0,0.4)',
                }}
              >
                ✨ 부적이 완성되었어요! ✨
              </motion.p>
            )}
          </AnimatePresence>

          {/* ── Action buttons ── */}
          <AnimatePresence>
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  gap: 12,
                  marginTop: 20,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {onSave && (
                  <RevealButton
                    onClick={onSave}
                    variant="primary"
                    label="부적 간직하기"
                    icon="🙏"
                  />
                )}
                {onDownload && (
                  <RevealButton
                    onClick={onDownload}
                    variant="secondary"
                    label="이미지 저장"
                    icon="📥"
                  />
                )}
                {onShare && (
                  <RevealButton
                    onClick={onShare}
                    variant="secondary"
                    label="공유하기"
                    icon="📤"
                  />
                )}
                <RevealButton
                  onClick={onClose}
                  variant="ghost"
                  label="닫기"
                  icon=""
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Close button (top right) ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 2,
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 28,
              cursor: 'pointer',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
            aria-label="닫기"
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Button sub-component ────────────────────────────────────────────
function RevealButton({
  onClick,
  variant,
  label,
  icon,
}: {
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'ghost';
  label: string;
  icon: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #FFD700, #FF8F00)',
      color: '#1A1A2E',
      border: 'none',
      fontWeight: 700,
      boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.1)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.2)',
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.5)',
      border: 'none',
      fontWeight: 400,
    },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        ...styles[variant],
        padding: '10px 20px',
        borderRadius: 12,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background 0.2s',
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </motion.button>
  );
}
