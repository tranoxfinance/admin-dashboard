"use client";

import { useState, useTransition } from "react";
import { HelpCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createFaqAction, updateFaqAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { FaqRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FaqDialog({ faq }: { faq?: FaqRow }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [sortOrder, setSortOrder] = useState(String(faq?.sortOrder ?? 0));
  const [isPublished, setIsPublished] = useState(faq?.isPublished ?? true);
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.faq;

  const valid = question.trim().length >= 3 && answer.trim().length >= 1;

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
        isPublished,
      };
      const result = faq
        ? await updateFaqAction(faq.id, payload)
        : await createFaqAction(payload);
      if (result.ok) {
        toast.success(faq ? t.updatedToast : t.createdToast);
        setOpen(false);
        if (!faq) {
          setQuestion("");
          setAnswer("");
          setSortOrder("0");
          setIsPublished(true);
        }
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {faq ? (
        <DialogTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={t.editFaq}
        >
          <Pencil className="size-3.5" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>
          <HelpCircle className="size-3.5" />
          {t.addFaq}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{faq ? t.editFaq : t.addFaq}</DialogTitle>
          <DialogDescription>{t.faqDialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="faq-question">{t.fieldQuestion}</Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="faq-answer">{t.fieldAnswer}</Label>
            <Textarea
              id="faq-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={5}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="faq-sort-order">{t.fieldSortOrder}</Label>
              <Input
                id="faq-sort-order"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t.sortOrderHint}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t.fieldPublished}</Label>
              <Select
                value={isPublished ? "published" : "hidden"}
                onValueChange={(value) => {
                  if (value) setIsPublished(value === "published");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">
                    {t.publishedBadge}
                  </SelectItem>
                  <SelectItem value="hidden">{t.hiddenBadge}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
          <Button disabled={isPending || !valid} onClick={handleSubmit}>
            {isPending ? t.saving : faq ? t.save : t.addFaq}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
