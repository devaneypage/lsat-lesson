/**
 * DESIGN: Nexus Command Center — Concept Map
 * Component: ConceptMap
 *
 * Interactive visual representation of LSAT concept hierarchy.
 * P7 fix: Reorganized into two semantic clusters — LR (left) and RC/Logic (right).
 * P2 fix: All nodes are clickable with hover scale + glow.
 * Tooltip enhancement: Hover tooltips show description, mastery level, and duration.
 */

import React, { useState, useRef } from "react";
import { useLocation } from "wouter";

interface TooltipData {
  description: string;
  mastery: number;   // 0–100
  duration: string;
  seq: number;
  group: "LR" | "RC" | "Logic" | "Hub";
}

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
  tooltip?: TooltipData;
}

// SVG viewport: 860 × 540
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
    route: "/learn",
    cluster: "center",
    tooltip: {
      description: "Your LSAT command center. Navigate to any topic or view all lessons.",
      mastery: 0,
      duration: "7 lessons",
      seq: 0,
      group: "Hub",
    },
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
    route: "/learn/necessary-assumptions",
    cluster: "LR",
    tooltip: {
      description: "Logical Reasoning: analyze arguments, identify assumptions, and evaluate evidence. Covers 5 core question types.",
      mastery: 0,
      duration: "5 lessons",
      seq: 0,
      group: "LR",
    },
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
    route: "/learn/necessary-assumptions",
    cluster: "LR",
    tooltip: {
      description: "Master the Negation Test™ to identify unstated premises that an argument cannot function without.",
      mastery: 72,
      duration: "14 min",
      seq: 1,
      group: "LR",
    },
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
    route: "/learn/sufficient-assumptions",
    cluster: "LR",
    tooltip: {
      description: "Master the Conditional Bridge Method to identify assumptions that, if true, guarantee the conclusion.",
      mastery: 65,
      duration: "16 min",
      seq: 2,
      group: "LR",
    },
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
    route: "/learn/flaw-in-reasoning",
    cluster: "LR",
    tooltip: {
      description: "Identify logical fallacies and structural weaknesses in arguments. Prerequisite for Common Flaws.",
      mastery: 58,
      duration: "15 min",
      seq: 3,
      group: "LR",
    },
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
    route: "/learn/common-flaws",
    cluster: "LR",
    tooltip: {
      description: "Learn the 19 most frequently tested logical fallacies with pattern recognition drills.",
      mastery: 45,
      duration: "18 min",
      seq: 4,
      group: "LR",
    },
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
    route: "/learn/strengthen-weaken",
    cluster: "LR",
    tooltip: {
      description: "Develop the systematic approach to finding answers that add or remove support for an argument's conclusion.",
      mastery: 61,
      duration: "16 min",
      seq: 5,
      group: "LR",
    },
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
    route: "/learn/reading-comprehension",
    cluster: "RC",
    tooltip: {
      description: "Reading Comprehension and Formal Logic: passage analysis, inference, and logical notation.",
      mastery: 0,
      duration: "2 lessons",
      seq: 0,
      group: "RC",
    },
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
    route: "/learn/reading-comprehension",
    cluster: "RC",
    tooltip: {
      description: "Master efficient passage annotation, structural mapping, and the 5 core RC question types.",
      mastery: 61,
      duration: "15 min",
      seq: 6,
      group: "RC",
    },
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
    route: "/learn/formal-logic",
    cluster: "RC",
    tooltip: {
      description: "Master logical notation, conditional statements, contrapositive, and quantifiers (all/some/none).",
      mastery: 58,
      duration: "17 min",
      seq: 7,
      group: "Logic",
    },
  },
];

// Connections: [fromId, toId]
const CONNECTIONS: [string, string][] = [
  ["center", "lr-header"],
  ["center", "rc-header"],
  ["lr-header", "necessary-assumptions"],
  ["lr-header", "sufficient-assumptions"],
  ["lr-header", "strengthen-weaken"],
  ["lr-header", "flaw-in-reasoning"],
  ["lr-header", "common-flaws"],
  ["rc-header", "reading-comprehension"],
  ["rc-header", "formal-logic"],
];

const GROUP_LABEL_COLORS: Record<string, string> = {
  LR: "var(--nexus-teal)",
  RC: "var(--nexus-blue)",
  Logic: "var(--nexus-purple)",
  Hub: "var(--nexus-forest)",
};

function getNodeCenter(node: ConceptNode): { x: number; y: number } {
  return { x: node.cx, y: node.cy };
}

function getMasteryLabel(mastery: number): string {
  if (mastery >= 80) return "Proficient";
  if (mastery >= 60) return "Developing";
  if (mastery >= 40) return "Emerging";
  if (mastery > 0)   return "Beginning";
  return "Not started";
}

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return "var(--nexus-teal)";
  if (mastery >= 60) return "var(--nexus-forest)";
  if (mastery >= 40) return "var(--nexus-amber)";
  if (mastery > 0)   return "var(--nexus-terra)";
  return "var(--muted-foreground)";
}

interface TooltipProps {
  node: ConceptNode;
  svgRect: DOMRect | null;
}

const NodeTooltip: React.FC<TooltipProps> = ({ node, svgRect }) => {
  if (!node.tooltip || !svgRect) return null;
  const { description, mastery, duration, seq, group } = node.tooltip;

  // Position tooltip relative to the SVG container
  // SVG is 860 wide; scale to actual rendered width
  const scaleX = svgRect.width / 860;
  const scaleY = svgRect.height / 540;

  // Tooltip appears above the node; clamp to viewport
  const nodeScreenX = svgRect.left + node.cx * scaleX;
  const nodeScreenY = svgRect.top + node.cy * scaleY;

  const tooltipW = 220;
  let left = nodeScreenX - tooltipW / 2;
  // Clamp to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));
  const top = nodeScreenY - (node.r ?? (node.h ?? 50) / 2) * scaleY - 12;

  const isHub = group === "Hub";
  const isHeader = seq === 0 && !isHub;

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        width: tooltipW,
        transform: "translateY(-100%)",
        background: "var(--card)",
        border: `1.5px solid ${node.color}`,
        borderRadius: "0.25rem",
        boxShadow: `0 6px 20px rgba(0,0,0,0.14), 0 0 0 1px ${node.color}22`,
        padding: "0.75rem",
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
        {seq > 0 && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "var(--muted-foreground)",
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            {String(seq).padStart(2, "0")}
          </span>
        )}
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: node.color,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {node.label} {node.sublabel ?? ""}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--muted-foreground)",
          margin: "0 0 0.5rem 0",
          lineHeight: 1.45,
        }}
      >
        {description}
      </p>

      {/* Footer row: mastery + duration */}
      {!isHub && !isHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.4rem",
            marginTop: "0.1rem",
          }}
        >
          {/* Mastery */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div
              style={{
                width: 56,
                height: 4,
                background: "var(--muted)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${mastery}%`,
                  height: "100%",
                  background: getMasteryColor(mastery),
                  borderRadius: "2px",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: getMasteryColor(mastery),
                letterSpacing: "0.03em",
              }}
            >
              {getMasteryLabel(mastery)}
            </span>
          </div>
          {/* Duration */}
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {duration}
          </span>
        </div>
      )}

      {/* Group badge for headers */}
      {isHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.4rem",
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: GROUP_LABEL_COLORS[group] ?? node.color,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {duration}
          </span>
        </div>
      )}
    </div>
  );
};

const ConceptMap: React.FC = () => {
  const [, navigate] = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgRect, setSvgRect] = useState<DOMRect | null>(null);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const hoveredNode = hoveredId ? nodeMap[hoveredId] : null;

  const handleNodeClick = (route: string) => {
    navigate(route);
  };

  const handleMouseEnter = (id: string) => {
    setHoveredId(id);
    if (svgRef.current) {
      setSvgRect(svgRef.current.getBoundingClientRect());
    }
  };

  const renderNode = (node: ConceptNode) => {
    const isHovered = hoveredId === node.id;
    const scale = isHovered ? 1.08 : 1;

    const baseProps = {
      onClick: () => handleNodeClick(node.route),
      onMouseEnter: () => handleMouseEnter(node.id),
      onMouseLeave: () => setHoveredId(null),
      style: {
        cursor: "pointer",
        transition: "transform 0.18s ease, filter 0.18s ease",
        transform: `scale(${scale})`,
        transformOrigin: `${node.cx}px ${node.cy}px`,
        filter: isHovered
          ? `drop-shadow(0 3px 10px ${node.color}60)`
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
          <polygon points={points} fill={node.color} stroke="#111111" strokeWidth={isHovered ? "2" : "1.5"} />
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
          <rect x={node.cx - hw} y={node.cy - hh} width={node.w} height={node.h} rx="3" fill={node.color} stroke="#111111" strokeWidth={isHovered ? "2" : "1.5"} />
          <text x={node.cx} y={labelY} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.label}</text>
          {node.sublabel && <text x={node.cx} y={sublabelY} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Archivo" fill={node.textColor}>{node.sublabel}</text>}
        </g>
      );
    }

    if (node.shape === "circle") {
      return (
        <g key={node.id} {...baseProps}>
          <circle cx={node.cx} cy={node.cy} r={node.r ?? 40} fill={node.color} stroke="#111111" strokeWidth={isHovered ? "2" : "1.5"} />
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
        position: "relative",
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
          Hover for details · Click to navigate
        </p>
      </div>

      {/* Interactive SVG */}
      <div style={{ flex: 1 }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 860 540"
          style={{ display: "block", minHeight: "380px" }}
          aria-label="LSAT concept map — hover a node for details, click to navigate"
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
            const isActive = hoveredId === fromId || hoveredId === toId;
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#111111"
                strokeWidth={isActive ? "2" : "1.5"}
                strokeOpacity={isActive ? "0.45" : "0.22"}
                style={{ transition: "stroke-opacity 0.15s ease, stroke-width 0.15s ease" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(renderNode)}
        </svg>
      </div>

      {/* Portal-style tooltip rendered via fixed positioning */}
      {hoveredNode && hoveredNode.tooltip && (
        <NodeTooltip node={hoveredNode} svgRect={svgRect} />
      )}
    </div>
  );
};

export default ConceptMap;
