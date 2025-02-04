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
    apiIdentifier: "gemma-2-9b-it",
    description: "For complex, multi-step tasks",
  },
] as const;

export const DEFAULT_MODEL_NAME: string = models[0].id;
