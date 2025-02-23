"use client";
import React, { use, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { GameboardContext } from "@/hooks/context";
import { GameboardType } from "@/utils/types";

function StartOptions() {
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[400px] gap-2 anchor">
            <div className=" flex justify-center items-center bg-red-900 rounded-full py-2 ">
                <div className="grid grid-cols-2 gap-3 w-56 place-content-center">
                    <button
                        className={`text-xl py-1 px-4 bg-black text-white rounded-full transition-transform duration-200 flex justify-center items-center`}
                        popoverTarget="popover-create"
                    >
                        create
                    </button>
                    <button
                        className={`text-xl py-1 px-4 bg-black text-white rounded-full transition-transform duration-200 flex justify-center items-center`}
                        popoverTarget="popover-join"
                    >
                        join
                    </button>
                </div>
            </div>
            <Creategame />
            <Joingame />
        </div>
    );
}

function Creategame() {
    const [isPending, startTransition] = useTransition();
    const { push } = useRouter();
    const { setUser } = use(GameboardContext) as GameboardType;
    const colors = [
        {
            id: "E52020",
            value: "#E52020",
        },
        {
            id: "FBA518",
            value: "#FBA518",
        },
        {
            id: "F9CB43",
            value: "#F9CB43",
        },
        {
            id: "A89C29",
            value: "#A89C29",
        },
    ];
    const createGame = useMutation(api.game.create);
    async function startGame(formData: FormData) {
        try {
            const username = formData.get("name") as string;
            const pawnColor = formData.get("color") as string;
            const gameKey = (Math.random() + 1).toString(36).slice(-5);
            startTransition(async () => {
                const userId = `${username.trim()}-${Date.now().toString(36).slice(-4)}`;
                await createGame({
                    username: username.trim(),
                    userId,
                    gameKey,
                    pawnColor,
                });
                setUser(userId);
                push(`${gameKey}`);
            });
        } catch (error) {
            throw error;
        }
    }
    return (
        <div popover="auto" id="popover-create">
            <form className={`flex flex-col gap-2`} action={startGame}>
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="flex flex-col">
                        <span>name</span>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="border border-black h-8 rounded px-2 py-1"
                        />
                    </label>
                </div>
                <div className="flex flex-col">
                    <span>pawn color</span>
                    <div className="flex justify-between">
                        {colors.map((color) => (
                            <div key={color.id}>
                                <label
                                    htmlFor={color.value}
                                    className="grid gap-1 [grid-template-areas:'center']"
                                >
                                    <input
                                        type="radio"
                                        name="color"
                                        value={color.value}
                                        className="peer [grid-area:center] cursor-pointer appearance-none z-10"
                                    />
                                    <span
                                        className="w-8 h-8 rounded-full [grid-area:center] border border-transparent peer-checked:border-black"
                                        style={{ background: color.value }}
                                    ></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="grid [grid-template-areas:'area'] text-xl px-2 py-[4px] bg-black text-white self-stretch rounded-full">
                    {isPending ? (
                        <span className="[grid-area:area]">Loading...</span>
                    ) : (
                        <span className="[grid-area:area]">Create</span>
                    )}
                </button>
            </form>
        </div>
    );
}
function Joingame() {
    const { push } = useRouter();
    const { setUser } = use(GameboardContext) as GameboardType;
    const joinGame = useMutation(api.game.join);
    const [isPending, startTransition] = useTransition();
    async function enterGame(formData: FormData) {
        try {
            const gameKey = formData.get("gamekey") as string;
            const username = formData.get("name") as string;
            const userId = `${username.trim()}-${Date.now().toString(36).slice(-4)}`;
            startTransition(async () => {
                await joinGame({ username: username.trim(), gameKey, userId });
                setUser(userId);
                push(`${gameKey}`);
            });
        } catch (error) {
            throw error;
        }
    }
    return (
        <div popover="auto" id="popover-join">
            <form action={enterGame} className={`flex flex-col gap-2`}>
                <div>
                    <label className="flex flex-col">
                        <span>name</span>
                        <input
                            type="text"
                            name="name"
                            className="border border-black h-8 rounded px-2 py-1"
                        />
                    </label>
                </div>
                <div>
                    <label className="flex flex-col">
                        <span>id</span>
                        <input
                            type="text"
                            name="gamekey"
                            className="border border-black h-8 rounded px-2 py-1"
                        />
                    </label>
                </div>

                <button className="grid [grid-template-areas:'area'] text-xl px-2 py-[4px] bg-black text-white self-stretch rounded-full">
                    {isPending ? (
                        <span className="[grid-area:area]">Loading...</span>
                    ) : (
                        <span className="[grid-area:area]">Join</span>
                    )}
                </button>
            </form>
        </div>
    );
}
export default StartOptions;
