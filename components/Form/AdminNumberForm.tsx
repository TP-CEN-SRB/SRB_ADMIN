import React from "react";
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
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminNumberSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

const AdminNumberForm = () => {
  const form = useForm<z.infer<typeof AdminNumberSchema>>({
    resolver: zodResolver(AdminNumberSchema),
    defaultValues: {
      adminNumber: "",
    },
  });
  const router = useRouter();
  const onSubmit = (values: z.infer<typeof AdminNumberSchema>) => {
    const validatedFields = AdminNumberSchema.safeParse(values);
    if (validatedFields.success) {
      router.push(`/my-points/${values.adminNumber.toUpperCase()}`);
    }
  };
  return (
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
                    className="text-3xl"
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    maxLength={8}
                    {...field}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={6} className="w-12 h-12 text-2xl" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={7} className="w-12 h-12 text-2xl" />
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
              className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold p-6 min-w-56 rounded-full transition-all"
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminNumberForm;
