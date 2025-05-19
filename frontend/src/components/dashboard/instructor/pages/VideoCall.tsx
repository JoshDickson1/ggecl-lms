import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Define the schema using Zod
const meetingDetailsSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  start_time: z.string().min(1, "Start time is required"),
  type: z.number().min(1, "Type is required"),
  duration: z.number().min(1, "Duration is required"),
  gurl: z.string().min(1, "Google meet url is required"),
  agenda: z.string().optional(),
});

type MeetingDetails = z.infer<typeof meetingDetailsSchema>;

const VideoCall: React.FC = () => {
  const form = useForm<MeetingDetails>({
    resolver: zodResolver(meetingDetailsSchema),
    defaultValues: {
      topic: "",
      start_time: "",
      type: 1,
      duration: 30,
      gurl: "",
      agenda: "",
    },
  });

  const onSubmit = (data: MeetingDetails) => {
    console.log("Form Data:", data);
    // Add your API call or logic to handle form submission here
  };

  return (
    <div className="p-2 mt-5 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-10">Create a Video Call</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            name="topic"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input placeholder="Enter topic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="start_time"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="duration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter duration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="gurl"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google meet link</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Google meet link" type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="agenda"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agenda</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter agenda (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Schedule Video Call
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VideoCall;