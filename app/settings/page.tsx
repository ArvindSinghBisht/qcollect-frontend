"use client";

import { useState } from "react";
import { Building2, Lock, Moon, Save, Sun, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveRole } from "@/lib/flow";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const systemRole = useAuthStore((state) => state.systemRole || state.user?.systemRole || state.user?.role);
  const selectedProjectRole = useAuthStore((state) => state.selectedProjectRole);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const selectedProjectName = useAuthStore((state) => state.selectedProjectName);
  const role = getEffectiveRole(systemRole, selectedProjectRole) || systemRole;
  const [profile, setProfile] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "", phone: user?.phone || "" });
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  function saveProfile() {
    toast.info("Profile update UI is ready. Connect backend profile endpoint when available.");
  }

  function changePassword() {
    if (!password.newPassword || password.newPassword !== password.confirmPassword) {
      toast.error("New password and confirmation must match");
      return;
    }
    toast.info("Change password UI is ready. Connect backend password endpoint when available.");
  }

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Settings" description="Profile, theme, tenant information and password controls.">
        <RoleBadge role={role} />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-teal-600" />Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2"><Label>First Name</Label><Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
              <label className="space-y-2"><Label>Last Name</Label><Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
            </div>
            <label className="space-y-2"><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
            <label className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
            <Button onClick={saveProfile} className="rounded-lg font-semibold"><Save className="h-4 w-4" />Save Profile</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-teal-600" />Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2"><Label>Old Password</Label><Input type="password" value={password.oldPassword} onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })} /></label>
            <label className="space-y-2"><Label>New Password</Label><Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></label>
            <label className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /></label>
            <Button onClick={changePassword} className="rounded-lg font-semibold">Update Password</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5 text-teal-600" />Theme</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Toggle dark/light mode locally for demo and operations view.</p>
            <Button variant="outline" onClick={toggleTheme} className="rounded-lg"><Sun className="h-4 w-4" /><Moon className="h-4 w-4" />Toggle Theme</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-teal-600" />Tenant Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Info label="Tenant ID" value={user?.tenantId || "Not returned by login yet"} />
            <Info label="User ID" value={user?.userId || "Not returned by login yet"} />
            <Info label="System Role" value={(systemRole || "USER").toString()} />
            <Info label="Selected Project" value={selectedProjectName || selectedProjectId || "No project selected"} />
            <Info label="Workspace Role" value={(role || "USER").toString()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-all font-bold">{value}</p></div>;
}
