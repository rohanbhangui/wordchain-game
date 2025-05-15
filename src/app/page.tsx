"use client";

import { useState, useRef } from "react";
import data from "@/generation/chainmail_word_chains.json"; // Adjust the path based on your folder structure

type WordChain = {
  start_word: string;
  end_word: string;
  solution: string; // Comma-separated list of correct words
  number_of_words: number; // Total number of words in the chain
};

const Home = () => {
  const [mode, setMode] = useState<"daily" | "shuffle">("daily"); // State to toggle between modes
  const [shuffleIndex, setShuffleIndex] = useState(Math.floor(Math.random() * data.length)); // Random index for shuffle mode

  // Generate a deterministic index based on today's date for the daily puzzle
  const today = new Date();
  const dateKey = parseInt(
    `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`
  );
  const dailyIndex = dateKey % data.length;

  // States for daily mode
  const dailyItem = data[dailyIndex] as WordChain;
  const [dailyCorrectWords, setDailyCorrectWords] = useState<string[]>([dailyItem.start_word]);

  // States for shuffle mode
  const shuffleItem = data[shuffleIndex] as WordChain;
  const [shuffleCorrectWords, setShuffleCorrectWords] = useState<string[]>([shuffleItem.start_word]);

  // Determine the current mode's data
  const selectedItem = mode === "daily" ? dailyItem : shuffleItem;
  const startWord = selectedItem.start_word;
  const endWord = selectedItem.end_word;
  const numberOfWords = selectedItem.number_of_words; // Get the number of words in the chain
  const solutionWords = selectedItem.solution
    .split(",")
    .map((word) => word.trim().toLowerCase()); // Parse solution list

  const [input, setInput] = useState(Array(startWord.length).fill(""));
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (value: string, index: number) => {
    // Allow only letters
    if (!/^[a-zA-Z]$/.test(value)) return;

    const newInput = [...input];
    newInput[index] = value.slice(-1); // Only keep the last character
    setInput(newInput);

    // Move to the next input field if it exists
    if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newInput = [...input];

      if (input[index]) {
        // If the current field has a character, delete it and move to the previous field
        newInput[index] = "";
        setInput(newInput);
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else if (index > 0) {
        // If the current field is empty, move to the previous field
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Ensure all inputs are filled
    if (input.some((char) => char === "")) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Shake animation for incomplete input
      return;
    }

    const enteredWord = input.join("").toLowerCase();

    // Check if the entered word is in the solution list and not already in the correctWords list
    if (solutionWords.includes(enteredWord)) {
      if (mode === "daily") {
        if (!dailyCorrectWords.includes(enteredWord)) {
          setDailyCorrectWords((prev) => [...prev, enteredWord]); // Add the word to the daily list
        }
      } else {
        if (!shuffleCorrectWords.includes(enteredWord)) {
          setShuffleCorrectWords((prev) => [...prev, enteredWord]); // Add the word to the shuffle list
        }
      }

      setInput(Array(startWord.length).fill("")); // Clear the inputs

      // Reset focus to the first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);

      // Check if the entered word is the final word in the solution
      if (enteredWord === endWord.toLowerCase()) {
        window.alert("You won!");
      }
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Remove shake effect after 500ms
    }
  };

  const handleTabSwitch = (newMode: "daily" | "shuffle") => {
    setMode(newMode);
    setInput(Array(startWord.length).fill("")); // Reset inputs
  };

  const handleShuffle = () => {
    const newShuffleIndex = Math.floor(Math.random() * data.length);
    setShuffleIndex(newShuffleIndex); // Pick a new random index for shuffle mode
    const newShuffleStartWord = data[newShuffleIndex].start_word as string;
    setInput(Array(newShuffleStartWord.length).fill("")); // Reset inputs
    setShuffleCorrectWords([newShuffleStartWord]); // Reset correct words
  };

  const renderWord = (word: string, previousWord: string | null) => {
    return (
      <div className="flex gap-1">
        {word.split("").map((char, index) => {
          const isChanged = previousWord ? char !== previousWord[index] : false;
          const colorClass = previousWord
            ? isChanged
              ? "text-green-500"
              : "text-gray-500"
            : "text-white";
          return (
            <span key={index} className={`${colorClass} font-bold`}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      {/* Tabs for switching modes */}
      <div className="flex border border-white rounded-lg overflow-hidden">
        <button
          onClick={() => handleTabSwitch("daily")}
          className={`px-4 py-2 font-bold ${
            mode === "daily"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--background)] text-[var(--foreground)]"
          }`}
        >
          Daily Puzzle
        </button>
        <button
          onClick={() => handleTabSwitch("shuffle")}
          className={`px-4 py-2 font-bold ${
            mode === "shuffle"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--background)] text-[var(--foreground)]"
          }`}
        >
          Shuffle Mode
        </button>
      </div>

      {/* Shuffle button for shuffle mode */}
      {mode === "shuffle" && (
        <button
          onClick={handleShuffle}
          className="px-4 py-2 mt-2 font-bold bg-green-500 text-white"
        >
          Shuffle
        </button>
      )}

      {/* Display start word and end word with an arrow */}
      <div className="text-xl font-bold">
        {startWord} → {endWord} <span className="text-gray-500">({numberOfWords} words)</span>
      </div>

      {/* Display correct words */}
      <div className="flex flex-col items-center gap-2">
        {(mode === "daily" ? dailyCorrectWords : shuffleCorrectWords).map((word, index) =>
          renderWord(word, index > 0 ? (mode === "daily" ? dailyCorrectWords[index - 1] : shuffleCorrectWords[index - 1]) : null)
        )}
      </div>

      {/* Input fields for each character */}
      <div
        className={`flex gap-2 mt-4 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {startWord.split("").map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={input[index]}
            onChange={(e) => handleInputChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="w-8 h-10 text-center border-b-2 border-gray-400 focus:outline-none"
          />
        ))}
      </div>
    </div>
  );
};

export default Home;