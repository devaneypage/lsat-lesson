/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Component: Breadcrumb Navigation
 * 
 * Shows current location: Dashboard > Lesson > Section
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const [, navigate] = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 px-4 py-3 rounded-lg"
      style={{
        background: "rgba(45, 27, 105, 0.03)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Home Icon */}
      <motion.button
        onClick={() => navigate("/")}
        className="flex items-center justify-center p-1 rounded transition-all duration-200"
        style={{
          color: "var(--primary)",
        }}
        whileHover={{
          background: "rgba(0, 102, 255, 0.1)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Home size={16} />
      </motion.button>

      {/* Breadcrumb Items */}
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="flex items-center gap-2"
        >
          {/* Separator */}
          <ChevronRight
            size={16}
            style={{
              color: "var(--muted-foreground)",
            }}
          />

          {/* Item */}
          {item.href ? (
            <motion.button
              onClick={() => navigate(item.href!)}
              className="px-2 py-1 rounded transition-all duration-200"
              style={{
                color: "var(--primary)",
                fontSize: "0.875rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
              whileHover={{
                background: "rgba(0, 102, 255, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.button>
          ) : (
            <span
              style={{
                color: "var(--foreground)",
                fontSize: "0.875rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </motion.nav>
  );
}
