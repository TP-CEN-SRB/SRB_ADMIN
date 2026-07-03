"use client";
import React, { useTransition, useState, ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { date, z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormHeader from "@/components/FormLogic/FormHeader";
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage";
import Card from "@/components/Card/Card";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, RewardSchema } from "@/schemas";
import { updateReward } from "@/app/action/reward";
import CropRewardDialog from "@/components/Dialog/CropRewardDialog";
import DateRangePicker from "@/components/DatePicker/DateRangePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reward } from "@/generated/prisma";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch";
interface RewardProps {
  reward: Reward;
}
const EditRewardForm = ({ reward }: RewardProps) => {
  const form = useForm<z.infer<typeof RewardSchema>>({
    resolver: zodResolver(RewardSchema),
    defaultValues: {
      name: reward.name,
      pointsRequired: reward.pointsRequired,
      description: reward.description,
      isCustomDateRange: reward.startDate !== null && reward.endDate !== null,
      isExistingImage: true,
      isAvailable: reward.isAvailable,
      dates: {
        from: reward.startDate ?? undefined,
        to: reward.endDate ?? undefined,
      },
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>();
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const isExistingImage = useWatch({
    control: form.control,
    name: "isExistingImage",
  });
  const isCustomDateRange = useWatch({
    control: form.control,
    name: "isCustomDateRange",
    defaultValue: reward.startDate !== null && reward.endDate !== null,
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const onSubmit = (values: z.infer<typeof RewardSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("pointsRequired", values.pointsRequired.toString());
      formData.append("description", values.description);
      formData.append("isAvailable", values.isAvailable.toString());
      formData.append("isExistingImage", values.isExistingImage.toString());
      formData.append("isCustomDateRange", values.isCustomDateRange.toString());
      if (values.isCustomDateRange) {
        const dateData = JSON.stringify({
          from: values.dates.from.toISOString(),
          to: values.dates.to.toISOString(),
        });
        formData.append("dates", dateData);
      }
      if (!croppedFile && !values.isExistingImage) {
        setError("Please select an image");
        return;
      }
      if (croppedFile && !values.isExistingImage) {
        formData.set("image", croppedFile);
      }
      const data = await updateReward(reward.id, formData);
      setError(data?.error as string);
      if (!data?.error && data?.success !== undefined) {
        router.push("/admin/reward");
        toast.success("success!",{
          description: `${data.success}`,
        });
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
      <FormHeader>Update reward</FormHeader>
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
                    <Textarea
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
                      disabled={isPending || isExistingImage}
                      placeholder="Select a image for the reward"
                      {...field}
                      type="file"
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]);
                        handleImageChange(event);
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.watch("isExistingImage")}
                      onCheckedChange={(value) =>
                        form.setValue("isExistingImage", value as boolean)
                      }
                      id="existingImage"
                    />
                    <label htmlFor="existingImage" className="text-sm">
                      Use existing image
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Availability
                </FormLabel>
                <div className="flex flex-row gap-3 items-center justify-between rounded-lg border border-gray-300 p-4 w-full">
                  <FormDescription>
                    Enable the reward to be used within the reward duration
                  </FormDescription>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel className="font-bold text-slate-700">
              Reward Duration
            </FormLabel>
            <RadioGroup
              disabled={isPending}
              onValueChange={(e) => {
                form.setValue("isCustomDateRange", e === "true");
                form.resetField("dates");
              }}
              defaultValue={isCustomDateRange.toString() ?? "false"}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="option-one" />
                <Label htmlFor="option-one">Unlimited</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="option-two" />
                <Label htmlFor="option-two">Specify start and end dates</Label>
              </div>
            </RadioGroup>
          </FormItem>
          {isCustomDateRange === true && (
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
                      initialDate={{
                        from: reward.startDate ?? undefined,
                        to: reward.endDate ?? undefined,
                      }}
                      onDateChange={(dateRange) => {
                        if (dateRange?.from && dateRange?.to) {
                          field.onChange({
                            from: dateRange.from,
                            to: dateRange.to,
                          });
                        } else {
                          form.resetField("dates");
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

export default EditRewardForm;
