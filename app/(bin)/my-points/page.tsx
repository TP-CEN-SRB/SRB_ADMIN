"use client";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import AdminNumberForm from "@/components/Form/BinUserForms/AdminNumberForm";
import { FaStar } from "react-icons/fa";

import React from "react";
import ButtonRedirect from "@/components/Button/ButtonRedirect";

const MyPointsPage = () => {
  return (
    <Card rounded>
      <div className="mb-6 flex flex-col items-center">
        <FaStar size={100} className="text-amber-500" />
        <CardHeader>Check my points</CardHeader>
        <p className="text-slate-600 mt-2">
          Enter your admin number to check your points
        </p>
      </div>
      <AdminNumberForm />
      <ButtonRedirect rounded href="/" variant="outline" color="amber">
        Back
      </ButtonRedirect>
    </Card>
  );
};

export default MyPointsPage;
