import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityFormData } from "@/types/sessionPlan";
import { Upload, AlertCircle, CheckCircle, Loader } from "lucide-react";

interface DocumentUploadProps {
  onActivitiesGenerated: (activities: ActivityFormData[]) => void;
}

/**
 * DocumentUpload Component
 * Allows uploading PDF, Word, or text documents
 * Extracts text and generates activities from document content
 */
export default function DocumentUpload({
  onActivitiesGenerated,
}: DocumentUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedActivities, setGeneratedActivities] = useState<ActivityFormData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Extract text from uploaded file
   */
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;

    // Text file
    if (fileType === "text/plain") {
      return await file.text();
    }

    // PDF file
    if (fileType === "application/pdf") {
      try {
        const { getDocument } = await import("pdfjs-dist");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ");
          text += "\n";
        }

        return text;
      } catch (err) {
        throw new Error("Failed to parse PDF. Please ensure it's a valid PDF file.");
      }
    }

    // Word document (.docx) - not supported yet
    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      throw new Error("Word document parsing not yet supported. Please convert to PDF or use a text file.");
    }

    throw new Error("Unsupported file type. Please use PDF or text files.");
  };

  /**
   * Generate activities from extracted text
   */
  const generateActivitiesFromText = (text: string): ActivityFormData[] => {
    const activities: ActivityFormData[] = [];
    const activityTypes: Array<ActivityFormData["type"]> = [
      "instruction",
      "practice",
      "drill",
      "review",
    ];

    // Split by common section markers
    const sections = text
      .split(/\n(?=\d+\.|•|[-*]|[A-Z][A-Z\s]{2,}:)/g)
      .filter((section) => section.trim().length > 20);

    sections.slice(0, 10).forEach((section, index) => {
      const lines = section.split("\n").filter((line) => line.trim());
      const title = lines[0]?.substring(0, 60) || `Activity ${index + 1}`;
      const description = lines.slice(1, 4).join("\n").substring(0, 200);

      activities.push({
        id: Math.random().toString(36).substr(2, 9),
        name: title,
        description: description,
        duration: 15,
        materials: [],
        type: activityTypes[index % activityTypes.length],
      });
    });

    return activities.length > 0
      ? activities
      : [
          {
            id: Math.random().toString(36).substr(2, 9),
            name: "Review Document Content",
            description: "Review and discuss the uploaded document",
            duration: 20,
            materials: [],
            type: "instruction",
          },
        ];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    setGeneratedActivities([]);

    try {
      const text = await extractTextFromFile(file);
      const activities = generateActivitiesFromText(text);
      setGeneratedActivities(activities);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseActivities = () => {
    if (generatedActivities.length > 0) {
      onActivitiesGenerated(generatedActivities);
      setGeneratedActivities([]);
      setIsExpanded(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "#1a1a1a" }}>
          Upload Curriculum Document
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
          <p className="text-sm" style={{ color: "#666" }}>
            Upload a PDF, Word document, or text file. We'll extract key topics and generate activities.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload size={32} style={{ color: "#1a7dff" }} />
              <p className="font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs" style={{ color: "#999" }}>
                PDF, Word (.docx), or Text (.txt)
              </p>
            </label>
          </div>

          {isLoading && (
            <div className="flex gap-2 p-3 rounded bg-blue-50 border border-blue-200">
              <Loader size={16} className="text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
              <p className="text-sm text-blue-700">Processing document...</p>
            </div>
          )}

          {error && (
            <div className="flex gap-2 p-3 rounded bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {generatedActivities.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-2 p-3 rounded bg-green-50 border border-green-200">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Generated {generatedActivities.length} activities from document
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedActivities.map((activity, index) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-semibold text-sm">{index + 1}. {activity.name}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
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
