"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Leaf,
  Users,
} from "lucide-react";
import { InputField, SubmitButton } from "../services/form/FormFields";
import { validateField, PATTERNS } from "../services/form/validators";
import { useAuth } from "../../store/context/AuthContext";
import { tempLogins } from "../../config/tempLogins";

type AuthMode = "login" | "register" | "forgot";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const router = useRouter();
  const { login } = useAuth();

  // Navigation & transition state
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState<Record<string, string>>({
    role: "retailer",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "email") {
          rule = {
            required: true,
            pattern: PATTERNS.EMAIL,
            patternMessage: "Enter a valid email address",
          };
        } else if (name === "mobile") {
          rule = {
            required: true,
            pattern: PATTERNS.PHONE,
            patternMessage: "Enter a valid 10-digit mobile number",
          };
        } else if (name === "password") {
          rule = {
            required: true,
            minLength: 6,
            minLengthMessage: "Password must be at least 6 characters",
          };
        } else if (name === "confirmPassword") {
          rule = {
            required: true,
            custom: (val: string, all: Record<string, string>) =>
              val === all.password ? null : "Passwords do not match",
          };
        }

        const errorMsg = validateField(name, value, rule, updated);
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          if (errorMsg) {
            next[name] = errorMsg;
          } else {
            delete next[name];
          }
          return next;
        });
      }
      return updated;
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (mode === "login") {
      const emailErr = validateField(
        "email",
        formData.email,
        { required: true },
        formData,
      );
      if (emailErr) newErrors.email = emailErr;
      const passErr = validateField(
        "password",
        formData.password,
        { required: true },
        formData,
      );
      if (passErr) newErrors.password = passErr;
    } else if (mode === "register") {
      const nameErr = validateField(
        "fullName",
        formData.fullName,
        { required: true },
        formData,
      );
      if (nameErr) newErrors.fullName = nameErr;
      const emailErr = validateField(
        "email",
        formData.email,
        { required: true, pattern: PATTERNS.EMAIL },
        formData,
      );
      if (emailErr) newErrors.email = emailErr;
      const phoneErr = validateField(
        "mobile",
        formData.mobile,
        { required: true, pattern: PATTERNS.PHONE },
        formData,
      );
      if (phoneErr) newErrors.mobile = phoneErr;
      const passErr = validateField(
        "password",
        formData.password,
        { required: true, minLength: 6 },
        formData,
      );
      if (passErr) newErrors.password = passErr;
      const confErr = validateField(
        "confirmPassword",
        formData.confirmPassword,
        {
          required: true,
          custom: (val, all) =>
            val === all.password ? null : "Passwords do not match",
        },
        formData,
      );
      if (confErr) newErrors.confirmPassword = confErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const emailKey = (formData.email || "").toLowerCase().trim();
        const passVal = formData.password;

        // Intercept mapped temporary credentials
        if (tempLogins[emailKey]) {
          const match = tempLogins[emailKey];
          if (match.pass === passVal) {
            await login(emailKey, "mock_token", match.role, match.name);
            router.push("/dashboard");
            return;
          } else {
            setErrors({ password: "Incorrect password for temporary account" });
            setIsSubmitting(false);
            return;
          }
        }

        let loggedInRole: "admin" | "retailer" | "distributor" | "customer" =
          "retailer";
        let loggedInName = "Thuruvan Dev";
        try {
          const registeredUsersStr =
            localStorage.getItem("e_seva_registered_users") || "[]";
          const registeredUsers = JSON.parse(registeredUsersStr);
          const matchedUser = registeredUsers.find(
            (u: any) => u.email.toLowerCase() === formData.email?.toLowerCase(),
          );
          if (matchedUser) {
            loggedInRole = matchedUser.role;
            loggedInName = matchedUser.name;
          } else {
            // Default rules based on email string
            if (formData.email?.toLowerCase().includes("admin")) {
              loggedInRole = "admin";
            } else if (formData.email?.toLowerCase().includes("distributor")) {
              loggedInRole = "distributor";
            }
          }
          if (formData.fullName) {
            loggedInName = formData.fullName;
          }
        } catch (err) {
          console.error("Failed to read user from localStorage mockup db", err);
        }

        login(
          formData.email || "",
          "mock_token",
          loggedInRole,
          loggedInName,
        ).then(() => {
          router.push("/dashboard");
        }).catch(err => {
          console.error(err);
          setErrors({ email: err.message || "Login failed" });
        });
      } else if (mode === "register") {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/api`;
        const res = await fetch(`${apiUrl}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName || "User",
            mobile: formData.mobile || "0000000000",
            role: formData.role || "retailer"
          }),
        });
        
        if (!res.ok) {
           const errorData = await res.json();
           throw new Error(errorData.error || "Signup failed");
        }

        setFormData({ role: "retailer" });
        setMode("login");
      } else {
        setSuccessMessage("Reset instructions sent!");
        setTimeout(() => {
          setSuccessMessage(null);
          setFormData({ role: "retailer" });
          setMode("login");
        }, 1500);
      }
    } catch (err) {
      const error = err as Error;
      setErrors({ form: error.message || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#090d16] flex flex-col md:flex-row font-sans transition-colors relative overflow-hidden select-none">
      {/* Absolute Decorative Glow Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#005c3a]/5 dark:bg-[#005c3a]/10 blur-[120px] pointer-events-none" />

      {/* LEFT PANEL: Splendid Branding Backdrop */}
      <div className="w-full md:w-1/2 bg-gradient-to-tr from-emerald-950 via-[#005c3a] to-emerald-900 dark:from-emerald-950 dark:via-[#004229] dark:to-emerald-950 p-8 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-screen">
        {/* Backdrop Graphic details */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />

        <div className="space-y-6 relative z-10">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md shadow-md border border-white/10">
              <Leaf size={18} fill="white" />
            </span>
            <span className="text-2xl font-black tracking-tight text-white">
              Thuruvan
            </span>
          </div>

          {/* Description */}
          <div className="space-y-4 pt-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-wider">
              <span>Next-Gen E-Seva Portal</span>
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-sm">
              Unlock instant digital agency operations.
            </h1>
            <p className="text-xs text-emerald-100/70 leading-relaxed max-w-sm font-semibold">
              Manage high-speed utility applications, secure wallets, instant
              validation searches, and centralized CRM databases from a single
              state-of-the-art terminal workspace.
            </p>
          </div>
        </div>

        {/* Secure indicator footer */}
        <div className="relative z-10 pt-16 flex items-center gap-2 text-emerald-200/60 text-[10px] font-bold tracking-widest uppercase">
          <ShieldCheck size={14} className="text-emerald-300 stroke-[2.5]" />
          <span>Encrypted Secure Sandbox Environment</span>
        </div>
      </div>

      {/* RIGHT PANEL: Interactive forms */}
      <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-white dark:bg-[#090d16] min-h-[60vh] md:min-h-screen">
        {successMessage ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-200">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </span>
            <div>
              <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Status Alert
              </h5>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-2 max-w-xs leading-relaxed font-bold">
                {successMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form Title */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === "login"
                  ? "Sign In"
                  : mode === "register"
                    ? "Create Account"
                    : "Reset Password"}
              </h2>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 font-semibold">
                {mode === "login"
                  ? "Welcome back! Enter credentials to launch console."
                  : mode === "register"
                    ? "Establish validation credentials to access agency tools."
                    : "Enter your registered email address to receive reset details."}
              </p>
            </div>

            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Action Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                    Select Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => handleFieldChange("role", "retailer")}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col gap-2 relative ${
                        formData.role === "retailer"
                          ? "border-[#005c3a] dark:border-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/10"
                          : "border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 bg-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`p-1.5 rounded-lg transition-colors ${
                            formData.role === "retailer"
                              ? "bg-[#005c3a] dark:bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <User size={16} />
                        </span>
                        {formData.role === "retailer" && (
                          <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-[#005c3a] dark:bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                          Retailer
                        </h4>
                        <p className="text-[10px] leading-tight text-slate-400 dark:text-slate-500 font-medium mt-1">
                          Apply utility services, wallets & instant forms.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => handleFieldChange("role", "distributor")}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col gap-2 relative ${
                        formData.role === "distributor"
                          ? "border-[#005c3a] dark:border-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/10"
                          : "border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 bg-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`p-1.5 rounded-lg transition-colors ${
                            formData.role === "distributor"
                              ? "bg-[#005c3a] dark:bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Users size={16} />
                        </span>
                        {formData.role === "distributor" && (
                          <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-[#005c3a] dark:bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                          Distributor
                        </h4>
                        <p className="text-[10px] leading-tight text-slate-400 dark:text-slate-500 font-medium mt-1">
                          Manage sub-retailer network & earn commissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <InputField
                  name="fullName"
                  label="UserName"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.fullName || ""}
                  onChange={(val) => handleFieldChange("fullName", val)}
                  error={errors.fullName}
                  disabled={isSubmitting}
                />
              )}

              <InputField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                value={formData.email || ""}
                onChange={(val) => handleFieldChange("email", val)}
                error={errors.email}
                disabled={isSubmitting}
              />

              {mode === "register" && (
                <InputField
                  name="mobile"
                  label="Mobile Number"
                  type="text"
                  placeholder="Enter 10-digit mobile"
                  value={formData.mobile || ""}
                  onChange={(val) => handleFieldChange("mobile", val)}
                  error={errors.mobile}
                  disabled={isSubmitting}
                />
              )}

              {mode !== "forgot" && (
                <InputField
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password || ""}
                  onChange={(val) => handleFieldChange("password", val)}
                  error={errors.password}
                  disabled={isSubmitting}
                />
              )}

              {mode === "register" && (
                <InputField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword || ""}
                  onChange={(val) => handleFieldChange("confirmPassword", val)}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                />
              )}

              {/* Sub features for login */}
              {mode === "login" && (
                <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-350 text-[#005c3a] focus:ring-[#005c3a] dark:bg-[#0a0f18]/30"
                    />
                    <span>Remember me</span>
                  </label>
                  <span
                    onClick={() => {
                      setErrors({});
                      setMode("forgot");
                    }}
                    className="text-[#005c3a] dark:text-emerald-400 hover:text-emerald-600 cursor-pointer select-none transition-colors"
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              <div className="pt-4">
                <SubmitButton
                  text={
                    mode === "login"
                      ? "Login"
                      : mode === "register"
                        ? "Create Account"
                        : "Recover Password"
                  }
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </div>
            </form>

            {/* Toggles for auth state modes */}
            <div className="border-t border-slate-100 dark:border-slate-900/60 pt-4 flex items-center justify-center text-xs font-bold text-slate-450 select-none">
              {mode === "login" ? (
                <div className="flex items-center gap-1">
                  <span>Don&apos;t have an agency account?</span>
                  <span
                    onClick={() => {
                      setErrors({});
                      setFormData({ role: "retailer" });
                      setMode("register");
                    }}
                    className="text-[#005c3a] dark:text-emerald-400 hover:text-emerald-650 cursor-pointer transition-colors"
                  >
                    Sign Up
                  </span>
                </div>
              ) : mode === "register" ? (
                <div className="flex items-center gap-1">
                  <span>Already registered?</span>
                  <span
                    onClick={() => {
                      setErrors({});
                      setFormData({});
                      setMode("login");
                    }}
                    className="text-[#005c3a] dark:text-emerald-400 hover:text-emerald-650 cursor-pointer transition-colors"
                  >
                    Login Here
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setErrors({});
                    setFormData({});
                    setMode("login");
                  }}
                  className="flex items-center gap-1 text-[#005c3a] dark:text-emerald-400 hover:text-emerald-650 transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Return to Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
