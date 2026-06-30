/**
 * DESIGN: Nexus Command Center — Concept Map
 * Component: ConceptMap
 * 
 * Visual representation of LSAT concept hierarchy with geometric shapes.
 * Central hub connected to skill categories via lines.
 */

import React from "react";

const ConceptMap: React.FC = () => {
  return (
    <div
      className="card p-8"
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* SVG Container for Concept Map */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Connection Lines */}
        <line
          x1="400"
          y1="250"
          x2="200"
          y2="150"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <line
          x1="400"
          y1="250"
          x2="600"
          y2="150"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <line
          x1="400"
          y1="250"
          x2="200"
          y2="350"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <line
          x1="400"
          y1="250"
          x2="600"
          y2="350"
          stroke="#111111"
          strokeWidth="1.5"
        />

        {/* Center Hub - Diamond */}
        <polygon
          points="400,200 450,250 400,300 350,250"
          fill="var(--nexus-forest)"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <text
          x="400"
          y="260"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fontFamily="Archivo Black"
          fill="#FFFDF8"
        >
          Main Point
        </text>

        {/* Top Left - Square */}
        <rect
          x="150"
          y="120"
          width="100"
          height="60"
          fill="var(--nexus-teal)"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <text
          x="200"
          y="155"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#FFFDF8"
        >
          Logical
        </text>
        <text
          x="200"
          y="170"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#FFFDF8"
        >
          Reasoning
        </text>

        {/* Top Right - Square */}
        <rect
          x="550"
          y="120"
          width="100"
          height="60"
          fill="var(--nexus-amber)"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <text
          x="600"
          y="155"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#111111"
        >
          Reading
        </text>
        <text
          x="600"
          y="170"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#111111"
        >
          Comprehension
        </text>

        {/* Bottom Left - Circle */}
        <circle
          cx="200"
          cy="350"
          r="35"
          fill="var(--nexus-terra)"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <text
          x="200"
          y="360"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#FFFDF8"
        >
          Assumptions
        </text>

        {/* Bottom Right - Circle */}
        <circle
          cx="600"
          cy="350"
          r="35"
          fill="var(--nexus-lime)"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <text
          x="600"
          y="360"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="Archivo"
          fill="#111111"
        >
          Flaws
        </text>
      </svg>

      {/* Content Overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "var(--foreground)",
            marginBottom: "0.5rem",
          }}
        >
          LSAT Concept Map
        </h2>
        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(17, 17, 17, 0.6)",
          }}
        >
          Navigate your learning journey through connected concepts
        </p>
      </div>
    </div>
  );
};

export default ConceptMap;
