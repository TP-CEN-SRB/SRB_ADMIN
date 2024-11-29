"use client";

import Card from "@/components/Card/Card";
import React, { useTransition } from "react";
import FormHeader from "../FormHeader";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";
import { UpdateBinFormSchema } from "@/schemas/auth";
import { Faculty } from "@prisma/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FacultyComboBox from "../AuthForms/FacultyCombobox";
import { Button } from "@/components/ui/button";

interface EditBinFormProps {
  name: string;
  email: string;
  faculty: Faculty;
  location: string;
}

const EditBinForm = ({ name, email, faculty, location }: EditBinFormProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof UpdateBinFormSchema>>({
    defaultValues: {
      name,
      email,
      faculty,
      location,
    },
  });
  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Edit Bin Manager</FormHeader>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700d">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="John Doe"
                    {...field}
                    type="text"
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
                <FormLabel className="font-bold text-slate-700d">
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
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700d">
                  Faculty
                </FormLabel>
                <FormControl>
                  {/* <FacultyComboBox  disabled={isPending}/> */}
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700d">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Block 1, Level 1 of Engine School"
                    {...field}
                    type="text"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default EditBinForm;
