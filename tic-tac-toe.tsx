"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User, RotateCcw, Trophy } from "lucide-react"

type Player = "X" | "O" | null
type GameMode = "pvp" | "ai"

interface GameState {
  board: Player[]
  currentPlayer: Player
  winner: Player | "tie"
  gameMode: GameMode
  scores: { X: number; O: number; ties: number }
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
]

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    gameMode: "pvp",
    scores: { X: 0, O: 0, ties: 0 },
  })

  const checkWinner = (board: Player[]): Player | "tie" | null => {
    // Check for winning combinations
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    // Check for tie
    if (board.every((cell) => cell !== null)) {
      return "tie"
    }

    return null
  }

  const makeMove = (index: number) => {
    if (gameState.board[index] || gameState.winner) return

    const newBoard = [...gameState.board]
    newBoard[index] = gameState.currentPlayer

    const winner = checkWinner(newBoard)
    const nextPlayer = gameState.currentPlayer === "X" ? "O" : "X"

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      currentPlayer: winner ? prev.currentPlayer : nextPlayer,
      winner,
      scores: winner
        ? {
            ...prev.scores,
            [winner === "tie" ? "ties" : winner]: prev.scores[winner === "tie" ? "ties" : winner] + 1,
          }
        : prev.scores,
    }))
  }

  // AI Move Logic
  const makeAIMove = () => {
    if (gameState.winner || gameState.currentPlayer === "X") return

    const availableMoves = gameState.board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null) as number[]

    if (availableMoves.length === 0) return

    // Simple AI: Try to win, then block, then random
    const getBestMove = (): number => {
      // Try to win
      for (const move of availableMoves) {
        const testBoard = [...gameState.board]
        testBoard[move] = "O"
        if (checkWinner(testBoard) === "O") return move
      }

      // Try to block player from winning
      for (const move of availableMoves) {
        const testBoard = [...gameState.board]
        testBoard[move] = "X"
        if (checkWinner(testBoard) === "X") return move
      }

      // Take center if available
      if (availableMoves.includes(4)) return 4

      // Take corners
      const corners = [0, 2, 6, 8].filter((i) => availableMoves.includes(i))
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)]
      }

      // Random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }

    setTimeout(() => {
      const aiMove = getBestMove()
      makeMove(aiMove)
    }, 500) // Small delay for better UX
  }

  // Effect for AI moves
  useEffect(() => {
    if (gameState.gameMode === "ai" && gameState.currentPlayer === "O" && !gameState.winner) {
      makeAIMove()
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.winner])

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
    }))
  }

  const resetScores = () => {
    setGameState((prev) => ({
      ...prev,
      scores: { X: 0, O: 0, ties: 0 },
    }))
  }

  const switchGameMode = (mode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
    }))
  }

  const getPlayerName = (player: Player) => {
    if (!player) return ""
    if (gameState.gameMode === "ai") {
      return player === "X" ? "Player" : "AI"
    }
    return `Player ${player}`
  }

  const getCellStyle = (index: number) => {
    const baseStyle =
      "w-20 h-20 text-3xl font-bold border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center cursor-pointer"

    if (gameState.board[index] === "X") {
      return `${baseStyle} text-blue-600 bg-blue-50`
    }
    if (gameState.board[index] === "O") {
      return `${baseStyle} text-red-600 bg-red-50`
    }
    if (gameState.winner) {
      return `${baseStyle} cursor-not-allowed opacity-50`
    }
    return baseStyle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Tic-Tac-Toe Game</CardTitle>

            {/* Game Mode Selection */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant={gameState.gameMode === "pvp" ? "default" : "outline"}
                onClick={() => switchGameMode("pvp")}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Player vs Player
              </Button>
              <Button
                variant={gameState.gameMode === "ai" ? "default" : "outline"}
                onClick={() => switchGameMode("ai")}
                className="flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                vs AI
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Scores */}
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="outline" className="px-3 py-1">
                <span className="text-blue-600 font-bold">X</span>: {gameState.scores.X}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Ties: {gameState.scores.ties}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <span className="text-red-600 font-bold">O</span>: {gameState.scores.O}
              </Badge>
            </div>

            {/* Game Status */}
            <div className="text-center">
              {gameState.winner ? (
                <div className="space-y-2">
                  {gameState.winner === "tie" ? (
                    <div className="text-xl font-bold text-gray-600 flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {"It's a Tie!"}
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {getPlayerName(gameState.winner)} Wins!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-lg font-semibold text-gray-700">
                  Current Turn:{" "}
                  <span className={gameState.currentPlayer === "X" ? "text-blue-600" : "text-red-600"}>
                    {getPlayerName(gameState.currentPlayer)}
                  </span>
                </div>
              )}
            </div>

            {/* Game Board */}
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 p-4 bg-gray-100 rounded-lg">
                {gameState.board.map((cell, index) => (
                  <button
                    key={index}
                    className={getCellStyle(index)}
                    onClick={() => makeMove(index)}
                    disabled={!!cell || !!gameState.winner}
                  >
                    {cell}
                  </button>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3">
              <Button onClick={resetGame} variant="outline" className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
              <Button
                onClick={resetScores}
                variant="outline"
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                Reset Scores
              </Button>
            </div>

            {/* Game Instructions */}
            <div className="text-center text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">How to Play:</p>
              <p>Get three of your markers (X or O) in a row - horizontally, vertically, or diagonally to win!</p>
              {gameState.gameMode === "ai" && (
                <p className="mt-2 text-blue-600">{"You're playing as X against the AI (O)"}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
