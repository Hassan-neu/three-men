"use client";
import React, { useTransition, useRef, useEffect } from "react";
import Player from "./player";
import AreaButton from "./areabutton";
import { use } from "react";
import { GameboardContext } from "@/hooks/context";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { GameboardType } from "@/utils/types";

function Board({ gameId }: { gameId: string }) {
    const joinDialog = useRef<HTMLDialogElement | null>(null);
    const colorDialog = useRef<HTMLDialogElement | null>(null);
    const [isPending, startTransition] = useTransition();
    const { setUser, showButtons, user, setCurrentArea } = use(
        GameboardContext
    ) as GameboardType;
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
    const joinGame = useMutation(api.game.join);
    const { push } = useRouter();
    const game = useQuery(api.game.get, {
        gameKey: gameId,
    });
    const endGame = useMutation(api.game.endGame);
    const restartGame = useMutation(api.game.restart);
    const updatePawnColor = useMutation(api.game.updateColor);
    const selectedPawnColor = game?.pawns.find(
        (pawn) => pawn.playerId !== user
    )?.pawnColor;
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
            const username = formData.get("name") as string;
            const pawnColor = formData.get("color") as string;
            const userId = `${username.trim()}-${Date.now().toString(36).slice(-4)}`;
            startTransition(async () => {
                await joinGame({
                    username: username.trim(),
                    gameKey: gameId,
                    userId,
                    pawnColor,
                });
                setUser(userId);
                joinDialog.current?.close();
            });
        } catch (error) {
            throw error;
        }
    }
    function updateColor(formData: FormData) {
        try {
            const pawnColor = formData.get("color") as string;
            startTransition(async () => {
                await updatePawnColor({
                    gameKey: gameId,
                    userId: user,
                    pawnColor,
                });
                colorDialog.current?.close();
            });
        } catch (error) {
            throw error;
        }
    }
    useEffect(() => {
        if (!game || typeof game == "undefined") return;
        if (
            joinDialog.current &&
            game.otherPlayer !== user &&
            game.createdBy !== user
        ) {
            joinDialog.current.showModal();
        }
    }, [game, user]);
    useEffect(() => {
        if (!game || typeof game == "undefined") return;
        const thisPawn = game.pawns.find((pawn) => pawn.playerId == user)!;
        if (
            colorDialog.current &&
            game.otherPlayer == user &&
            !thisPawn.pawnColor
        ) {
            colorDialog.current.showModal();
        }
    }, [game, user]);

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
                                            gameKey={gameId}
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
                                        background: pawn.pawnColor,
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
                                                        gameKey: gameId,
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
                                                        gameKey: gameId,
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

            <dialog
                id="joinDialog"
                className={`flex flex-col`}
                ref={joinDialog}
            >
                {/* <button
                    className="self-end text-2xl"
                    onClick={() => joinDialog.current?.close()}
                >
                    &times;
                </button> */}
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
                    <div className="flex justify-between">
                        {colors.map((color) => (
                            <div key={color.id}>
                                <label
                                    htmlFor={color.value}
                                    className="grid gap-1 [grid-template-areas:'center']"
                                >
                                    <input
                                        disabled={
                                            selectedPawnColor == color.value
                                        }
                                        type="radio"
                                        name="color"
                                        value={color.value}
                                        className="peer [grid-area:center] cursor-pointer appearance-none z-10 disabled:cursor-not-allowed"
                                    />
                                    <span
                                        className="w-8 h-8 rounded-full [grid-area:center] 
                                        border border-transparent peer-checked:border-black peer-disabled:cursor-not-allowed"
                                        style={{ background: color.value }}
                                    ></span>
                                </label>
                            </div>
                        ))}
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
            <dialog
                id="colorDialog"
                className={`flex flex-col`}
                ref={colorDialog}
            >
                <form className={`flex flex-col gap-2`} action={updateColor}>
                    <div className="flex justify-between">
                        {colors.map((color) => (
                            <div key={color.id}>
                                <label
                                    htmlFor={color.value}
                                    className="grid gap-1 [grid-template-areas:'center']"
                                >
                                    <input
                                        disabled={
                                            selectedPawnColor == color.value
                                        }
                                        type="radio"
                                        name="color"
                                        value={color.value}
                                        className="peer [grid-area:center] cursor-pointer appearance-none z-10 disabled:cursor-not-allowed"
                                    />
                                    <span
                                        className="w-8 h-8 rounded-full [grid-area:center] border border-transparent peer-checked:border-black"
                                        style={{ background: color.value }}
                                    ></span>
                                </label>
                            </div>
                        ))}
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
