/**
 * ProgressTracker Page
 * Comprehensive progress monitoring and analytics
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";

export default function ProgressTracker() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  const progressData = {
    overallAccuracy: 78,
    questionsAnswered: 47,
    lessonsCompleted: 2,
    hoursSpent: 12.5,
    estimatedScoreImprovement: 8,
  };

  const weeklyData = [
    { day: "Mon", correct: 12, total: 15 },
    { day: "Tue", correct: 14, total: 18 },
    { day: "Wed", correct: 10, total: 14 },
    { day: "Thu", correct: 16, total: 20 },
    { day: "Fri", correct: 13, total: 16 },
    { day: "Sat", correct: 15, total: 18 },
    { day: "Sun", correct: 11, total: 14 },
  ];

  const topicPerformance = [
    { topic: "Necessary Assumptions", accuracy: 85, questions: 12 },
    { topic: "Common Flaws", accuracy: 72, questions: 18 },
    { topic: "Strengthen/Weaken", accuracy: 78, questions: 15 },
    { topic: "Reading Comprehension", accuracy: 68, questions: 8 },
    { topic: "Formal Logic", accuracy: 82, questions: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#FFFBF8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2D3561] mb-2">
            Your Progress
          </h1>
          <p className="text-[#4A5578]">
            Track your improvement and identify areas for focus
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(["week", "month", "all"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`capitalize ${
                timeRange === range
                  ? "bg-[#0052CC] text-white"
                  : "bg-white text-[#2D3561] border border-[#E8E6E1]"
              }`}
            >
              {range === "all" ? "All Time" : `Last ${range}`}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#1a7dff]/10">
                <TrendingUp className="w-5 h-5 text-[#1a7dff]" />
              </div>
              <p className="text-sm text-[#4A5578] font-medium">Accuracy</p>
            </div>
            <p className="text-3xl font-bold text-[#2D3561]">
              {progressData.overallAccuracy}%
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#439cdf]/10">
                <Calendar className="w-5 h-5 text-[#439cdf]" />
              </div>
              <p className="text-sm text-[#4A5578] font-medium">Questions</p>
            </div>
            <p className="text-3xl font-bold text-[#2D3561]">
              {progressData.questionsAnswered}
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#46e291]/10">
                <Award className="w-5 h-5 text-[#46e291]" />
              </div>
              <p className="text-sm text-[#4A5578] font-medium">Lessons</p>
            </div>
            <p className="text-3xl font-bold text-[#2D3561]">
              {progressData.lessonsCompleted}
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#ffdd33]/10">
                <Calendar className="w-5 h-5 text-[#ffdd33]" />
              </div>
              <p className="text-sm text-[#4A5578] font-medium">Hours</p>
            </div>
            <p className="text-3xl font-bold text-[#2D3561]">
              {progressData.hoursSpent}h
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#0052CC] to-[#003D99] text-white">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5" />
              <p className="text-sm font-medium">Est. Score Gain</p>
            </div>
            <p className="text-3xl font-bold">+{progressData.estimatedScoreImprovement}</p>
          </Card>
        </div>

        {/* Weekly Performance */}
        <Card className="p-6 bg-white mb-8">
          <h2 className="text-xl font-bold text-[#2D3561] mb-6">
            Weekly Performance
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day) => {
              const percentage = (day.correct / day.total) * 100;
              return (
                <div key={day.day} className="text-center">
                  <div
                    className="h-24 rounded-lg mb-2 flex items-end justify-center transition-all hover:shadow-lg"
                    style={{
                      backgroundColor:
                        percentage >= 80
                          ? "#46e291"
                          : percentage >= 60
                            ? "#ffdd33"
                            : "#FF6B6B",
                      opacity: 0.8,
                    }}
                  >
                    <span className="text-xs font-bold text-white mb-1">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#2D3561]">
                    {day.day}
                  </p>
                  <p className="text-xs text-[#4A5578]">
                    {day.correct}/{day.total}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Topic Performance */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-[#2D3561] mb-6">
            Performance by Topic
          </h2>
          <div className="space-y-4">
            {topicPerformance.map((topic) => (
              <div key={topic.topic}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#2D3561]">{topic.topic}</p>
                  <p className="text-sm text-[#4A5578]">
                    {topic.accuracy}% ({topic.questions} questions)
                  </p>
                </div>
                <div className="w-full bg-[#E8E6E1] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${topic.accuracy}%`,
                      backgroundColor:
                        topic.accuracy >= 80
                          ? "#46e291"
                          : topic.accuracy >= 70
                            ? "#1a7dff"
                            : "#ffdd33",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
