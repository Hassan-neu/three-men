"use client";
import React, { useState } from "react";
import { createContext } from "react";
import { GameboardType } from "@/utils/types";
export const GameboardContext = createContext<GameboardType | null>(null);
function GameboardProvider({ children }: { children: React.ReactNode }) {
    const [currentArea, setCurrentArea] = useState("");
    const [showButtons, setShowButtons] = useState(false);
    const [user, setUser] = useState("");
    return (
        <GameboardContext.Provider
            value={{
                user,
                setUser,
                showButtons,
                setShowButtons,
                currentArea,
                setCurrentArea,
            }}
        >
            {children}
        </GameboardContext.Provider>
    );
}

export default GameboardProvider;
