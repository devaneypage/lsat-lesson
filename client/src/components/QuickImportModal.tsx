/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Component: Quick Import Modal
 * 
 * Modal dialog for quick CSV import of questions directly from the navigation bar.
 * Provides file upload, preview, and import confirmation in a compact interface.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { normalizeImportedAnswer } from "@/lib/questionImport";
import { toast } from "sonner";

interface ImportPreview {
  fileName: string;
  rowCount: number;
  columns: string[];
  preview: Record<string, string>[];
  status: "pending" | "success" | "error";
  message?: string;
}

interface QuickImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
}

export default function QuickImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: QuickImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [parsedData, setParsedData] = useState<Record<string, string>[] | null>(null);

  const importMutation = trpc.questions.import.useMutation();

  const parseCSV = (csvFile: File): Promise<ImportPreview> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          const headers = lines[0].split(",").map((h) => h.trim());

          const previewData: Record<string, string>[] = [];
          const allData: Record<string, string>[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",");
            const row: Record<string, string> = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx]?.trim() || "";
            });
            allData.push(row);
            if (i < 4) {
              previewData.push(row);
            }
          }

          setParsedData(allData);

          resolve({
            fileName: csvFile.name,
            rowCount: Math.max(0, lines.length - 1),
            columns: headers,
            preview: previewData,
            status: "success",
          });
        } catch (error) {
          resolve({
            fileName: csvFile.name,
            rowCount: 0,
            columns: [],
            preview: [],
            status: "error",
            message: "Failed to parse CSV file",
          });
        }
      };
      reader.readAsText(csvFile);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsProcessing(true);
      const csvPreview = await parseCSV(selectedFile);
      setPreview(csvPreview);
      setIsProcessing(false);
      setShowPreview(true);
    }
  };

  const handleImport = async () => {
    if (!file || !preview || !parsedData) return;

    setImportStatus("processing");

    try {
      // Transform CSV data to match API schema
      const questions = parsedData.map((row) => ({
        question_id: row.question_id || `Q_${Date.now()}_${Math.random()}`,
        question_text: row.question_text || "",
        option_a: row.option_a || "",
        option_b: row.option_b || "",
        option_c: row.option_c || "",
        option_d: row.option_d || "",
        option_e: row.option_e || undefined,
        correct_answer: normalizeImportedAnswer(row.correct_answer),
        explanation: row.explanation || "",
        category: row.category || undefined,
        difficulty: row.difficulty || undefined,
        source: row.source || undefined,
      }));

      const result = await importMutation.mutateAsync({
        fileName: file.name,
        questions,
      });

      setImportStatus("success");
      toast.success(`Successfully imported ${result.importedCount} questions!`);
      onImportSuccess?.(result.importedCount);

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setImportStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import questions";
      toast.error(errorMessage);
      console.error("Import error:", error);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setShowPreview(false);
    setImportStatus("idle");
    setParsedData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <Card
              className="p-6 shadow-2xl"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(0, 102, 255, 0.1)" }}
                  >
                    <Upload size={20} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--foreground)",
                      }}
                    >
                      Quick Import
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.75rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Upload CSV questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              {!showPreview ? (
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <label
                    className="block p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 text-center"
                    style={{
                      borderColor: "var(--border)",
                      background: "rgba(45, 27, 105, 0.02)",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.background =
                        "rgba(0, 102, 255, 0.05)";
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background =
                        "rgba(45, 27, 105, 0.02)";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) {
                        const input = e.currentTarget.querySelector(
                          "input"
                        ) as HTMLInputElement;
                        if (input) {
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(droppedFile);
                          input.files = dataTransfer.files;
                          handleFileSelect({
                            target: input,
                          } as React.ChangeEvent<HTMLInputElement>);
                        }
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Loader size={24} style={{ color: "var(--primary)" }} />
                          </motion.div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.9rem",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            Processing file...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload size={24} style={{ color: "var(--primary)" }} />
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              color: "var(--foreground)",
                            }}
                          >
                            Drag CSV here or click to select
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.8rem",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            Max 10MB, CSV format only
                          </p>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Help Text */}
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(45, 27, 105, 0.05)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>Required columns:</strong> question_id, question_text,
                      option_a, option_b, option_c, option_d, correct_answer,
                      explanation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview Status */}
                  {preview && (
                    <>
                      <div
                        className="p-3 rounded-lg flex items-start gap-3"
                        style={{
                          background:
                            preview.status === "success"
                              ? "rgba(70, 226, 145, 0.1)"
                              : "rgba(184, 64, 48, 0.1)",
                          border:
                            preview.status === "success"
                              ? "1px solid rgba(70, 226, 145, 0.3)"
                              : "1px solid rgba(184, 64, 48, 0.3)",
                        }}
                      >
                        <div
                          style={{
                            color:
                              preview.status === "success"
                                ? "#46e291"
                                : "#b84030",
                          }}
                        >
                          {preview.status === "success" ? (
                            <CheckCircle size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "var(--foreground)",
                            }}
                          >
                            {preview.status === "success"
                              ? "File parsed successfully"
                              : "Error parsing file"}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.8rem",
                              color: "var(--muted-foreground)",
                              marginTop: "0.25rem",
                            }}
                          >
                            {preview.fileName} • {preview.rowCount} rows •{" "}
                            {preview.columns.length} columns
                          </p>
                        </div>
                      </div>

                      {/* Preview Table */}
                      {preview.preview.length > 0 && (
                        <div
                          className="p-3 rounded-lg border overflow-x-auto"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            <div
                              className="font-bold mb-2 pb-2 border-b"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--primary)",
                              }}
                            >
                              {preview.columns.slice(0, 3).join(" • ")}
                              {preview.columns.length > 3 ? " •..." : ""}
                            </div>
                            {preview.preview.slice(0, 2).map((row, idx) => (
                              <div key={idx} className="mb-1 text-ellipsis overflow-hidden">
                                <span style={{ color: "var(--muted-foreground)" }}>
                                  {Object.values(row)
                                    .slice(0, 3)
                                    .map((v) => v.substring(0, 15))
                                    .join(" • ")}
                                  {preview.columns.length > 3 ? " •..." : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => setShowPreview(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleImport}
                          disabled={
                            importStatus === "processing" ||
                            preview.status !== "success" ||
                            importMutation.isPending
                          }
                          className="flex-1"
                          style={{
                            background:
                              importStatus === "success"
                                ? "#46e291"
                                : "var(--primary)",
                            color:
                              importStatus === "success"
                                ? "#1E2130"
                                : "white",
                          }}
                        >
                          {importStatus === "processing" || importMutation.isPending ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Loader size={16} />
                            </motion.div>
                          ) : importStatus === "success" ? (
                            <>
                              <CheckCircle size={16} />
                              Imported!
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              Import
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
