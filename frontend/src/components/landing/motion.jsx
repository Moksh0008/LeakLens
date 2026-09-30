// motion.jsx — tiny motion primitives for the landing page.
// Everything respects prefers-reduced-motion: when the user asks for
// less motion, reveals become simple fades and counters skip to the end.

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";
import { useEffect, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1]; // gentle, professional ease-out

/** Fade-and-rise reveal triggered when the element scrolls into view. */
export function Reveal({ children, delay = 0, y = 18, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduce ? 0.2 : 0.55, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Staggered container: children with <StaggerItem> reveal one after another. */
export function Stagger({ children, className = "", gap = 0.08, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", y = 16 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp — animates a number from 0 to `value` when scrolled into view.
 * `format` receives the live number and returns the display string,
 * e.g. format={(v) => `₹${(v / 1_000_000).toFixed(1)}M`}.
 */
export function CountUp({ value, format, duration = 1.4, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useStateSafe(format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setDisplay(format(latest)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

// Tiny helper so CountUp stays a single-purpose component.
import { useState } from "react";
function useStateSafe(initial) {
  return useState(initial);
}
