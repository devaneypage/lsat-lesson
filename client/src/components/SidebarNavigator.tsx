/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Component: Sidebar Navigator
 * 
 * Collapsible sidebar showing lesson structure with active section highlighting.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";

interface SidebarSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface SidebarNavigatorProps {
  lessonTitle: string;
  sections: SidebarSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onClose?: () => void;
}

export default function SidebarNavigator({
  lessonTitle,
  sections,
  activeSection,
  onSectionClick,
  onClose,
}: SidebarNavigatorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 md:hidden p-3 rounded-lg transition-all duration-200"
        style={{
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          boxShadow: "0 4px 12px rgba(0, 102, 255, 0.3)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: "rgba(0, 0, 0, 0.5)" }}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 z-40 h-screen w-64 md:relative md:h-auto md:w-auto md:z-auto overflow-y-auto"
              style={{
                background: "var(--card)",
                borderRight: "1px solid var(--border)",
                boxShadow: "2px 0 8px rgba(45, 27, 105, 0.1)",
              }}
            >
              {/* Header */}
              <div
                className="sticky top-0 p-4 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h3
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.5rem",
                  }}
                >
                  Lesson Sections
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.4,
                  }}
                >
                  {lessonTitle}
                </p>
              </div>

              {/* Sections */}
              <nav className="p-2">
                {sections.map((section, idx) => {
                  const isActive = activeSection === section.id;

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="w-full text-left px-3 py-2 rounded-lg mb-1 transition-all duration-200 relative"
                      style={{
                        background: isActive
                          ? "rgba(0, 102, 255, 0.1)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid var(--primary)"
                          : "3px solid transparent",
                      }}
                      whileHover={{
                        background: isActive
                          ? "rgba(0, 102, 255, 0.15)"
                          : "rgba(45, 27, 105, 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {section.icon && (
                          <span
                            style={{
                              color: isActive
                                ? "var(--primary)"
                                : "var(--muted-foreground)",
                            }}
                          >
                            {section.icon}
                          </span>
                        )}
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.9rem",
                            fontWeight: isActive ? 600 : 400,
                            color: isActive
                              ? "var(--primary)"
                              : "var(--foreground)",
                          }}
                        >
                          {section.title}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                          style={{ background: "var(--primary)" }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
