import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, FileText, Settings } from "lucide-react";
import SessionPlanForm from "@/components/SessionPlanForm";
import SessionPlanPreview from "@/components/SessionPlanPreview";
import OutlineInput from "@/components/OutlineInput";
import DocumentUpload from "@/components/DocumentUpload";
import {
  SessionPlanFormData,
  ActivityFormData,
  SAMPLE_SESSION_PLAN,
} from "@/types/sessionPlan";
import {
  exportSessionPlanAsPDF,
  exportSessionPlanAsJSON,
  exportSessionPlanMaterialsAsCSV,
  printSessionPlan,
} from "@/lib/exportSessionPlan";

/**
 * SessionPlanGenerator Page
 * Main page for creating and managing session plans
 * Workflow: Input (outline/document) → Edit → Preview → Export
 */
export default function SessionPlanGenerator() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"input" | "edit" | "preview">("input");
  
  // Check for lesson query parameter to pre-fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lesson = params.get("lesson");
    if (lesson) {
      // Pre-fill session plan with lesson title
      setSessionPlan((prev) => ({
        ...prev,
        title: `${lesson} Session Plan`,
        description: `Detailed session plan for teaching ${lesson}`,
      }));
      setActiveTab("edit");
    }
  }, []);
  
  const [sessionPlan, setSessionPlan] = useState<SessionPlanFormData>({
    ...SAMPLE_SESSION_PLAN,
    description: SAMPLE_SESSION_PLAN.description || "",
    notes: SAMPLE_SESSION_PLAN.notes || "",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleActivitiesGenerated = (activities: ActivityFormData[]) => {
    setSessionPlan((prev) => ({
      ...prev,
      activities: [...prev.activities, ...activities],
    }));
    setActiveTab("edit");
  };

  const handleFormSubmit = (data: SessionPlanFormData) => {
    setSessionPlan(data);
    setActiveTab("preview");
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportError("");
    try {
      await exportSessionPlanAsPDF(sessionPlan, "Devaney M. Page");
    } catch (error: any) {
      setExportError(error.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportSessionPlanAsJSON(sessionPlan);
    } catch (error: any) {
      setExportError(error.message || "Failed to export JSON");
    }
  };

  const handleExportMaterials = () => {
    try {
      exportSessionPlanMaterialsAsCSV(sessionPlan);
    } catch (error: any) {
      setExportError(error.message || "Failed to export materials");
    }
  };

  const handlePrint = () => {
    printSessionPlan();
  };

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "#ddd" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
              >
                Session Plan Generator
              </h1>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                Create detailed lesson plans from outlines or documents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="input" className="gap-2">
              <FileText size={16} /> Input
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Settings size={16} /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Download size={16} /> Export
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card className="p-6">
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
              >
                Generate Activities
              </h2>
              <p className="mb-6" style={{ color: "#666" }}>
                Choose how you'd like to generate activities for your session plan:
              </p>

              <div className="space-y-6">
                <OutlineInput onActivitiesGenerated={handleActivitiesGenerated} />
                <DocumentUpload onActivitiesGenerated={handleActivitiesGenerated} />
              </div>

              <div className="mt-8 pt-6 border-t" style={{ borderColor: "#ddd" }}>
                <p className="text-sm mb-4" style={{ color: "#666" }}>
                  Or start with the default session plan and customize it:
                </p>
                <Button
                  onClick={() => setActiveTab("edit")}
                  className="w-full"
                  style={{ background: "#1a7dff", color: "#fff" }}
                >
                  Go to Edit Mode
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit">
            <SessionPlanForm
              initialData={sessionPlan}
              onSubmit={handleFormSubmit}
            />
          </TabsContent>

          {/* Preview & Export Tab */}
          <TabsContent value="preview" className="space-y-6">
            {exportError && (
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{exportError}</p>
              </Card>
            )}

            {/* Export Options */}
            <Card className="p-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}
              >
                Export Options
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="gap-2"
                  style={{ background: "#1a7dff", color: "#fff" }}
                >
                  <Download size={16} /> PDF
                </Button>
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="gap-2"
                >
                  <Download size={16} /> JSON
                </Button>
                <Button
                  onClick={handleExportMaterials}
                  variant="outline"
                  className="gap-2"
                >
                  <Download size={16} /> Materials CSV
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText size={16} /> Print
                </Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-white">
              <SessionPlanPreview plan={sessionPlan} tutorName="Devaney M. Page" />
            </Card>

            {/* Back to Edit */}
            <div className="flex gap-3">
              <Button
                onClick={() => setActiveTab("edit")}
                variant="outline"
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex-1"
                style={{ background: "#46e291", color: "#1a1a1a" }}
              >
                {isExporting ? "Exporting..." : "Export as PDF"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
