"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
}

export function CommentThread({
  challengeId,
  projectId,
  initialComments,
  canComment,
}: {
  challengeId?: string;
  projectId?: string;
  initialComments: CommentItem[];
  canComment: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postComment() {
    if (!content.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        challengeId ? `/api/challenges/${challengeId}/comments` : `/api/projects/${projectId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error?.message ?? "Could not post comment");
        return;
      }
      setComments((prev) => [...prev, payload.data]);
      setContent("");
      router.refresh();
    } catch {
      setError("Unable to reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Discussion</h3>
      {error ? <ErrorState message={error} /> : null}
      {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="rounded-md bg-gray-50 px-3 py-2 text-sm">
            <p className="font-medium text-gray-800">
              {c.author.name} <span className="text-xs font-normal text-gray-500">· {new Date(c.createdAt).toLocaleString()}</span>
            </p>
            <p className="mt-0.5 text-gray-700">{c.content}</p>
          </li>
        ))}
      </ul>
      {canComment && (
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment…"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            rows={2}
          />
          <Button onClick={postComment} disabled={busy || !content.trim()} className="self-end">
            Post
          </Button>
        </div>
      )}
    </section>
  );
}