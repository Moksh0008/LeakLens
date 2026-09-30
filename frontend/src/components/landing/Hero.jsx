// Hero.jsx — the first thing a visitor reads.
// One sentence: what LeakLens does, for whom, and what to do next.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import HeroVisual from "./HeroVisual";

const EASE = [0.22, 1, 0.36, 1];

export default function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 0.55, ease: EASE, delay },
  });

  return (
    <section className="relative overflow-hidden">
      {/* calm: no decorative gradients — whitespace does the work */}

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.p {...fade(0)} className="overline">
            Procurement Spend Intelligence
          </motion.p>

          <motion.h1
            {...fade(0.08)}
            className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-text-primary sm:text-5xl"
          >
            Find where procurement spend leaks.
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-5 text-body text-text-secondary sm:text-[15px]">
            LeakLens analyzes procurement transactions to uncover price
            anomalies, missed discounts, fragmented purchasing, contract
            exceptions, and other potential sources of avoidable spend.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="md" className="h-11 px-6">Start Analyzing</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" size="md" className="h-11 px-6">Explore Dashboard</Button>
            </Link>
          </motion.div>

          <motion.p {...fade(0.32)} className="mt-6 text-caption text-text-muted">
            Illustrative figures shown below — not real company data.
          </motion.p>
        </div>

        {/* Visual */}
        <div className="flex justify-center lg:justify-end">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
