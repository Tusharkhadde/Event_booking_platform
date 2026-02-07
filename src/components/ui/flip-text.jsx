"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export function FlipText({
  className,
  text,
  children,
  duration = 0.8,
  delay = 0,
  loop = true,
  separator = " ",
  together = false,
}) {
  // Choose string source: text prop first, then string children
  const sourceText = useMemo(() => {
    if (typeof text === "string") return text;
    if (typeof children === "string") return children;
    return "";
  }, [text, children]);

  const words = useMemo(
    () => sourceText.split(separator),
    [sourceText, separator]
  );

  const totalChars = sourceText.length || 1;

  const getCharIndex = (wordIndex, charIndex) => {
    let index = 0;
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length);
    }
    return index + charIndex;
  };

  return (
    <span className={cn("flip-text-wrapper inline-block leading-none", className)}>
      {words.map((word, wordIndex) => {
        const chars = word.split("");

        return (
          <span
            key={wordIndex}
            className="inline-block whitespace-nowrap"
          >
            {chars.map((char, charIndex) => {
              const currentGlobalIndex = getCharIndex(wordIndex, charIndex);

              let calculatedDelay = delay;
              if (!together) {
                const normalizedIndex = currentGlobalIndex / totalChars;
                const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
                calculatedDelay = sineValue * (duration * 0.25) + delay;
              }

              return (
                <span
                  key={charIndex}
                  className="flip-char inline-block"
                  style={{
                    animationName: "flipChar",
                    animationDuration: `${duration}s`,
                    animationDelay: `${calculatedDelay}s`,
                    animationIterationCount: loop ? "infinite" : "1",
                    animationTimingFunction: "ease-in-out",
                  }}
                >
                  {char}
                </span>
              );
            })}

            {separator === " " && wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
            {separator !== " " && wordIndex < words.length - 1 && (
              <span className="inline-block">{separator}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export default FlipText;