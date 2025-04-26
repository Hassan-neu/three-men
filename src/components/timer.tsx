"use client";
import React, { useEffect, useState } from "react";
import { secondsToHours, secondsToMinutes } from "date-fns";
export default function Timer({ gameStarted }: { gameStarted: boolean }) {
    const [timer, setTimer] = useState(0);
    useEffect(() => {
        if (!gameStarted) return;
        const timerInterval = setTimeout(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    });
    return (
        <div className="w-12 h-6 ml-auto">
            {secondsToHours(timer).toString().padStart(2, "0")}:
            {secondsToMinutes(timer).toString().padStart(2, "0")}:
            {(timer % 60).toString().padStart(2, "0")}
        </div>
    );
}
