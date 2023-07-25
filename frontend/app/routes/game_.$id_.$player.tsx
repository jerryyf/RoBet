import { Dialog, Transition } from "@headlessui/react";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  addMoveGame,
  createGame,
  getGame,
  getResultGame,
} from "~/models/game.server";
import { getLobby, addPlayerToLobby } from "~/models/lobby.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  const address = params.player;

  if (address && id) {
    const game = await getGame(id);
    const result = await getResultGame(id);
    return json({ game, address, result });
  } else {
    return redirect("/lobby");
  }
};

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData();
  console.dir(formData, { depth: null });
  const address = formData.get("address")?.toString() ?? "";
  const value = formData.get("value")?.toString() ?? "";
  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));
  await delay(4000);
  const result = await addMoveGame(params?.id ?? "", address, parseInt(value));
  console.log("________RESULT__________");
  console.log(result);
  if (result === null || result === undefined) return null;
  if (result === true) return { status: 200 };
  return { status: result };
};

export default function Lobby() {
  const { game, address, result } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const fetcher = useFetcher();
  const data = useActionData();
  const navigate = useNavigate();
  const [isDraw, setIsDraw] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLoss, setIsLoss] = useState(false);
  const opponentAddress =
    game?.challenger === address ? game?.creator : game?.challenger;

  useEffect(() => {
    if (data?.status === 200) {
      setIsDraw(true);
    }
    if (data?.status === address) {
      setIsWin(true);
    }
    if (data?.status === opponentAddress) {
      setIsLoss(true);
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/game/${game?.id}/${address}`);
    }, 3 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher?.data?.result === true) setIsDraw(true);
      if (fetcher?.data?.result === address) setIsWin(true);
      if (fetcher?.data?.result === opponentAddress) setIsLoss(true);
    }
  }, [fetcher.data]);

  return (
    <>
      <ToastContainer />
      <div className="relative min-h-screen w-screen bg-slate-100 sm:flex  sm:justify-center">
        <div>
          <div className="mx-auto ">
            <div className="relative">
              <div className="absolute inset-0"></div>
              <h1 className="block text-center text-2xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md ">
                Opponent:{" "}
                {address === game?.challenger
                  ? game?.creator
                  : game?.challenger}
              </h1>
              <h1 className="block text-center text-2xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md ">
                Bet: {game?.wager}
              </h1>
              <h1 className="block pt-12 text-center text-6xl font-extrabold uppercase tracking-tight text-slate-700 drop-shadow-md sm:text-8xl lg:text-9xl">
                Make your Choice
              </h1>
              <div className="relative">
                <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl"></p>
                <div className=" mx-auto mt-10 max-w-sm items-center  sm:flex sm:max-w-none sm:justify-center">
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-3 sm:gap-5 sm:space-y-0">
                    <button
                      onClick={() =>
                        submit(
                          { address: address, value: 1 },
                          { method: "post" }
                        )
                      }
                    >
                      <svg
                        className="hover:fill-slate-600"
                        width="500px"
                        fill="#94a3b8"
                        height="500px"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M 11.40625 6.96875 C 10.578125 6.953125 9.890625 7.125 9.46875 7.25 C 9.457031 7.25 9.449219 7.25 9.4375 7.25 L 6.9375 8.03125 C 4.003906 8.933594 2 11.652344 2 14.71875 L 2 20 C 2 23.855469 5.144531 27 9 27 L 18.90625 27 C 20.125 27.027344 21.304688 26.3125 21.78125 25.125 C 22.082031 24.371094 22.039063 23.578125 21.75 22.875 C 22.363281 22.550781 22.882813 22.027344 23.15625 21.34375 C 23.46875 20.558594 23.417969 19.722656 23.09375 19 L 27 19 C 28.644531 19 30 17.644531 30 16 C 30 14.355469 28.644531 13 27 13 L 25.46875 13 L 25.875 12.875 C 27.449219 12.398438 28.351563 10.699219 27.875 9.125 C 27.398438 7.550781 25.699219 6.648438 24.125 7.125 L 15.6875 9.71875 C 15.613281 9.53125 15.527344 9.328125 15.40625 9.125 C 14.90625 8.289063 13.894531 7.34375 12.28125 7.0625 C 11.980469 7.011719 11.683594 6.972656 11.40625 6.96875 Z M 25.125 9 C 25.515625 9.042969 25.847656 9.3125 25.96875 9.71875 C 26.132813 10.257813 25.820313 10.804688 25.28125 10.96875 L 18.4375 13.03125 L 18.78125 14.15625 L 18.78125 15 L 27 15 C 27.566406 15 28 15.433594 28 16 C 28 16.566406 27.566406 17 27 17 L 20.40625 17 L 17.78125 15.96875 C 17.402344 15.816406 17.011719 15.742188 16.625 15.75 L 16.09375 11.65625 L 24.71875 9.03125 C 24.855469 8.988281 24.996094 8.984375 25.125 9 Z M 11.375 9.03125 C 11.566406 9.03125 11.765625 9.03125 11.9375 9.0625 C 13.011719 9.25 13.425781 9.71875 13.6875 10.15625 C 13.949219 10.59375 13.96875 10.90625 13.96875 10.90625 C 13.96875 10.925781 13.96875 10.949219 13.96875 10.96875 L 14.8125 17.40625 C 14.820313 17.4375 14.832031 17.46875 14.84375 17.5 C 14.96875 18.027344 14.652344 18.53125 14.125 18.65625 C 13.800781 18.734375 13.636719 18.691406 13.46875 18.59375 C 13.300781 18.496094 13.09375 18.289063 12.9375 17.84375 L 11.6875 13 C 11.609375 12.703125 11.398438 12.460938 11.121094 12.339844 C 10.839844 12.21875 10.519531 12.230469 10.25 12.375 L 8.59375 13.28125 C 8.109375 13.546875 7.933594 14.15625 8.203125 14.640625 C 8.46875 15.125 9.078125 15.300781 9.5625 15.03125 L 10.0625 14.75 L 11.03125 18.4375 C 11.039063 18.46875 11.050781 18.5 11.0625 18.53125 C 11.332031 19.304688 11.792969 19.925781 12.4375 20.3125 C 12.964844 20.628906 13.578125 20.75 14.1875 20.6875 C 13.871094 20.980469 13.609375 21.355469 13.4375 21.78125 C 12.980469 22.925781 13.269531 24.183594 14.09375 25 L 9 25 C 6.226563 25 4 22.773438 4 20 L 4 14.71875 C 4 12.519531 5.429688 10.585938 7.53125 9.9375 L 10.03125 9.1875 C 10.234375 9.125 10.804688 9.03125 11.375 9.03125 Z M 16.8125 17.78125 C 16.886719 17.792969 16.957031 17.78125 17.03125 17.8125 L 20.75 19.3125 C 21.273438 19.523438 21.523438 20.070313 21.3125 20.59375 C 21.101563 21.117188 20.523438 21.367188 20 21.15625 L 16.28125 19.6875 C 16.226563 19.667969 16.203125 19.621094 16.15625 19.59375 C 16.550781 19.085938 16.804688 18.445313 16.8125 17.78125 Z M 16.1875 21.90625 C 16.320313 21.90625 16.460938 21.917969 16.59375 21.96875 L 17.9375 22.5 L 19.25 23.03125 L 19.375 23.0625 C 19.898438 23.273438 20.148438 23.851563 19.9375 24.375 C 19.785156 24.757813 19.445313 24.980469 19.0625 25 C 19.050781 25 19.042969 25 19.03125 25 C 18.898438 25.003906 18.757813 24.988281 18.625 24.9375 L 15.84375 23.8125 C 15.320313 23.601563 15.070313 23.023438 15.28125 22.5 C 15.386719 22.238281 15.578125 22.070313 15.8125 21.96875 C 15.929688 21.917969 16.054688 21.90625 16.1875 21.90625 Z" />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        submit(
                          { address: address, value: 2 },
                          { method: "post" }
                        )
                      }
                      className="p-0"
                    >
                      <svg
                        className="hover:fill-slate-600"
                        width="380"
                        height="380"
                        fill="#94a3b8"
                        version="1.1"
                        id="_x32_"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <style type="text/css"></style>
                        <g>
                          <path
                            d="M416.585,50.544v-0.114h-3.686h-3.686v0.114c-2.044,0.132-4.063,0.378-6.042,0.723
		c-5.162-26.003-28.153-45.66-55.648-45.66c-10.482,0-20.307,2.856-28.745,7.83C308.889,5.056,296.101,0,282.155,0
		c-27.685,0-50.798,19.936-55.756,46.202c-3.998-0.894-8.15-1.37-12.41-1.37c-31.28,0-56.733,25.452-56.733,56.733v98.126
		c-2.028-3.005-4.014-5.762-5.976-8.298c-5.54-7.075-10.489-12.09-16.178-16.424c-4.137-3.127-8.274-5.573-12.738-7.535
		c-5.968-2.626-12.213-4.219-18.566-4.736c-1.535-0.131-3.128-0.197-4.704-0.197c-15.833,0-31.058,6.697-41.778,18.369
		c-11.942,13.026-17.096,30.484-14.125,47.901c1.378,7.707,4.604,18.681,9.915,33.841c9.07,25.888,23.105,60.443,41.72,102.738
		c19.174,43.461,47.615,81.184,82.268,109.1C206.708,498.317,248.954,512,293.014,512c78.238,0,141.684-42.066,165.578-109.773
		c7.182-20.528,10.99-41.122,11.04-59.63v-5.704v-5.606V107.162C469.632,77.122,446.157,52.448,416.585,50.544z M293.014,478.38
		c-36.008,0-71.113-10.998-94.826-30.107c-30.123-24.27-55.634-58.021-72.59-96.467c-21.89-49.74-34.014-81.053-40.761-100.3
		c-6.747-19.272-8.15-26.413-8.504-28.383c-1.206-7.074,0.904-14.232,5.754-19.518c4.416-4.81,10.556-7.485,17.006-7.485
		l1.954,0.081c2.897,0.238,5.532,1.018,7.773,2.003c2.257,0.993,4.161,2.184,5.91,3.505c3.48,2.651,6.467,5.794,9.956,10.251
		c6.886,8.906,15.775,23.336,28.875,50.47c5.63,11.705,11.195,19.831,15.948,25.067c4.768,5.262,8.593,7.576,10.982,8.537
		c1.617,0.64,2.626,0.755,3.39,0.763c0.854-0.008,1.462-0.165,2.225-0.501c0.739-0.345,1.592-0.944,2.372-1.798
		c1.642-1.666,2.496-4.358,2.397-5.228V258.45V101.564c0-12.764,10.35-23.113,23.113-23.113c12.763,0,23.114,10.35,23.114,23.113
		v133.772h21.939V56.733c0-12.764,10.35-23.113,23.113-23.113c12.764,0,23.114,10.35,23.114,23.113v178.604h19.141V62.339
		c0-12.764,10.35-23.113,23.114-23.113c12.763,0,23.113,10.35,23.113,23.113v172.998h19.149V107.162
		c0-12.764,10.35-23.114,23.114-23.114c12.763,0,23.113,10.35,23.113,23.114v224.124c0,0.016,0,1.535,0,5.606
		c0,1.502,0,3.34,0,5.606c-0.041,14.347-2.971,30.944-9.128,48.542C405.126,452.706,348.024,478.38,293.014,478.38z"
                          />
                        </g>
                      </svg>
                    </button>
                    <button
                      className="p-0"
                      onClick={() =>
                        submit(
                          { address: address, value: 3 },
                          { method: "post" }
                        )
                      }
                    >
                      <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="350"
                        fill="#94a3b8"
                        height="350"
                        viewBox="0 0 1280.000000 1110.000000"
                        preserveAspectRatio="xMidYMid meet"
                        className="hover:fill-slate-600"
                      >
                        <metadata>
                          Created by potrace 1.15, written by Peter Selinger
                          2001-2017
                        </metadata>
                        <g
                          transform="translate(0.000000,1110.000000) scale(0.100000,-0.100000)"
                          stroke="none"
                        >
                          <path
                            d="M7830 11085 c-352 -38 -545 -133 -1065 -520 -433 -322 -637 -430
-910 -480 -54 -10 -164 -45 -275 -87 -388 -149 -835 -286 -1750 -538 -842
-232 -1316 -386 -1726 -560 -237 -102 -644 -492 -1000 -962 -120 -157 -297
-413 -525 -758 -118 -179 -257 -386 -309 -460 -72 -104 -101 -156 -127 -229
-148 -412 -181 -906 -93 -1403 58 -328 194 -756 368 -1158 145 -336 398 -840
497 -990 156 -236 357 -416 659 -590 224 -129 430 -214 1003 -414 199 -70 413
-147 475 -172 328 -131 1943 -709 2408 -862 820 -270 1525 -459 2190 -586 180
-34 780 -130 1010 -161 774 -104 1491 -155 2193 -155 277 0 317 6 507 77 737
275 1282 986 1416 1845 25 156 25 481 1 635 -44 280 -144 543 -288 759 -52 78
-98 202 -149 403 -79 315 -111 683 -91 1051 20 358 56 617 186 1355 152 865
178 1064 191 1515 12 412 -31 729 -147 1074 -190 562 -543 975 -1008 1180
-187 82 -365 112 -861 146 -451 31 -610 53 -790 109 -220 67 -364 148 -509
286 -177 168 -544 430 -733 523 -258 126 -452 160 -748 127z m335 -454 c161
-33 317 -107 493 -234 46 -33 186 -145 310 -249 345 -287 505 -392 690 -452
131 -42 178 -48 391 -47 1059 5 1666 -259 1907 -829 234 -553 274 -1185 133
-2110 -11 -74 -49 -308 -84 -520 -118 -707 -137 -870 -155 -1280 -10 -243 -28
-357 -85 -528 -122 -367 -378 -688 -670 -839 -151 -78 -347 -121 -493 -107
-103 9 -317 53 -417 86 -497 162 -910 575 -1029 1029 -14 51 -30 141 -36 197
-11 105 -10 130 15 327 7 61 19 153 25 205 23 193 85 407 254 875 157 432 203
622 213 873 l6 152 -74 0 c-282 0 -452 -170 -550 -549 -28 -108 -41 -178 -103
-566 -25 -152 -39 -217 -85 -381 -10 -39 -33 -153 -50 -255 -81 -491 -121
-981 -121 -1502 l0 -250 -45 -95 c-64 -136 -144 -250 -254 -364 -202 -211
-425 -341 -708 -415 -99 -25 -123 -28 -283 -27 -157 0 -185 3 -274 27 -55 15
-142 47 -194 73 -78 38 -107 58 -162 117 -336 357 -513 822 -561 1472 -15 213
-6 724 21 1065 11 146 17 284 14 307 -8 55 12 234 37 330 38 144 90 266 258
603 92 184 182 373 200 420 71 184 106 381 94 531 -8 108 -7 107 -95 86 -117
-28 -227 -89 -318 -174 -190 -178 -271 -372 -400 -953 -39 -173 -83 -360 -100
-415 -37 -126 -63 -243 -94 -426 -139 -811 -85 -1668 153 -2444 88 -289 54
-237 321 -493 441 -423 597 -609 730 -869 96 -186 135 -351 134 -564 l-1 -137
-47 -70 c-127 -192 -315 -281 -561 -268 -219 12 -417 74 -808 252 -66 30 -250
101 -410 158 -161 58 -490 180 -732 271 -1364 516 -1839 683 -2405 846 -182
52 -186 54 -266 115 -479 370 -685 1013 -659 2060 8 305 2 353 -48 429 -86
131 -257 59 -499 -210 -107 -118 -93 -121 -151 35 -74 200 -114 469 -103 685
31 551 251 1062 661 1530 34 39 121 156 195 260 460 656 729 934 1101 1140
220 122 576 229 1224 370 687 149 952 225 1235 355 144 66 193 83 630 219 615
191 823 267 1115 411 274 134 454 255 675 451 178 157 306 232 454 264 94 21
333 19 441 -4z m1121 -6976 c28 -14 59 -40 74 -62 35 -51 36 -176 3 -243 -58
-116 -175 -119 -252 -6 -42 61 -69 191 -52 254 19 72 33 82 111 82 50 0 78 -6
116 -25z m2633 -42 c13 -38 68 -180 121 -318 185 -473 247 -665 291 -905 18
-100 23 -160 23 -300 0 -257 -29 -370 -170 -667 -156 -330 -378 -576 -695
-769 -404 -246 -900 -327 -1324 -216 -63 16 -76 17 -135 4 -149 -31 -284 7
-341 97 -50 78 -63 134 -62 266 1 198 65 452 170 675 43 91 45 98 39 161 -18
205 -168 473 -377 674 -130 125 -255 206 -368 239 -72 21 -174 20 -235 -1 -55
-20 -133 -89 -161 -142 l-17 -34 46 -67 c25 -37 108 -133 184 -214 322 -344
409 -454 448 -567 27 -78 24 -180 -6 -244 -35 -72 -121 -152 -246 -229 -249
-153 -379 -196 -619 -203 -270 -9 -502 54 -695 188 -247 172 -374 445 -326
701 109 580 642 1010 1359 1099 126 15 455 6 552 -15 100 -22 526 -32 725 -17
534 41 962 171 1303 398 157 104 330 267 434 409 26 35 49 64 53 64 3 0 16
-30 29 -67z"
                          />
                          <path
                            d="M3729 6758 c-37 -59 -147 -291 -180 -378 -142 -382 -198 -659 -294
-1475 -64 -545 -122 -905 -166 -1045 -17 -55 -23 -413 -9 -542 60 -547 308
-1000 673 -1232 90 -58 402 -208 513 -248 128 -46 317 -93 464 -115 158 -23
463 -23 625 1 337 49 647 170 900 351 94 67 285 239 285 256 0 15 -177 95
-238 108 -75 16 -228 14 -313 -4 -112 -24 -225 -65 -474 -173 -360 -156 -484
-192 -658 -192 -127 0 -218 25 -380 104 -225 109 -391 229 -552 398 -211 221
-343 460 -406 737 -26 111 -35 319 -20 436 24 179 105 651 206 1200 151 819
207 1152 260 1557 16 118 16 128 0 162 -33 70 -119 126 -193 126 -14 0 -29
-11 -43 -32z"
                          />
                        </g>
                      </svg>
                    </button>
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
      </div>
      <Transition appear show={isDraw} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDraw(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform justify-center overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-6xl font-medium leading-6 text-slate-600"
                  >
                    DRAW
                  </Dialog.Title>
                  <h1 className=" mt-12 text-center text-2xl font-medium leading-6 text-slate-600">
                    Your deposit has been returned
                  </h1>
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      onClick={() => navigate("/")}
                    >
                      Back to Lobby
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isLoss} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsLoss(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform justify-center overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-6xl font-medium leading-6 text-slate-600"
                  >
                    LOSER
                  </Dialog.Title>
                  <h1 className=" mt-12 text-center text-2xl font-medium leading-6 text-slate-600">
                    You lost {game?.wager} eth
                  </h1>
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      onClick={() => navigate("/")}
                    >
                      Back to Lobby
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isWin} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsWin(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform justify-center overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-6xl font-medium leading-6 text-slate-600"
                  >
                    WINNER
                  </Dialog.Title>
                  <h1 className=" mt-12 text-center text-2xl font-medium leading-6 text-slate-600">
                    You earnt {game?.wager} eth
                  </h1>
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      onClick={() => navigate("/")}
                    >
                      Back to Lobby
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
