"use client";

import React, { createContext, useContext, useState } from "react";
import { AuthModal } from "./auth-modal";

interface AuthModalContextType {
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openAuthModal = () => setIsOpen(true);
    const closeAuthModal = () => setIsOpen(false);

    return (
        <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
            {children}
            <AuthModal open={isOpen} setOpen={setIsOpen} />
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error("useAuthModal must be used within an AuthModalProvider");
    }
    return context;
}
