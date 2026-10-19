import { chooseMove, type Board, type Player } from '../lib/lab/connectFour.ts'

globalThis.onmessage = (event: MessageEvent<{ board: Board; player: Player; depth: number }>) => {
  const { board, player, depth } = event.data
  globalThis.postMessage(chooseMove(board, player, depth))
}
