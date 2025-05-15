"use client";

import { useState, useRef } from "react";
import data from "@/generation/chainmail_word_chains.json"; // Adjust the path based on your folder structure

type WordChain = {
  start_word: string;
  end_word: string;
  solution: string; // Comma-separated list of correct words
};

const Home = () => {
  // Generate a deterministic index based on today's date
  const today = new Date();
  const dateKey = parseInt(
    `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`
  );
  const randomIndex = dateKey % data.length;

  // Select the word chain for today
  const selectedItem = data[randomIndex] as WordChain;
  const startWord = selectedItem.start_word;
  const endWord = selectedItem.end_word;
  const solutionWords = selectedItem.solution
    .split(",")
    .map((word) => word.trim().toLowerCase()); // Parse solution list

  const [input, setInput] = useState(Array(startWord.length).fill(""));
  const [correctWords, setCorrectWords] = useState<string[]>([startWord]); // Start with the initial word
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
    const enteredWord = input.join("").toLowerCase();

    // Check if the entered word is in the solution list and not already in the correctWords list
    if (solutionWords.includes(enteredWord) && !correctWords.includes(enteredWord)) {
      setCorrectWords((prev) => [...prev, enteredWord]); // Add the word to the list
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
      {/* Display start word and end word with an arrow */}
      <div className="text-xl font-bold">
        {startWord} → {endWord}
      </div>

      {/* Display correct words */}
      <div className="flex flex-col items-center gap-2">
        {correctWords.map((word, index) =>
          renderWord(word, index > 0 ? correctWords[index - 1] : null)
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