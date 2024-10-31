"use client";
import Card from "@/components/Card/Card";
import CardButton from "@/components/Card/CardButton";
import CardHeader from "@/components/Card/CardHeader";
import AdminNumberForm from "@/components/Form/AdminNumberForm";

import React from "react";

const MyPointsPage = () => {
  return (
    <Card>
      <div className="mb-6">
        <CardHeader>Enter your admin number</CardHeader>
      </div>
      <AdminNumberForm />
      <CardButton href="/" color="blue">
        Back
      </CardButton>
    </Card>
  );
};

export default MyPointsPage;
