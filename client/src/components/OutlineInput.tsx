import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityFormData } from "@/types/sessionPlan";
import { AlertCircle, CheckCircle } from "lucide-react";

interface OutlineInputProps {
  onActivitiesGenerated: (activities: ActivityFormData[]) => void;
}

/**
 * OutlineInput Component
 * Parses markdown outlines to generate session activities
 * Supports hierarchical topics that become activities
 */
export default function OutlineInput({
  onActivitiesGenerated,
}: OutlineInputProps) {
  const [outline, setOutline] = useState("");
  const [generatedActivities, setGeneratedActivities] = useState<ActivityFormData[]>([]);
  const [parseError, setParseError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Parse markdown outline into activities
   * Format:
   * # Main Topic (becomes activity name)
   * Description text
   * ## Subtopic (becomes activity description)
   */
  const parseOutline = () => {
    setParseError("");
    setGeneratedActivities([]);

    if (!outline.trim()) {
      setParseError("Please enter an outline");
      return;
    }

    const lines = outline.split("\n").filter((line) => line.trim());
    const activities: ActivityFormData[] = [];
    let currentActivity: Partial<ActivityFormData> | null = null;

    const activityTypes: Array<ActivityFormData["type"]> = [
      "warmup",
      "instruction",
      "practice",
      "drill",
      "review",
    ];
    let typeIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Main topic (# heading) - starts new activity
      if (trimmed.startsWith("# ")) {
        if (currentActivity && currentActivity.name) {
          activities.push({
            id: Math.random().toString(36).substr(2, 9),
            name: currentActivity.name || "",
            description: currentActivity.description || "",
            duration: currentActivity.duration || 15,
            materials: currentActivity.materials || [],
            type: activityTypes[typeIndex % activityTypes.length],
          });
          typeIndex++;
        }

        currentActivity = {
          name: trimmed.replace(/^#+\s+/, "").trim(),
          description: "",
          duration: 15,
          materials: [],
        };
      }
      // Subtopic (## heading) - adds to description
      else if (trimmed.startsWith("## ")) {
        if (currentActivity) {
          const subtitle = trimmed.replace(/^#+\s+/, "").trim();
          currentActivity.description = currentActivity.description
            ? `${currentActivity.description}\n• ${subtitle}`
            : `• ${subtitle}`;
        }
      }
      // Regular text - adds to description
      else if (trimmed && !trimmed.startsWith("#")) {
        if (currentActivity) {
          currentActivity.description = currentActivity.description
            ? `${currentActivity.description}\n${trimmed}`
            : trimmed;
        }
      }
    }

    // Add last activity
    if (currentActivity && currentActivity.name) {
      activities.push({
        id: Math.random().toString(36).substr(2, 9),
        name: currentActivity.name || "",
        description: currentActivity.description || "",
        duration: currentActivity.duration || 15,
        materials: currentActivity.materials || [],
        type: activityTypes[typeIndex % activityTypes.length],
      });
    }

    if (activities.length === 0) {
      setParseError("No activities found. Use # for activity names.");
      return;
    }

    setGeneratedActivities(activities);
  };

  const handleUseActivities = () => {
    if (generatedActivities.length > 0) {
      onActivitiesGenerated(generatedActivities);
      setOutline("");
      setGeneratedActivities([]);
      setIsExpanded(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "#1a1a1a" }}>
          Generate from Outline
        </h3>
        <Button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          size="sm"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2" style={{ color: "#666" }}>
              Enter a markdown outline to auto-generate activities. Use <code className="bg-gray-100 px-1 rounded">#</code> for activity names and <code className="bg-gray-100 px-1 rounded">##</code> for subtopics.
            </p>
            <textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder={`# Warm-up: Review Assumptions
Quick review of assumption types

# Instruction: The Negation Test™
## Framework overview
## Step-by-step methodology

# Practice: Guided Examples
## Simple arguments
## Complex arguments`}
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
              rows={8}
            />
          </div>

          <Button
            type="button"
            onClick={parseOutline}
            className="w-full"
            style={{ background: "#1a7dff", color: "#fff" }}
          >
            Parse Outline
          </Button>

          {parseError && (
            <div className="flex gap-2 p-3 rounded bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{parseError}</p>
            </div>
          )}

          {generatedActivities.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-2 p-3 rounded bg-green-50 border border-green-200">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Generated {generatedActivities.length} activities
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedActivities.map((activity, index) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-semibold text-sm">{index + 1}. {activity.name}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {activity.duration} min • {activity.type}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleUseActivities}
                className="w-full"
                style={{ background: "#46e291", color: "#1a1a1a" }}
              >
                Use These Activities
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
