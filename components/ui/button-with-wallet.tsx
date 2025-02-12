import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import React from "react";
import { Button, type ButtonProps } from "./button";

const ButtonWithWallet = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { isConnected } = useAppKitAccount();
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
