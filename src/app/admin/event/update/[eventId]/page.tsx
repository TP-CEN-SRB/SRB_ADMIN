import { getEventById } from "@/app/action/event";
import NotFoundPage from "@/app/not-found";
import UpdateEventForm from "@/components/FormLogic/EventForms/UpdateEventForm";
import { notFound } from "next/navigation";
import React from "react";

const UpdateEventPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const { eventId } = await params; 
  const event = await getEventById(eventId);

  if (!event) {
    notFound(); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateEventForm initialData={{ ...event, id: eventId }} />
    </div>
  );
};

export default UpdateEventPage;
