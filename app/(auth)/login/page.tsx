import Image from "next/image";
import LoginForm from "@/components/Form/AuthForms/LoginForm";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex w-full overflow-hidden min-h-screen">
      <div className="w-full md:max-w-full md:flex-1 bg-[var(--pale-mint)] flex justify-center">
        <LoginForm />
      </div>
      <div className="relative md:flex-1 border-gray-200 border-l-2">
        <Image
          className="object-cover"
          src="/recycling.png"
          alt="Recycling bins"
          fill
        />
      </div>
    </div>
  );
};

export default LoginPage;
