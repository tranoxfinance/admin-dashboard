"use client";

import { useState, useTransition } from "react";
import { BriefcaseBusiness, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createJobAction, updateJobAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { JobEmploymentType, JobOpeningRow } from "@/lib/types";
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

const EMPLOYMENT_TYPES: JobEmploymentType[] = [
  "full_time",
  "part_time",
  "contract",
  "internship",
];

export function JobDialog({ job }: { job?: JobOpeningRow }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(job?.title ?? "");
  const [department, setDepartment] = useState(job?.department ?? "");
  const [location, setLocation] = useState(job?.location ?? "");
  const [employmentType, setEmploymentType] = useState<JobEmploymentType>(
    job?.employmentType ?? "full_time",
  );
  const [description, setDescription] = useState(job?.description ?? "");
  const [requirements, setRequirements] = useState(job?.requirements ?? "");
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.careers;

  const valid =
    title.trim().length >= 3 &&
    department.trim().length >= 2 &&
    location.trim().length >= 2 &&
    description.trim().length >= 20 &&
    requirements.trim().length >= 10;

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        employmentType,
        description: description.trim(),
        requirements: requirements.trim(),
      };
      const result = job
        ? await updateJobAction(job.id, payload)
        : await createJobAction(payload);
      if (result.ok) {
        toast.success(job ? t.jobUpdatedToast : t.jobCreatedToast);
        setOpen(false);
        if (!job) {
          setTitle("");
          setDepartment("");
          setLocation("");
          setEmploymentType("full_time");
          setDescription("");
          setRequirements("");
        }
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {job ? (
        <DialogTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={t.editJob}
        >
          <Pencil className="size-3.5" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" />}>
          <BriefcaseBusiness className="size-3.5" />
          {t.postJob}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{job ? t.editJob : t.postJob}</DialogTitle>
          <DialogDescription>{t.jobDialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-title">{t.fieldTitle}</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="job-department">{t.fieldDepartment}</Label>
              <Input
                id="job-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="job-location">{t.fieldLocation}</Label>
              <Input
                id="job-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.fieldEmploymentType}</Label>
            <Select
              value={employmentType}
              onValueChange={(value) => {
                if (value) setEmploymentType(value as JobEmploymentType);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.employmentTypes[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-description">{t.fieldDescription}</Label>
            <Textarea
              id="job-description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-requirements">{t.fieldRequirements}</Label>
            <Textarea
              id="job-requirements"
              rows={5}
              placeholder={t.requirementsHint}
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
          <Button disabled={isPending || !valid} onClick={handleSubmit}>
            {isPending ? t.saving : job ? t.saveJob : t.postJob}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
