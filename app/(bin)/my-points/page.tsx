"use client";
import Card from "@/components/Card/Card";
import CardButton from "@/components/Card/CardButton";
import CardHeader from "@/components/Card/CardHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AdminNumberSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MyPointsPage = () => {
  const form = useForm<z.infer<typeof AdminNumberSchema>>({
    resolver: zodResolver(AdminNumberSchema),
    defaultValues: {
      adminNumber: "",
    },
  });
  const onSubmit = (values: z.infer<typeof AdminNumberSchema>) => {};
  return (
    <Card>
      <div className="mb-6">
        <CardHeader>Enter your admin number</CardHeader>
      </div>
      <div className="flex justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="adminNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      maxLength={8}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                        <InputOTPSlot index={6} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={7} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-6 px-6 min-w-56 rounded-full transition-all"
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <CardButton href="/" color="blue">
        Back
      </CardButton>
    </Card>
  );
};

export default MyPointsPage;
