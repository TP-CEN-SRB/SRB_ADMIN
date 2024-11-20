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
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, RewardSchema } from "@/schemas";
import { createReward } from "@/app/action/reward";
import CropRewardDialog from "@/components/Dialog/CropRewardDialog";
import DateRangePicker from "@/components/DatePicker/DateRangePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const CreateRewardForm = () => {
  const [radioSelection, setRadioSelection] = useState("option-one");
  const form = useForm<z.infer<typeof RewardSchema>>({
    resolver: zodResolver(
      radioSelection === "option-two"
        ? RewardSchema
        : RewardSchema.omit({ dates: true })
    ),
    defaultValues: {
      name: "",
      pointsRequired: undefined,
      image: undefined,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>();
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const onSubmit = (values: z.infer<typeof RewardSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("pointsRequired", values.pointsRequired.toString());
      formData.append("description", values.description);
      if (radioSelection === "option-two") {
        const dateData = JSON.stringify({
          from: values.dates.from.toISOString(),
          to: values.dates.to.toISOString(),
        });
        formData.append("dates", dateData);
      }
      if (!croppedFile) {
        setError("Please select an image");
        return;
      }
      formData.set("image", croppedFile);
      const data = await createReward(
        formData,
        radioSelection === "option-two"
      );
      setError(data?.error as string);
      setSuccess(data?.success as string);
      if (data?.success) {
        setCroppedFile(null);
        setImagePreview(null);
        form.reset({ name: "", pointsRequired: 0, description: "" });
      }
    });
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setDialogOpen(true);
  };
  const handleCropComplete = (file: File) => {
    setCroppedFile(file); // Update the state with the cropped file
    setDialogOpen(false);
  };

  const handleDialogClose = (error: string | undefined) => {
    if (error) {
      setError(error);
    }
    setDialogOpen(false);
    setCroppedFile(null);
    setImagePreview(null);
    form.resetField("image");
  };

  return (
    <Card isAdmin rounded fullWidth>
      <CropRewardDialog
        onCropComplete={handleCropComplete}
        isOpen={isDialogOpen}
        image={imagePreview as string}
        onDialogClose={handleDialogClose}
      />
      <FormHeader>Add a reward</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[250px]">
                  <FormLabel className="font-bold text-slate-700">
                    Name
                  </FormLabel>
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
                <FormItem className="flex-1 min-w-[250px]">
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
          </div>
          <div className="flex flex-wrap gap-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[250px]">
                  <FormLabel className="font-bold text-slate-700">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="A voucher to use in short circuit"
                      {...field}
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
                <FormItem className="flex-1 min-w-[250px]">
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormItem>
            <FormLabel className="font-bold text-slate-700">
              Reward Duration
            </FormLabel>
            <RadioGroup
              disabled={isPending}
              onValueChange={(e) => {
                setRadioSelection(e);
                form.reset({ dates: undefined });
              }}
              defaultValue="option-one"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Specify start and end dates</Label>
              </div>
            </RadioGroup>
          </FormItem>
          {radioSelection == "option-two" && (
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">
                    Dates
                  </FormLabel>
                  <FormControl>
                    <DateRangePicker
                      disabled={isPending}
                      className="w-full"
                      onDateChange={(dateRange) => {
                        if (dateRange?.from && dateRange?.to) {
                          field.onChange({
                            from: dateRange.from,
                            to: dateRange.to,
                          });
                        } else {
                          form.reset({ dates: undefined });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateRewardForm;
