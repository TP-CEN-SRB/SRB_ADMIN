import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const RewardsGrid = () => {
  return (
    <div className="px-4 md:px-6 lg:px-8 flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-16">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Voucher</CardTitle>
            <CardDescription>50 points</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-4">
            <div className="h-[200px] flex items-center justify-center">
              {/* <Image
                fill
                src="/qr_code.png"
                className="w-3/4 object-cover"
                alt="Voucher Icon"
              /> */}
            </div>
          </CardContent>
          <CardFooter className="flex justify-start">
            <Button variant="secondary">
              <span className="mx-2">Edit</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2 */}
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Reward 1</CardTitle>
            <CardDescription>50 points</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-gray-500">Reward details here</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Reward 2</CardTitle>
            <CardDescription>100 points</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-gray-500">Reward details here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RewardsGrid;
