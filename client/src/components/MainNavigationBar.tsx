/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Component: Main Navigation Bar
 * 
 * Top navigation bar with links to Dashboard, Lessons, Question Bank,
 * Curriculum Guide, and CSV Import Manager. Responsive with mobile menu.
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
  Library,
} from "lucide-react";
import QuickImportModal from "./QuickImportModal";

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
    label: "Knowledgebase",
    route: "/knowledgebase",
    icon: <Library size={18} />,
    description: "LSAT concept reference",
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

  const isActive = (route: string) => {
    return location.startsWith(route.split("/").slice(0, 2).join("/"));
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav
        className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 border-b shadow-sm"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            L
          </div>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--foreground)",
            }}
          >
            LSAT Mastery
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.route);
            return (
              <Link
                key={item.route}
                href={item.route}
                className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 relative group"
                style={{
                  color: active ? "var(--primary)" : "var(--foreground)",
                  background: active ? "rgba(0, 102, 255, 0.1)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(45, 27, 105, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ color: active ? "var(--primary)" : "inherit" }}>
                  {item.icon}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}

                {/* Tooltip on hover */}
                {item.description && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{
                      background: "var(--foreground)",
                      color: "var(--background)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
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
        <div className="flex items-center gap-2">
          {/* Book a Session CTA */}
          <Link
            href="/booking"
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-semibold"
            style={{
              background: "linear-gradient(135deg, #5B4A8A 0%, #7B5EA7 100%)",
              color: "white",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              boxShadow: "0 2px 8px rgba(91,74,138,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(91,74,138,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(91,74,138,0.35)";
            }}
          >
            <Calendar size={16} />
            Book a Session
          </Link>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            style={{
              color: "white",
              background: "var(--primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Upload size={18} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Import CSV
            </span>
          </button>
          <Link
            href="/progress"
            className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            style={{
              color: "var(--foreground)",
              background: "rgba(45, 27, 105, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(45, 27, 105, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(45, 27, 105, 0.05)";
            }}
          >
            <Zap size={18} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Progress
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav
        className="md:hidden sticky top-0 z-50 h-14 flex items-center justify-between px-4 border-b shadow-sm"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "var(--primary)" }}
          >
            L
          </div>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "var(--foreground)",
            }}
          >
            LSAT
          </span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: "var(--foreground)",
            background: "rgba(45, 27, 105, 0.05)",
          }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-14 left-0 right-0 z-40 border-b shadow-lg"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex flex-col">
              {NAV_ITEMS.map((item, idx) => {
                const active = isActive(item.route);
                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 flex items-center gap-3 border-b transition-all duration-200"
                    style={{
                      borderColor: "var(--border)",
                      background: active ? "rgba(0, 102, 255, 0.1)" : "transparent",
                      color: active ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    <span style={{ color: active ? "var(--primary)" : "inherit" }}>
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.75rem",
                            color: "var(--muted-foreground)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Import CSV Button in Mobile Menu */}
              <motion.button
                onClick={() => {
                  setIsImportModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: NAV_ITEMS.length * 0.05 }}
                className="w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 border-b"
                style={{
                  background: "var(--primary)",
                  color: "white",
                  borderColor: "var(--border)",
                }}
              >
                <Upload size={18} />
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  Quick Import
                </div>
              </motion.button>

              {/* Book a Session — Mobile */}
              <Link
                href="/booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 flex items-center gap-3 transition-all duration-200 border-b"
                style={{
                  background: "linear-gradient(135deg, #5B4A8A 0%, #7B5EA7 100%)",
                  color: "white",
                  borderColor: "var(--border)",
                }}
              >
                <Calendar size={18} />
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  Book a Session
                </div>
              </Link>

              {/* Progress Link in Mobile Menu */}
              <Link
                href="/progress"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: "rgba(45, 27, 105, 0.05)",
                  color: "var(--foreground)",
                }}
              >
                <Zap size={18} />
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Progress Tracker
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Import Modal */}
      <QuickImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          console.log("Successfully imported", count, "questions");
        }}
      />
    </>
  );
}
