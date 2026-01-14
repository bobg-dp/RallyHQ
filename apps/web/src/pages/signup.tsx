import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Seo from "../components/Seo";
import { motion } from "framer-motion";
import Logo from "@/components/custom/Logo";
import strings from "../strings.json";

import { useAppDispatch } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { register } from "@/lib/store/thunks/auth.thunks";
import { addToast } from "@/lib/store/slices/uiSlice";
import { useState } from "react";

const schema = z
  .object({
    email: z.string().email().nonempty("Email is required"),
    password: z.string().min(6).max(20).nonempty("Password is required"),
    confirmPassword: z.string().min(6).max(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Inputs = z.infer<typeof schema>;

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!termsAccepted) return; // safety, button is also disabled
    try {
      const response = await dispatch(
        register({ email: data.email, password: data.password, name: "" })
      ).unwrap();

      // If token is present, sign-up returned a session and user is logged in
      if (response.token) {
        dispatch(
          addToast({
            type: "success",
            message: "Account created and signed in",
          })
        );
        navigate("/dashboard");
        return;
      }

      // Otherwise user needs to confirm email
      dispatch(
        addToast({
          type: "info",
          message:
            "Registration successful. Please check your email to confirm your account.",
        })
      );
    } catch (err) {
      // errors handled by thunk/store
    }
  };

  return (
    <>
      <Seo
        title="Rejestracja konta | RallyHQ"
        description="Utórz motorsportowe ktonto na RallyHQ"
      />
      <div className="min-h-screen flex md:items-center md:justify-center bg-background">
        <div className="w-full md:flex md:min-h-screen">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex md:w-1/2 bg-primary/5 items-center justify-center p-8"
          >
            <div className="max-w-md text-center flex flex-col items-center">
              <Logo textClass="text-6xl my-4" />
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                {strings.pages.singup.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {strings.pages.singup.description}
              </p>
            </div>
          </motion.div>

          {/* Right side - Signup form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-md">
              {/* Right side logo on mobile */}
              <div className="text-center mb-8 md:hidden w-full flex flex-col items-center">
                <Logo textClass="text-4xl my-4" />
                <h2 className="text-muted-foreground text-md">
                  {strings.pages.singup.description}
                </h2>
              </div>

              <div className="bg-card rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {strings.components.loginForm.email}
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          autoComplete="username"
                          className={cn(
                            "w-full transition-all duration-200",
                            errors.email
                              ? "border-destructive focus-visible:ring-destructive pr-10"
                              : "focus-visible:ring-primary"
                          )}
                          placeholder={strings.components.loginForm.emailHint}
                          type="email"
                          {...formRegister("email")}
                        />
                        {errors.email && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="h-5 w-5 text-destructive"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-destructive text-sm mt-1.5 flex items-center gap-1.5"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {strings.components.loginForm.errorWrongEmail}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {strings.components.loginForm.password}
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          autoComplete="new-password"
                          className={cn(
                            "w-full transition-all duration-200",
                            errors.password
                              ? "border-destructive focus-visible:ring-destructive pr-10"
                              : "focus-visible:ring-primary"
                          )}
                          placeholder={
                            strings.components.loginForm.passwordHint
                          }
                          type="password"
                          {...formRegister("password")}
                        />
                        {errors.password && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="h-5 w-5 text-destructive"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-destructive text-sm mt-1.5 flex items-center gap-1.5"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {strings.components.loginForm.errorPasswordSize}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {strings.pages.singup.form.confirmPassword}
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          autoComplete="new-password"
                          className={cn(
                            "w-full transition-all duration-200",
                            errors.confirmPassword
                              ? "border-destructive focus-visible:ring-destructive pr-10"
                              : "focus-visible:ring-primary"
                          )}
                          placeholder={
                            strings.pages.singup.form.confirmPasswordHint
                          }
                          type="password"
                          {...formRegister("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="h-5 w-5 text-destructive"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-destructive text-sm mt-1.5 flex items-center gap-1.5"
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 block text-sm text-muted-foreground"
                    >
                      {strings.common.iAgree}{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:text-primary/80"
                      >
                        {strings.common.termsOfService}
                      </Link>{" "}
                      {strings.common.and}{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:text-primary/80"
                      >
                        {strings.common.privacyPolicy}
                      </Link>
                    </label>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!termsAccepted}
                  >
                    {strings.common.createAccount}
                  </Button>

                  {/* <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      GitHub
                    </Button>
                  </div> */}
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {strings.common.haveAnAccount}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {strings.common.signIn}
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
