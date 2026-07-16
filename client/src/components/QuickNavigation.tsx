/**
 * DESIGN: Nexus Command Center — Quick Navigation
 * Component: QuickNavigation
 * 
 * Quick action buttons for common workflows: Start Drill, Review Mistakes, Study Plan, etc.
 */

import React from "react";
import { Link } from "wouter";
import {
  Zap,
  BookOpen,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface QuickAction {
  label: string;
  route: string;
  icon: React.ReactNode;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Start Drill",
    route: "/question-bank",
    icon: <Zap size={18} />,
    color: "var(--nexus-teal)",
  },
  {
    label: "Analyze Errors",
    route: "/question-bank",
    icon: <AlertCircle size={18} />,
    color: "var(--nexus-amber)",  // P8: reassigned from terra (destructive) to amber (attention)
  },
  {
    label: "Study Plan",
    route: "/lesson-plan-generator",
    icon: <BookOpen size={18} />,
    color: "var(--nexus-forest)",
  },
  {
    label: "View Progress",
    route: "/progress",
    icon: <TrendingUp size={18} />,
    color: "var(--nexus-forest)",
  },
];

const QuickNavigation: React.FC = () => {
  return (
    <div
      className="card p-6"
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h3
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",  // P9: replaced hardcoded rgba
          marginBottom: "1rem",
        }}
      >
        Quick Actions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.route}
            href={action.route}
            className="px-3 py-2 flex items-center gap-2 transition-all duration-200"
            style={{
              background: "rgba(17, 17, 17, 0.05)",
              color: action.color,
              border: `1.5px solid ${action.color}`,
              borderRadius: "0.25rem",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${action.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(17, 17, 17, 0.05)";
            }}
          >
            <span style={{ color: action.color }}>{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickNavigation;
