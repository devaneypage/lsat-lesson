/**
 * DESIGN: Tag Manager — Three-Panel Layout
 * Left: Tag Browser (hierarchy by type, with question counts + CRUD)
 * Center: Question List (filterable, selectable, with inline tag chips)
 * Right: Assignment Panel (assign/remove tags on selected questions)
 *
 * Color palette: matches the app's charcoal/amber/sage theme
 */

import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckSquare,
  Square,
  X,
  BookOpen,
  Target,
  Layers,
  Wrench,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TagType = "topic" | "objective" | "section" | "custom";

interface TagWithCount {
  id: number;
  name: string;
  type: TagType;
  description: string | null;
  color: string | null;
  questionCount: number;
}

interface QuestionWithTags {
  id: number;
  questionId: string;
  questionText: string;
  category: string | null;
  difficulty: string | null;
  source: string | null;
  tags: { id: number; name: string; type: string | null; color: string | null }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_TYPE_META: Record<TagType, { label: string; icon: React.ReactNode; color: string }> = {
  topic: {
    label: "Lesson",
    icon: <BookOpen size={14} />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  objective: {
    label: "Unit",
    icon: <Target size={14} />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  section: {
    label: "Section",
    icon: <Layers size={14} />,
    color: "bg-sage-100 text-green-800 border-green-200",
  },
  custom: {
    label: "Flaw Type",
    icon: <Wrench size={14} />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const PRESET_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6",
  "#EF4444", "#06B6D4", "#F97316", "#84CC16",
  "#EC4899", "#6366F1", "#14B8A6", "#A78BFA",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagChip({
  tag,
  onRemove,
}: {
  tag: { id: number; name: string; color: string | null };
  onRemove?: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={
        tag.color
          ? { backgroundColor: tag.color + "22", color: tag.color, borderColor: tag.color + "44" }
          : {}
      }
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          title="Remove tag"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

function TagTypeSection({
  type,
  tags,
  selectedTagId,
  onSelectTag,
  onEditTag,
  onDeleteTag,
}: {
  type: TagType;
  tags: TagWithCount[];
  selectedTagId: number | null;
  onSelectTag: (id: number | null) => void;
  onEditTag: (tag: TagWithCount) => void;
  onDeleteTag: (tag: TagWithCount) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const meta = TAG_TYPE_META[type];

  if (tags.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-700 transition-colors"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {meta.icon}
        <span>{meta.label}</span>
        <span className="ml-auto bg-stone-200 text-stone-600 rounded-full px-1.5 py-0.5 text-[10px]">
          {tags.length}
        </span>
      </button>

      {expanded && (
        <div className="ml-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                selectedTagId === tag.id
                  ? "bg-amber-50 border border-amber-200"
                  : "hover:bg-stone-50"
              }`}
              onClick={() => onSelectTag(selectedTagId === tag.id ? null : tag.id)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color || "#94A3B8" }}
              />
              <span className="flex-1 text-sm text-stone-700 truncate">{tag.name}</span>
              <span className="text-xs text-stone-400 tabular-nums">{tag.questionCount}</span>
              <div className="hidden group-hover:flex items-center gap-1 ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTag(tag);
                  }}
                  className="p-0.5 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
                  title="Edit tag"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTag(tag);
                  }}
                  className="p-0.5 rounded hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
                  title="Delete tag"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TagManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // ── Server state ──
  const utils = trpc.useUtils();
  const { data: tagsWithCounts = [], isLoading: tagsLoading } =
    trpc.tags.listWithCounts.useQuery();
  const { data: questionsWithTags = [], isLoading: questionsLoading } =
    trpc.tags.questionsWithTags.useQuery({ limit: 200, offset: 0 });

  const createTagMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.listWithCounts.invalidate();
      toast.success("Tag created");
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTagMutation = trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.listWithCounts.invalidate();
      toast.success("Tag updated");
      setEditDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTagMutation = trpc.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.listWithCounts.invalidate();
      utils.tags.questionsWithTags.invalidate();
      if (selectedTagId === deletingTag?.id) setSelectedTagId(null);
      toast.success("Tag deleted");
      setDeleteDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const addToQuestionMutation = trpc.tags.addToQuestion.useMutation({
    onSuccess: () => {
      utils.tags.questionsWithTags.invalidate();
      utils.tags.listWithCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const removeFromQuestionMutation = trpc.tags.removeFromQuestion.useMutation({
    onSuccess: () => {
      utils.tags.questionsWithTags.invalidate();
      utils.tags.listWithCounts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const bulkAssignMutation = trpc.tags.bulkAssign.useMutation({
    onSuccess: (data) => {
      utils.tags.questionsWithTags.invalidate();
      utils.tags.listWithCounts.invalidate();
      toast.success(`Tag assigned to ${data.added} question${data.added !== 1 ? "s" : ""}`);
      setSelectedQuestionIds(new Set());
    },
    onError: (e) => toast.error(e.message),
  });

  const bulkRemoveMutation = trpc.tags.bulkRemove.useMutation({
    onSuccess: () => {
      utils.tags.questionsWithTags.invalidate();
      utils.tags.listWithCounts.invalidate();
      toast.success("Tag removed from selected questions");
      setSelectedQuestionIds(new Set());
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Local state ──
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TagType>("topic");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#3B82F6");

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagWithCount | null>(null);

  // Bulk assign panel
  const [bulkTagId, setBulkTagId] = useState<string>("");

  const resetForm = () => {
    setFormName("");
    setFormType("topic");
    setFormDescription("");
    setFormColor("#3B82F6");
  };

  // ── Derived data ──
  const tagsByType = useMemo(() => {
    const map: Record<TagType, TagWithCount[]> = {
      topic: [],
      objective: [],
      section: [],
      custom: [],
    };
    for (const tag of tagsWithCounts) {
      map[tag.type as TagType]?.push(tag as TagWithCount);
    }
    return map;
  }, [tagsWithCounts]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const q of questionsWithTags) {
      if (q.category) cats.add(q.category);
    }
    return Array.from(cats).sort();
  }, [questionsWithTags]);

  const filteredQuestions = useMemo(() => {
    let qs = questionsWithTags as QuestionWithTags[];

    if (selectedTagId !== null) {
      qs = qs.filter((q) => q.tags.some((t) => t.id === selectedTagId));
    }

    if (categoryFilter !== "all") {
      qs = qs.filter((q) => q.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      qs = qs.filter((q) => q.questionText.toLowerCase().includes(lower));
    }

    return qs;
  }, [questionsWithTags, selectedTagId, categoryFilter, searchQuery]);

  const allFilteredSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedQuestionIds.has(q.id));

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  }, [allFilteredSelected, filteredQuestions]);

  const toggleQuestion = useCallback((id: number) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkAssign = () => {
    if (!bulkTagId || selectedQuestionIds.size === 0) return;
    bulkAssignMutation.mutate({
      questionIds: Array.from(selectedQuestionIds),
      tagId: Number(bulkTagId),
    });
  };

  const handleBulkRemove = () => {
    if (!bulkTagId || selectedQuestionIds.size === 0) return;
    bulkRemoveMutation.mutate({
      questionIds: Array.from(selectedQuestionIds),
      tagId: Number(bulkTagId),
    });
  };

  const openEditDialog = (tag: TagWithCount) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormType(tag.type);
    setFormDescription(tag.description || "");
    setFormColor(tag.color || "#3B82F6");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: TagWithCount) => {
    setDeletingTag(tag);
    setDeleteDialogOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-stone-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Tag size={16} className="text-amber-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-800">Tag Manager</h1>
            <p className="text-xs text-stone-500">
              Organize {questionsWithTags.length} questions by lesson, unit, and flaw type
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
          >
            <Plus size={14} />
            New Tag
          </Button>
        )}
      </div>

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Tag Browser ── */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-stone-200 flex flex-col overflow-hidden">
          <div className="px-3 py-3 border-b border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
              Tags ({tagsWithCounts.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-1">
            {tagsLoading ? (
              <div className="flex items-center justify-center py-8 text-stone-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : tagsWithCounts.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Tag size={24} className="mx-auto text-stone-300 mb-2" />
                <p className="text-xs text-stone-400">No tags yet.</p>
                {isAdmin && (
                  <p className="text-xs text-stone-400 mt-1">
                    Click <strong>New Tag</strong> to get started.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* All questions filter */}
                <button
                  onClick={() => setSelectedTagId(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                    selectedTagId === null
                      ? "bg-amber-50 border border-amber-200 text-amber-800 font-medium"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Layers size={14} />
                  All Questions
                  <span className="ml-auto text-xs text-stone-400">
                    {questionsWithTags.length}
                  </span>
                </button>

                {(["topic", "objective", "section", "custom"] as TagType[]).map((type) => (
                  <TagTypeSection
                    key={type}
                    type={type}
                    tags={tagsByType[type]}
                    selectedTagId={selectedTagId}
                    onSelectTag={setSelectedTagId}
                    onEditTag={openEditDialog}
                    onDeleteTag={openDeleteDialog}
                  />
                ))}
              </>
            )}
          </div>
        </aside>

        {/* ── CENTER: Question List ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <Input
                placeholder="Search questions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-stone-50 border-stone-200"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 h-8 text-sm bg-stone-50 border-stone-200">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-stone-400 tabular-nums ml-auto">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
              {selectedQuestionIds.size > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  · {selectedQuestionIds.size} selected
                </span>
              )}
            </span>

            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              title={allFilteredSelected ? "Deselect all" : "Select all"}
            >
              {allFilteredSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              {allFilteredSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          {/* Question list */}
          <div className="flex-1 overflow-y-auto">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-16 text-stone-400">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading questions…
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No questions match the current filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      selectedQuestionIds.has(q.id) ? "bg-amber-50" : "hover:bg-stone-50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedQuestionIds.has(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-stone-400">{q.questionId}</span>
                        {q.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {q.category}
                          </Badge>
                        )}
                        {q.difficulty && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              q.difficulty === "Hard"
                                ? "border-red-200 text-red-600"
                                : q.difficulty === "Medium"
                                ? "border-amber-200 text-amber-600"
                                : "border-green-200 text-green-600"
                            }`}
                          >
                            {q.difficulty}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-stone-700 line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>
                      {q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {q.tags.map((t) => (
                            <TagChip
                              key={t.id}
                              tag={t}
                              onRemove={
                                isAdmin
                                  ? () =>
                                      removeFromQuestionMutation.mutate({
                                        questionId: q.id,
                                        tagId: t.id,
                                      })
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: Assignment Panel ── */}
        {isAdmin && (
          <aside className="w-64 flex-shrink-0 bg-white border-l border-stone-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Assign Tags
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedQuestionIds.size === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <CheckSquare size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Select questions from the list to assign or remove tags.</p>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                    <strong>{selectedQuestionIds.size}</strong> question
                    {selectedQuestionIds.size !== 1 ? "s" : ""} selected
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-stone-600">Choose a tag</label>
                    <Select value={bulkTagId} onValueChange={setBulkTagId}>
                      <SelectTrigger className="h-8 text-sm border-stone-200">
                        <SelectValue placeholder="Select tag…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["topic", "objective", "section", "custom"] as TagType[]).map((type) => {
                          const typeTags = tagsByType[type];
                          if (typeTags.length === 0) return null;
                          return (
                            <div key={type}>
                              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                                {TAG_TYPE_META[type].label}
                              </div>
                              {typeTags.map((tag) => (
                                <SelectItem key={tag.id} value={String(tag.id)}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: tag.color || "#94A3B8" }}
                                    />
                                    {tag.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={handleBulkAssign}
                      disabled={!bulkTagId || bulkAssignMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                    >
                      {bulkAssignMutation.isPending ? (
                        <Loader2 size={13} className="animate-spin mr-1" />
                      ) : (
                        <Plus size={13} className="mr-1" />
                      )}
                      Assign to selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkRemove}
                      disabled={!bulkTagId || bulkRemoveMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                    >
                      {bulkRemoveMutation.isPending ? (
                        <Loader2 size={13} className="animate-spin mr-1" />
                      ) : (
                        <Trash2 size={13} className="mr-1" />
                      )}
                      Remove from selected
                    </Button>
                  </div>

                  <button
                    onClick={() => setSelectedQuestionIds(new Set())}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors w-full text-center"
                  >
                    Clear selection
                  </button>
                </>
              )}

              {/* Quick single-question assign (when tag is selected in browser) */}
              {selectedTagId !== null && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="text-xs font-medium text-stone-500 mb-2">
                    Viewing tag:{" "}
                    <span className="text-stone-700 font-semibold">
                      {tagsWithCounts.find((t) => t.id === selectedTagId)?.name}
                    </span>
                  </p>
                  <p className="text-xs text-stone-400">
                    Click the × on any tag chip in the question list to remove it from that
                    question.
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Create Tag Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag size={16} className="text-amber-600" />
              Create New Tag
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Necessary Assumption"
                className="border-stone-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <Select value={formType} onValueChange={(v) => setFormType(v as TagType)}>
                <SelectTrigger className="border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic">Lesson (topic)</SelectItem>
                  <SelectItem value="objective">Unit (objective)</SelectItem>
                  <SelectItem value="section">Section</SelectItem>
                  <SelectItem value="custom">Flaw Type (custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Description</label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
                className="border-stone-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      formColor === c ? "border-stone-700 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-stone-200"
                />
                <span className="text-xs text-stone-500 font-mono">{formColor}</span>
                <span
                  className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: formColor + "22",
                    color: formColor,
                    borderColor: formColor + "44",
                  }}
                >
                  {formName || "Preview"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createTagMutation.mutate({
                  name: formName.trim(),
                  type: formType,
                  description: formDescription || undefined,
                  color: formColor,
                })
              }
              disabled={!formName.trim() || createTagMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createTagMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Tag Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={16} className="text-amber-600" />
              Edit Tag
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border-stone-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <Select value={formType} onValueChange={(v) => setFormType(v as TagType)}>
                <SelectTrigger className="border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic">Lesson (topic)</SelectItem>
                  <SelectItem value="objective">Unit (objective)</SelectItem>
                  <SelectItem value="section">Section</SelectItem>
                  <SelectItem value="custom">Flaw Type (custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Description</label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-stone-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      formColor === c ? "border-stone-700 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-stone-200"
                />
                <span className="text-xs text-stone-500 font-mono">{formColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editingTag) return;
                updateTagMutation.mutate({
                  tagId: editingTag.id,
                  name: formName.trim(),
                  type: formType,
                  description: formDescription || undefined,
                  color: formColor,
                });
              }}
              disabled={!formName.trim() || updateTagMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {updateTagMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Tag Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 size={16} />
              Delete Tag
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-600 py-2">
            Are you sure you want to delete{" "}
            <strong className="text-stone-800">{deletingTag?.name}</strong>? This will remove it
            from all {deletingTag?.questionCount} question
            {deletingTag?.questionCount !== 1 ? "s" : ""} it is assigned to.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingTag && deleteTagMutation.mutate({ tagId: deletingTag.id })}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
