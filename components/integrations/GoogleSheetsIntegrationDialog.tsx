"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, Sheet, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import {
  connectGoogleProject,
  getGoogleAuthorizationUrl,
  getGoogleSpreadsheets,
  selectGoogleSpreadsheet,
} from "@/services/google-integration.service";
import type { GoogleSpreadsheet } from "@/types/google-integration";

const MESSAGE_TYPE = "QCOLLECT_GOOGLE_OAUTH_CALLBACK";

type Props = {
  projectId: string;
};

type OAuthMessage = {
  type?: string;
  code?: string;
  error?: string;
  state?: string | null;
};

function isNotConnectedError(error: unknown) {
  return getErrorMessage(error, "").toLowerCase().includes("not connected");
}

export default function GoogleSheetsIntegrationDialog({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheet[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const popupRef = useRef<Window | null>(null);

  const selectedSpreadsheet = useMemo(
    () => spreadsheets.find((sheet) => sheet.spreadsheetId === spreadsheetId),
    [spreadsheetId, spreadsheets]
  );

  const loadSpreadsheets = useCallback(
    async (silent = false) => {
      try {
        setLoading(true);
        const response = await getGoogleSpreadsheets(projectId);
        const data = unwrapApiData<GoogleSpreadsheet[]>(response, []);
        setSpreadsheets(data);
        setConnected(true);
      } catch (error) {
        setSpreadsheets([]);
        setConnected(false);

        if (!silent && !isNotConnectedError(error)) {
          toast.error(getErrorMessage(error, "Failed to load Google spreadsheets"));
        }
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (open) void loadSpreadsheets(true);
  }, [loadSpreadsheets, open]);

  useEffect(() => {
    async function handleOAuthMessage(event: MessageEvent<OAuthMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== MESSAGE_TYPE) return;

      popupRef.current?.close();
      popupRef.current = null;

      if (event.data.state !== projectId) {
        setConnecting(false);
        toast.error("Google authorization could not be matched to this project");
        return;
      }

      if (event.data.error || !event.data.code) {
        setConnecting(false);
        toast.error(event.data.error || "Google authorization failed");
        return;
      }

      try {
        await connectGoogleProject(projectId, {
          authorizationCode: event.data.code,
        });
        setConnected(true);
        toast.success("Google account connected successfully");
        await loadSpreadsheets();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Google account"));
      } finally {
        setConnecting(false);
      }
    }

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [loadSpreadsheets, projectId]);

  async function handleConnect() {
    try {
      setConnecting(true);
      const response = await getGoogleAuthorizationUrl();
      const authorizationUrl = unwrapApiData<string>(response, "");

      if (!authorizationUrl) {
        throw new Error("Backend did not return the Google authorization URL");
      }

      const url = new URL(authorizationUrl);
      url.searchParams.set("state", projectId);

      popupRef.current = window.open(
        url.toString(),
        "qcollect-google-oauth",
        "popup=yes,width=560,height=720,left=200,top=80"
      );

      if (!popupRef.current) {
        throw new Error("Popup was blocked. Allow popups and try again.");
      }

      popupRef.current.focus();
    } catch (error) {
      setConnecting(false);
      toast.error(getErrorMessage(error, "Unable to start Google authorization"));
    }
  }

  async function handleSave() {
    if (!selectedSpreadsheet) {
      toast.error("Select a Google spreadsheet");
      return;
    }

    const normalizedSheetName = sheetName.trim();
    if (!normalizedSheetName) {
      toast.error("Enter the exact sheet tab name");
      return;
    }

    try {
      setSaving(true);
      await selectGoogleSpreadsheet(projectId, {
        spreadsheetId: selectedSpreadsheet.spreadsheetId,
        spreadsheetName: selectedSpreadsheet.spreadsheetName,
        sheetName: normalizedSheetName,
      });
      toast.success("Google Sheet selected successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to select Google Sheet"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="rounded-lg font-semibold" />
        }
      >
        <Sheet className="h-4 w-4" /> Google Sheets
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Google Sheets Integration</DialogTitle>
          <DialogDescription>
            Connect the Project Admin&apos;s Google account and choose the spreadsheet where project submissions will be synced.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-lg border bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-3 ${connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {connected ? <CheckCircle2 className="h-5 w-5" /> : <Unplug className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold">{connected ? "Google account connected" : "Google account not connected"}</p>
                <p className="text-xs text-slate-500">
                  {connected ? "Select a spreadsheet and its exact sheet-tab name below." : "Authorize Google Drive and Sheets access for this project."}
                </p>
              </div>
            </div>

            <Button
              variant={connected ? "outline" : "default"}
              className="rounded-xl font-semibold"
              disabled={connecting}
              onClick={handleConnect}
            >
              <ExternalLink className="h-4 w-4" />
              {connecting ? "Connecting..." : connected ? "Reconnect" : "Connect Google"}
            </Button>
          </div>

          {connected ? (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Select destination spreadsheet</h3>
                  <p className="text-xs text-slate-500">Only Google Sheets accessible to the connected account are shown.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  disabled={loading}
                  onClick={() => void loadSpreadsheets()}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`google-spreadsheet-${projectId}`}>Spreadsheet</Label>
                <select
                  id={`google-spreadsheet-${projectId}`}
                  value={spreadsheetId}
                  disabled={loading}
                  onChange={(event) => setSpreadsheetId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">{loading ? "Loading spreadsheets..." : "Select spreadsheet"}</option>
                  {spreadsheets.map((spreadsheet) => (
                    <option key={spreadsheet.spreadsheetId} value={spreadsheet.spreadsheetId}>
                      {spreadsheet.spreadsheetName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`google-sheet-name-${projectId}`}>Sheet tab name</Label>
                <Input
                  id={`google-sheet-name-${projectId}`}
                  value={sheetName}
                  placeholder="Sheet1"
                  onChange={(event) => setSheetName(event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Enter the exact tab name inside the selected spreadsheet, for example <b>Sheet1</b> or <b>Submissions</b>.
                </p>
              </div>

              <Button
                className="w-full rounded-xl font-semibold"
                disabled={saving || !selectedSpreadsheet || !sheetName.trim()}
                onClick={handleSave}
              >
                <Sheet className="h-4 w-4" />
                {saving ? "Saving..." : "Use This Google Sheet"}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
