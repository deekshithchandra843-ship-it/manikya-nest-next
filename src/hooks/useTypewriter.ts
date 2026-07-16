import { useState, useEffect } from "react";

export function useTypewriterPlaceholder(words: string[], speed = 60, delay = 2000) {
  const [placeholder, setPlaceholder] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const wordsString = JSON.stringify(words);

  // Reset indices if the words list actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setWordIndex(0);
      setCharIndex(0);
      setIsDeleting(false);
      setPlaceholder("");
    }, 0);
    return () => clearTimeout(timer);
  }, [wordsString]);

  useEffect(() => {
    if (!words || words.length === 0) return;

    // Ensure index bounds are safe
    const activeIndex = wordIndex % words.length;
    const currentWord = words[activeIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        if (charIndex === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        } else {
          setPlaceholder(currentWord.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        if (charIndex === currentWord.length) {
          setIsDeleting(true);
        } else {
          setPlaceholder(currentWord.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, wordsString, speed, delay, words]);

  return placeholder;
}
