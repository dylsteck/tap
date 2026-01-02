"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";

import { login, register, type LoginActionState, type RegisterActionState } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

type AuthMode = "login" | "register";

export function AuthModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const { width } = useWindowSize();
    const [mode, setMode] = useState<AuthMode>("login");

    const [loginState, loginAction, isLoginPending] = useActionState<
        LoginActionState,
        FormData
    >(login, { status: "idle" });

    const [registerState, registerAction, isRegisterPending] = useActionState<
        RegisterActionState,
        FormData
    >(register, { status: "idle" });

    useEffect(() => {
        if (loginState.status === "success" || registerState.status === "success") {
            toast.success(
                mode === "login"
                    ? "Successfully logged in!"
                    : "Successfully registered!"
            );
            setOpen(false);
            window.location.reload();
        } else if (loginState.status === "failed") {
            toast.error("Invalid email or password");
        } else if (registerState.status === "user_exists") {
            toast.error("User already exists");
        } else if (registerState.status === "failed") {
            toast.error("Failed to register");
        }
    }, [loginState.status, registerState.status, mode, setOpen]);

    const isDesktop = width > 768;

    const content = (
        <div className="flex flex-col gap-4 py-4">
            <AuthForm
                action={mode === "login" ? loginAction : registerAction}
                defaultEmail=""
            >
                <SubmitButton isSuccessful={mode === "login" ? loginState.status === "success" : registerState.status === "success"}>
                    {mode === "login" ? "Login" : "Sign Up"}
                </SubmitButton>
            </AuthForm>

            <div className="px-4 text-center text-sm sm:px-16">
                <button
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    type="button"
                >
                    {mode === "login"
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "login" ? "Login" : "Create Account"}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "login"
                                ? "Enter your email and password to login to your account."
                                : "Enter your email and password to create a new account."}
                        </DialogDescription>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet onOpenChange={setOpen} open={open}>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle>
                        {mode === "login" ? "Login" : "Create Account"}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === "login"
                            ? "Enter your email and password to login to your account."
                            : "Enter your email and password to create a new account."}
                    </SheetDescription>
                </SheetHeader>
                {content}
            </SheetContent>
        </Sheet>
    );
}
