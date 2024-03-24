import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, Heading, SimpleGrid, Text, useInterval } from "@chakra-ui/react";

const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const INITIAL_SPEED = 200;
const SPEED_INCREASE = 50;

const generateRandomPosition = () => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

const Index = () => {
  const [snakes, setSnakes] = useState([]);
  const [food, setFood] = useState(generateRandomPosition());
  const [powerup, setPowerup] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const intervalRef = useRef();

  const resetGame = () => {
    setSnakes([
      {
        id: 1,
        body: [
          { x: 2, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 0 },
        ],
        direction: "RIGHT",
        speed: INITIAL_SPEED,
      },
      {
        id: 2,
        body: [
          { x: GRID_SIZE - 3, y: GRID_SIZE - 1 },
          { x: GRID_SIZE - 2, y: GRID_SIZE - 1 },
          { x: GRID_SIZE - 1, y: GRID_SIZE - 1 },
        ],
        direction: "LEFT",
        speed: INITIAL_SPEED,
      },
    ]);
    setFood(generateRandomPosition());
    setPowerup(null);
    setGameOver(false);
    setWinner(null);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useInterval(
    () => {
      setSnakes((prevSnakes) =>
        prevSnakes.map((snake) => {
          const head = { ...snake.body[0] };
          switch (snake.direction) {
            case "UP":
              head.y -= 1;
              break;
            case "DOWN":
              head.y += 1;
              break;
            case "LEFT":
              head.x -= 1;
              break;
            case "RIGHT":
              head.x += 1;
              break;
          }

          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || prevSnakes.some((s) => s.body.some((segment) => segment.x === head.x && segment.y === head.y))) {
            setGameOver(true);
            setWinner(prevSnakes.find((s) => s.id !== snake.id));
            return snake;
          }

          const newBody = [head, ...snake.body];

          if (head.x === food.x && head.y === food.y) {
            setFood(generateRandomPosition());
          } else {
            newBody.pop();
          }

          if (powerup && head.x === powerup.x && head.y === powerup.y) {
            setPowerup(null);
            return { ...snake, body: newBody, speed: snake.speed - SPEED_INCREASE };
          }

          return { ...snake, body: newBody };
        }),
      );
    },
    snakes.reduce((minSpeed, snake) => Math.min(minSpeed, snake.speed), INITIAL_SPEED),
    intervalRef,
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.replace("Arrow", "").toUpperCase();
      if (["UP", "DOWN", "LEFT", "RIGHT"].includes(key)) {
        setSnakes((prevSnakes) =>
          prevSnakes.map((snake, index) =>
            index === 0
              ? {
                  ...snake,
                  direction: key,
                }
              : snake,
          ),
        );
      }

      if (key === "W" || key === "S" || key === "A" || key === "D") {
        const direction = key === "W" ? "UP" : key === "S" ? "DOWN" : key === "A" ? "LEFT" : "RIGHT";
        setSnakes((prevSnakes) =>
          prevSnakes.map((snake, index) =>
            index === 1
              ? {
                  ...snake,
                  direction,
                }
              : snake,
          ),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (Math.random() < 0.02 && !powerup) {
      setPowerup(generateRandomPosition());
    }
  }, [snakes, powerup]);

  return (
    <Box p={4}>
      <Heading as="h1" mb={4} textAlign="center">
        Multi-Player Snake Game
      </Heading>
      <Flex justify="center" mb={8}>
        <SimpleGrid columns={GRID_SIZE} spacing={0} borderWidth={1} borderColor="gray.200" bg="gray.100">
          {Array(GRID_SIZE * GRID_SIZE)
            .fill(null)
            .map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isFood = food.x === x && food.y === y;
              const isPowerup = powerup && powerup.x === x && powerup.y === y;
              const isSnake = snakes.some((snake) => snake.body.some((segment) => segment.x === x && segment.y === y));
              return <Box key={index} w={6} h={6} bg={isFood ? "red.500" : isPowerup ? "blue.500" : isSnake ? "green.500" : "white"} />;
            })}
        </SimpleGrid>
      </Flex>
      {gameOver && (
        <Box textAlign="center">
          <Heading as="h2" size="xl" mb={4}>
            Game Over!
          </Heading>
          {winner && (
            <Text fontSize="xl" mb={4}>
              Player {winner.id} wins!
            </Text>
          )}
          <Button onClick={resetGame}>Play Again</Button>
        </Box>
      )}
    </Box>
  );
};

export default Index;
