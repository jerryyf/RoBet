import { ActionArgs, LoaderArgs, json } from "@remix-run/node";
import {
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  createLobby,
  getAllLobby,
  getAllOpenLobby,
} from "~/models/lobby.server";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllGame } from "~/models/game.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const test = await fetch("http://localhost:3005");
  console.log(await test.text());
  // const response = await fetch("http://localhost:3005/start", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     p1: "0xcf389bef5486e62a0fd1b31686394264773fe3cd54b6ed3346a33efe228b872a",
  //     p2: "0xcb9f0700855870a3fc13fe437b89c56e44b812e8b34113a1d9772025d0f4e383",
  //     p1bet: "1",
  //     p2bet: "1",
  //   }),
  //   headers: {
  //     "Content-type": "application/json; charset=UTF-8",
  //   },
  // });
  // const data = await response.text();
  // console.log(data);
  const games = (await getAllGame()) ?? [];
  const lobbies = (await getAllOpenLobby()) ?? [];
  return json({ games, lobbies });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const address = formData.get("address")?.toString();
  const bets = formData.get("bet")?.toString();
  if (bets && address) {
    const bet = parseInt(bets);
    console.log(address, bet);
    await createLobby(bet, address);
    console.log(await getAllLobby());
    return { status: 200 };
  } else {
    return { status: 404 };
  }
};

export default function Lobby() {
  const { games, lobbies } = useLoaderData<typeof loader>();
  const data = useActionData();
  const navigate = useNavigate();
  //const user = useUser();
  const [datas, setDatas] = useState(games);

  useEffect(() => setDatas(games), [games]);

  const fetcher = useFetcher();

  // Get fresh data every 30 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher?.data?.games.forEach(
        (game: { creator: any; creator_choice: null; id: any }) => {
          if (
            game.creator ===
              JSON.parse(localStorage.getItem("address") ?? "") &&
            game.creator_choice === null
          ) {
            console.log("MATCH");
            navigate(`/game/${game.id}/${game.creator}`);
          }
        }
      );
      fetcher.load("/lobby");
    }, 5 * 1000);

    return () => clearInterval(interval);
  }, []);

  // When the fetcher comes back with new data,
  // update our `data` state.
  useEffect(() => {
    if (fetcher.data) {
      fetcher?.data?.games.forEach(
        (game: { creator: any; creator_choice: null; id: any }) => {
          console.log("MATCH");
          if (
            game.creator ===
              JSON.parse(localStorage.getItem("address") ?? "") &&
            game.creator_choice === null
          ) {
            navigate(`/game/${game.id}/${game.creator}`);
          }
        }
      );
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (data?.status === 404) {
      toast.error("Please input a proper wallet address and wager");
    }
  }, [data]);

  // usePollingEffect(
  //   async () =>
  //     await checkOpenGame(JSON.parse(localStorage.getItem("address") ?? "")),
  //   [],
  //   { interval: 3000, onCleanUp: () => {} } // optional
  // );

  return (
    <>
      <div className=" bg-slate-600">
        <div className="float-left w-4/12 items-center p-4 ">
          <span className="my-3 ml-14 block text-6xl  font-extrabold uppercase text-slate-700 drop-shadow-md">
            Create Game
          </span>

          <form method="post">
            <div className="my-8">
              <label className="mr-4 text-2xl">
                Enter Wallet Address:{" "}
                <input
                  className=" float-right rounded-lg"
                  type="text"
                  name="address"
                  onChange={(e) =>
                    localStorage.setItem(
                      "address",
                      JSON.stringify(e.target.value)
                    )
                  }
                />
              </label>
            </div>
            <div>
              <label className="mr-4 text-2xl">
                Bet Value:{" "}
                <input
                  className=" float-right rounded-lg"
                  type="number"
                  name="bet"
                />
              </label>
            </div>
            <button
              type="submit"
              value="submit"
              name="action"
              className=" float-right mr-5 mt-4 rounded-lg border bg-slate-300 px-2 py-2"
            >
              Create Game
            </button>
          </form>
        </div>
        <div className="float-left w-8/12 p-4 ">
          <span className="my-3 ml-14 block text-6xl  font-extrabold uppercase text-slate-700 drop-shadow-md">
            Choose game
          </span>
          <div className=" slate relative flex min-h-screen text-slate-500 sm:flex ">
            <table className=" w-11/12 border-separate rounded-e-3xl ">
              {lobbies.map((game) => {
                return (
                  <div
                    key={game.creator + game.createdAt.toString() + "Div"}
                    className="w-full"
                  >
                    <td className="w-fit overflow-hidden rounded-3xl bg-slate-200 p-4 opacity-70 hover:opacity-100">
                      <div className="m-2 flex h-1/5  p-10  ">
                        <div>
                          <div className="mr-12 text-4xl font-semibold">
                            Bet: {game.wager}
                          </div>
                          <div className="mt-5">Created by: {game.creator}</div>
                          <div className="mr-[26rem]">
                            Time: {game.createdAt.toLocaleString()}
                          </div>
                        </div>

                        <Link
                          to={`/lobby/${game.id}`}
                          className="ml-auto mt-4 block text-5xl  font-semibold text-slate-500 drop-shadow-md hover:text-slate-600"
                        >
                          Start Match
                        </Link>
                      </div>
                    </td>
                  </div>
                );
              })}
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
