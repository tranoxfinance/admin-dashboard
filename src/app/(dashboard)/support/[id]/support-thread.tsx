"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import {
  assignSupportConversationAction,
  closeSupportConversationAction,
  resolveSupportConversationAction,
  sendSupportReplyAction,
  translateTextsAction,
} from "@/actions/admin";
import { formatDate } from "@/lib/format";
import { describeApiError } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  SupportConversationDetail,
  SupportConversationStatus,
  SupportMessage,
} from "@/lib/types";
import { useDict, useLocale } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT: Record<
  SupportConversationStatus,
  "secondary" | "destructive" | "outline" | "default"
> = {
  bot: "outline",
  pending_agent: "destructive",
  active: "default",
  resolved: "secondary",
  closed: "secondary",
};

export function SupportThread({
  initialDetail,
  conversationId,
  accessToken,
  canManage,
}: {
  initialDetail: SupportConversationDetail;
  conversationId: string;
  accessToken: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const dict = useDict();
  const locale = useLocale();
  const [detail, setDetail] = useState(initialDetail);
  const [draft, setDraft] = useState("");
  const [isSending, startSending] = useTransition();
  const [isMutating, startMutating] = useTransition();
  const [isTranslating, startTranslating] = useTransition();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showTranslations, setShowTranslations] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const statusLabels: Record<SupportConversationStatus, string> = {
    bot: dict.support.statusBot,
    pending_agent: dict.support.statusPendingAgent,
    active: dict.support.statusActive,
    resolved: dict.support.statusResolved,
    closed: dict.support.statusClosed,
  };

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

  function toggleTranslations() {
    if (showTranslations) {
      setShowTranslations(false);
      return;
    }
    const pending = detail.messages.filter(
      (message) => translations[message.id] === undefined,
    );
    if (pending.length === 0) {
      setShowTranslations(true);
      return;
    }
    startTranslating(async () => {
      const result = await translateTextsAction(
        pending.map((message) => message.body),
        locale,
      );
      if (!result.ok || !result.translations) {
        toast.error(describeApiError(dict, result.error));
        return;
      }
      const next = { ...translations };
      pending.forEach((message, index) => {
        next[message.id] = result.translations![index];
      });
      setTranslations(next);
      setShowTranslations(true);
    });
  }

  function send() {
    const message = draft.trim();
    if (!message) {
      return;
    }
    startSending(async () => {
      const result = await sendSupportReplyAction(conversationId, message);
      if (!result.ok || !result.message) {
        toast.error(
          result.error
            ? describeApiError(dict, result.error)
            : dict.support.sendError,
        );
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
        toast.error(
          result.error
            ? describeApiError(dict, result.error)
            : dict.support.assignError,
        );
        return;
      }
      toast.success(dict.support.assignedToast);
      router.refresh();
    });
  }

  function resolve() {
    startMutating(async () => {
      const result = await resolveSupportConversationAction(conversationId);
      if (!result.ok) {
        toast.error(
          result.error
            ? describeApiError(dict, result.error)
            : dict.support.resolveError,
        );
        return;
      }
      toast.success(dict.support.resolvedToast);
      setDetail((current) => ({
        ...current,
        conversation: { ...current.conversation, status: "resolved" },
      }));
    });
  }

  function close() {
    startMutating(async () => {
      const result = await closeSupportConversationAction(conversationId);
      if (!result.ok) {
        toast.error(
          result.error
            ? describeApiError(dict, result.error)
            : dict.support.closeError,
        );
        return;
      }
      toast.success(dict.support.closedToast);
      setDetail((current) => ({
        ...current,
        conversation: { ...current.conversation, status: "closed" },
      }));
    });
  }

  const user = detail.user;
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.phone
    : dict.common.unknownUser;
  const conversation = detail.conversation;
  const isClosed = conversation.status === "closed";
  const isResolved = conversation.status === "resolved";
  const isTicket = conversation.kind === "ticket";

  const senderLabels = {
    user: dict.support.senderUser,
    bot: dict.support.senderBot,
    agent: dict.support.senderAgent,
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {isTicket
              ? (conversation.subject ?? dict.support.untitledTicket)
              : userName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isTicket
              ? [
                  conversation.reference,
                  conversation.category
                    ? dict.support.categories[conversation.category]
                    : null,
                  userName,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : null}
            {isTicket ? <br /> : null}
            {user?.phone}
            {user?.email ? ` · ${user.email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[conversation.status]}>
            {statusLabels[conversation.status]}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            disabled={isTranslating}
            onClick={toggleTranslations}
          >
            <Languages className="size-3.5" />
            {isTranslating
              ? dict.common.translating
              : showTranslations
                ? dict.common.showOriginal
                : dict.common.translate}
          </Button>
          {canManage && !conversation.assignedAdminId && !isClosed ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={assign}
            >
              {dict.support.assignToMe}
            </Button>
          ) : null}
          {canManage && !isClosed && !isResolved ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={resolve}
            >
              {dict.support.markResolved}
            </Button>
          ) : null}
          {canManage && !isClosed ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={close}
            >
              {dict.support.close}
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
          const translated = showTranslations
            ? translations[message.id]
            : undefined;
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
                <p className="whitespace-pre-wrap">
                  {translated ?? message.body}
                </p>
                {translated !== undefined && translated !== message.body ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
                    <Languages className="size-3" />
                    {message.body}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] opacity-70">
                  {senderLabels[message.senderType]} ·{" "}
                  {formatDate(message.createdAt, dict.common.dateLocale)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {canManage && !isClosed ? (
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
            placeholder={dict.support.replyPlaceholder}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button disabled={isSending || !draft.trim()} onClick={send}>
            {dict.support.send}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
