"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  createArticleAction,
  removeArticleMediaAction,
  updateArticleAction,
  uploadArticleMediaAction,
} from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { ArticleCategory, ArticleRow, ArticleStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArticleStatusBadge } from "./articles-table";

const CATEGORIES: ArticleCategory[] = ["news", "press", "product", "community"];
const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MEDIA_TYPES = `${IMAGE_TYPES},video/mp4,video/webm`;

export function ArticleForm({
  article,
  canManage,
}: {
  article?: ArticleRow;
  canManage: boolean;
}) {
  const dict = useDict();
  const t = dict.articles;
  const router = useRouter();
  const [current, setCurrent] = useState<ArticleRow | undefined>(article);
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [category, setCategory] = useState<ArticleCategory>(
    article?.category ?? "news",
  );
  const [isPending, startTransition] = useTransition();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const bodyPlainLength = body.replace(/<[^>]*>/g, "").trim().length;
  const valid = title.trim().length >= 3 && bodyPlainLength >= 20;
  const readOnly = !canManage;

  function handleSave() {
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        body: body.trim(),
        category,
      };
      if (current) {
        const result = await updateArticleAction(current.id, payload);
        if (result.ok && result.article) {
          setCurrent(result.article);
          toast.success(t.savedToast);
        } else {
          toast.error(describeApiError(dict, result.error));
        }
      } else {
        const result = await createArticleAction(payload);
        if (result.ok && result.article) {
          toast.success(t.createdToast);
          router.replace(`/articles/${result.article.id}`);
        } else {
          toast.error(describeApiError(dict, result.error));
        }
      }
    });
  }

  function setStatus(status: ArticleStatus) {
    if (!current) {
      return;
    }
    startTransition(async () => {
      const result = await updateArticleAction(current.id, { status });
      if (result.ok && result.article) {
        setCurrent(result.article);
        toast.success(
          status === "published" ? t.publishedToast : t.savedToast,
        );
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function uploadMedia(target: "cover" | "gallery", file: File) {
    if (!current) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("target", target);
      formData.set("file", file);
      const result = await uploadArticleMediaAction(current.id, formData);
      if (result.ok && result.article) {
        setCurrent(result.article);
        toast.success(t.mediaUploadedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  function removeMedia(mediaId: string) {
    if (!current) {
      return;
    }
    startTransition(async () => {
      const result = await removeArticleMediaAction(current.id, mediaId);
      if (result.ok && result.article) {
        setCurrent(result.article);
        toast.success(t.mediaRemovedToast);
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/articles"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t.backToArticles}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold">
            {current ? t.editTitle : t.newArticle}
          </h1>
          {current ? (
            <ArticleStatusBadge status={current.status} dict={dict} />
          ) : null}
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            {current && current.status !== "published" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setStatus("published")}
              >
                {t.publish}
              </Button>
            ) : null}
            {current && current.status === "published" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setStatus("archived")}
              >
                {t.unpublish}
              </Button>
            ) : null}
            <Button size="sm" disabled={isPending || !valid} onClick={handleSave}>
              {isPending ? t.saving : current ? t.save : t.create}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="article-title">{t.fieldTitle}</Label>
            <Input
              id="article-title"
              value={title}
              disabled={readOnly}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="article-excerpt">{t.fieldExcerpt}</Label>
            <Textarea
              id="article-excerpt"
              rows={2}
              maxLength={500}
              disabled={readOnly}
              placeholder={t.excerptHint}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="article-body">{t.fieldBody}</Label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder={t.bodyHint}
              editable={!readOnly}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t.fieldCategory}</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                if (value) setCategory(value as ArticleCategory);
              }}
            >
              <SelectTrigger disabled={readOnly}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.categories[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {current ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>{t.coverImage}</Label>
                {current.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.coverImageUrl}
                    alt={current.title}
                    className="aspect-video w-full rounded-lg border object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                    {t.noCover}
                  </div>
                )}
                {canManage ? (
                  <>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept={IMAGE_TYPES}
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadMedia("cover", file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <ImagePlus className="size-3.5" />
                      {current.coverImageUrl ? t.replaceCover : t.uploadCover}
                    </Button>
                  </>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t.gallery}</Label>
                {current.media.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t.noMedia}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {current.media.map((item) => (
                      <div key={item.id} className="group relative">
                        {item.mediaType === "video" ? (
                          <video
                            src={item.url}
                            controls
                            className="aspect-video w-full rounded-lg border object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt=""
                            className="aspect-video w-full rounded-lg border object-cover"
                          />
                        )}
                        {canManage ? (
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={t.removeMedia}
                            disabled={isPending}
                            onClick={() => removeMedia(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                {canManage ? (
                  <>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept={MEDIA_TYPES}
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadMedia("gallery", file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Upload className="size-3.5" />
                      {t.addMedia}
                    </Button>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{t.mediaAfterCreate}</p>
          )}
        </div>
      </div>
    </div>
  );
}
