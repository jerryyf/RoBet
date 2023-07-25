import type { lobby } from "@prisma/client";
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

export async function addMoveGame(id: string, address: string, choice: number) {
    const game = await getGame(id)
    if (game?.challenger === address) {
            await prisma.game.update({
            where: {
                id: id,
            },
            data: {
                challenger_choice: choice,
            },
            })
    } else if (game?.creator === address) {
        await prisma.game.update({
            where: {
                id: id,
            },
            data: {
                creator_choice: choice,
            },
            })
          
    }
    return getResultGame(id)


}
export async function getResultGame(id: string) {
  const game = await getGame(id)
  if (game?.challenger_choice === null || game?.creator_choice === null || game === undefined ) return null
  if (game?.challenger_choice === game?.creator_choice) return true
  if ((game?.challenger_choice === 1 && game?.creator_choice === 2) 
  || (game?.challenger_choice === 2 && game?.creator_choice === 3) 
  || (game?.challenger_choice === 3 && game?.creator_choice === 1) ) return game.challenger
  return game?.creator

    
}