"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface FeedbackFormProps {
  isDarkMode: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!message.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("feedbacks").insert([{ name, email, message }]);
    setLoading(false);

    if (error) {
      console.error("Feedback submission error:", error);
      alert("There was an error submitting your feedback. Please try again.");
    } else {
      alert("Thanks for your feedback!");
      e.currentTarget.reset();
    }
  };

  return (
    // <div className={`mt-12 rounded-xl p-6 shadow-md ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}`}>
    <div
  className={`mt-12 rounded-xl p-6 shadow-md max-w-xl w-full mx-auto text-center ${
    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
  }`}
>

      <h2 className="text-2xl font-bold mb-4">We'd love your feedback!</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          className={`px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email (optional)"
          className={`px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
        />
        <textarea
          name="message"
          placeholder="Your Feedback"
          required
          rows={4}
          className={`px-4 py-2 rounded-lg border resize-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
        ></textarea>
        <button
  type="submit"
  disabled={loading}
  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-fit disabled:opacity-50 mx-auto"
>

          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
