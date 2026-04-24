/**
 * Resources Page
 * Downloadable study materials, guides, and tools
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Zap } from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "guide" | "tool";
  icon: React.ReactNode;
  size?: string;
  downloads: number;
  color: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: "lr-framework",
    title: "Logical Reasoning Framework Guide",
    description:
      "Complete guide to argument analysis, assumptions, and common flaws. 45 pages.",
    type: "pdf",
    icon: <FileText className="w-6 h-6" />,
    size: "2.3 MB",
    downloads: 1247,
    color: "#1a7dff",
  },
  {
    id: "rc-strategy",
    title: "Reading Comprehension Strategy",
    description:
      "Passage mapping techniques, question types, and time management. 32 pages.",
    type: "pdf",
    icon: <BookOpen className="w-6 h-6" />,
    size: "1.8 MB",
    downloads: 892,
    color: "#439cdf",
  },
  {
    id: "formal-logic",
    title: "Formal Logic Notation Reference",
    description:
      "Quick reference for logical notation, conditionals, and quantifiers. 12 pages.",
    type: "pdf",
    icon: <Zap className="w-6 h-6" />,
    size: "0.9 MB",
    downloads: 654,
    color: "#46e291",
  },
  {
    id: "study-schedule",
    title: "8-Week Study Schedule",
    description:
      "Customizable study plan with daily goals and weekly milestones.",
    type: "guide",
    icon: <BookOpen className="w-6 h-6" />,
    downloads: 2103,
    color: "#ffdd33",
  },
  {
    id: "question-tracker",
    title: "Question Performance Tracker",
    description:
      "Excel spreadsheet to track your practice question performance and trends.",
    type: "tool",
    icon: <Zap className="w-6 h-6" />,
    size: "0.4 MB",
    downloads: 1456,
    color: "#1a7dff",
  },
  {
    id: "test-checklist",
    title: "Test Day Checklist",
    description:
      "Complete checklist for test day preparation and execution.",
    type: "guide",
    icon: <FileText className="w-6 h-6" />,
    downloads: 3201,
    color: "#439cdf",
  },
];

export default function Resources() {
  const [selectedType, setSelectedType] = useState<"all" | "pdf" | "guide" | "tool">("all");

  const filteredResources =
    selectedType === "all"
      ? RESOURCES
      : RESOURCES.filter((r) => r.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2D3561] mb-2">
            Study Resources
          </h1>
          <p className="text-[#4A5578]">
            Download guides, tools, and materials to support your LSAT preparation
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["all", "pdf", "guide", "tool"] as const).map((type) => (
            <Button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`capitalize ${
                selectedType === type
                  ? "bg-[#0052CC] text-white"
                  : "bg-white text-[#2D3561] border border-[#E8E6E1]"
              }`}
            >
              {type === "all"
                ? "All Resources"
                : type === "pdf"
                  ? "PDF Guides"
                  : type === "guide"
                    ? "Study Guides"
                    : "Tools"}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className="p-6 bg-white hover:shadow-lg transition-all"
            >
              {/* Icon */}
              <div
                className="p-4 rounded-lg text-white mb-4 w-fit"
                style={{ backgroundColor: resource.color }}
              >
                {resource.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[#2D3561] mb-2">
                {resource.title}
              </h3>
              <p className="text-[#4A5578] text-sm mb-4">
                {resource.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-4 text-xs text-[#4A5578]">
                <span>
                  {resource.size && `${resource.size} •`} {resource.downloads.toLocaleString()} downloads
                </span>
              </div>

              {/* Download Button */}
              <Button className="w-full bg-[#0052CC] text-white hover:bg-[#003D99] flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-[#0052CC] to-[#003D99] text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Resources?</h2>
          <p className="mb-6 text-blue-100">
            Check back regularly for new study guides, practice sets, and tools.
          </p>
          <Button className="bg-white text-[#0052CC] hover:bg-blue-50 font-semibold">
            Request a Resource
          </Button>
        </Card>
      </div>
    </div>
  );
}
