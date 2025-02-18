import React from "react";
import { Button } from "./button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

interface AddLiquidityFormProps {
  tokenAddress: string;
}

interface AddLiquidityFormValues {
  amount: string;
}

export const AddLiquidityForm = ({ tokenAddress }: AddLiquidityFormProps) => {
  const form = useForm<AddLiquidityFormValues>({
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (data: AddLiquidityFormValues) => {
    // TODO: Implement add liquidity logic
    console.log("Add liquidity:", { tokenAddress, amount: data.amount });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Liquidity</Button>
      </form>
    </Form>
  );
};
