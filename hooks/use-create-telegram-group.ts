import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import type { CreateTokenParams } from "./use-create-solana-token";

interface ExtendedCreateTokenParams extends CreateTokenParams {
  adminUsername: string;
  message?: string;
}

export const useCreateTelegramGroup = () => {
  return useMutation({
    mutationFn: async (data: ExtendedCreateTokenParams) => {
      toast.loading("Creating Telegram group...");
      const response = await fetch("/api/social/telegram", {
        method: "POST",
        body: JSON.stringify({
          groupName: data.name,
          groupDescription: data.description,
          adminUsername: data.adminUsername,
          imageUrl: data.url,
          message: data.message,
        }),
      });

      toast.success("Telegram group created successfully");
      return response.json();
    },
  });
};
