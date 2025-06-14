"use client";

import { createContext, useContext } from "react";
import { type Message } from "ai";
import { Doc } from "@convex/_generated/dataModel";
import { SupportedModelId } from "@/lib/models";

type ChatMessage = Message & { metadata?: Doc<"messages">["metadata"] };

interface ChatMessagesContextType {
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  isStreaming: boolean;
  handleRetry: (messageToRetry: Message, retryModelId?: SupportedModelId) => Promise<void>;
}

const ChatMessagesContext = createContext<ChatMessagesContextType | null>(null);

export function useChatMessages() {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error("useChatMessages must be used within a ChatMessagesProvider");
  }
  return context;
}

export { ChatMessagesContext };
export type { ChatMessage, ChatMessagesContextType }; 