// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: "google/gemma-2-9b-it",
    label: "Gemma 2 9B IT",
    apiIdentifier: "google/gemma-2-9b-it",
    description: "For complex, multi-step tasks",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    label: "Llama 3.3 70B Instruct Turbo",
    apiIdentifier: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    description: "For complex, multi-step tasks",
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    label: "Qwen 2.5 72B Instruct",
    apiIdentifier: "Qwen/Qwen2.5-72B-Instruct",
    description: "For complex, multi-step tasks",
  },
] as const;

export const DEFAULT_MODEL_NAME: string = models[0].id;
