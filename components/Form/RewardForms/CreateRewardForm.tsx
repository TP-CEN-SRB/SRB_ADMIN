"use client";
import React, { useTransition, useState, ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormHeader from "@/components/Form/FormHeader";
import CustomFormMessage from "@/components/Form/CustomFormMessage";
import Card from "@/components/Card/Card";
import { RewardSchema } from "@/schemas";
import { createReward } from "@/app/action/reward";

const CreateRewardForm = () => {
  const form = useForm<z.infer<typeof RewardSchema>>({
    resolver: zodResolver(RewardSchema),
    defaultValues: {
      name: "",
      pointsRequired: undefined,
      image: undefined,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const onSubmit = (values: z.infer<typeof RewardSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("pointsRequired", values.pointsRequired.toString());
      formData.append("image", values.image);
      const data = await createReward(formData);
      setError(data?.error as string);
      setSuccess(data?.success as string);
    });
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card rounded fullWidth>
      <FormHeader>Add a reward</FormHeader>
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
                    placeholder="Short Circuit Voucher"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pointsRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Points Required
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
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Image
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Select a image for the reward"
                    {...field}
                    type="file"
                    onChange={(event) => {
                      onChange(event.target.files && event.target.files[0]);
                      handleImageChange(event);
                    }}
                  />
                  {/* <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      // Do something with the response
                      console.log("Files: ", res);
                      alert("Upload Completed");
                    }}
                    onUploadError={(error: Error) => {
                      // Do something with the error.
                      alert(`ERROR! ${error.message}`);
                    }}
                  /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {imagePreview && (
            <div className="mt-4">
              <p>Image Preview:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-48 object-cover"
              />
            </div>
          )}

          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
      {/* <form action={createReward}>
        <button type="submit">Create something</button>
      </form> */}
    </Card>
  );
};

export default CreateRewardForm;
