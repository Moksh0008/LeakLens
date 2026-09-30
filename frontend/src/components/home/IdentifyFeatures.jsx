// IdentifyFeatures.jsx — what LeakLens can identify. Product workspace
// copy, not marketing: short, factual, four quiet cards.

import { motion, useReducedMotion } from "framer-motion";
import { ChartIcon, DocIcon, GridIcon, AlertIcon } from "../ui/Icons";

const ICONS = {
  price: ChartIcon,
  fragmentation: GridIcon,
  contract: DocIcon,
  pattern: AlertIcon,
};

export default function IdentifyFeatures({ items }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((f) => {
        const Icon = ICONS[f.icon] || DocIcon;
        return (
          <motion.div
            key={f.title}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
            }}
            className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-control border border-border bg-surface-elevated text-accent">
              <Icon size={15} />
            </span>
            <h3 className="text-card font-semibold text-text-primary">{f.title}</h3>
            <p className="text-small text-text-secondary">{f.body}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
