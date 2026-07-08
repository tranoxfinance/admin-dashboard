"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import {
  assignSupportConversationAction,
  closeSupportConversationAction,
  sendSupportReplyAction,
} from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  SupportConversationDetail,
  SupportConversationStatus,
  SupportMessage,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT: Record<
  SupportConversationStatus,
  "secondary" | "destructive" | "outline" | "default"
> = {
  bot: "outline",
  pending_agent: "destructive",
  active: "default",
  closed: "secondary",
};

const STATUS_LABEL: Record<SupportConversationStatus, string> = {
  bot: "Bot handling",
  pending_agent: "Needs agent",
  active: "Active",
  closed: "Closed",
};

export function SupportThread({
  initialDetail,
  conversationId,
  accessToken,
}: {
  initialDetail: SupportConversationDetail;
  conversationId: string;
  accessToken: string;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initialDetail);
  const [draft, setDraft] = useState("");
  const [isSending, startSending] = useTransition();
  const [isMutating, startMutating] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function appendMessage(message: SupportMessage) {
    setDetail((current) =>
      current.messages.some((existing) => existing.id === message.id)
        ? current
        : { ...current, messages: [...current.messages, message] },
    );
  }

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const socket: Socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/support`,
      { transports: ["websocket"], auth: { token: accessToken } },
    );
    socket.on("connect", () => {
      socket.emit("join", { conversationId });
    });
    socket.on("message", (message: SupportMessage) => {
      appendMessage(message);
    });
    socket.on("status", ({ status }: { status: SupportConversationStatus }) => {
      setDetail((current) => ({
        ...current,
        conversation: { ...current.conversation, status },
      }));
    });
    return () => {
      socket.disconnect();
    };
  }, [accessToken, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [detail.messages.length]);

  function send() {
    const message = draft.trim();
    if (!message) {
      return;
    }
    startSending(async () => {
      const result = await sendSupportReplyAction(conversationId, message);
      if (!result.ok || !result.message) {
        toast.error(result.error ?? "Could not send reply");
        return;
      }
      setDraft("");
      appendMessage(result.message);
      setDetail((current) => ({
        ...current,
        conversation: { ...current.conversation, status: "active" },
      }));
    });
  }

  function assign() {
    startMutating(async () => {
      const result = await assignSupportConversationAction(conversationId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not assign conversation");
        return;
      }
      toast.success("Conversation assigned to you");
      router.refresh();
    });
  }

  function close() {
    startMutating(async () => {
      const result = await closeSupportConversationAction(conversationId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not close conversation");
        return;
      }
      toast.success("Conversation closed");
      setDetail((current) => ({
        ...current,
        conversation: { ...current.conversation, status: "closed" },
      }));
    });
  }

  const user = detail.user;
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.phone
    : "Unknown user";
  const isClosed = detail.conversation.status === "closed";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{userName}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.phone}
            {user?.email ? ` · ${user.email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[detail.conversation.status]}>
            {STATUS_LABEL[detail.conversation.status]}
          </Badge>
          {!detail.conversation.assignedAdminId && !isClosed ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={assign}
            >
              Assign to me
            </Button>
          ) : null}
          {!isClosed ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={close}
            >
              Close
            </Button>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      >
        {detail.messages.map((message) => {
          const isUser = message.senderType === "user";
          return (
            <div
              key={message.id}
              className={cn("flex", isUser ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-md rounded-2xl px-4 py-2 text-sm",
                  isUser
                    ? "bg-muted text-foreground"
                    : message.senderType === "bot"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className="mt-1 text-[11px] opacity-70">
                  {message.senderType === "user"
                    ? "User"
                    : message.senderType === "bot"
                      ? "Bot"
                      : "Agent"}{" "}
                  · {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!isClosed ? (
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Reply to the user…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button disabled={isSending || !draft.trim()} onClick={send}>
            Send
          </Button>
        </div>
      ) : null}
    </div>
  );
}
