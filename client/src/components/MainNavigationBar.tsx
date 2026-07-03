/**
 * DESIGN: Nexus Command Center — Balanced & Refined
 * Component: Main Navigation Bar
 * 
 * Dark navy navigation bar with geometric amber logo, uppercase letter-spaced tabs,
 * minimal borders, and clear active state indicators. Responsive with mobile menu.
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  BookOpen,
  BarChart3,
  FileText,
  Upload,
  Zap,
  Sparkles,
  Tag,
  User,
  Calendar,
} from "lucide-react";
import QuickImportModal from "./QuickImportModal";
import { useFeatureFlag } from "@/lib/flags";

interface NavItem {
  label: string;
  route: string;
  icon: React.ReactNode;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    route: "/dashboard",
    icon: <Home size={18} />,
    description: "Main hub",
  },
  {
    label: "Lessons",
    route: "/lessons",
    icon: <BookOpen size={18} />,
    description: "Core concepts",
  },
  {
    label: "Question Bank",
    route: "/question-bank",
    icon: <BarChart3 size={18} />,
    description: "1,000+ questions",
  },
  {
    label: "Curriculum",
    route: "/curriculum",
    icon: <FileText size={18} />,
    description: "30-chapter guide",
  },
  {
    label: "AI Plan",
    route: "/lesson-plan-generator",
    icon: <Sparkles size={18} />,
    description: "Generate study plan",
  },
  {
    label: "Import",
    route: "/import",
    icon: <Upload size={18} />,
    description: "CSV upload",
  },
  {
    label: "Tags",
    route: "/tag-manager",
    icon: <Tag size={18} />,
    description: "Organize questions",
  },
  {
    label: "About",
    route: "/about",
    icon: <User size={18} />,
    description: "Hire Devaney",
  },
];

export default function MainNavigationBar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { enabled: showBookingCta } = useFeatureFlag("booking_cta");

  const isActive = (route: string) => {
    return location.startsWith(route.split("/").slice(0, 2).join("/"));
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav
        className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 border-b"
        style={{
          background: "#1F1F1F",
          borderColor: "#111111",
          borderWidth: "1.5px",
        }}
      >
        {/* Logo/Brand — N-mark submark */}
        <div className="flex items-center gap-2.5">
          {/* Distinctive N-mark: two vertical bars connected by a diagonal — monogram submark */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="LSAT Nexus logo mark"
          >
            {/* Outer square border */}
            <rect x="1" y="1" width="26" height="26" rx="2" fill="#EFA01C" />
            {/* N letterform: left vertical, diagonal, right vertical — white on amber */}
            <path
              d="M7 21V7L21 21V7"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontWeight: 900,
              fontSize: "0.9rem",
              color: "var(--nexus-amber)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            LSAT Nexus
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex items-center gap-0">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.route);
            return (
              <Link
                key={item.route}
                href={item.route}
                className="px-2.5 py-2 flex items-center gap-1.5 transition-all duration-200 relative group whitespace-nowrap"
                style={{
                  color: active ? "var(--nexus-amber)" : "#CCCCCC",
                  fontSize: "0.72rem",
                  fontFamily: "'Archivo', sans-serif",
                  fontWeight: active ? 700 : 500,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  borderBottom: active ? "2.5px solid var(--nexus-amber)" : "2.5px solid transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#CCCCCC";
                  }
                }}
              >
                <span style={{ color: "inherit", display: "flex", alignItems: "center" }}>
                  {item.icon && <span style={{ transform: "scale(0.85)", display: "inline-flex" }}>{item.icon}</span>}
                </span>
                <span>{item.label}</span>

                {/* Tooltip on hover */}
                {item.description && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{
                      background: "#111111",
                      color: "var(--nexus-amber)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.7rem",
                      fontFamily: "'Archivo', sans-serif",
                      whiteSpace: "nowrap",
                      border: "1px solid var(--nexus-amber)",
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Book a Session CTA — gated by booking_cta feature flag */}
          {showBookingCta && (<Link
            href="/booking"
            className="px-4 py-2 flex items-center gap-2 transition-all duration-200 font-semibold"
            style={{
              background: "var(--nexus-amber)",
              color: "#111111",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "0.85rem",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              border: "1.5px solid var(--nexus-amber)",
              borderRadius: "0.25rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d98a0b";
              e.currentTarget.style.borderColor = "#d98a0b";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(239, 160, 28, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--nexus-amber)";
              e.currentTarget.style.borderColor = "var(--nexus-amber)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Calendar size={16} />
            Book
          </Link>)}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 flex items-center gap-2 transition-all duration-200"
            style={{
              color: "#111111",
              background: "var(--nexus-teal)",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              border: "1.5px solid var(--nexus-teal)",
              borderRadius: "0.25rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#158a99";
              e.currentTarget.style.borderColor = "#158a99";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(26, 171, 188, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--nexus-teal)";
              e.currentTarget.style.borderColor = "var(--nexus-teal)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Upload size={16} />
            Import
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav
        className="md:hidden sticky top-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{
          background: "#1F1F1F",
          borderColor: "#111111",
          borderWidth: "1.5px",
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="LSAT Nexus logo mark"
          >
            <rect x="1" y="1" width="26" height="26" rx="2" fill="#EFA01C" />
            <path
              d="M7 21V7L21 21V7"
              stroke="#111111"
              strokeWidth="2.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontWeight: 900,
              fontSize: "0.85rem",
              color: "var(--nexus-amber)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            LSAT Nexus
          </span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ color: "var(--nexus-amber)" }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-14 left-0 right-0 z-40 border-b"
            style={{
              background: "#1F1F1F",
              borderColor: "#111111",
              borderWidth: "1.5px",
            }}
          >
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.route);
                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    className="px-4 py-3 flex items-center gap-3 transition-all duration-200 border-b"
                    style={{
                      color: active ? "var(--nexus-amber)" : "#CCCCCC",
                      background: active ? "rgba(239, 160, 28, 0.1)" : "transparent",
                      borderColor: "#333333",
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: active ? 600 : 500,
                      letterSpacing: "0.02em",
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span style={{ color: "inherit" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/booking"
                className="px-4 py-3 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: "var(--nexus-amber)",
                  color: "#111111",
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar size={18} />
                Book a Session
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
}
