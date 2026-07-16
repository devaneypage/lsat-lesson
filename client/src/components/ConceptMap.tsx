/**
 * DESIGN: Nexus Command Center — Concept Map
 * Component: ConceptMap
 *
 * Interactive visual representation of LSAT concept hierarchy.
 * Central hub connected to skill categories via lines.
 * Each node is clickable and navigates to the corresponding lesson/section.
 * Hover states: scale + glow shadow to signal interactivity.
 *
 * P2 fix: nodes are now interactive (hover + click-through navigation)
 */

import React, { useState } from "react";
import { useLocation } from "wouter";

interface ConceptNode {
  id: string;
  label: string;
  sublabel?: string;
  shape: "rect" | "circle" | "diamond";
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  r?: number;
  color: string;
  textColor: string;
  route: string;
}

const NODES: ConceptNode[] = [
  {
    id: "center",
    label: "LSAT",
    sublabel: "Core",
    shape: "diamond",
    cx: 400,
    cy: 250,
    w: 90,
    h: 90,
    color: "var(--nexus-forest)",
    textColor: "#FFFDF8",
    route: "/lessons",
  },
  {
    id: "logical-reasoning",
    label: "Logical",
    sublabel: "Reasoning",
    shape: "rect",
    cx: 185,
    cy: 140,
    w: 110,
    h: 58,
    color: "var(--nexus-teal)",
    textColor: "#FFFDF8",
    route: "/lessons/necessary-assumptions",
  },
  {
    id: "reading-comprehension",
    label: "Reading",
    sublabel: "Comprehension",
    shape: "rect",
    cx: 615,
    cy: 140,
    w: 120,
    h: 58,
    color: "var(--nexus-blue)",
    textColor: "#FFFDF8",
    route: "/lessons/reading-comprehension",
  },
  {
    id: "assumptions",
    label: "Assumptions",
    shape: "circle",
    cx: 185,
    cy: 360,
    r: 42,
    color: "var(--nexus-amber)",
    textColor: "#111111",
    route: "/lessons/necessary-assumptions",
  },
  {
    id: "flaws",
    label: "Flaws &",
    sublabel: "Reasoning",
    shape: "circle",
    cx: 615,
    cy: 360,
    r: 42,
    color: "var(--nexus-terra)",
    textColor: "#FFFDF8",
    route: "/lessons/flaw-in-reasoning",
  },
  {
    id: "formal-logic",
    label: "Formal",
    sublabel: "Logic",
    shape: "rect",
    cx: 400,
    cy: 430,
    w: 100,
    h: 50,
    color: "var(--nexus-purple)",
    textColor: "#FFFDF8",
    route: "/lessons/formal-logic",
  },
];

// Connection lines: [fromId, toId]
const CONNECTIONS: [string, string][] = [
  ["center", "logical-reasoning"],
  ["center", "reading-comprehension"],
  ["center", "assumptions"],
  ["center", "flaws"],
  ["center", "formal-logic"],
];

function getNodeCenter(node: ConceptNode): { x: number; y: number } {
  return { x: node.cx, y: node.cy };
}

const ConceptMap: React.FC = () => {
  const [, navigate] = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  const handleNodeClick = (route: string) => {
    navigate(route);
  };

  const renderNode = (node: ConceptNode) => {
    const isHovered = hoveredId === node.id;
    const scale = isHovered ? 1.08 : 1;
    const glowColor = node.color.startsWith("var(") ? "rgba(0,0,0,0.18)" : node.color + "55";

    const commonProps = {
      style: {
        cursor: "pointer",
        transition: "transform 0.18s ease, filter 0.18s ease",
        transform: `scale(${scale})`,
        transformOrigin: `${node.cx}px ${node.cy}px`,
        filter: isHovered
          ? `drop-shadow(0 4px 10px ${glowColor})`
          : "none",
      },
      onClick: () => handleNodeClick(node.route),
      onMouseEnter: () => setHoveredId(node.id),
      onMouseLeave: () => setHoveredId(null),
    };

    const labelY = node.sublabel ? node.cy - 7 : node.cy + 5;
    const sublabelY = node.cy + 10;

    if (node.shape === "diamond") {
      const hw = (node.w ?? 80) / 2;
      const hh = (node.h ?? 80) / 2;
      const points = `${node.cx},${node.cy - hh} ${node.cx + hw},${node.cy} ${node.cx},${node.cy + hh} ${node.cx - hw},${node.cy}`;
      return (
        <g key={node.id} {...commonProps}>
          <polygon
            points={points}
            fill={node.color}
            stroke="#111111"
            strokeWidth="1.5"
          />
          <text
            x={node.cx}
            y={labelY}
            textAnchor="middle"
            fontSize="13"
            fontWeight="900"
            fontFamily="Archivo Black"
            fill={node.textColor}
          >
            {node.label}
          </text>
          {node.sublabel && (
            <text
              x={node.cx}
              y={sublabelY}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fontFamily="Archivo"
              fill={node.textColor}
            >
              {node.sublabel}
            </text>
          )}
        </g>
      );
    }

    if (node.shape === "rect") {
      const hw = (node.w ?? 100) / 2;
      const hh = (node.h ?? 50) / 2;
      return (
        <g key={node.id} {...commonProps}>
          <rect
            x={node.cx - hw}
            y={node.cy - hh}
            width={node.w}
            height={node.h}
            rx="3"
            fill={node.color}
            stroke="#111111"
            strokeWidth="1.5"
          />
          <text
            x={node.cx}
            y={labelY}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="Archivo"
            fill={node.textColor}
          >
            {node.label}
          </text>
          {node.sublabel && (
            <text
              x={node.cx}
              y={sublabelY}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="Archivo"
              fill={node.textColor}
            >
              {node.sublabel}
            </text>
          )}
        </g>
      );
    }

    if (node.shape === "circle") {
      return (
        <g key={node.id} {...commonProps}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.r ?? 40}
            fill={node.color}
            stroke="#111111"
            strokeWidth="1.5"
          />
          <text
            x={node.cx}
            y={labelY}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="Archivo"
            fill={node.textColor}
          >
            {node.label}
          </text>
          {node.sublabel && (
            <text
              x={node.cx}
              y={sublabelY}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fontFamily="Archivo"
              fill={node.textColor}
            >
              {node.sublabel}
            </text>
          )}
        </g>
      );
    }

    return null;
  };

  return (
    <div
      className="card p-6"
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        minHeight: "520px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card header */}
      <div style={{ marginBottom: "1rem" }}>
        <h2
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "1.25rem",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          LSAT Concept Map
        </h2>
        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: "0.8rem",
            color: "var(--muted-foreground)",
            margin: "0.25rem 0 0 0",
          }}
        >
          Click any node to navigate to that topic
        </p>
      </div>

      {/* Interactive SVG */}
      <div style={{ flex: 1, position: "relative" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 520"
          style={{ display: "block", minHeight: "380px" }}
          aria-label="LSAT concept map — click a node to navigate"
        >
          {/* Connection lines */}
          {CONNECTIONS.map(([fromId, toId]) => {
            const from = getNodeCenter(nodeMap[fromId]);
            const to = getNodeCenter(nodeMap[toId]);
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#111111"
                strokeWidth="1.5"
                strokeOpacity="0.35"
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(renderNode)}
        </svg>
      </div>

      {/* Hover hint */}
      {hoveredId && hoveredId !== "center" && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 0.75rem",
            background: "var(--muted)",
            borderRadius: "0.25rem",
            fontFamily: "'Archivo', sans-serif",
            fontSize: "0.78rem",
            color: "var(--muted-foreground)",
            letterSpacing: "0.02em",
          }}
        >
          Click to open:{" "}
          <strong style={{ color: "var(--foreground)" }}>
            {NODES.find((n) => n.id === hoveredId)?.label}{" "}
            {NODES.find((n) => n.id === hoveredId)?.sublabel ?? ""}
          </strong>
        </div>
      )}
    </div>
  );
};

export default ConceptMap;
