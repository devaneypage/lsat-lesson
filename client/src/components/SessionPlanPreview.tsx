import { SessionPlanFormData, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_COLORS } from "@/types/sessionPlan";
import { Card } from "@/components/ui/card";
import { Clock, BookOpen, Package } from "lucide-react";

interface SessionPlanPreviewProps {
  plan: SessionPlanFormData;
  tutorName?: string;
}

/**
 * SessionPlanPreview Component
 * Displays a formatted session plan for review and printing
 * Designed to be print-friendly and professional
 */
export default function SessionPlanPreview({
  plan,
  tutorName = "Your Name",
}: SessionPlanPreviewProps) {
  const totalDuration = plan.activities.reduce((sum, a) => sum + a.duration, 0);

  return (
    <div
      id="session-plan-preview"
      className="w-full max-w-4xl mx-auto p-8 bg-white"
      style={{ color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2" style={{ borderColor: "#1a7dff" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
            >
              {plan.title}
            </h1>
            {plan.description && (
              <p className="text-base" style={{ color: "#666" }}>
                {plan.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "#666" }}>
              Instructor: <span className="font-semibold">{tutorName}</span>
            </p>
            <p className="text-sm" style={{ color: "#666" }}>
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: "#1a7dff" }} />
            <div>
              <p className="text-xs" style={{ color: "#666" }}>
                Duration
              </p>
              <p className="font-semibold">{plan.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={18} style={{ color: "#1a7dff" }} />
            <div>
              <p className="text-xs" style={{ color: "#666" }}>
                Activities
              </p>
              <p className="font-semibold">{plan.activities.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package size={18} style={{ color: "#1a7dff" }} />
            <div>
              <p className="text-xs" style={{ color: "#666" }}>
                Materials
              </p>
              <p className="font-semibold">{plan.materials.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8">
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
        >
          Learning Objectives
        </h2>
        <ul className="space-y-2">
          {plan.objectives.map((objective, index) => (
            <li key={index} className="flex gap-3">
              <span
                className="font-bold min-w-fit"
                style={{ color: "#1a7dff" }}
              >
                {index + 1}.
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities Timeline */}
      <div className="mb-8">
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
        >
          Session Timeline
        </h2>

        <div className="space-y-3">
          {plan.activities.map((activity, index) => {
            const cumulativeTime = plan.activities
              .slice(0, index)
              .reduce((sum, a) => sum + a.duration, 0);

            return (
              <div key={activity.id} className="border-l-4 pl-4 py-2" style={{ borderColor: ACTIVITY_TYPE_COLORS[activity.type] }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
                    >
                      {index + 1}. {activity.name}
                    </p>
                    <p className="text-sm" style={{ color: "#666" }}>
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right min-w-fit ml-4">
                    <div
                      className="px-3 py-1 rounded text-xs font-semibold text-white"
                      style={{ background: ACTIVITY_TYPE_COLORS[activity.type] }}
                    >
                      {ACTIVITY_TYPE_LABELS[activity.type]}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#666" }}>
                      {cumulativeTime}–{cumulativeTime + activity.duration} min
                    </p>
                    <p className="text-xs font-semibold">{activity.duration} min</p>
                  </div>
                </div>

                {activity.materials.length > 0 && (
                  <div className="text-xs mt-2" style={{ color: "#666" }}>
                    <span className="font-semibold">Materials:</span>{" "}
                    {activity.materials.join(", ")}
                  </div>
                )}

                {activity.notes && (
                  <div className="text-xs mt-2 italic" style={{ color: "#999" }}>
                    <span className="font-semibold">Note:</span> {activity.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t-2" style={{ borderColor: "#ddd" }}>
          <p className="text-sm font-semibold">
            Total Activity Time:{" "}
            <span style={{ color: "#1a7dff" }}>
              {totalDuration} / {plan.duration} minutes
            </span>
          </p>
          {totalDuration < plan.duration && (
            <p className="text-xs" style={{ color: "#666" }}>
              Buffer time: {plan.duration - totalDuration} minutes
            </p>
          )}
        </div>
      </div>

      {/* Materials Checklist */}
      {plan.materials.length > 0 && (
        <div className="mb-8">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
          >
            Required Materials Checklist
          </h2>

          <div className="space-y-2">
            {plan.materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-3 border rounded"
                style={{ borderColor: "#ddd", background: "#f9f9f9" }}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: "#1a7dff" }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{material.name}</p>
                  {material.notes && (
                    <p className="text-sm" style={{ color: "#666" }}>
                      {material.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{material.quantity}</p>
                  {material.unit && (
                    <p className="text-xs" style={{ color: "#666" }}>
                      {material.unit}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {plan.notes && (
        <div className="mb-8 p-4 rounded" style={{ background: "#f0f4ff", borderLeft: "4px solid #1a7dff" }}>
          <h3
            className="font-semibold mb-2"
            style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
          >
            Preparation Notes
          </h3>
          <p className="text-sm" style={{ color: "#666", whiteSpace: "pre-wrap" }}>
            {plan.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-12 pt-6 border-t text-center text-xs"
        style={{ borderColor: "#ddd", color: "#999" }}
      >
        <p>Generated by LSAT Mastery Session Plan Generator</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
