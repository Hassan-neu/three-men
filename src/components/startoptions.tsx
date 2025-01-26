"use client";
import React, { use, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
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
    const createGame = useMutation(api.game.create);
    async function startGame(formData: FormData) {
        try {
            const username = formData.get("name") as string;
            startTransition(async () => {
                const userId = `${username}-${Date.now().toString()}`;
                const id = await createGame({
                    username,
                    userId,
                });
                setUser(userId);
                push(`${id}`);
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
            const id = formData.get("gameid") as Id<"games">;
            startTransition(async () => {
                const username = formData.get("name") as string;
                const userId = `${username}-${Date.now().toString()}`;
                await joinGame({ username, id, userId });
                setUser(userId);
                push(`${id}`);
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
                            name="gameid"
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
