import { AlertCircle } from "lucide-react";

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  );
}
