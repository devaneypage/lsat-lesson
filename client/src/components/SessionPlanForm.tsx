import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import {
  SessionPlanFormData,
  ActivityFormData,
  MaterialFormData,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_COLORS,
  SessionPlanSchema,
} from "@/types/sessionPlan";

interface SessionPlanFormProps {
  initialData?: SessionPlanFormData;
  onSubmit: (data: SessionPlanFormData) => void;
  isLoading?: boolean;
}

/**
 * SessionPlanForm Component
 * Form for creating and editing session plans with:
 * - Session metadata (title, duration, objectives)
 * - Dynamic activities (add/remove with timing)
 * - Dynamic materials (add/remove with quantities)
 * - Full validation
 */
export default function SessionPlanForm({
  initialData,
  onSubmit,
  isLoading = false,
}: SessionPlanFormProps) {
  const [formData, setFormData] = useState<SessionPlanFormData>(
    initialData || {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      description: "",
      duration: 60,
      objectives: [""],
      activities: [
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "",
          description: "",
          duration: 15,
          materials: [],
          type: "instruction",
        },
      ],
      materials: [],
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidation = () => {
    try {
      SessionPlanSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
      onSubmit(formData);
    }
  };

  // Session metadata handlers
  const updateSessionField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  // Objective handlers
  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  // Activity handlers
  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "",
          description: "",
          duration: 15,
          materials: [],
          type: "instruction" as const,
        },
      ],
    }));
  };

  const updateActivity = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      ),
    }));
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  // Material handlers
  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "",
          quantity: 1,
          unit: "",
          notes: "",
        },
      ],
    }));
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((material, i) =>
        i === index ? { ...material, [field]: value } : material
      ),
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const totalActivityDuration = formData.activities.reduce(
    (sum, activity) => sum + activity.duration,
    0
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Session Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#1a1a1a" }}>
          Session Details
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#4a4a4a" }}>
              Session Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateSessionField("title", e.target.value)}
              placeholder="e.g., Necessary Assumptions Deep Dive"
              className="w-full"
            />
            {errors["title"] && <p className="text-red-500 text-sm mt-1">{errors["title"]}</p>}
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4a4a4a" }}>
                Session Duration (minutes) *
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => updateSessionField("duration", parseInt(e.target.value))}
                min={5}
                max={480}
                className="w-full"
              />
              {errors["duration"] && <p className="text-red-500 text-sm mt-1">{errors["duration"]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4a4a4a" }}>
                Activity Duration Total
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300">
                <p className="font-semibold" style={{ color: "#1a7dff" }}>
                  {totalActivityDuration} min
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#4a4a4a" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateSessionField("description", e.target.value)}
              placeholder="Brief description of the session"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#4a4a4a" }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateSessionField("notes", e.target.value)}
              placeholder="Any additional notes or preparation instructions"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Learning Objectives */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#1a1a1a" }}>
            Learning Objectives
          </h3>
          <Button
            type="button"
            onClick={addObjective}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus size={16} /> Add Objective
          </Button>
        </div>

        <div className="space-y-3">
          {formData.objectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                placeholder={`Objective ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => removeObjective(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Activities */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#1a1a1a" }}>
            Activities
          </h3>
          <Button
            type="button"
            onClick={addActivity}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus size={16} /> Add Activity
          </Button>
        </div>

        <div className="space-y-4">
          {formData.activities.map((activity, index) => (
            <Card key={activity.id} className="p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Input
                    value={activity.name}
                    onChange={(e) => updateActivity(index, "name", e.target.value)}
                    placeholder="Activity name"
                    className="font-semibold mb-2"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeActivity(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#4a4a4a" }}>
                    Type
                  </label>
                  <select
                    value={activity.type}
                    onChange={(e) =>
                      updateActivity(index, "type", e.target.value as any)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#4a4a4a" }}>
                    Duration (min)
                  </label>
                  <Input
                    type="number"
                    value={activity.duration}
                    onChange={(e) =>
                      updateActivity(index, "duration", parseInt(e.target.value))
                    }
                    min={1}
                    max={480}
                    className="text-sm"
                  />
                </div>

                <div
                  className="px-2 py-1 rounded flex items-center justify-center text-sm font-semibold"
                  style={{
                    background: ACTIVITY_TYPE_COLORS[activity.type],
                    color: "#fff",
                  }}
                >
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </div>
              </div>

              <textarea
                value={activity.description}
                onChange={(e) => updateActivity(index, "description", e.target.value)}
                placeholder="Activity description"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                rows={2}
              />

              {activity.notes && (
                <textarea
                  value={activity.notes}
                  onChange={(e) => updateActivity(index, "notes", e.target.value)}
                  placeholder="Notes"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  rows={1}
                />
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* Materials */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#1a1a1a" }}>
            Required Materials
          </h3>
          <Button
            type="button"
            onClick={addMaterial}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus size={16} /> Add Material
          </Button>
        </div>

        <div className="space-y-3">
          {formData.materials.map((material, index) => (
            <div key={material.id} className="grid grid-cols-12 gap-2 items-end">
              <Input
                value={material.name}
                onChange={(e) => updateMaterial(index, "name", e.target.value)}
                placeholder="Material name"
                className="col-span-5"
              />
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) => updateMaterial(index, "quantity", parseInt(e.target.value))}
                min={1}
                className="col-span-2"
              />
              <Input
                value={material.unit}
                onChange={(e) => updateMaterial(index, "unit", e.target.value)}
                placeholder="e.g., copies"
                className="col-span-3"
              />
              <Button
                type="button"
                onClick={() => removeMaterial(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 col-span-2"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          style={{ background: "#1a7dff", color: "#fff" }}
        >
          {isLoading ? "Saving..." : "Save Session Plan"}
        </Button>
      </div>
    </form>
  );
}
