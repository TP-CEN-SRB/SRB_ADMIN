import SignUpForm from "@/components/Form/AuthForms/SignUpForm";
import Image from "next/image";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="flex w-full overflow-hidden min-h-screen">
      <div className="relative flex-1 border-gray-200 border-r-2">
        <Image
          className="object-cover"
          src="/recycling.png"
          alt="Recycling bins"
          fill
        />
      </div>
      <div className="w-full md:max-w-full md:flex-1 bg-[var(--pale-mint)] flex justify-center">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
