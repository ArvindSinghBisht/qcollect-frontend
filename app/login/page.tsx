"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Layers3, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginFormData } from "@/lib/validations/login.schema";
import { useAuth } from "@/hooks/useAuth";
import { flowSteps } from "@/lib/flow";
import axios from "axios";

const loginTypes = [
  "Super Admin",
  "Tenant Admin",
  "User / Project Role",
  "Project Admin",
  "Accessor",
  "Quality Checker",
];

export default function LoginPage() {
  const { loginUser } = useAuth();
  const [selected, setSelected] = useState("Super Admin");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data.email, data.password);
      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
    
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error;
    
        if (!error.response) {
          toast.error(
            "Cannot connect to the backend. Please check that backend and frontend proxy are running."
          );
          return;
        }
    
        toast.error(
          backendMessage ||
            "Login failed. Please verify your email and password."
        );
    
        return;
      }
    
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="About QCollect">
        <Link href="/login" className="login-brand"><span className="brand-symbol"><Layers3 className="h-5 w-5" /></span>QCollect</Link>
        <div className="login-story-content">
          <p className="story-kicker">Field data. Clear decisions.</p>
          <h1>Good work starts<br />with reliable data.</h1>
          <p className="story-description">One workspace to organise projects, collect field observations and review every submission.</p>
          <div className="workflow-list">
            {flowSteps.map((step, index) => <div key={step.role} className="workflow-step"><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.role}</h3><p>{step.action}</p></div></div>)}
          </div>
        </div>
        <p className="story-footer">QCollect / Field data platform</p>
      </section>
      <section className="login-access">
        <div className="login-form-wrap">
          <p className="access-kicker">YOUR WORKSPACE</p>
          <h2>Welcome back.</h2>
          <p className="access-description">Sign in to continue your work.</p>
          <fieldset className="login-role-picker">
            <legend>Choose your role</legend>
            <div className="role-options">{loginTypes.map((type) => <button key={type} type="button" onClick={() => setSelected(type)} aria-pressed={selected === type} className={selected === type ? "role-option selected" : "role-option"}><span>{type}</span>{selected === type ? <CheckCircle2 className="h-4 w-4" /> : null}</button>)}</div>
          </fieldset>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div><label htmlFor="login-email">Email address</label><Input id="login-email" type="email" autoComplete="username" placeholder="you@organisation.com" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} /><p id="email-error" className="field-error">{errors.email?.message}</p></div>
            <div><label htmlFor="login-password">Password</label><Input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" {...register("password")} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} /><p id="password-error" className="field-error">{errors.password?.message}</p></div>
            <Button type="submit" className="login-submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}<ArrowRight className="h-4 w-4" /></Button>
          </form>
          <p className="login-role-note">Selected: <strong>{selected}</strong>. Access is determined by your account and project permissions.</p>
          <Link href="/register" className="registration-link"><UserPlus className="h-4 w-4" />View registration workflow<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <p className="access-footer">Projects · Forms · Fieldwork · Reviews</p>
      </section>
    </main>
  );
}
