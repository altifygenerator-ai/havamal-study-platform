"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  payload: Record<string, unknown>;
  label: string;
  confirmText?: string;
  children?: ReactNode;
  className?: string;
};

export function AdminActionForm({
  payload,
  label,
  confirmText,
  children,
  className,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmText && !window.confirm(confirmText)) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const dynamicPayload: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      dynamicPayload[key] = value;
    }

    if (typeof dynamicPayload.locked === "string") {
      dynamicPayload.locked = dynamicPayload.locked === "true";
    }
    if (typeof dynamicPayload.enabled === "string") {
      dynamicPayload.enabled = dynamicPayload.enabled === "true";
    }
    if (typeof dynamicPayload.value === "string") {
      dynamicPayload.value = dynamicPayload.value === "true";
    }
    if (typeof dynamicPayload.hours === "string") {
      dynamicPayload.hours = dynamicPayload.hours ? Number(dynamicPayload.hours) : null;
    }

    setWorking(true);
    setMessage("");
    const response = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, ...dynamicPayload }),
    });
    const result = await response.json();
    setWorking(false);

    if (!response.ok) {
      setMessage(result.error || "The action failed.");
      return;
    }

    setMessage("Saved.");
    router.refresh();
  }

  return (
    <form className={className || "admin-action-form"} onSubmit={submit}>
      {children}
      <button type="submit" disabled={working}>
        {working ? "Saving…" : label}
      </button>
      <span aria-live="polite">{message}</span>
    </form>
  );
}
