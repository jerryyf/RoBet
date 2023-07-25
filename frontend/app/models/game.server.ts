import { lobby } from "@prisma/client";
import { prisma } from "~/db.server";

export type { game } from "@prisma/client";

export async function createGame(lobby: lobby) {

    return await prisma.game.create({
      data: {
        wager: lobby.wager,
        creator: lobby.creator,
        challenger: lobby.challenger ?? "",    

      },
    });
  }

export async function checkOpenGame(address?: string | null) {
    console.log("CHECK OPEN GAME")

    if (address) {
        return await prisma.game.findFirst({
            where: {
              creator: address,
              creator_choice: null,
            },
           
            orderBy: {
              id: "desc"
            }
          })
        }
        
     else {
        return null
    }

}
export async function getAllGame() {
    return await prisma.game.findMany()
}
 



export async function getGame(id: string) {

    return  await prisma.game.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
    })
  }