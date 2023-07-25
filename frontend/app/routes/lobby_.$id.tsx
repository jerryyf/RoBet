import { redirect, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import type { lobby } from "../models/lobby.server";
import { addPlayerToLobby, getLobby } from "../models/lobby.server";
import { createGame } from "~/models/game.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const url = params?.id;
  if (url) {
    const id = await getLobby(url);
    console.log(id);
    return { id };
  } else {
    throw new Error();
  }
};

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData();
  console.dir(params, { deppth: null });
  const address = formData.get("address")?.toString();
  const lobby = (await getLobby(params?.id ?? ""))[0] as unknown as lobby;
  console.log(lobby);
  if (address) {
    console.log(lobby.creator, address);
    const response = await fetch("http://localhost:3005/start", {
      method: "POST",
      body: JSON.stringify({
        p1: lobby.creator,
        p2: address,
        p1bet: lobby.wager,
        p2bet: lobby.wager,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const data = await response.json();
    console.log(data);
    if (data?.error) return { status: 403 };
    await addPlayerToLobby(address, params?.id ?? "");
    const lobbyData = (await getLobby(params?.id ?? ""))[0] as unknown as lobby;
    console.log("_______________________");
    console.log(lobbyData);
    const gameId = await createGame(lobbyData);
    console.dir(gameId);
    return redirect(`/game/${gameId.id}/${address}`);
  } else {
    return { status: 404 };
  }
};

export default function LobbyStart() {
  const { id } = useLoaderData<typeof loader>();
  const data = useActionData();
  let game = {} as lobby;
  if (id.length === 1) {
    game = id[0] as unknown as lobby;
  }

  useEffect(() => {
    if (data?.status === 403) {
      toast.error("Contract could not be started");
    }
    if (data?.status === 404) {
      toast.error("Invalid Address");
    }
  }, [data]);

  return (
    <>
      {Object.keys(game).length === 0 ? (
        <div className="text-6xl "> Invalid Game</div>
      ) : (
        <>
          <ToastContainer />
          <div className="relative min-h-screen w-screen bg-slate-100 sm:flex sm:items-center sm:justify-center">
            <div className="relative sm:pb-16 sm:pt-8">
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="relative">
                  <div className="absolute inset-0">
                    {/* <img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/1500684/157774694-99820c51-8165-4908-a031-34fc371ac0d6.jpg"
                alt="Sonic Youth On Stage"
              /> */}
                  </div>
                  <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
                    <h1 className="block text-center text-6xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md sm:text-8xl lg:text-9xl">
                      Betting {game.wager} Eth
                    </h1>
                    <h1 className="block text-center text-6xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md sm:text-8xl lg:text-9xl">
                      VS
                    </h1>
                    <h1 className="mt-2 block text-center text-3xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md  ">
                      {game.creator}
                    </h1>

                    <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl"></p>
                    <div className=" mx-auto mt-10 max-w-sm items-center  sm:flex sm:max-w-none sm:justify-center">
                      <form
                        method="post"
                        className="w-11/12 items-center justify-center"
                      >
                        <div className="mx-auto mt-10 max-w-sm text-center font-extrabold  sm:flex sm:max-w-none sm:justify-center">
                          Enter Wallet Address
                        </div>

                        <input
                          className="s relative w-full rounded-lg py-2  text-center text-2xl font-extrabold"
                          type="text"
                          name="address"
                        />
                        <div className="mx-auto mt-6 max-w-sm font-extrabold sm:flex sm:max-w-none sm:justify-center">
                          <button
                            type="submit"
                            value="submit"
                            name="action"
                            className=" mb-12  max-w-sm rounded-lg border bg-slate-300 px-2 py-2 font-extrabold sm:flex sm:max-w-none sm:justify-center"
                          >
                            Join Game
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="mx-auto mt-10 max-w-sm font-extrabold sm:flex sm:max-w-none sm:justify-center">
                      <div className="text-4xl  text-slate-300">
                        powered by{" "}
                      </div>{" "}
                      &nbsp;
                      <div className="text-6xl text-slate-500">Robet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
