import { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ToastContainer } from "react-toastify";
import {
  createLobby,
  getAllLobby,
  getLobby,
  lobby,
} from "~/models/lobby.server";

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

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const address = formData.get("address")?.toString();
  if (address) {
    const response = await fetch("http://localhost:3005/start", {
      method: "POST",
      body: JSON.stringify({
        p1: "0xcf389bef5486e62a0fd1b31686394264773fe3cd54b6ed3346a33efe228b872a",
        p2: "0xcb9f0700855870a3fc13fe437b89c56e44b812e8b34113a1d9772025d0f4e383",
        p1bet: "1",
        p2bet: "1",
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const data = await response.text();
    console.log("data_______", data, "________");
    return { status: 200 };
  } else {
    return { status: 404 };
  }
};

export default function LobbyStart() {
  const { id } = useLoaderData<typeof loader>();
  let game = {} as lobby;
  if (id.length === 1) {
    game = id[0] as unknown as lobby;
  }

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
                    <div className="mx-auto mt-10 max-w-sm justify-center sm:flex sm:max-w-none sm:justify-center">
                      <div className="items-center justify-center space-y-4 sm:mx-auto sm:inline-grid  sm:gap-5 sm:space-y-0">
                        <form
                          method="post"
                          className="items-center justify-center"
                        >
                          <label className="relative top-0.5 mr-4 text-lg text-slate-500">
                            Enter Wallet Address:{" "}
                            <input
                              className="relative bottom-0.5 rounded-lg pb-3 pr-16"
                              type="text"
                              name="address"
                            />
                          </label>
                          <button
                            type="submit"
                            value="submit"
                            name="action"
                            className="float-right mb-12 ml-auto mr-5 rounded-lg border bg-slate-300 px-2 py-2"
                          >
                            Join Game
                          </button>
                        </form>
                      </div>
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
