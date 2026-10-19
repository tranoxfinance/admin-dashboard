"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  countEmailCampaignAudienceAction,
  previewEmailCampaignAction,
  sendEmailCampaignAction,
  sendEmailCampaignTestAction,
} from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import type {
  EmailCampaignAction,
  EmailCampaignContent,
  EmailCampaignCountry,
  EmailCampaignDraft,
  EmailCampaignImage,
  EmailCampaignLocale,
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
const MAX_MODULES = 3;
const PREVIEW_DELAY_MS = 700;

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

function isComplete(draft: Draft): boolean {
  return Boolean(
    draft.subject.trim() &&
    draft.eyebrow.trim() &&
    draft.headline.trim() &&
    draft.title.trim() &&
    paragraphsOf(draft.text).length,
  );
}

function useImageSizes(urls: string[]): ImageSizes {
  const [sizes, setSizes] = useState<ImageSizes>({});
  const key = urls.join("\n");

  useEffect(() => {
    const pending = key.split("\n").filter((url) => url.startsWith("https://"));
    const images = pending.map((url) => {
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

export function CampaignComposer({ canSend }: { canSend: boolean }) {
  const dict = useDict();
  const t = dict.emailCampaigns;
  const [locale, setLocale] = useState<EmailCampaignLocale>("en");
  const [country, setCountry] = useState<EmailCampaignCountry | undefined>();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [audienceCount, setAudienceCount] = useState<{
    key: string;
    count: number;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isTesting, startTest] = useTransition();

  const imageUrls = useMemo(
    () =>
      [draft.heroUrl, ...draft.modules.map((module) => module.imageUrl)]
        .map((url) => url.trim())
        .filter(Boolean),
    [draft.heroUrl, draft.modules],
  );
  const sizes = useImageSizes(imageUrls);
  const complete = isComplete(draft);
  const payload = useMemo<EmailCampaignDraft>(
    () => ({
      subject: draft.subject.trim(),
      locale,
      country,
      content: toContent(draft, sizes),
    }),
    [draft, sizes, locale, country],
  );

  const audienceKey = `${locale}:${country ?? ALL_COUNTRIES}`;
  const audience =
    audienceCount?.key === audienceKey ? audienceCount.count : null;

  useEffect(() => {
    let cancelled = false;
    countEmailCampaignAudienceAction(locale, country).then((result) => {
      if (!cancelled && result.ok) {
        setAudienceCount({ key: audienceKey, count: result.count ?? 0 });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale, country, audienceKey]);

  useEffect(() => {
    if (!complete) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      previewEmailCampaignAction(payload).then((result) => {
        if (cancelled) {
          return;
        }
        setPreviewFailed(!result.ok);
        if (result.ok && result.html) {
          setPreviewHtml(result.html);
        }
      });
    }, PREVIEW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [payload, complete]);

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

  function handleTest() {
    startTest(async () => {
      const result = await sendEmailCampaignTestAction(payload);
      if (result.ok && result.sentTo) {
        toast.success(t.testSent(result.sentTo));
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  async function handleSend(): Promise<boolean> {
    const result = await sendEmailCampaignAction(payload);
    if (result.ok) {
      toast.success(t.queued);
      setDraft(EMPTY_DRAFT);
      setPreviewHtml(null);
      return true;
    }
    toast.error(describeApiError(dict, result.error));
    return false;
  }

  const audienceLabel =
    audience === null ? null : audience.toLocaleString(dict.common.dateLocale);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t.audienceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t.language}</Label>
              <Segmented>
                {(["en", "fr"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={segmentClassName(locale === value)}
                    aria-pressed={locale === value}
                    onClick={() => setLocale(value)}
                  >
                    {value === "en" ? t.languageEn : t.languageFr}
                  </button>
                ))}
              </Segmented>
            </div>
            <div className="flex min-w-48 flex-col gap-2">
              <Label>{t.country}</Label>
              <Select
                value={country ?? ALL_COUNTRIES}
                onValueChange={(value) =>
                  setCountry(
                    value === "NG" || value === "CI" ? value : undefined,
                  )
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
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium tabular-nums">
              {audienceLabel === null
                ? t.audienceLoading
                : t.audienceCount(audienceLabel)}
            </p>
            <p className="text-xs text-muted-foreground">{t.audienceHint}</p>
          </div>

          <Separator />

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t.emailTitle}</h3>
            <TextField
              id="campaign-subject"
              label={t.subject}
              value={draft.subject}
              maxLength={200}
              placeholder={t.subjectPlaceholder}
              onChange={(value) => update("subject", value)}
            />
            <TextField
              id="campaign-preheader"
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
              id="campaign-eyebrow"
              label={t.eyebrow}
              value={draft.eyebrow}
              maxLength={40}
              placeholder={t.eyebrowPlaceholder}
              onChange={(value) => update("eyebrow", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="campaign-headline"
                label={t.headline}
                value={draft.headline}
                maxLength={80}
                onChange={(value) => update("headline", value)}
              />
              <TextField
                id="campaign-headline-accent"
                label={t.headlineAccent}
                value={draft.headlineAccent}
                maxLength={80}
                onChange={(value) => update("headlineAccent", value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="campaign-hero-url"
                label={t.imageUrl}
                value={draft.heroUrl}
                maxLength={500}
                hint={t.imageHint}
                error={imageError(draft.heroUrl)}
                onChange={(value) => update("heroUrl", value)}
              />
              <TextField
                id="campaign-hero-alt"
                label={t.imageAlt}
                value={draft.heroAlt}
                maxLength={200}
                onChange={(value) => update("heroAlt", value)}
              />
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t.bodyTitle}</h3>
            <TextField
              id="campaign-section-eyebrow"
              label={t.sectionEyebrow}
              value={draft.sectionEyebrow}
              maxLength={40}
              onChange={(value) => update("sectionEyebrow", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="campaign-title"
                label={t.messageTitle}
                value={draft.title}
                maxLength={120}
                onChange={(value) => update("title", value)}
              />
              <TextField
                id="campaign-title-accent"
                label={t.messageTitleAccent}
                value={draft.titleAccent}
                maxLength={80}
                onChange={(value) => update("titleAccent", value)}
              />
            </div>
            <AreaField
              id="campaign-text"
              label={t.paragraphs}
              value={draft.text}
              maxLength={4000}
              hint={t.paragraphsHint}
              onChange={(value) => update("text", value)}
            />
            <AreaField
              id="campaign-bullets"
              label={t.bullets}
              value={draft.bullets}
              maxLength={1200}
              hint={t.bulletsHint}
              onChange={(value) => update("bullets", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="campaign-action-label"
                label={t.actionLabel}
                value={draft.actionLabel}
                maxLength={40}
                onChange={(value) => update("actionLabel", value)}
              />
              <TextField
                id="campaign-action-url"
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
                    id={`campaign-module-${index}-eyebrow`}
                    label={t.sectionEyebrow}
                    value={module.eyebrow}
                    maxLength={40}
                    onChange={(value) => updateModule(index, "eyebrow", value)}
                  />
                  <TextField
                    id={`campaign-module-${index}-title`}
                    label={t.messageTitle}
                    value={module.title}
                    maxLength={120}
                    onChange={(value) => updateModule(index, "title", value)}
                  />
                </div>
                <AreaField
                  id={`campaign-module-${index}-text`}
                  label={t.paragraphs}
                  value={module.text}
                  maxLength={2400}
                  hint={t.paragraphsHint}
                  onChange={(value) => updateModule(index, "text", value)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`campaign-module-${index}-image`}
                    label={t.imageUrl}
                    value={module.imageUrl}
                    maxLength={500}
                    error={imageError(module.imageUrl)}
                    onChange={(value) => updateModule(index, "imageUrl", value)}
                  />
                  <TextField
                    id={`campaign-module-${index}-alt`}
                    label={t.imageAlt}
                    value={module.imageAlt}
                    maxLength={200}
                    onChange={(value) => updateModule(index, "imageAlt", value)}
                  />
                  <TextField
                    id={`campaign-module-${index}-action-label`}
                    label={t.actionLabel}
                    value={module.actionLabel}
                    maxLength={40}
                    onChange={(value) =>
                      updateModule(index, "actionLabel", value)
                    }
                  />
                  <TextField
                    id={`campaign-module-${index}-action-url`}
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
            id="campaign-fine-print"
            label={t.finePrint}
            value={draft.finePrint}
            maxLength={500}
            onChange={(value) => update("finePrint", value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!complete || isTesting}
              onClick={handleTest}
            >
              {isTesting ? t.sending : t.sendTest}
            </Button>
            {canSend ? (
              <ConfirmDialog
                trigger={
                  <Button disabled={!complete || !audience}>
                    {audienceLabel && audience
                      ? t.send(audienceLabel)
                      : t.sendDisabled}
                  </Button>
                }
                title={t.confirmTitle(audienceLabel ?? "0")}
                description={t.confirmDescription}
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
          <CardTitle>{t.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {complete && previewHtml ? (
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
