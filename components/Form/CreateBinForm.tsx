"use client";

import { createBin, BinFormState } from "@/app/action/bin";
import React, { useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

// Separate SubmitButton component
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      className="flex items-center justify-center rounded-lg h-12 border-2 border-green-400/75 outline-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
      type="submit"
      disabled={pending}
    >
      {pending ? "Creating Bin..." : "Add New Bin"}
    </button>
  );
};

const CreateBinForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: BinFormState = {
    message: "",
  };

  const [state, handleSubmit] = useFormState<BinFormState, FormData>(
    createBin,
    initialState
  );

  // Use useEffect to handle form reset after successful submission
  useEffect(() => {
    if (state.message === "Bin created successfully") {
      formRef.current?.reset();
    }
  }, [state.message]);

  return (
    <div className="md:w-1/2 sm:w-4/5 flex flex-col space-x-5 gap-y-5">
      <h1>Add new bin</h1>
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex flex-col text-xl font-medium gap-y-5"
      >
        <label htmlFor="location">Location:</label>
        <input
          className="rounded-lg h-12 p-3 border-2 border-green-400/75 outline-blue-500"
          type="text"
          id="location"
          name="location"
          placeholder="Location"
          required
        />

        <label htmlFor="status">Status:</label>
        <select
          className="rounded-lg h-12 p-3 border-2 border-green-400/75 outline-blue-500"
          id="status"
          name="status"
          required
        >
          <option value="FUNCTIONAL">FUNCTIONAL</option>
          <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
        </select>

        <label htmlFor="material">Material:</label>
        <select
          className="rounded-lg h-12 p-3 border-2 border-green-400/75 outline-blue-500"
          id="material"
          name="material"
          required
        >
          <option value="PLASTIC">PLASTIC</option>
          <option value="METAL">METAL</option>
        </select>

        <label htmlFor="currentCapacity">Current Capacity:</label>
        <input
          className="rounded-lg h-12 p-3 border-2 border-green-400/75 outline-blue-500"
          type="number"
          id="currentCapacity"
          name="currentCapacity"
          placeholder="Current Capacity"
          required
        />

        <SubmitButton />

        {state.message && (
          <p
            className={`text-center ${
              state.message === "Bin created successfully"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateBinForm;
