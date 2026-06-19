/**
 * useErrorLog — single hook the Review & Analytics section uses for the error
 * log. When the user is signed in it reads/writes through tRPC (persisted in
 * MySQL). When signed out — or if the API is unavailable — it transparently
 * falls back to localStorage so the feature still works end-to-end.
 */
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface ErrorEntry {
  id: number;
  category: string;
  questionType: string;
  errorReason?: string | null;
  notes?: string | null;
  source?: string | null;
  confidence: number;
  resolved: number;
  createdAt: string;
}

export interface ErrorDraft {
  category: string;
  questionType: string;
  errorReason?: string;
  notes?: string;
  source?: string;
  confidence: number;
}

const LS_KEY = "nexus.errorLog.v1";

function readLocal(): ErrorEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ErrorEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: ErrorEntry[]) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function useErrorLog() {
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 60_000 });
  const isAuthed = !!me.data;

  // Server-backed list (only enabled when signed in).
  const serverList = trpc.nexus.listErrors.useQuery(undefined, {
    enabled: isAuthed,
  });

  // Local fallback state.
  const [local, setLocal] = useState<ErrorEntry[]>([]);
  useEffect(() => setLocal(readLocal()), []);

  const refetchServer = () => utils.nexus.listErrors.invalidate();

  const addServer = trpc.nexus.addError.useMutation({
    onSuccess: refetchServer,
  });
  const updateServer = trpc.nexus.updateError.useMutation({
    onSuccess: refetchServer,
  });
  const deleteServer = trpc.nexus.deleteError.useMutation({
    onSuccess: refetchServer,
  });

  const add = useCallback(
    async (draft: ErrorDraft) => {
      if (isAuthed) {
        await addServer.mutateAsync(draft);
        return;
      }
      setLocal(prev => {
        const next: ErrorEntry[] = [
          {
            ...draft,
            id: Date.now(),
            resolved: 0,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
        writeLocal(next);
        return next;
      });
    },
    [isAuthed, addServer]
  );

  const update = useCallback(
    async (
      id: number,
      updates: Partial<ErrorDraft> & { resolved?: number }
    ) => {
      if (isAuthed) {
        await updateServer.mutateAsync({ id, ...updates });
        return;
      }
      setLocal(prev => {
        const next = prev.map(e => (e.id === id ? { ...e, ...updates } : e));
        writeLocal(next);
        return next;
      });
    },
    [isAuthed, updateServer]
  );

  const remove = useCallback(
    async (id: number) => {
      if (isAuthed) {
        await deleteServer.mutateAsync({ id });
        return;
      }
      setLocal(prev => {
        const next = prev.filter(e => e.id !== id);
        writeLocal(next);
        return next;
      });
    },
    [isAuthed, deleteServer]
  );

  const entries: ErrorEntry[] = useMemo(() => {
    if (isAuthed) {
      return (serverList.data ?? []).map(e => ({
        ...e,
        createdAt:
          e.createdAt instanceof Date
            ? e.createdAt.toISOString()
            : String(e.createdAt),
      }));
    }
    return local;
  }, [isAuthed, serverList.data, local]);

  return {
    entries,
    isAuthed,
    isLoading: isAuthed && serverList.isLoading,
    add,
    update,
    remove,
  };
}
