"use client";

import { useState, useCallback, memo } from "react";
import { Copy, Check, GitBranch, Zap, Hash, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type Message } from "ai";
import { Doc } from "@convex/_generated/dataModel";
import { getModelById, type SupportedModelId } from "@/lib/models";
import RetryModelSelector from "./RetryModelSelector";

type ChatMessage = Message & { 
  metadata?: Doc<"messages">["metadata"];
  model?: string;
};

interface MessageActionsProps {
  message: ChatMessage;
  isUser?: boolean;
  isStreaming?: boolean;
  className?: string;
  onBranch?: () => void;
  onRetry?: (messageToRetry: Message, retryModelId?: SupportedModelId) => Promise<void>;
}

interface StatConfig {
  key: string;
  icon?: React.ComponentType<{ className?: string }>;
  getValue: (message: ChatMessage) => string | null;
  condition: (message: ChatMessage) => boolean;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'model',
    getValue: (message) => {
      if (!message.model) return null;
      try {
        const modelInfo = getModelById(message.model as SupportedModelId);
        return modelInfo.name;
      } catch {
        return message.model;
      }
    },
    condition: (message) => !!message.model
  },
  {
    key: 'tokensPerSecond',
    icon: Zap,
    getValue: (message) => {
      const { duration, usage } = message.metadata || {};
      if (!duration || !usage?.totalTokens) return null;
      const tokensPerSecond = (usage.totalTokens / (duration / 1000)).toFixed(1);
      return `${tokensPerSecond} tok/s`;
    },
    condition: (message) => {
      const { duration, usage } = message.metadata || {};
      return !!(duration && usage?.totalTokens);
    }
  },
  {
    key: 'totalTokens',
    icon: Hash,
    getValue: (message) => {
      const { usage } = message.metadata || {};
      return usage?.totalTokens ? `${usage.totalTokens} tokens` : null;
    },
    condition: (message) => {
      const { usage } = message.metadata || {};
      return !!usage?.totalTokens;
    }
  },
  {
    key: 'duration',
    icon: Clock,
    getValue: (message) => {
      const { duration } = message.metadata || {};
      return duration ? `${(duration / 1000).toFixed(2)}s` : null;
    },
    condition: (message) => {
      const { duration } = message.metadata || {};
      return !!duration;
    }
  }
];

const MessageActions = memo(function MessageActions({ 
  message, 
  isUser = false,
  className,
  onBranch,
  onRetry
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleRetryWithModel = useCallback(async (modelId: SupportedModelId) => {
    if (onRetry) await onRetry(message, modelId);
  }, [onRetry, message]);

  const stats = STAT_CONFIGS
    .filter(config => config.condition(message))
    .map(config => ({
      key: config.key,
      icon: config.icon,
      text: config.getValue(message)!
    }))
    .filter(stat => stat.text !== null);

  return (
    <div className={cn(
      "flex items-center gap-2 transition-opacity duration-200",
      "group-hover:opacity-100 opacity-0",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "flex items-center gap-1",
        isUser && "order-2"
      )}>
        <Button
          variant="ghost"
          onClick={handleCopy}
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
        
        {!isUser && (
          <>
            <Button
              variant="ghost"
              onClick={onBranch}
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Branch conversation"
            >
              <GitBranch className="h-3 w-3" />
            </Button>
            
          </>
        )}
        <RetryModelSelector
          currentModelId={message.model}
          onRetry={handleRetryWithModel}
        />
      </div>

      {!isUser && stats.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-1">
              {stat.icon && <stat.icon className="h-3 w-3" />}
              <span>{stat.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default MessageActions; 