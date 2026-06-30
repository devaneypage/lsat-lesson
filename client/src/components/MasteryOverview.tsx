/**
 * DESIGN: Nexus Command Center — Mastery Overview
 * Component: MasteryOverview
 * 
 * Displays progress bars for each LSAT skill category.
 * Color-coded by skill type (teal, amber, forest, etc.).
 */

import React from "react";

interface SkillMastery {
  name: string;
  percentage: number;
  color: string;
}

interface MasteryOverviewProps {
  skills?: SkillMastery[];
}

const DEFAULT_SKILLS: SkillMastery[] = [
  { name: "Logical Reasoning", percentage: 72, color: "var(--nexus-teal)" },
  { name: "Reading Comprehension", percentage: 61, color: "var(--nexus-forest)" },
  { name: "Analytical Reasoning", percentage: 58, color: "var(--nexus-amber)" },
];

const MasteryOverview: React.FC<MasteryOverviewProps> = ({
  skills = DEFAULT_SKILLS,
}) => {
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
          color: "rgba(17, 17, 17, 0.6)",
          marginBottom: "1.5rem",
        }}
      >
        Section Mastery
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {skills.map((skill) => (
          <div key={skill.name}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                {skill.name}
              </label>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: skill.color,
                }}
              >
                {skill.percentage}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(17, 17, 17, 0.1)",
                borderRadius: "0.25rem",
                overflow: "hidden",
                border: "1px solid rgba(17, 17, 17, 0.15)",
              }}
            >
              <div
                style={{
                  width: `${skill.percentage}%`,
                  height: "100%",
                  background: skill.color,
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasteryOverview;
