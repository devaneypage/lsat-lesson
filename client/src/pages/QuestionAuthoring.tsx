import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { CsvDraftImportPanel, ReviewerAssignmentPanel, SkillMappingField } from "@/components/AuthoringExtensions";
import { MetadataRow, PageFrame, SectionCard, StatePanel } from "@/components/PagePrimitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardCheck, FilePenLine, Loader2, Send, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";

type SubmissionStatus = "draft" | "submitted" | "needs_revision" | "approved" | "rejected" | "published";

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "In review",
  needs_revision: "Revision requested",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

const STATUS_TONES: Record<SubmissionStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  needs_revision: "bg-warning/20 text-warning-foreground",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  published: "bg-secondary/15 text-secondary",
};

type AuthoringForm = {
  internalTitle: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;
  authorNotes: string;
  rightsConfirmed: boolean;
};

const initialForm: AuthoringForm = {
  internalTitle: "",
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  optionE: "",
  correctAnswer: "A",
  explanation: "",
  category: "",
  difficulty: "medium",
  source: "LSAT Nexus Original",
  authorNotes: "",
  rightsConfirmed: false,
};

export default function QuestionAuthoring() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [form, setForm] = useState<AuthoringForm>(initialForm);
  const [skillMappings, setSkillMappings] = useState<{ skillId: string; weight: number }[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const submissionsQuery = trpc.questionAuthoring.list.useQuery(statusFilter === "all" ? {} : { status: statusFilter });
  const skillsQuery = trpc.questionAuthoring.listSkills.useQuery();
  const reviewersQuery = trpc.questionAuthoring.listReviewers.useQuery();

  const refresh = async () => utils.questionAuthoring.list.invalidate();
  const createDraft = trpc.questionAuthoring.createDraft.useMutation({
    onSuccess: async (submission) => {
      await refresh();
      setSelectedKey(submission.submissionKey);
      setForm(initialForm);
      setSkillMappings([]);
      toast.success("Original question saved as a private draft.");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateDraft = trpc.questionAuthoring.updateDraft.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Draft revision saved. Submit it again when ready for review.");
    },
    onError: (error) => toast.error(error.message),
  });
  const submit = trpc.questionAuthoring.submit.useMutation({ onSuccess: async () => { await refresh(); toast.success("Submission sent for review."); }, onError: (error) => toast.error(error.message) });
  const review = trpc.questionAuthoring.review.useMutation({ onSuccess: async () => { await refresh(); setReviewNotes(""); toast.success("Review decision recorded."); }, onError: (error) => toast.error(error.message) });
  const publish = trpc.questionAuthoring.publish.useMutation({ onSuccess: async () => { await refresh(); toast.success("Approved original question published to the Question Bank."); }, onError: (error) => toast.error(error.message) });

  const selected = useMemo(
    () => submissionsQuery.data?.find((submission) => submission.submissionKey === selectedKey) ?? null,
    [selectedKey, submissionsQuery.data],
  );

  const update = <K extends keyof AuthoringForm>(key: K, value: AuthoringForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const canEditSelected = selected ? selected.authorId === user?.id && ["draft", "needs_revision", "rejected"].includes(selected.status) : false;
  const openSelectedForEditing = () => {
    if (!selected || !canEditSelected) return;
    setForm({
      internalTitle: selected.internalTitle,
      questionText: selected.questionText,
      optionA: selected.optionA,
      optionB: selected.optionB,
      optionC: selected.optionC,
      optionD: selected.optionD,
      optionE: selected.optionE ?? "",
      correctAnswer: selected.correctAnswer as AuthoringForm["correctAnswer"],
      explanation: selected.explanation,
      category: selected.category,
      difficulty: selected.difficulty as AuthoringForm["difficulty"],
      source: selected.source,
      authorNotes: selected.authorNotes ?? "",
      rightsConfirmed: selected.rightsConfirmed === 1,
    });
    setSkillMappings(selected.skillMappings.map((mapping) => ({ skillId: mapping.skillId, weight: mapping.weight })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const isSaving = createDraft.isPending || updateDraft.isPending || submit.isPending || review.isPending || publish.isPending;

  if (user?.role !== "admin") {
    return <StatePanel icon={ShieldCheck} eyebrow="Restricted workspace" title="Administrator access required" description="Original-question authoring and review are limited to the protected content team." tone="warning" />;
  }

  return (
    <PageFrame width="wide" className="space-y-6">
      <section className="border-b border-border pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-secondary">Content studio</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-foreground sm:text-4xl">Original question authoring</h1>
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">Create, review, and publish original LSAT-style practice content through an auditable, rights-respecting editorial workflow.</p>
          </div>
          <Badge variant="outline" className="w-fit border-secondary/40 bg-secondary/10 px-3 py-1.5 text-secondary"><ShieldCheck className="mr-1.5 h-4 w-4" />Admin-only workflow</Badge>
        </div>
      </section>

      <SectionCard title="Editorial protocol" description="Private drafts never enter learner practice. Publication is available only after a recorded approval and rights attestation.">
        <MetadataRow items={[
          { label: "1. Author", value: "Draft original content" },
          { label: "2. Review", value: "Approve, reject, or return" },
          { label: "3. Publish", value: "Create learner-visible record" },
        ]} />
      </SectionCard>

      <CsvDraftImportPanel onCommitted={refresh} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(24rem,0.7fr)]">
        <SectionCard title={canEditSelected ? `Revise: ${selected?.internalTitle}` : "New original question"} description={canEditSelected ? "Revision resets the item to a private draft and preserves its original author and review history." : "All fields are required to preserve instructional quality and original-content provenance."}>
          <form className="space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (!form.rightsConfirmed) {
              toast.error("Confirm original-content rights before saving a draft.");
              return;
            }
            const content = { ...form, rightsConfirmed: true as const, optionE: form.optionE || undefined, authorNotes: form.authorNotes || undefined, skillMappings };
            if (selected && canEditSelected) {
              updateDraft.mutate({ submissionKey: selected.submissionKey, content });
            } else {
              createDraft.mutate(content);
            }
          }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="internalTitle">Internal title</Label><Input id="internalTitle" value={form.internalTitle} onChange={(event) => update("internalTitle", event.target.value)} placeholder="LR — necessary assumption — transit authority" required /></div>
              <div className="space-y-2"><Label htmlFor="category">Question type / category</Label><Input id="category" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Necessary Assumption" required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="questionText">Question stem</Label><Textarea id="questionText" value={form.questionText} onChange={(event) => update("questionText", event.target.value)} placeholder="Write the stimulus and question stem in original language." className="min-h-32" required /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["A", "B", "C", "D", "E"] as const).map((letter) => <div className="space-y-2" key={letter}><Label htmlFor={`option${letter}`}>Option {letter}{letter === "E" ? " (optional)" : ""}</Label><Input id={`option${letter}`} value={form[`option${letter}`]} onChange={(event) => update(`option${letter}`, event.target.value)} required={letter !== "E" || form.correctAnswer === "E"} /></div>)}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Credited response</Label><Select value={form.correctAnswer} onValueChange={(value) => update("correctAnswer", value as AuthoringForm["correctAnswer"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["A", "B", "C", "D", "E"].map((letter) => <SelectItem key={letter} value={letter}>{letter}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Difficulty</Label><Select value={form.difficulty} onValueChange={(value) => update("difficulty", value as AuthoringForm["difficulty"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="source">Source label</Label><Input id="source" value={form.source} onChange={(event) => update("source", event.target.value)} required /></div>
            </div>
            <SkillMappingField skills={skillsQuery.data ?? []} mappings={skillMappings} onChange={setSkillMappings} />
            <div className="space-y-2"><Label htmlFor="explanation">Instructional explanation</Label><Textarea id="explanation" value={form.explanation} onChange={(event) => update("explanation", event.target.value)} placeholder="Explain the credited response and the intended reasoning move." className="min-h-32" required /></div>
            <div className="space-y-2"><Label htmlFor="authorNotes">Author notes for reviewer (optional)</Label><Textarea id="authorNotes" value={form.authorNotes} onChange={(event) => update("authorNotes", event.target.value)} placeholder="Flag any intended distractor logic or review question." /></div>
            <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-secondary/35 bg-secondary/10 p-4 text-sm leading-6 text-foreground"><Checkbox checked={form.rightsConfirmed} onCheckedChange={(checked) => update("rightsConfirmed", checked === true)} /><span>I attest that this question and its explanation are original work for LSAT Nexus, contain no proprietary LSAC material, and may be reviewed for publication.</span></label>
            <Button type="submit" disabled={isSaving} className="w-full"><FilePenLine className="mr-2 h-4 w-4" />{updateDraft.isPending ? "Saving revision…" : createDraft.isPending ? "Saving draft…" : canEditSelected ? "Save revision as draft" : "Save private draft"}</Button>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Submission queue" description="Select an item to submit, review, or publish. Learners cannot access non-published submissions.">
            <div className="mb-4"><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SubmissionStatus | "all")}><SelectTrigger aria-label="Filter authoring submissions by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{(Object.keys(STATUS_LABELS) as SubmissionStatus[]).map((status) => <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>)}</SelectContent></Select></div>
            {submissionsQuery.isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading submissions…</div> : submissionsQuery.data?.length ? <div className="space-y-2">{submissionsQuery.data.map((submission) => <button type="button" key={submission.submissionKey} onClick={() => { setSelectedKey(submission.submissionKey); setReviewNotes(submission.reviewNotes ?? ""); }} className={`w-full rounded-sm border p-3 text-left transition-colors ${submission.submissionKey === selectedKey ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"}`}><div className="flex items-start justify-between gap-3"><span className="font-medium text-foreground">{submission.internalTitle}</span><Badge className={STATUS_TONES[submission.status]}>{STATUS_LABELS[submission.status]}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{submission.category} · {submission.difficulty} · {submission.source}</p></button>)}</div> : <p className="text-sm text-muted-foreground">No submissions match this queue filter.</p>}
          </SectionCard>

          {selected && <SectionCard title="Review and release" description="Each decision is recorded against the selected private submission.">
            <div className="space-y-4">
              <div><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold text-foreground">{selected.internalTitle}</h2><Badge className={STATUS_TONES[selected.status]}>{STATUS_LABELS[selected.status]}</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.questionText}</p></div>
              <ReviewerAssignmentPanel submissionKey={selected.submissionKey} assignedReviewerId={selected.assignedReviewerId} editorialDueAt={selected.editorialDueAt} reviewers={reviewersQuery.data ?? []} onAssigned={refresh} />
              <div className="space-y-2"><Label htmlFor="reviewNotes">Reviewer notes</Label><Textarea id="reviewNotes" value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Required when requesting revision or rejecting an item." /></div>
              <div className="grid gap-2 sm:grid-cols-2">
                {canEditSelected && <Button type="button" variant="outline" onClick={openSelectedForEditing} disabled={isSaving}><FilePenLine className="mr-2 h-4 w-4" />Edit content</Button>}
                {selected.status === "draft" && <Button type="button" onClick={() => submit.mutate({ submissionKey: selected.submissionKey })} disabled={isSaving}><Send className="mr-2 h-4 w-4" />Submit for review</Button>}
                {selected.status === "submitted" && <><Button type="button" variant="outline" onClick={() => review.mutate({ submissionKey: selected.submissionKey, decision: "needs_revision", reviewNotes })} disabled={isSaving}>Request revision</Button><Button type="button" onClick={() => review.mutate({ submissionKey: selected.submissionKey, decision: "approved", reviewNotes: reviewNotes || undefined })} disabled={isSaving}><ClipboardCheck className="mr-2 h-4 w-4" />Approve</Button><Button type="button" variant="destructive" onClick={() => review.mutate({ submissionKey: selected.submissionKey, decision: "rejected", reviewNotes })} disabled={isSaving}>Reject</Button></>}
                {selected.status === "approved" && <Button type="button" onClick={() => publish.mutate({ submissionKey: selected.submissionKey })} disabled={isSaving}><Upload className="mr-2 h-4 w-4" />Publish to Question Bank</Button>}
                {selected.status === "published" && <div className="flex items-center gap-2 rounded-sm border border-success/40 bg-success/10 p-3 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Published as learner question #{selected.publishedQuestionId}.</div>}
              </div>
              {selected.reviewNotes && <div className="rounded-sm border border-border bg-muted/35 p-3 text-sm text-foreground"><strong>Recorded review notes:</strong> {selected.reviewNotes}</div>}
            </div>
          </SectionCard>}
        </div>
      </div>
    </PageFrame>
  );
}
