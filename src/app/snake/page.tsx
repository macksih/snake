"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "./page.module.scss";

type BrickType = "empty" | "snake" | "feed";
type MoveType = "" | "U" | "D" | "L" | "R";
type LocationType = { i: number; j: number };
type Snake = LocationType[];
interface Brick {
  type: BrickType;
  i: number;
  j: number;
}

function SnakePage() {
  const BOARDER_HEIGHT = 50;
  const BOARDER_WIDTH = 50;
  const boardEl = useRef<HTMLDivElement>(null);
  const [bricks, setBricks] = useState<Brick[]>([]);
  
  const [isEaten, setIsEaten] = useState(false);
  const [feed, setFeed] = useState<LocationType>({ i: -1, j: -1 });
  const [head, setHead] = useState<LocationType>({ i: -1, j: -1 });
  const [tail, setTail] = useState<LocationType>({ i: -1, j: -1 });
  const [move, setMove] = useState<MoveType>("");
  const [direction, setDirection] = useState<MoveType>("");
  const [debug, setDebug] = useState("DEBUG");
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");


  const hw = Math.floor(BOARDER_WIDTH / 2);
  const hh = Math.floor(BOARDER_HEIGHT / 2);
  const INIT_HEAD: LocationType = { i: 4, j: hh };
  const INIT_TAIL: LocationType = { i: 2, j: hh };
  const INIT_SNAKE = [
    INIT_HEAD,
    { i: 3, j: hh },
    INIT_TAIL,
  ];
  const INIT_FEED = {
    i: hw,
    j: hh,
  };
  const [snake, setSnake] = useState<Snake>(INIT_SNAKE);

  const INIT_DIRECTION = "R";

  const serial = (i: number, j: number) => (j - 1) * BOARDER_WIDTH + i - 1;
  const isOpposite = (m: MoveType, d: MoveType): boolean => {
    if (m === "D" && d === "U") return true;
    if (m === "U" && d === "D") return true;
    if (m === "L" && d === "R") return true;
    if (m === "R" && d === "L") return true;
    return false;
  };
  const getId = (l: LocationType) => `${l.i},${l.j}`;
  const getBrickType = (
    snake: Snake,
    feed: LocationType,
    i: number,
    j: number
  ): BrickType => {
    if (feed.i === i && feed.j === j) return "feed";
    if (snake.find((el) => el.i === i && el.j === j)) return "snake";
    return "empty";
  };

  const mark = (brick: LocationType, className: string) => {
    const brickEl = document.getElementById(getId(brick));
    if (brickEl) {
      brickEl.removeAttribute("class");
      brickEl.classList.add(className);
    }
  };

  const isSame = (b1: LocationType, b2: LocationType) =>
    b1.i === b2.i && b1.j === b2.j;
  const randIntBetween = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const MOVEMENT_INTERVAL = 200;

  const resetGame = () => {
    setGameState("playing");
    setHead(INIT_HEAD);
    setTail(INIT_TAIL);
    setSnake(INIT_SNAKE);
    setFeed(INIT_FEED);
    setDirection(INIT_DIRECTION);
    setIsEaten(false);
  };

  const checkCollision = (nextHead: LocationType) => {
    if (
      nextHead.i < 1 ||
      nextHead.i > BOARDER_WIDTH ||
      nextHead.j < 1 ||
      nextHead.j > BOARDER_HEIGHT
    ) {
      
      setGameState("gameOver");
      return true;
    }

     if (snake.find((segment) => isSame(segment, nextHead))) {
      
      setGameState("gameOver");
      return true;
    }

    return false;
  };

  const movementIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!move || !snake || isOpposite(move, direction)) return;
    setDebug(move);
    const tmpSnake = [...snake];
    let tmpHead = { ...head };
    let tmpIsEaten = isEaten;
    let tmpFeed = { ...feed };

    const timeout = setTimeout(() => {
      setDebug(move);
      const tmpSnake = [...snake];
      let tmpHead = { ...head };
      let tmpIsEaten = isEaten;
      let tmpFeed = { ...feed };

      if (move === "R") tmpHead.i = head.i > BOARDER_WIDTH - 1 ? 1 : head.i + 1;
      if (move === "L") tmpHead.i = head.i <= 1 ? BOARDER_WIDTH : head.i - 1;
      if (move === "U") tmpHead.j = head.j <= 1 ? BOARDER_HEIGHT : head.j - 1;
      if (move === "D") tmpHead.j = head.j > BOARDER_HEIGHT - 1 ? 1 : head.j + 1;

      if (checkCollision(tmpHead)) {
        clearTimeout(timeout);
        return;
      }

      const tmpTail = tmpSnake[tmpSnake.length - 1] as LocationType;
      if (isSame(tmpHead, feed)) {
        tmpIsEaten = true;
        setIsEaten(true);
        mark(feed, styles.eaten);
      }
      if (isSame(tmpTail, feed)) {
        tmpFeed = {
          i: randIntBetween(1, BOARDER_WIDTH),
          j: randIntBetween(1, BOARDER_HEIGHT),
        };
        mark(tmpFeed, styles.feed);
        mark(feed, styles.empty);
      } else {
        tmpSnake.pop();
        mark(tmpTail, styles.empty);
      }

      tmpSnake.unshift(tmpHead);
      mark(tmpHead, isSame(tmpHead, feed) ? styles.eaten : styles.snake);

      setTail(tmpTail);
      setFeed(tmpFeed);
      setHead(tmpHead);
      setSnake(tmpSnake);
      setDirection(move);
      setIsEaten(tmpIsEaten);
    }, MOVEMENT_INTERVAL);

    return () => clearTimeout(timeout);
  }, [move, direction, snake, head, feed, isEaten]);

  useEffect(() => {
    const callback = (ev: KeyboardEvent) => {
      switch (ev.key.toLocaleLowerCase()) {
        case "w":
          setMove("U");
          break;
        case "s":
          setMove("D");
          break;
        case "a":
          setMove("L");
          break;
        case "d":
          setMove("R");
          break;
        default:
          setMove("");
          break;
      }
    };
    if (document) document.addEventListener("keydown", (ev) => callback(ev));

    return () => document.removeEventListener("keydown", callback);
  }, [setMove]);

  useEffect(() => {
    setHead(INIT_HEAD);
    setTail(INIT_TAIL);
    setSnake(INIT_SNAKE);
    setFeed(INIT_FEED);
    setDirection(INIT_DIRECTION);
    const tmp: Brick[] = [];
    for (let j = 1; j <= BOARDER_HEIGHT; j++) {
      for (let i = 1; i <= BOARDER_WIDTH; i++) {
        tmp.push({
          i,
          j,
          type: getBrickType(INIT_SNAKE, INIT_FEED, i, j),
        });
      }
    }
    setBricks(tmp);
  }, []);

  return (
    <div className={styles.page} ref={boardEl}>
      {gameState === "gameOver" && (
        <div className={styles.gameOverStyles}>
          <p>Game Over!</p>
          <button
            className={styles.gameOverButtonStyles}
            onClick={resetGame}
          >
            Restart
          </button>
        </div>
      )}
      <div>{debug}</div>
      <div className={styles.board}>
        {bricks.map((b) => (
          <div
            key={getId(b)}
            className={styles[b.type]}
            id={getId(b)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default SnakePage;