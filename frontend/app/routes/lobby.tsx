import { Link, useLoaderData } from "@remix-run/react";
import { useUser } from "~/utils";
import { loader } from "./healthcheck";

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  //const user = useUser();
  const games = [
    { user: "Ben", wager: 50, createdAt: new Date(2023, 6, 24, 19, 33, 30, 0) },
    {
      user: "Jimmy",
      wager: 450,
      createdAt: new Date(2023, 6, 24, 19, 33, 35, 0),
    },
    {
      user: "Jerry",
      wager: 80,
      createdAt: new Date(2023, 6, 24, 19, 33, 20, 0),
    },
    {
      user: "Austin",
      wager: 300,
      createdAt: new Date(2023, 6, 24, 19, 33, 24, 0),
    },
  ];

  return (
    <div className="  bg-yellow-100">
      <span className="block text-center text-6xl  font-extrabold uppercase text-yellow-500 drop-shadow-md">
        Choose open game
      </span>
      <div className="relative min-h-screen bg-yellow-100  text-slate-400 sm:flex sm:items-center sm:justify-center">
        <table className=" w-1/2">
          {games.map((game) => {
            return (
              <tr className="h-1/5" key={game.user + game.createdAt.toString()}>
                <div className="m-2 flex  rounded-3xl border bg-yellow-200 p-10 opacity-70 hover:opacity-100">
                  <div>
                    <div className="text-4xl font-semibold">
                      Bet: {game.wager}
                    </div>
                    <div>Created by: {game.user}</div>
                    <div>Time: {game.createdAt.toLocaleString()}</div>
                  </div>

                  <Link
                    to="/"
                    className="ml-auto mt-4 block text-5xl  font-semibold text-yellow-500 drop-shadow-md hover:text-yellow-600"
                  >
                    Start Match
                  </Link>
                </div>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}
