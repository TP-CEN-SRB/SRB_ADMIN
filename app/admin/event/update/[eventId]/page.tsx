import { getEventById } from "@/app/action/event";
import NotFoundPage from "@/app/not-found";
import UpdateEventForm from "@/components/Form/EventForms/UpdateEventForm";
import { notFound } from "next/navigation";
import React from "react";

const UpdateEventPage = async ({
  params,
}: {
  params: { eventId: string };
}) => {
  const event = await getEventById(params.eventId);

  if (!event) {
    notFound(); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateEventForm initialData={{ ...event, id: params.eventId }} />
    </div>
  );
};

export default UpdateEventPage;
