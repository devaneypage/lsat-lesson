/**
 * DESIGN: Nexus Command Center — Concept Map
 * Component: ConceptMap
 *
 * Interactive visual representation of LSAT concept hierarchy.
 * P7 fix: Reorganized into two semantic clusters — LR (left) and RC/Logic (right).
 *   - LR cluster: Necessary Assumptions, Sufficient Assumptions, Flaw, Common Flaws, Strengthen/Weaken
 *   - RC/Logic cluster: Reading Comprehension, Formal Logic
 *   - Central LSAT diamond connects to both cluster headers
 * P2 fix: All nodes are clickable with hover scale + glow.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";

interface ConceptNode {
  id: string;
  label: string;
  sublabel?: string;
  shape: "rect" | "circle" | "diamond" | "oval";
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  r?: number;
  color: string;
  textColor: string;
  route: string;
  cluster?: "LR" | "RC" | "center";
}

// SVG viewport: 860 × 540
// Layout: center diamond at (430, 270)
// LR cluster header at (200, 130), RC cluster header at (660, 130)
// LR nodes fan below-left, RC/Logic nodes below-right
const NODES: ConceptNode[] = [
  // ── Center ──────────────────────────────────────────────
  {
    id: "center",
    label: "LSAT",
    sublabel: "Nexus",
    shape: "diamond",
    cx: 430,
    cy: 270,
    w: 100,
    h: 100,
    color: "var(--nexus-forest)",
    textColor: "#FFFDF8",
    route: "/lessons",
    cluster: "center",
  },

  // ── LR Cluster Header ────────────────────────────────────
  {
    id: "lr-header",
    label: "Logical",
    sublabel: "Reasoning",
    shape: "rect",
    cx: 200,
    cy: 120,
    w: 140,
    h: 52,
    color: "var(--nexus-teal)",
    textColor: "#FFFDF8",
    route: "/lessons/necessary-assumptions",
    cluster: "LR",
  },

  // ── LR Leaf Nodes ────────────────────────────────────────
  {
    id: "necessary-assumptions",
    label: "Necessary",
    sublabel: "Assumptions",
    shape: "circle",
    cx: 80,
    cy: 240,
    r: 44,
    color: "var(--nexus-amber)",
    textColor: "#111111",
    route: "/lessons/necessary-assumptions",
    cluster: "LR",
  },
  {
    id: "sufficient-assumptions",
    label: "Sufficient",
    sublabel: "Assumptions",
    shape: "circle",
    cx: 80,
    cy: 370,
    r: 44,
    color: "var(--nexus-teal)",
    textColor: "#FFFDF8",
    route: "/lessons/sufficient-assumptions",
    cluster: "LR",
  },
  {
    id: "flaw-in-reasoning",
    label: "Flaw in",
    sublabel: "Reasoning",
    shape: "circle",
    cx: 220,
    cy: 450,
    r: 44,
    color: "var(--nexus-terra)",
    textColor: "#FFFDF8",
    route: "/lessons/flaw-in-reasoning",
    cluster: "LR",
  },
  {
    id: "common-flaws",
    label: "Common",
    sublabel: "Flaws",
    shape: "circle",
    cx: 360,
    cy: 460,
    r: 40,
    color: "var(--nexus-lime)",
    textColor: "#FFFDF8",
    route: "/lessons/common-flaws",
    cluster: "LR",
  },
  {
    id: "strengthen-weaken",
    label: "Strengthen",
    sublabel: "& Weaken",
    shape: "circle",
    cx: 200,
    cy: 330,
    r: 40,
    color: "var(--nexus-forest)",
    textColor: "#FFFDF8",
    route: "/lessons/strengthen-weaken",
    cluster: "LR",
  },

  // ── RC/Logic Cluster Header ──────────────────────────────
  {
    id: "rc-header",
    label: "Reading &",
    sublabel: "Logic",
    shape: "rect",
    cx: 660,
    cy: 120,
    w: 140,
    h: 52,
    color: "var(--nexus-blue)",
    textColor: "#FFFDF8",
    route: "/lessons/reading-comprehension",
    cluster: "RC",
  },

  // ── RC/Logic Leaf Nodes ──────────────────────────────────
  {
    id: "reading-comprehension",
    label: "Reading",
    sublabel: "Comprehension",
    shape: "rect",
    cx: 660,
    cy: 280,
    w: 140,
    h: 58,
    color: "var(--nexus-blue)",
    textColor: "#FFFDF8",
    route: "/lessons/reading-comprehension",
    cluster: "RC",
  },
  {
    id: "formal-logic",
    label: "Formal",
    sublabel: "Logic",
    shape: "rect",
    cx: 660,
    cy: 400,
    w: 130,
    h: 54,
    color: "var(--nexus-purple)",
    textColor: "#FFFDF8",
    route: "/lessons/formal-logic",
    cluster: "RC",
  },
];

// Connections: [fromId, toId]
const CONNECTIONS: [string, string][] = [
  // Center → cluster headers
  ["center", "lr-header"],
  ["center", "rc-header"],
  // LR header → LR leaves
  ["lr-header", "necessary-assumptions"],
  ["lr-header", "sufficient-assumptions"],
  ["lr-header", "strengthen-weaken"],
  ["lr-header", "flaw-in-reasoning"],
  ["lr-header", "common-flaws"],
  // RC header → RC/Logic leaves
  ["rc-header", "reading-comprehension"],
  ["rc-header", "formal-logic"],
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

    const baseProps = {
      onClick: () => handleNodeClick(node.route),
      onMouseEnter: () => setHoveredId(node.id),
      onMouseLeave: () => setHoveredId(null),
      style: {
        cursor: "pointer",
        transition: "transform 0.18s ease, filter 0.18s ease",
        transform: `scale(${scale})`,
        transformOrigin: `${node.cx}px ${node.cy}px`,
        filter: isHovered
          ? "drop-shadow(0 3px 8px rgba(0,0,0,0.22))"
          : "none",
      } as React.CSSProperties,
    };

    const labelY = node.sublabel ? node.cy - 7 : node.cy + 5;
    const sublabelY = node.cy + 10;

    if (node.shape === "diamond") {
      const hw = (node.w ?? 80) / 2;
      const hh = (node.h ?? 80) / 2;
      const points = `${node.cx},${node.cy - hh} ${node.cx + hw},${node.cy} ${node.cx},${node.cy + hh} ${node.cx - hw},${node.cy}`;
      return (
        <g key={node.id} {...baseProps}>
          <polygon points={points} fill={node.color} stroke="#111111" strokeWidth="1.5" />
          <text x={node.cx} y={labelY} textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="Archivo Black" fill={node.textColor}>{node.label}</text>
          {node.sublabel && <text x={node.cx} y={sublabelY} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.sublabel}</text>}
        </g>
      );
    }

    if (node.shape === "rect") {
      const hw = (node.w ?? 100) / 2;
      const hh = (node.h ?? 50) / 2;
      return (
        <g key={node.id} {...baseProps}>
          <rect x={node.cx - hw} y={node.cy - hh} width={node.w} height={node.h} rx="3" fill={node.color} stroke="#111111" strokeWidth="1.5" />
          <text x={node.cx} y={labelY} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.label}</text>
          {node.sublabel && <text x={node.cx} y={sublabelY} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.sublabel}</text>}
        </g>
      );
    }

    if (node.shape === "circle") {
      return (
        <g key={node.id} {...baseProps}>
          <circle cx={node.cx} cy={node.cy} r={node.r ?? 40} fill={node.color} stroke="#111111" strokeWidth="1.5" />
          <text x={node.cx} y={labelY} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.label}</text>
          {node.sublabel && <text x={node.cx} y={sublabelY} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.sublabel}</text>}
        </g>
      );
    }

    return null;
  };

  // Cluster background zones
  const LR_ZONE = { x: 20, y: 80, w: 420, h: 440 };
  const RC_ZONE = { x: 560, y: 80, w: 280, h: 360 };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        minHeight: "520px",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
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
      <div style={{ flex: 1 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 860 540"
          style={{ display: "block", minHeight: "380px" }}
          aria-label="LSAT concept map — click a node to navigate to that topic"
        >
          {/* Cluster background zones */}
          <rect
            x={LR_ZONE.x} y={LR_ZONE.y} width={LR_ZONE.w} height={LR_ZONE.h}
            rx="6" fill="var(--nexus-teal)" fillOpacity="0.04"
            stroke="var(--nexus-teal)" strokeOpacity="0.18" strokeWidth="1"
          />
          <text x={LR_ZONE.x + 10} y={LR_ZONE.y + 20} fontSize="10" fontWeight="700"
            fontFamily="Archivo" fill="var(--nexus-teal)" fillOpacity="0.55"
            letterSpacing="0.06em">
          LOGICAL REASONING
          </text>

          <rect
            x={RC_ZONE.x} y={RC_ZONE.y} width={RC_ZONE.w} height={RC_ZONE.h}
            rx="6" fill="var(--nexus-blue)" fillOpacity="0.04"
            stroke="var(--nexus-blue)" strokeOpacity="0.18" strokeWidth="1"
          />
          <text x={RC_ZONE.x + 10} y={RC_ZONE.y + 20} fontSize="10" fontWeight="700"
            fontFamily="Archivo" fill="var(--nexus-blue)" fillOpacity="0.55"
            letterSpacing="0.06em">
            READING &amp; LOGIC
          </text>

          {/* Connection lines */}
          {CONNECTIONS.map(([fromId, toId]) => {
            const from = getNodeCenter(nodeMap[fromId]);
            const to = getNodeCenter(nodeMap[toId]);
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#111111" strokeWidth="1.5" strokeOpacity="0.22"
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
