import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useEffect } from "react";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  useEffect(() => {
    localStorage.setItem("address", JSON.stringify(null));
  }, []);
  return (
    <main className="relative min-h-screen bg-yellow-100 sm:flex sm:items-center sm:justify-center">
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
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <Link
                  to="/lobby"
                  className="block uppercase text-yellow-500 drop-shadow-md hover:text-yellow-600"
                >
                  Join Lobby
                </Link>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl"></p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    to="/join"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                  >
                    Log In
                  </Link>
                </div>
              </div>
              <div className="mx-auto mt-10 max-w-sm font-extrabold sm:flex sm:max-w-none sm:justify-center">
                <div className="text-4xl  text-slate-300">powered by </div>{" "}
                &nbsp;
                <div className="text-6xl text-slate-500">Robet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
