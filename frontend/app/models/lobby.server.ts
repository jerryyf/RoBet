
import { prisma } from "~/db.server";

export type { lobby } from "@prisma/client";



export async function createLobby(wager: number, address: string) {

  return await prisma.lobby.create({
    data: {
      wager: wager,
      creator: address,
    },
  });
}

export async function getAllLobby() {

  return  await prisma.lobby.findMany()
}

export async function getAllOpenLobby() {

  return await prisma.lobby.findMany({
    where: {
      challenger: {
        equals: null,
      },
    },
  })
}

export async function getLobby(id: string) {

  return  await prisma.lobby.findMany({
    where: {
      id: {
        equals: id,
      },
    },
  })
}

export async function addPlayerToLobby(address: string, id: string) {

  return  await prisma.lobby.update({
    where: {
      id: id,
    },
    data: {
      challenger: address
    },
  })
}
