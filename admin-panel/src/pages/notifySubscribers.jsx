import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { use } from "react";

const NotifySubscribers = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setError(null);

    try {
      // Fetch subscribers
      const response = await fetch("https://bharat-story-backend.vercel.app/api/subscribers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
console.log("API response status:", response);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", response.status, errorText);
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();
      console.log("API response:", data);
      const { emails } = data;
      console.log("Emails:", emails);

      if (!Array.isArray(emails) || emails.length === 0) {
        setError("No subscribers found or invalid response");
        setIsLoading(false);
        return;
      }

      // EmailJS configuration
      const serviceId =
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_78sy4cn";
      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_b3s2acs";
      const userId =
        import.meta.env.VITE_EMAILJS_USER_ID || "I3FrnElOF94OEwk9Z";

      // Send emails
      const emailPromises = emails.map(async (email) => {
        try {
          const result = await emailjs.send(
            serviceId,
            templateId,
            {
              email:email||"srcdesigns24@gmail.com",
              name: subject||"Test Subject",
              message: message||"Test Message",
            },
            userId
          );
          console.log(`Email sent to ${email}:`, result);
          return result;
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          throw emailError;
        }
      });

      await Promise.all(emailPromises);
      setStatus("Notifications sent successfully to all subscribers");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Error sending notifications:", err);
      setError(`Failed to send notifications: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const serviceId =
    import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_78sy4cn";
  const templateId =
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_b3s2acs";
  const userId = import.meta.env.VITE_EMAILJS_USER_ID || "I3FrnElOF94OEwk9Z";
  // testing the email sending process
  const testEmail = async () => {
    try {
      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          email: "test@example.com",
          name: "Test Subject",
          message: "Test Message",
        },
        userId
      );
      console.log("Test email result:", result);
      setStatus("Test email sent successfully");
    } catch (err) {
      console.error("Test email error:", err);
      setError(`Test email failed: ${err.message}`);
    }
  };
  // Call testEmail() in a useEffect or button click for testing

  useEffect(() => {
    // Call testEmail() here if needed for testing purposes
    // testEmail();
  }, []);


  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notify Subscribers</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md dark:bg-slate-700 dark:text-white"
            placeholder="Enter email subject"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md dark:bg-slate-700 dark:text-white"
            rows="5"
            placeholder="Enter your message"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`py-2 px-4 rounded-md text-white ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Sending..." : "Send Notifications"}
        </button>
      </form>
      {status && <p className="mt-4 text-green-600">{status}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default NotifySubscribers;
