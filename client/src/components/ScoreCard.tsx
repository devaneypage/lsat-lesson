/**
 * DESIGN: Nexus Command Center — Score Card
 * Component: ScoreCard
 * 
 * Displays current LSAT score, percentile, and target score.
 * Minimal borders, teal accent color, monospace numbers.
 */

import React from "react";

interface ScoreCardProps {
  currentScore?: number;
  percentile?: number;
  targetScore?: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  currentScore = 157,
  percentile = 63,
  targetScore = 170,
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
          color: "var(--muted-foreground)",
          marginBottom: "1rem",
        }}
      >
        Current Score
      </h3>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "3.5rem",
          fontWeight: 700,
          color: "var(--nexus-teal)",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        {currentScore}
      </div>

      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: "0.8rem",
          color: "var(--muted-foreground)",
          marginBottom: "1.5rem",
        }}
      >
        Percentile: <strong>{percentile}th</strong>
      </p>

      <div
        style={{
          borderTop: "1.5px solid var(--border)",
          paddingTop: "1rem",
        }}
      >
        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: "0.5rem",
          }}
        >
          Target Score
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--nexus-amber)",
          }}
        >
          {targetScore}
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;
