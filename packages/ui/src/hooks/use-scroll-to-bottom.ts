'use client';

import { useEffect, useRef } from "react";

export function useScrollToBottom(messages: any[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  
  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;
    
    if (!container || !end) return;
    
    const observer = new MutationObserver(() => {
      if (!isUserScrolling.current) {
        end.scrollIntoView({ behavior: "smooth" });
      }
    });
    
    observer.observe(container, { childList: true, subtree: true });
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isUserScrolling.current = scrollHeight - scrollTop - clientHeight > 100;
    };
    
    container.addEventListener("scroll", handleScroll);
    
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);
  
  return [containerRef, endRef] as const;
}