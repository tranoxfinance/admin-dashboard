"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Languages, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  countEmailCampaignAudienceAction,
  previewEmailCampaignAction,
  sendEmailCampaignAction,
  sendEmailCampaignTestAction,
  translateTextsAction,
  uploadEmailCampaignImageAction,
} from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import type {
  EmailCampaignAction,
  EmailCampaignAudience,
  EmailCampaignContent,
  EmailCampaignCountry,
  EmailCampaignImage,
  EmailCampaignLocale,
  EmailCampaignVersion,
  EmailCampaignVersions,
} from "@/lib/types";
import { useDict } from "@/components/i18n-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Segmented, segmentClassName } from "@/components/segmented";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const ALL_COUNTRIES = "all";
const LOCALES: EmailCampaignLocale[] = ["en", "fr"];
const MAX_MODULES = 3;
const PREVIEW_DELAY_MS = 700;
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIRECT_BYTES = 3.5 * 1024 * 1024;
const UPLOAD_MAX_WIDTH = 2400;
const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ModuleDraft {
  eyebrow: string;
  title: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  actionLabel: string;
  actionUrl: string;
}

interface Draft {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  heroUrl: string;
  heroAlt: string;
  sectionEyebrow: string;
  title: string;
  titleAccent: string;
  text: string;
  bullets: string;
  actionLabel: string;
  actionUrl: string;
  finePrint: string;
  modules: ModuleDraft[];
}

type ImageSizes = Record<string, { width: number; height: number } | null>;

const TRANSLATABLE_FIELDS = [
  "subject",
  "preheader",
  "eyebrow",
  "headline",
  "headlineAccent",
  "heroAlt",
  "sectionEyebrow",
  "title",
  "titleAccent",
  "text",
  "bullets",
  "actionLabel",
  "finePrint",
] as const;

const TRANSLATABLE_MODULE_FIELDS = [
  "eyebrow",
  "title",
  "text",
  "imageAlt",
  "actionLabel",
] as const;

const EMPTY_MODULE: ModuleDraft = {
  eyebrow: "",
  title: "",
  text: "",
  imageUrl: "",
  imageAlt: "",
  actionLabel: "",
  actionUrl: "",
};

const EMPTY_DRAFT: Draft = {
  subject: "",
  preheader: "",
  eyebrow: "",
  headline: "",
  headlineAccent: "",
  heroUrl: "",
  heroAlt: "",
  sectionEyebrow: "",
  title: "",
  titleAccent: "",
  text: "",
  bullets: "",
  actionLabel: "",
  actionUrl: "",
  finePrint: "",
  modules: [],
};

const EMPTY_DRAFTS: Record<EmailCampaignLocale, Draft> = {
  en: EMPTY_DRAFT,
  fr: EMPTY_DRAFT,
};

function paragraphsOf(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function linesOf(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function actionOf(label: string, url: string): EmailCampaignAction | undefined {
  return label.trim() && url.trim()
    ? { label: label.trim(), url: url.trim() }
    : undefined;
}

function imageOf(
  url: string,
  alt: string,
  sizes: ImageSizes,
): EmailCampaignImage | undefined {
  const size = sizes[url.trim()];
  return url.trim() && alt.trim() && size
    ? { url: url.trim(), alt: alt.trim(), ...size }
    : undefined;
}

function toContent(draft: Draft, sizes: ImageSizes): EmailCampaignContent {
  const bullets = linesOf(draft.bullets);
  const modules = draft.modules
    .map((module) => ({
      eyebrow: module.eyebrow.trim(),
      title: module.title.trim(),
      paragraphs: paragraphsOf(module.text),
      image: imageOf(module.imageUrl, module.imageAlt, sizes),
      action: actionOf(module.actionLabel, module.actionUrl),
    }))
    .filter(
      (module) => module.eyebrow && module.title && module.paragraphs.length,
    );
  return {
    eyebrow: draft.eyebrow.trim(),
    headline: draft.headline.trim(),
    headlineAccent: optional(draft.headlineAccent),
    heroImage: imageOf(draft.heroUrl, draft.heroAlt, sizes),
    sectionEyebrow: optional(draft.sectionEyebrow),
    title: draft.title.trim(),
    titleAccent: optional(draft.titleAccent),
    paragraphs: paragraphsOf(draft.text),
    bullets: bullets.length ? bullets : undefined,
    action: actionOf(draft.actionLabel, draft.actionUrl),
    modules: modules.length ? modules : undefined,
    finePrint: optional(draft.finePrint),
    preheader: optional(draft.preheader),
  };
}

function toVersion(draft: Draft, sizes: ImageSizes): EmailCampaignVersion {
  return { subject: draft.subject.trim(), content: toContent(draft, sizes) };
}

function isComplete(draft: Draft): boolean {
  return Boolean(
    draft.subject.trim() &&
    draft.eyebrow.trim() &&
    draft.headline.trim() &&
    draft.title.trim() &&
    paragraphsOf(draft.text).length,
  );
}

function isBlank(draft: Draft): boolean {
  return (
    !draft.modules.length &&
    Object.entries(draft).every(
      ([key, value]) => key === "modules" || !String(value).trim(),
    )
  );
}

function useImageSizes(urls: string[]): ImageSizes {
  const [sizes, setSizes] = useState<ImageSizes>({});
  const key = urls.join("\n");

  useEffect(() => {
    const images = key
      .split("\n")
      .filter((url) => url.startsWith("https://"))
      .map((url) => {
        const image = new Image();
        image.onload = () =>
          setSizes((current) => ({
            ...current,
            [url]: { width: image.naturalWidth, height: image.naturalHeight },
          }));
        image.onerror = () =>
          setSizes((current) => ({ ...current, [url]: null }));
        image.src = url;
        return image;
      });
    return () => {
      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [key]);

  return sizes;
}

async function prepareUpload(file: File): Promise<Blob> {
  if (file.size <= UPLOAD_DIRECT_BYTES) {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, UPLOAD_MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      type,
      0.9,
    ),
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  hint,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function AreaField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ImageUrlField({
  id,
  value,
  onChange,
  hint,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}) {
  const dict = useDict();
  const t = dict.emailCampaigns;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!UPLOAD_TYPES.includes(file.type)) {
      toast.error(dict.errors.EMAIL_IMAGE_INVALID);
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error(t.uploadTooLarge);
      return;
    }
    startUpload(async () => {
      try {
        const formData = new FormData();
        formData.append("file", await prepareUpload(file), file.name);
        const result = await uploadEmailCampaignImageAction(formData);
        if (result.ok && result.image) {
          onChange(result.image.url);
        } else {
          toast.error(describeApiError(dict, result.error));
        }
      } catch {
        toast.error(dict.errors.EMAIL_IMAGE_INVALID);
      }
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{t.imageUrl}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          maxLength={500}
          placeholder="https://"
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload data-icon="inline-start" />
          {isUploading ? t.uploading : t.upload}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function CampaignComposer({ canSend }: { canSend: boolean }) {
  const dict = useDict();
  const t = dict.emailCampaigns;
  const [country, setCountry] = useState<EmailCampaignCountry | undefined>();
  const [active, setActive] = useState<EmailCampaignLocale>("en");
  const [drafts, setDrafts] =
    useState<Record<EmailCampaignLocale, Draft>>(EMPTY_DRAFTS);
  const [audienceState, setAudienceState] = useState<{
    key: string;
    counts: EmailCampaignAudience;
  } | null>(null);
  const [previewState, setPreviewState] = useState<{
    locale: EmailCampaignLocale;
    html: string | null;
    failed: boolean;
  } | null>(null);
  const [isTesting, startTest] = useTransition();
  const [isTranslating, startTranslate] = useTransition();

  const draft = drafts[active];
  const source: EmailCampaignLocale = active === "en" ? "fr" : "en";
  const imageUrls = useMemo(
    () =>
      LOCALES.flatMap((locale) => [
        drafts[locale].heroUrl,
        ...drafts[locale].modules.map((module) => module.imageUrl),
      ])
        .map((url) => url.trim())
        .filter(Boolean),
    [drafts],
  );
  const sizes = useImageSizes(imageUrls);
  const activeComplete = isComplete(draft);
  const activeVersion = useMemo(() => toVersion(draft, sizes), [draft, sizes]);
  const included = LOCALES.filter((locale) => !isBlank(drafts[locale]));
  const allIncludedComplete = included.every((locale) =>
    isComplete(drafts[locale]),
  );

  const audienceKey = country ?? ALL_COUNTRIES;
  const counts =
    audienceState?.key === audienceKey ? audienceState.counts : null;
  const total = counts
    ? included.reduce((sum, locale) => sum + counts[locale], 0)
    : null;
  const format = (value: number) =>
    value.toLocaleString(dict.common.dateLocale);

  useEffect(() => {
    let cancelled = false;
    countEmailCampaignAudienceAction(country).then((result) => {
      if (!cancelled && result.ok && result.counts) {
        setAudienceState({ key: audienceKey, counts: result.counts });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [country, audienceKey]);

  useEffect(() => {
    if (!activeComplete) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      previewEmailCampaignAction(active, activeVersion).then((result) => {
        if (cancelled) {
          return;
        }
        setPreviewState((current) => ({
          locale: active,
          html:
            result.ok && result.html
              ? result.html
              : current?.locale === active
                ? current.html
                : null,
          failed: !result.ok,
        }));
      });
    }, PREVIEW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, activeVersion, activeComplete]);

  function setDraft(updater: (current: Draft) => Draft) {
    setDrafts((current) => ({
      ...current,
      [active]: updater(current[active]),
    }));
  }

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateModule(
    index: number,
    field: keyof ModuleDraft,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      modules: current.modules.map((module, position) =>
        position === index ? { ...module, [field]: value } : module,
      ),
    }));
  }

  function imageError(url: string): string | undefined {
    return url.trim() && sizes[url.trim()] === null
      ? t.imageInvalid
      : undefined;
  }

  function handleTranslate() {
    const from = drafts[source];
    const texts: string[] = [];
    const setters: ((value: string, target: Draft) => void)[] = [];
    for (const field of TRANSLATABLE_FIELDS) {
      if (from[field].trim()) {
        texts.push(from[field]);
        setters.push((value, target) => {
          target[field] = value;
        });
      }
    }
    from.modules.forEach((module, index) => {
      for (const field of TRANSLATABLE_MODULE_FIELDS) {
        if (module[field].trim()) {
          texts.push(module[field]);
          setters.push((value, target) => {
            target.modules[index][field] = value;
          });
        }
      }
    });
    if (!texts.length) {
      return;
    }
    const target = active;
    startTranslate(async () => {
      const result = await translateTextsAction(texts, target);
      if (!result.ok || !result.translations) {
        toast.error(describeApiError(dict, result.error));
        return;
      }
      const next: Draft = {
        ...from,
        modules: from.modules.map((module) => ({ ...module })),
      };
      result.translations.forEach((value, index) =>
        setters[index](value, next),
      );
      setDrafts((current) => ({ ...current, [target]: next }));
      toast.success(t.translated);
    });
  }

  function handleTest() {
    startTest(async () => {
      const result = await sendEmailCampaignTestAction(active, activeVersion);
      if (result.ok && result.sentTo) {
        toast.success(t.testSent(result.sentTo));
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  async function handleSend(): Promise<boolean> {
    const versions: EmailCampaignVersions = {};
    for (const locale of included) {
      versions[locale] = toVersion(drafts[locale], sizes);
    }
    const result = await sendEmailCampaignAction({ country, versions });
    if (result.ok) {
      toast.success(t.queued);
      setDrafts(EMPTY_DRAFTS);
      setPreviewState(null);
      return true;
    }
    toast.error(describeApiError(dict, result.error));
    return false;
  }

  const sourceHasContent = !isBlank(drafts[source]);
  const previewHtml =
    activeComplete && previewState?.locale === active
      ? previewState.html
      : null;
  const previewFailed = previewState?.locale === active && previewState.failed;
  const canSubmit =
    included.length > 0 && allIncludedComplete && Boolean(total);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t.audienceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label>{t.country}</Label>
            <Select
              value={country ?? ALL_COUNTRIES}
              onValueChange={(value) =>
                setCountry(value === "NG" || value === "CI" ? value : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COUNTRIES}>{t.countryAll}</SelectItem>
                <SelectItem value="NG">{t.countryNg}</SelectItem>
                <SelectItem value="CI">{t.countryCi}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium tabular-nums">
              {counts && total !== null
                ? t.audienceCount(format(total))
                : t.audienceLoading}
            </p>
            {counts ? (
              <p className="text-xs tabular-nums text-muted-foreground">
                {t.audienceSplit(format(counts.en), format(counts.fr))}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">{t.audienceHint}</p>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented>
              {LOCALES.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  className={segmentClassName(active === locale)}
                  aria-pressed={active === locale}
                  onClick={() => setActive(locale)}
                >
                  {locale === "en" ? t.versionEn : t.versionFr}
                </button>
              ))}
            </Segmented>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!sourceHasContent || isTranslating}
                onClick={handleTranslate}
              >
                <Languages data-icon="inline-start" />
                {isTranslating
                  ? t.translating
                  : source === "en"
                    ? t.translateFromEn
                    : t.translateFromFr}
              </Button>
              {!isBlank(draft) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft(() => EMPTY_DRAFT)}
                >
                  {t.clearVersion}
                </Button>
              ) : null}
            </div>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">
            {active === "en" ? t.versionHintEn : t.versionHintFr}
          </p>
          {!isBlank(draft) && !activeComplete ? (
            <p className="-mt-3 text-xs text-warning">{t.versionIncomplete}</p>
          ) : null}

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t.emailTitle}</h3>
            <TextField
              id={`campaign-${active}-subject`}
              label={t.subject}
              value={draft.subject}
              maxLength={200}
              placeholder={t.subjectPlaceholder}
              onChange={(value) => update("subject", value)}
            />
            <TextField
              id={`campaign-${active}-preheader`}
              label={t.preheader}
              value={draft.preheader}
              maxLength={150}
              hint={t.preheaderHint}
              onChange={(value) => update("preheader", value)}
            />
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t.heroTitle}</h3>
            <TextField
              id={`campaign-${active}-eyebrow`}
              label={t.eyebrow}
              value={draft.eyebrow}
              maxLength={40}
              placeholder={t.eyebrowPlaceholder}
              onChange={(value) => update("eyebrow", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id={`campaign-${active}-headline`}
                label={t.headline}
                value={draft.headline}
                maxLength={80}
                onChange={(value) => update("headline", value)}
              />
              <TextField
                id={`campaign-${active}-headline-accent`}
                label={t.headlineAccent}
                value={draft.headlineAccent}
                maxLength={80}
                onChange={(value) => update("headlineAccent", value)}
              />
            </div>
            <ImageUrlField
              id={`campaign-${active}-hero-url`}
              value={draft.heroUrl}
              hint={t.imageHint}
              error={imageError(draft.heroUrl)}
              onChange={(value) => update("heroUrl", value)}
            />
            <TextField
              id={`campaign-${active}-hero-alt`}
              label={t.imageAlt}
              value={draft.heroAlt}
              maxLength={200}
              onChange={(value) => update("heroAlt", value)}
            />
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t.bodyTitle}</h3>
            <TextField
              id={`campaign-${active}-section-eyebrow`}
              label={t.sectionEyebrow}
              value={draft.sectionEyebrow}
              maxLength={40}
              onChange={(value) => update("sectionEyebrow", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id={`campaign-${active}-title`}
                label={t.messageTitle}
                value={draft.title}
                maxLength={120}
                onChange={(value) => update("title", value)}
              />
              <TextField
                id={`campaign-${active}-title-accent`}
                label={t.messageTitleAccent}
                value={draft.titleAccent}
                maxLength={80}
                onChange={(value) => update("titleAccent", value)}
              />
            </div>
            <AreaField
              id={`campaign-${active}-text`}
              label={t.paragraphs}
              value={draft.text}
              maxLength={4000}
              hint={t.paragraphsHint}
              onChange={(value) => update("text", value)}
            />
            <AreaField
              id={`campaign-${active}-bullets`}
              label={t.bullets}
              value={draft.bullets}
              maxLength={1200}
              hint={t.bulletsHint}
              onChange={(value) => update("bullets", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id={`campaign-${active}-action-label`}
                label={t.actionLabel}
                value={draft.actionLabel}
                maxLength={40}
                onChange={(value) => update("actionLabel", value)}
              />
              <TextField
                id={`campaign-${active}-action-url`}
                label={t.actionUrl}
                value={draft.actionUrl}
                maxLength={500}
                placeholder="https://"
                onChange={(value) => update("actionUrl", value)}
              />
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">{t.modulesTitle}</h3>
              <p className="text-xs text-muted-foreground">{t.modulesHint}</p>
            </div>
            {draft.modules.map((module, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium">
                    {t.moduleHeading(index + 1)}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update(
                        "modules",
                        draft.modules.filter(
                          (_, position) => position !== index,
                        ),
                      )
                    }
                  >
                    <Trash2 data-icon="inline-start" />
                    {t.removeModule}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`campaign-${active}-module-${index}-eyebrow`}
                    label={t.sectionEyebrow}
                    value={module.eyebrow}
                    maxLength={40}
                    onChange={(value) => updateModule(index, "eyebrow", value)}
                  />
                  <TextField
                    id={`campaign-${active}-module-${index}-title`}
                    label={t.messageTitle}
                    value={module.title}
                    maxLength={120}
                    onChange={(value) => updateModule(index, "title", value)}
                  />
                </div>
                <AreaField
                  id={`campaign-${active}-module-${index}-text`}
                  label={t.paragraphs}
                  value={module.text}
                  maxLength={2400}
                  hint={t.paragraphsHint}
                  onChange={(value) => updateModule(index, "text", value)}
                />
                <ImageUrlField
                  id={`campaign-${active}-module-${index}-image`}
                  value={module.imageUrl}
                  error={imageError(module.imageUrl)}
                  onChange={(value) => updateModule(index, "imageUrl", value)}
                />
                <TextField
                  id={`campaign-${active}-module-${index}-alt`}
                  label={t.imageAlt}
                  value={module.imageAlt}
                  maxLength={200}
                  onChange={(value) => updateModule(index, "imageAlt", value)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`campaign-${active}-module-${index}-action-label`}
                    label={t.actionLabel}
                    value={module.actionLabel}
                    maxLength={40}
                    onChange={(value) =>
                      updateModule(index, "actionLabel", value)
                    }
                  />
                  <TextField
                    id={`campaign-${active}-module-${index}-action-url`}
                    label={t.actionUrl}
                    value={module.actionUrl}
                    maxLength={500}
                    placeholder="https://"
                    onChange={(value) =>
                      updateModule(index, "actionUrl", value)
                    }
                  />
                </div>
              </div>
            ))}
            {draft.modules.length < MAX_MODULES ? (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    update("modules", [...draft.modules, { ...EMPTY_MODULE }])
                  }
                >
                  <Plus data-icon="inline-start" />
                  {t.addModule}
                </Button>
              </div>
            ) : null}
          </section>

          <Separator />

          <AreaField
            id={`campaign-${active}-fine-print`}
            label={t.finePrint}
            value={draft.finePrint}
            maxLength={500}
            onChange={(value) => update("finePrint", value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!activeComplete || isTesting}
              onClick={handleTest}
            >
              {isTesting ? t.sending : t.sendTest}
            </Button>
            {canSend ? (
              <ConfirmDialog
                trigger={
                  <Button disabled={!canSubmit}>
                    {total ? t.send(format(total)) : t.sendDisabled}
                  </Button>
                }
                title={t.confirmTitle(format(total ?? 0))}
                description={
                  <>
                    {counts
                      ? t.audienceSplit(
                          format(included.includes("en") ? counts.en : 0),
                          format(included.includes("fr") ? counts.fr : 0),
                        )
                      : null}
                    . {t.confirmDescription}
                  </>
                }
                confirmLabel={t.confirmSend}
                pendingLabel={t.sending}
                destructive
                onConfirm={handleSend}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <CardTitle>
            {t.previewTitle} · {active === "en" ? t.versionEn : t.versionFr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewHtml ? (
            <div className="flex flex-col gap-2">
              {previewFailed ? (
                <p className="text-xs text-destructive">{t.previewError}</p>
              ) : null}
              <iframe
                title={t.previewTitle}
                srcDoc={previewHtml}
                sandbox=""
                className="h-[75vh] w-full rounded-lg border bg-background"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {previewFailed ? t.previewError : t.previewEmpty}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
