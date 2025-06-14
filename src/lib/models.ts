import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";
import { 
  Eye, 
  FileUp, 
  Brain, 
  type LucideIcon,
  Search,
  FlaskConical,
  Key,
  Sparkles,
  Crown,
  Image,
  Settings2,
  Zap
} from "lucide-react";


// ------- CAPABILITIES -------
export interface BaseCapabilityDefinition {
  name: string;
  description: string;
  icon: LucideIcon;
  textColor: string;
  backgroundColor: string;
}

export const CAPABILITY_DEFINITIONS = {
  vision: {
    name: "Vision",
    description: "Supports image uploads and analysis",
    icon: Eye,
    textColor: "text-blue-300",
    backgroundColor: "bg-blue-300/10",
  },
  pdfUpload: {
    name: "PDFs",
    description: "Supports PDF uploads and analysis",
    icon: FileUp,
    textColor: "text-orange-300",
    backgroundColor: "bg-orange-300/10",
  },
  effortControl: {
    name: "Effort Control",
    description: "Customize the model's reasoning effort",
    icon: Settings2,
    textColor: "text-pink-300",
    backgroundColor: "bg-pink-300/10",
  },
  reasoning: {
    name: "Reasoning",
    description: "Has reasoning capabilities",
    icon: Brain,
    textColor: "text-purple-300",
    backgroundColor: "bg-purple-300/10",
  },
  webSearch: {
    name: "Web Search",
    description: "Can search the web for information",
    icon: Search,
    textColor: "text-green-300",
    backgroundColor: "bg-green-300/10",
  },
  fast: {
    name: "Fast",
    description: "Very fast model",
    icon: Zap,
    textColor: "text-yellow-300",
    backgroundColor: "bg-yellow-300/10",
  },
  imageGeneration: {
    name: "Image Generation",
    description: "Can generate images",
    icon: Image,
    textColor: "text-red-300",
    backgroundColor: "bg-red-300/10",
  },
} as const satisfies Record<string, BaseCapabilityDefinition>;

export type CapabilityKey = keyof typeof CAPABILITY_DEFINITIONS;
export interface CapabilityDefinition extends BaseCapabilityDefinition {
  id: CapabilityKey;
}

export type ModelCapabilities = Record<CapabilityKey, boolean> & {
  maxTokens?: number;
  contextWindow?: number;
};
type PartialModelCapabilities = Partial<ModelCapabilities>;

// Helper function to ensure all capabilities are defined with defaults
function normalizeCapabilities(capabilities: PartialModelCapabilities): ModelCapabilities {
  const defaultCapabilities: Record<CapabilityKey, boolean> = {
    vision: false,
    pdfUpload: false,
    effortControl: false,
    reasoning: false,
    webSearch: false,
    fast: false,
    imageGeneration: false,
  };

  return {
    ...defaultCapabilities,
    ...capabilities,
    maxTokens: capabilities.maxTokens,
    contextWindow: capabilities.contextWindow,
  };
}


// ------- MODEL FLAGS -------
export interface BaseModelFlagDefinition {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const MODEL_FLAG_DEFINITIONS = {
  isExperimental: {
    name: "Experimental",
    description: "Experimental - may have unstable behavior",
    icon: FlaskConical,
    color: "text-purple-300",
  },
  isBringYourOwnKey: {
    name: "Bring Your Own Key",
    description: "Requires your own API key",
    icon: Key,
    color: "text-blue-300",
  },
  isNew: {
    name: "New",
    description: "Recently released model",
    icon: Sparkles,
    color: "text-yellow-300",
  },
  isPremium: {
    name: "Premium",
    description: "Premium model with advanced features",
    icon: Crown,
    color: "text-green-300",
  },
} as const satisfies Record<string, BaseModelFlagDefinition>;

export type ModelFlagKey = keyof typeof MODEL_FLAG_DEFINITIONS;
export interface ModelFlagDefinition extends BaseModelFlagDefinition {
  id: ModelFlagKey;
}

export type ModelFlags = Partial<Record<ModelFlagKey, boolean>>;


// ------- PROVIDERS -------
interface BaseProviderDefinition {
  name: string;
  website: string;
}

export const PROVIDER_DEFINITIONS = {
  google: {
    name: "Google",
    website: "https://ai.google.dev/",
  },
  openai: {
    name: "OpenAI",
    website: "https://openai.com/",
  },
  anthropic: {
    name: "Anthropic",
    website: "https://anthropic.com/",
  },
  deepseek: {
    name: "DeepSeek",
    website: "https://deepseek.com/",
  },
  meta: {
    name: "Meta",
    website: "https://ai.meta.com/",
  },
  grok: {
    name: "Grok",
    website: "https://x.ai/",
  },
  qwen: {
    name: "Qwen",
    website: "https://qwenlm.github.io/",
  },
} as const satisfies Record<string, BaseProviderDefinition>;
export type ProviderKey = keyof typeof PROVIDER_DEFINITIONS;

export interface ProviderDefinition extends BaseProviderDefinition {
  id: ProviderKey;
}


// ------- MODELS -------
type ModelType = "chat" | "imageGeneration";

// Internal model definition with optional capabilities
interface InternalBaseModel {
  id: string;
  name: string;
  subtitle?: string;
  provider: ProviderKey;
  type: ModelType;
  description: string;
  capabilities: PartialModelCapabilities; // Allow partial capabilities
  flags?: ModelFlags;
  isDefault?: boolean;
}

// Final model definition with normalized capabilities
interface BaseModel {
  id: string;
  name: string;
  subtitle?: string;
  provider: ProviderKey;
  type: ModelType;
  description: string;
  capabilities: ModelCapabilities; // All capabilities defined
  flags?: ModelFlags;
  isDefault?: boolean;
}

const INTERNAL_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    type: "chat",
    description: "Google's latest stable model",
    capabilities: {
      vision: true,
      pdfUpload: true,
      webSearch: true,
      maxTokens: 8192,
      contextWindow: 1000000,
    },
    isDefault: true,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    subtitle: "Thinking",
    provider: "google",
    type: "chat",
    description: "Google's latest fast model",
    capabilities: {
      vision: true,
      pdfUpload: true,
      webSearch: true,
      maxTokens: 65535,
      contextWindow: 1048576,
    },
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    type: "chat",
    description: "Google's most capable model",
    capabilities: {
      vision: true,
      pdfUpload: true,
      reasoning: true,
      webSearch: true,
      effortControl: true,
      maxTokens: 65536,
      contextWindow: 1048576,
    },
    flags: {
      isExperimental: true,
    },
  },
  {
    id: "gpt-imagegen",
    name: "GPT ImageGen",
    provider: "openai",
    type: "imageGeneration",
    description: "OpenAI's image generation model",
    capabilities: {
      vision: true,
      imageGeneration: true,
    }
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    type: "chat",
    description: "OpenAI's flagship model optimized for advanced instruction following and real-world software engineering",
    capabilities: {
      vision: true,
      contextWindow: 1047576,
      maxTokens: 32768
    }
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    type: "chat",
    description: "OpenAI's faster less precise 4.1 model",
    capabilities: {
      vision: true,
      contextWindow: 1047576,
      maxTokens: 32768
    }
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    type: "chat",
    description: "OpenAI's fastest less precise 4.1 model that demand low latency",
    capabilities: {
      vision: true,
      contextWindow: 1047576,
      maxTokens: 32768
    }
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    type: "chat",
    description: "OpenAI's flagship non-reasoning model",
    capabilities: {
      vision: true,
      maxTokens: 16384,
      contextWindow: 128000,
    }
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    type: "chat",
    description: "OpenAI's faster less precise 4o model",
    capabilities: {
      vision: true,
      maxTokens: 16384,
      contextWindow: 128000
    }
  },
  {
    id: "o4-mini",
    name: "o4-mini",
    provider: "openai",
    type: "chat",
    description: "OpenAI's latest small reasoning model",
    capabilities: {
      vision: true,
      reasoning: true,
      effortControl: true,
      maxTokens: 100000,
      contextWindow: 200000,
    },
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "anthropic",
    type: "chat",
    description: "Anthropic's flagship model",
    capabilities: {
      vision: true,
      pdfUpload: true,
      maxTokens: 64000,
      contextWindow: 200000,
    },
    flags: {
      isBringYourOwnKey: true,
    },
  },
  {
    id: "claude-4-sonnet-reasoning",
    name: "Claude 4 Sonnet",
    subtitle: "Reasoning",
    provider: "anthropic",
    type: "chat",
    description: "Anthropic's flagship model (reasoning)",
    capabilities: {
      vision: true,
      pdfUpload: true,
      reasoning: true,
      effortControl: true,
      maxTokens: 64000,
      contextWindow: 200000,
    },
  },
  {
    id: "deepseek-r1-0528",
    name: "DeepSeek R1",
    subtitle: "0528",
    provider: "deepseek",
    type: "chat",
    description: "DeepSeek's updated R1 model",
    capabilities: {
      reasoning: true,
      maxTokens: 16000,
      contextWindow: 128000,
    }
  },
  {
    id: "deepseek-r1-llama-distilled",
    name: "DeepSeek R1",
    subtitle: "Llama Distilled",
    provider: "deepseek",
    type: "chat",
    description: "DeepSeek R1 distilled in Llama 3.3 70b",
    capabilities: {
      reasoning: true,
      fast: true,
      maxTokens: 16000,
      contextWindow: 128000,
    },
  },
] as const satisfies readonly InternalBaseModel[];

export interface Model extends BaseModel {
  id: SupportedModelId;
}

// Transform internal models to normalized models with all capabilities defined
function createModels(): Model[] {
  return INTERNAL_MODELS.map(model => ({
    ...model,
    capabilities: normalizeCapabilities(model.capabilities),
  })) as Model[];
}

export const MODELS = createModels();
export type SupportedModelId = (typeof INTERNAL_MODELS)[number]["id"];


// ------- UTILITIES -------
export function getModelById(id: SupportedModelId): Model {
  return MODELS.find(model => model.id === id)!;
}

export function getModelsByProvider(provider: ProviderKey): Model[] {
  return MODELS.filter(model => model.provider === provider);
}

export function getModelsByCapability(capability: CapabilityKey): Model[] {
  return MODELS.filter(model => model.capabilities[capability]);
}

export function getModelsByType(type: ModelType): Model[] {
  return MODELS.filter(model => model.type === type);
}

export function isImageGenerationModel(model: Model): boolean {
  return model.type === "imageGeneration";
}

export function isChatModel(model: Model): boolean {
  return model.type === "chat";
}

export function getDefaultModel(): Model {
  return MODELS.find(model => model.isDefault) || MODELS[0];
}

export function getModelCapabilities(model: Model): CapabilityDefinition[] {
  return Object.entries(model.capabilities)
    .filter(([key, value]) => typeof value === "boolean" && value && CAPABILITY_DEFINITIONS[key as CapabilityKey])
    .map(([key]) => ({ 
      ...CAPABILITY_DEFINITIONS[key as CapabilityKey], 
      id: key as CapabilityKey 
    }));
}

export function getModelFlags(model: Model): ModelFlagDefinition[] {
  if (!model.flags) return [];
  
  return Object.entries(model.flags)
    .filter(([key, value]) => value && MODEL_FLAG_DEFINITIONS[key as ModelFlagKey])
    .map(([key]) => ({ 
      ...MODEL_FLAG_DEFINITIONS[key as ModelFlagKey], 
      id: key as ModelFlagKey 
    }));
}

export function getProviderDefinition(provider: ProviderKey): ProviderDefinition {
  return { 
    ...PROVIDER_DEFINITIONS[provider], 
    id: provider 
  };
}


// ------- MODEL INSTANCES -------
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export type ImageModelV1 = ReturnType<typeof openai.image>;
export function getModelByInternalId(internalId: SupportedModelId): LanguageModelV1 | ImageModelV1 | undefined {
  switch (internalId) {
    case "gemini-2.0-flash":
      return google("gemini-2.0-flash");
    case "gemini-2.5-flash":
      return google("gemini-2.5-flash-preview-04-17");
    case "gemini-2.5-pro":
      return google("gemini-2.5-pro-preview-05-06");
    case "gpt-imagegen":
      return openai.image("gpt-image-1");
    case "gpt-4.1":
      return openai("gpt-4.1");
    case "gpt-4.1-mini":
      return openai("gpt-4.1-mini");
    case "gpt-4.1-nano":
      return openai("gpt-4.1-nano");
    case "gpt-4o":
      return openai("gpt-4o");
    case "gpt-4o-mini":
      return openai("gpt-4o-mini");
    case "o4-mini":
      return openai("o4-mini");
    case "claude-4-sonnet":
      return openrouter.languageModel("anthropic/claude-sonnet-4");
    case "claude-4-sonnet-reasoning":
      return openrouter.languageModel("anthropic/claude-sonnet-4");
    case "deepseek-r1-0528":
      // TODO: REMOVE FREE
      return openrouter.languageModel("deepseek/deepseek-r1-0528:free");
    case "deepseek-r1-llama-distilled":
      return openrouter.languageModel("deepseek/deepseek-r1-distill-llama-70b");
    default:
      return undefined;
  }
}