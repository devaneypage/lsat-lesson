/**
 * CSV Import Manager Page
 * User-friendly interface for uploading questions and curriculum CSV files
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  BookOpen,
  ArrowRight,
  Eye,
  Trash2,
} from "lucide-react";

interface ImportPreview {
  fileName: string;
  rowCount: number;
  columns: string[];
  preview: Record<string, string>[];
  status: "pending" | "success" | "error";
  message?: string;
}

export default function CSVImportManager() {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [questionsPreview, setQuestionsPreview] =
    useState<ImportPreview | null>(null);
  const [curriculumPreview, setCurriculumPreview] =
    useState<ImportPreview | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "curriculum">(
    "questions"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCSV = (file: File): Promise<ImportPreview> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          const headers = lines[0].split(",").map((h) => h.trim());

          const preview: Record<string, string>[] = [];
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            const values = lines[i].split(",");
            const row: Record<string, string> = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx]?.trim() || "";
            });
            preview.push(row);
          }

          resolve({
            fileName: file.name,
            rowCount: Math.max(0, lines.length - 1),
            columns: headers,
            preview,
            status: "success",
          });
        } catch (error) {
          resolve({
            fileName: file.name,
            rowCount: 0,
            columns: [],
            preview: [],
            status: "error",
            message: "Failed to parse CSV file",
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleQuestionsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestionsFile(file);
      setIsProcessing(true);
      const preview = await parseCSV(file);
      setQuestionsPreview(preview);
      setIsProcessing(false);
    }
  };

  const handleCurriculumUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurriculumFile(file);
      setIsProcessing(true);
      const preview = await parseCSV(file);
      setCurriculumPreview(preview);
      setIsProcessing(false);
    }
  };

  const handleImport = async (type: "questions" | "curriculum") => {
    const file = type === "questions" ? questionsFile : curriculumFile;
    const preview = type === "questions" ? questionsPreview : curriculumPreview;

    if (!file || !preview) return;

    setIsProcessing(true);
    // Simulate import process
    setTimeout(() => {
      if (type === "questions") {
        setQuestionsPreview({
          ...preview,
          status: "success",
          message: `Successfully imported ${preview.rowCount} questions!`,
        });
      } else {
        setCurriculumPreview({
          ...preview,
          status: "success",
          message: `Successfully imported ${preview.rowCount} chapters!`,
        });
      }
      setIsProcessing(false);
    }, 1500);
  };

  const downloadTemplate = (type: "questions" | "curriculum") => {
    const templates = {
      questions: `id,type,section,difficulty,topic,stimulus,questionText,optionA,optionB,optionC,optionD,optionE,correctAnswer,explanation,source
Q001,Necessary Assumption,LR,Intermediate,Assumptions,"The city council decided to ban plastic bags because they harm marine life.","Which of the following is an assumption upon which the argument depends?","The council values environmental protection more than job preservation","Plastic bags are the primary cause of marine pollution","The council has considered the economic impact of the ban","Marine life is more important than human employment","Reducing plastic bags will have minimal impact on the economy",A,"The argument assumes that environmental protection outweighs job concerns.",LSAT PrepPlus 2024`,
      curriculum: `id,number,title,part,description,estimatedHours,difficulty,topics,relatedLessons,relatedQuestions,source
CH001,1,Introduction to Logical Reasoning,Part 1,Overview of LSAT structure and logical reasoning fundamentals,2,Foundational,"LSAT Overview, Argument Structure, Main Point",Necessary Assumptions,15,Study Master Guide
CH002,2,Formal Logic Foundations,Part 1,Logical notation, conditionals, and quantifiers,3,Foundational,"Logical Notation, Conditionals, Quantifiers",Formal Logic Fundamentals,20,Study Master Guide`,
    };

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(templates[type])
    );
    element.setAttribute(
      "download",
      `${type}_template.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2D3561] mb-2">
            CSV Import Manager
          </h1>
          <p className="text-[#4A5578]">
            Upload your questions and curriculum data to populate the platform
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "questions"
                ? "bg-[#0052CC] text-white"
                : "bg-white text-[#2D3561] border-2 border-[#E8E6E1]"
            }`}
          >
            <FileText className="inline mr-2 w-4 h-4" />
            Import Questions
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "curriculum"
                ? "bg-[#0052CC] text-white"
                : "bg-white text-[#2D3561] border-2 border-[#E8E6E1]"
            }`}
          >
            <BookOpen className="inline mr-2 w-4 h-4" />
            Import Curriculum
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="p-8 bg-white border-2 border-dashed border-[#0052CC]">
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#0052CC] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#2D3561] mb-2">
                  Upload Questions CSV
                </h2>
                <p className="text-[#4A5578] mb-6">
                  Drag and drop your CSV file or click to browse
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleQuestionsUpload}
                    className="hidden"
                  />
                  <span className="px-8 py-3 bg-[#0052CC] text-white rounded-lg font-semibold cursor-pointer hover:bg-[#003D99] transition-colors inline-block">
                    Choose File
                  </span>
                </label>

                <p className="text-sm text-[#4A5578] mt-4">
                  or{" "}
                  <button
                    onClick={() => downloadTemplate("questions")}
                    className="text-[#0052CC] font-semibold hover:underline"
                  >
                    download the template
                  </button>
                </p>
              </div>
            </Card>

            {/* Preview */}
            {questionsPreview && (
              <Card className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {questionsPreview.status === "success" ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-bold text-[#2D3561]">
                        {questionsPreview.fileName}
                      </h3>
                      <p className="text-sm text-[#4A5578]">
                        {questionsPreview.rowCount} rows detected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setQuestionsFile(null);
                      setQuestionsPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Columns */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-[#2D3561] mb-2">
                    Columns Detected:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {questionsPreview.columns.map((col) => (
                      <span
                        key={col}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Table */}
                {questionsPreview.preview.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-[#2D3561] mb-2">
                      Preview (first 5 rows):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {questionsPreview.columns.slice(0, 5).map((col) => (
                              <th
                                key={col}
                                className="px-3 py-2 text-left font-semibold text-[#2D3561] border border-[#E8E6E1]"
                              >
                                {col}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-left font-semibold text-[#2D3561] border border-[#E8E6E1]">
                              ...
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {questionsPreview.preview.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {questionsPreview.columns.slice(0, 5).map((col) => (
                                <td
                                  key={col}
                                  className="px-3 py-2 text-[#4A5578] border border-[#E8E6E1] truncate max-w-xs"
                                >
                                  {row[col]}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-[#4A5578] border border-[#E8E6E1]">
                                ...
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import Button */}
                <Button
                  onClick={() => handleImport("questions")}
                  disabled={isProcessing || questionsPreview.status !== "success"}
                  className="w-full bg-[#0052CC] text-white hover:bg-[#003D99] font-semibold py-3 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin">⏳</div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Import {questionsPreview.rowCount} Questions
                    </>
                  )}
                </Button>

                {questionsPreview.message && (
                  <p className="text-center text-sm text-green-600 mt-3 font-semibold">
                    {questionsPreview.message}
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="p-8 bg-white border-2 border-dashed border-[#0052CC]">
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#0052CC] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#2D3561] mb-2">
                  Upload Curriculum CSV
                </h2>
                <p className="text-[#4A5578] mb-6">
                  Drag and drop your CSV file or click to browse
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCurriculumUpload}
                    className="hidden"
                  />
                  <span className="px-8 py-3 bg-[#0052CC] text-white rounded-lg font-semibold cursor-pointer hover:bg-[#003D99] transition-colors inline-block">
                    Choose File
                  </span>
                </label>

                <p className="text-sm text-[#4A5578] mt-4">
                  or{" "}
                  <button
                    onClick={() => downloadTemplate("curriculum")}
                    className="text-[#0052CC] font-semibold hover:underline"
                  >
                    download the template
                  </button>
                </p>
              </div>
            </Card>

            {/* Preview */}
            {curriculumPreview && (
              <Card className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {curriculumPreview.status === "success" ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-bold text-[#2D3561]">
                        {curriculumPreview.fileName}
                      </h3>
                      <p className="text-sm text-[#4A5578]">
                        {curriculumPreview.rowCount} rows detected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurriculumFile(null);
                      setCurriculumPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Columns */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-[#2D3561] mb-2">
                    Columns Detected:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {curriculumPreview.columns.map((col) => (
                      <span
                        key={col}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Table */}
                {curriculumPreview.preview.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-[#2D3561] mb-2">
                      Preview (first 5 rows):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {curriculumPreview.columns.slice(0, 5).map((col) => (
                              <th
                                key={col}
                                className="px-3 py-2 text-left font-semibold text-[#2D3561] border border-[#E8E6E1]"
                              >
                                {col}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-left font-semibold text-[#2D3561] border border-[#E8E6E1]">
                              ...
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {curriculumPreview.preview.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {curriculumPreview.columns.slice(0, 5).map((col) => (
                                <td
                                  key={col}
                                  className="px-3 py-2 text-[#4A5578] border border-[#E8E6E1] truncate max-w-xs"
                                >
                                  {row[col]}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-[#4A5578] border border-[#E8E6E1]">
                                ...
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import Button */}
                <Button
                  onClick={() => handleImport("curriculum")}
                  disabled={isProcessing || curriculumPreview.status !== "success"}
                  className="w-full bg-[#0052CC] text-white hover:bg-[#003D99] font-semibold py-3 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin">⏳</div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Import {curriculumPreview.rowCount} Chapters
                    </>
                  )}
                </Button>

                {curriculumPreview.message && (
                  <p className="text-center text-sm text-green-600 mt-3 font-semibold">
                    {curriculumPreview.message}
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-[#2D3561] mb-4">
            Need Help?
          </h2>
          <p className="text-[#4A5578] mb-4">
            Check the import guide for detailed instructions on preparing your
            CSV files.
          </p>
          <Button className="bg-[#0052CC] text-white hover:bg-[#003D99]">
            <Eye className="w-4 h-4 mr-2" />
            View Import Guide
          </Button>
        </Card>
      </div>
    </div>
  );
}
