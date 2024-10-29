import { logout } from "@/app/action/user";
import React from "react";
import { Button } from "../ui/button";
import Card from "@/components/Card/Card";
import CardBody from "@/components/Card/CardBody";

const SignOutForm = () => {
  return (
    <Card>
      <h1 className="text-gray-800 text-center">Are you sure?</h1>
      <CardBody>
        <p className="text-gray-500 text-center mt-4">
          You&apos;re about to sign out from your account. <br />
          Any unsaved changes will be{" "}
          <span className="font-bold text-black">lost</span>.
        </p>
        <div className="flex justify-center mt-8">
          <form action={logout}>
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white text-lg font-semibold py-6 px-6 min-w-56 rounded-full transition-all"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </CardBody>
    </Card>
  );
};

export default SignOutForm;
