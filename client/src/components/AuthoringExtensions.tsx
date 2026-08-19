import { useMemo, useState } from "react";
import { CalendarDays, FileSpreadsheet, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseAuthoringCsv } from "@/lib/authoringCsv";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Skill = { skillId: string; title: string; section: string; description: string };
type Reviewer = { id: number; name: string | null; email: string | null };
type SkillMapping = { skillId: string; weight: number };
type CsvDraftInput = {
  internal_title: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  category: string;
  lesson_id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  source?: string;
  author_notes?: string;
  skill_ids?: string;
};

export function SkillMappingField({ skills, mappings, onChange }: { skills: Skill[]; mappings: SkillMapping[]; onChange: (mappings: SkillMapping[]) => void }) {
  const selected = new Set(mappings.map((mapping) => mapping.skillId));
  const toggle = (skillId: string) => {
    if (selected.has(skillId)) onChange(mappings.filter((mapping) => mapping.skillId !== skillId));
    else if (mappings.length < 5) onChange([...mappings, { skillId, weight: 100 }]);
    else toast.error("Map no more than five curriculum skills to one question.");
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">Curriculum skills</legend>
      <p className="text-xs leading-5 text-muted-foreground">Map the reasoning skills this item measures. These mappings become mastery evidence after publication.</p>
      <div className="grid max-h-44 gap-2 overflow-y-auto rounded-sm border border-border bg-muted/25 p-3 sm:grid-cols-2">
        {skills.map((skill) => <label key={skill.skillId} className="flex cursor-pointer items-start gap-2 rounded-sm p-1.5 text-sm hover:bg-card"><Checkbox checked={selected.has(skill.skillId)} onCheckedChange={() => toggle(skill.skillId)} /><span><strong className="block text-foreground">{skill.title}</strong><span className="text-xs text-muted-foreground">{skill.section} · {skill.skillId}</span></span></label>)}
      </div>
      <p className="text-xs font-medium text-secondary">{mappings.length} of 5 skills selected</p>
    </fieldset>
  );
}

export function CsvDraftImportPanel({ onCommitted }: { onCommitted: () => Promise<void> }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<CsvDraftInput[]>([]);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewMutationResult>> | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const previewMutation = trpc.questionAuthoring.previewDraftImport.useMutation();
  const commitMutation = trpc.questionAuthoring.commitDraftImport.useMutation();
  const validRows = preview?.filter((row) => row.isValid).length ?? 0;
  const invalidRows = (preview?.length ?? 0) - validRows;

  async function previewMutationResult() {
    return [] as { rowNumber: number; internalTitle: string; skillIds: string[]; issues: string[]; isValid: boolean }[];
  }

  const selectFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Choose a CSV file for draft intake.");
      return;
    }
    const parsed = parseAuthoringCsv(await file.text());
    if (!parsed.length) {
      toast.error("The CSV contains no draft rows.");
      return;
    }
    setFileName(file.name);
    // The server preview applies the authoritative Zod validation; this cast
    // preserves malformed raw values so their row-level issues can be shown.
    setRows(parsed as CsvDraftInput[]);
    setPreview(null);
  };

  const runPreview = async () => {
    try {
      const result = await previewMutation.mutateAsync({ rows });
      setPreview(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to preview this CSV.");
    }
  };

  const removeInvalidRow = (rowNumber: number) => {
    setRows((current) => current.filter((_row, index) => index + 2 !== rowNumber));
    setPreview(null);
    toast.message(`Removed CSV row ${rowNumber}. Correct the source file or continue with the remaining rows, then preview again.`);
  };

  const commit = async () => {
    if (!rightsConfirmed || !preview || invalidRows > 0) return;
    try {
      const result = await commitMutation.mutateAsync({ rows, rightsConfirmed: true });
      await onCommitted();
      setRows([]); setPreview(null); setFileName(""); setRightsConfirmed(false);
      toast.success(`${result.createdCount} private draft${result.createdCount === 1 ? "" : "s"} created from the CSV preview.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save draft intake.");
    }
  };

  return (
    <section className="academic-surface space-y-4 border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3"><FileSpreadsheet className="mt-0.5 h-5 w-5 text-secondary" /><div><h2 className="font-display text-lg font-bold text-foreground">CSV draft intake</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Preview validated original-question rows before creating any private drafts. Required columns use the authoring field names; `skill_ids` accepts semicolon-separated registry IDs.</p></div></div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Input type="file" accept=".csv,text/csv" onChange={(event) => void selectFile(event.target.files?.[0])} /><Button type="button" variant="outline" onClick={() => void runPreview()} disabled={!rows.length || previewMutation.isPending}>{previewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}Preview {rows.length || ""} rows</Button></div>
      {fileName && <p className="text-xs text-muted-foreground">Selected file: {fileName} · {rows.length} parsed rows · nothing has been saved.</p>}
      {preview && <div className="space-y-3 rounded-sm border border-border bg-muted/25 p-3"><p className="text-sm font-medium text-foreground">{validRows} valid · {invalidRows} require correction</p><div className="max-h-52 space-y-2 overflow-y-auto">{preview.map((row) => <div key={row.rowNumber} className={`rounded-sm border p-2 text-sm ${row.isValid ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}><div className="flex items-start justify-between gap-2"><div><strong>Row {row.rowNumber}: {row.internalTitle}</strong><span className="ml-2 text-xs text-muted-foreground">{row.skillIds.join(" · ") || "No skills mapped"}</span>{row.issues.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs text-destructive">{row.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}</div>{!row.isValid && <Button type="button" variant="outline" size="sm" onClick={() => removeInvalidRow(row.rowNumber)}>Remove row</Button>}</div></div>)}</div>{invalidRows > 0 && <p className="text-xs leading-5 text-muted-foreground">Remove invalid rows to continue with the valid set, or correct the source CSV and choose it again. Re-run preview after every change; nothing is committed until all remaining rows validate.</p>}<label className="flex items-start gap-2 text-sm text-foreground"><Checkbox checked={rightsConfirmed} onCheckedChange={(checked) => setRightsConfirmed(checked === true)} /><span>I attest that every valid row is original work for LSAT Nexus and may be saved as a private editorial draft.</span></label><Button type="button" onClick={() => void commit()} disabled={invalidRows > 0 || !rightsConfirmed || commitMutation.isPending}>{commitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}Create {validRows} private drafts</Button></div>}
    </section>
  );
}

export function ReviewerAssignmentPanel({ submissionKey, assignedReviewerId, editorialDueAt, reviewers, onAssigned }: { submissionKey: string; assignedReviewerId: number | null; editorialDueAt: Date | string | null; reviewers: Reviewer[]; onAssigned: () => Promise<void> }) {
  const [reviewerId, setReviewerId] = useState(assignedReviewerId?.toString() ?? "unassigned");
  const [dueDate, setDueDate] = useState(editorialDueAt ? new Date(editorialDueAt).toISOString().slice(0, 10) : "");
  const assign = trpc.questionAuthoring.assignReviewer.useMutation({ onSuccess: async () => { await onAssigned(); toast.success("Reviewer assignment and editorial due date saved."); }, onError: (error) => toast.error(error.message) });
  const selectedReviewer = useMemo(() => reviewerId === "unassigned" ? null : Number(reviewerId), [reviewerId]);

  return <div className="space-y-3 rounded-sm border border-border bg-muted/25 p-3"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-secondary" /><h3 className="font-medium text-foreground">Reviewer ownership</h3></div><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Assigned reviewer</Label><Select value={reviewerId} onValueChange={setReviewerId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{reviewers.map((reviewer) => <SelectItem value={reviewer.id.toString()} key={reviewer.id}>{reviewer.name || reviewer.email || `Administrator #${reviewer.id}`}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label htmlFor="editorialDueAt">Editorial due date</Label><Input id="editorialDueAt" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div></div><Button type="button" variant="outline" onClick={() => assign.mutate({ submissionKey, assignedReviewerId: selectedReviewer, editorialDueAt: dueDate ? new Date(`${dueDate}T12:00:00`) : null })} disabled={assign.isPending}>{assign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}Save ownership</Button></div>;
}
