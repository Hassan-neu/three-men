"use client";

import { useRouter } from "next/navigation";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { push } = useRouter();
    return (
        <div className="h-screen flex flex-col justify-center items-center">
            <div className="flex flex-col gap-2 w-2/3 items-center">
                <div className="flex flex-col gap-2">{error.message}</div>
                <div className="flex gap-2">
                    <button
                        className="border-2 border-black bg-black p-2 rounded-md text-white self-center"
                        onClick={reset}
                    >
                        Try again
                    </button>
                    <button
                        className="border-2 border-black bg-black p-2 rounded-md text-white self-center"
                        onClick={() => push("/")}
                    >
                        Main menu
                    </button>
                </div>
            </div>
        </div>
    );
}
