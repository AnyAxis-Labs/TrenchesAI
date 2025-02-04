import { useAppKit } from "@reown/appkit/react";
import React from "react";
import { useAccount } from "wagmi";
import { Button, type ButtonProps } from "./button";

const ButtonWithWallet = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { isConnected } = useAccount();
    const { open } = useAppKit();

    if (isConnected) {
      return <Button ref={ref} {...props} />;
    }

    return (
      <Button ref={ref} {...props} onClick={() => open()} disabled={false}>
        Connect Wallet
      </Button>
    );
  }
);
ButtonWithWallet.displayName = "ButtonWithWallet";

export { ButtonWithWallet };
