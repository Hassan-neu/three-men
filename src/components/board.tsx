"use client";
import React, { useTransition, useRef, useEffect } from "react";
import Player from "./player";
import AreaButton from "./areabutton";
import { use } from "react";
import { GameboardContext } from "@/hooks/context";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

import { GameboardType } from "@/utils/types";
function Board({ gameId }: { gameId: Id<"games"> }) {
    const popover = useRef<HTMLDialogElement | null>(null);
    const [isPending, startTransition] = useTransition();
    const { setUser, showButtons, user, setCurrentArea } = use(
        GameboardContext
    ) as GameboardType;
    const joinGame = useMutation(api.game.join);
    const { push } = useRouter();
    const game = useQuery(api.game.get, {
        id: gameId,
    });
    const endGame = useMutation(api.game.endGame);
    const restartGame = useMutation(api.game.restart);
    function getWinnner() {
        const gamePlayer = game?.players.find(
            (player) => player.id === game?.gameWinner
        );
        if (gamePlayer?.id == user) {
            return "You win";
        } else {
            return `${gamePlayer?.username} wins`;
        }
    }
    function join(formData: FormData) {
        try {
            startTransition(async () => {
                const username = formData.get("name") as string;
                const userId = `${username}-${Date.now().toString()}`;
                await joinGame({ username, id: gameId as Id<"games">, userId });
                setUser(userId);
                popover.current?.close();
            });
        } catch (error) {
            throw error;
        }
    }
    useEffect(() => {
        if (!game || typeof game == "undefined") return;
        if (
            popover.current &&
            game.otherPlayer !== user &&
            game.createdBy !== user
        ) {
            popover.current.showModal();
        }
    }, [game, user]);
    useEffect(() => {
        console.log(game);
    }, [game]);
    return (
        <>
            <div className="h-screen flex flex-col items-center justify-center gap-10">
                {game ? (
                    <div className="flex flex-col gap-2">
                        <div>
                            {!game?.otherPlayer &&
                                "waiting for other player..."}
                        </div>
                        <div className="flex gap-2 self-start">
                            <span>Game Id:</span>
                            <span>{gameId}</span>
                            <button
                                className="border"
                                onClick={() => {
                                    navigator.clipboard.writeText(gameId);
                                }}
                            >
                                copy
                            </button>
                        </div>
                        <div className="self-center border-red-500 border-8 grid game-box relative">
                            {showButtons &&
                                game?.grids
                                    .filter((grid) => grid.status == "open")
                                    .map((button, indx) => (
                                        <AreaButton
                                            pawns={game.pawns}
                                            gameId={gameId}
                                            player={button}
                                            styling={{
                                                gridArea: button.gridArea,
                                            }}
                                            key={indx}
                                        />
                                    ))}
                            {game?.pawns.map((pawn, indx) => (
                                <Player
                                    isPlayable={game.isPlayable}
                                    lastPlayer={game.lastPlayer}
                                    key={indx}
                                    pawn={pawn}
                                    styling={{
                                        background: pawn.background!,
                                        gridArea: pawn.gridArea,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="self-center">
                            {game?.gameWinner ? (
                                <div className="flex flex-col gap-2">
                                    <div className="max-w-max border-2 border-black p-2 rounded-md self-center">
                                        {getWinnner()}
                                    </div>
                                    {game?.createdBy == user && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                className=" border-2 border-black p-2 rounded-md"
                                                onClick={() => {
                                                    restartGame({
                                                        id: gameId,
                                                    });
                                                    setCurrentArea("");
                                                }}
                                            >
                                                Restart
                                            </button>
                                            <button
                                                className="border-2 border-black bg-black p-2 rounded-md text-white"
                                                onClick={() => {
                                                    endGame({
                                                        gameId,
                                                    });
                                                    push("/");
                                                }}
                                            >
                                                Quit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <>Game not found</>
                )}
            </div>

            <dialog id="popover" className={`flex flex-col`} ref={popover}>
                <button
                    className="self-end text-2xl"
                    onClick={() => popover.current?.close()}
                >
                    &times;
                </button>
                <form className={`flex flex-col gap-2`} action={join}>
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
                            <span className="[grid-area:area]">Join</span>
                        )}
                    </button>
                </form>
            </dialog>
        </>
    );
}

export default Board;
