import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface SessionPlanCTAProps {
  lessonTitle: string;
  lessonDescription?: string;
}

/**
 * SessionPlanCTA Component
 * Call-to-action for generating session plans from lesson content
 * Placed at the end of lesson pages
 */
export default function SessionPlanCTA({
  lessonTitle,
  lessonDescription,
}: SessionPlanCTAProps) {
  const [location, navigate] = useLocation();

  const handleGeneratePlan = () => {
    const encodedLesson = encodeURIComponent(lessonTitle);
    navigate(`/session-plan-generator?lesson=${encodedLesson}`);
  };

  return (
    <Card className="p-6 my-8 border-2" style={{ borderColor: "#1a7dff" }}>
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{ background: "#fff3cd" }}
        >
          <Zap size={24} style={{ color: "#ffb81c" }} />
        </div>

        <div className="flex-1">
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
          >
            Ready to Teach This Lesson?
          </h3>
          <p className="mb-4" style={{ color: "#666" }}>
            Generate a detailed session plan for <strong>{lessonTitle}</strong> with timing, activities, and materials. Perfect for individual or group tutoring.
          </p>
          {lessonDescription && (
            <p className="text-sm mb-4 italic" style={{ color: "#999" }}>
              {lessonDescription}
            </p>
          )}

          <Button
            onClick={handleGeneratePlan}
            className="gap-2"
            style={{ background: "#1a7dff", color: "#fff" }}
          >
            <Zap size={16} /> Generate Session Plan
          </Button>
        </div>
      </div>
    </Card>
  );
}
