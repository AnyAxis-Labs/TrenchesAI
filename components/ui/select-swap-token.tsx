import { useState } from "react";
import type { Token } from "agni-sdk";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAgni } from "@/hooks/use-agni";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface SelectSwapTokenProps {
  value: Token | null;
  onChange: (token: Token | null) => void;
}

const SelectSwapToken = ({ value: token, onChange }: SelectSwapTokenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: { tokenMangerApi },
  } = useAgni();

  const { data: tokens } = useQuery({
    queryKey: ["tokens", tokenMangerApi],
    queryFn: async () => {
      const tokenList = await tokenMangerApi.getTokenByTokenList();

      return tokenList.concat(tokenMangerApi.systemTokens());
    },
  });

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={token?.logoURI} alt={token?.symbol} className="w-6 h-6" />
        {token?.symbol}
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md rounded-lg p-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {tokens?.map((token) => (
              <Button
                key={token.address}
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => {
                  onChange(token);
                  setIsOpen(false);
                }}
              >
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-6 h-6"
                />
                {token.symbol}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectSwapToken;
