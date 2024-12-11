"use client";
import { UpdateStudentSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FacultyComboBox from "@/components/Form/AuthForms/FacultyCombobox";
import FormHeader from "@/components/Form/FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "@/components/Form/CustomFormMessage";
import Card from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { Faculty } from "@prisma/client";
import { updateStudent } from "@/app/action/user";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface EditStudentFormProps {
  id: string;
  email: string;
  name: string;
  faculty: Faculty;
  points: number | undefined;
}
const EditStudentForm = ({
  id,
  email,
  name,
  faculty,
  points,
}: EditStudentFormProps) => {
  const form = useForm<z.infer<typeof UpdateStudentSchema>>({
    resolver: zodResolver(UpdateStudentSchema),
    defaultValues: {
      name,
      email,
      faculty,
      points,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const onSubmit = (values: z.infer<typeof UpdateStudentSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await updateStudent(values, id);
      setError(data?.error as string);
      if (!data?.error && data?.success !== undefined) {
        router.push("/admin/user");
        toast({
          title: "Success!",
          description: `${data.success}`,
        });
      }
    });
  };
  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update user</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="John Doe"
                    {...field}
                    type="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="johndoe@tp.edu.sg"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="faculty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Faculty
                </FormLabel>
                <FormControl>
                  <FacultyComboBox disabled={isPending} field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[250px]">
                <FormLabel className="font-bold text-slate-700">
                  Points
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="10"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default EditStudentForm;
