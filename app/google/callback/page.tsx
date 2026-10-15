"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const MESSAGE_TYPE = "QCOLLECT_GOOGLE_OAUTH_CALLBACK";

type CallbackState = "processing" | "success" | "error";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<CallbackState>("processing");
  const [message, setMessage] = useState("Completing Google authorization...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");

    if (error || !code) {
      setStatus("error");
      setMessage(error || "Google did not return an authorization code.");
      window.opener?.postMessage(
        {
          type: MESSAGE_TYPE,
          error: error || "Missing authorization code",
          state,
        },
        window.location.origin
      );
      return;
    }

    window.opener?.postMessage(
      {
        type: MESSAGE_TYPE,
        code,
        state,
      },
      window.location.origin
    );

    setStatus("success");
    setMessage("Google authorization received. This window will close automatically.");

    const timer = window.setTimeout(() => window.close(), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-xl dark:bg-slate-900">
        {status === "processing" ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />
        ) : status === "success" ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-600" />
        )}
        <h1 className="mt-5 text-xl font-semibold">Google Sheets Integration</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      </div>
    </main>
  );
}
