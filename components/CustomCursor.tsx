'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const GOLD     = '#C8820A';
const GOLD_MID = '#F5A623';

const CustomCursor: React.FC = () => {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const [variant, setVariant] = useState<'default' | 'pointer'>('default');
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const springFast = { stiffness: 420, damping: 32, mass: 0.5 };

  const x = useSpring(cursorX, springFast);
  const y = useSpring(cursorY, springFast);

  useEffect(() => {
    // Hide on touch/coarse-pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement;
      const clickable = el.closest(
        "a, button, [role='button'], input, textarea, select, label, [onClick]",
      );
      setVariant(clickable ? 'pointer' : 'default');
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [cursorX, cursorY, visible]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        opacity: visible ? 1 : 0,
        boxShadow: `0 0 8px ${GOLD_MID}90`,
      }}
      animate={{
        width:      variant === 'pointer' ? 10 : 7,
        height:     variant === 'pointer' ? 10 : 7,
        background: variant === 'pointer' ? GOLD_MID : GOLD,
        scale:      variant === 'pointer' ? 1.15 : 1,
        transition: { duration: 0.12 },
      }}
    />
  );
};

export default CustomCursor;
