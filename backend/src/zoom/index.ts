import dotenv from "dotenv";
import axios, { AxiosError } from "axios";
import jwt from "jsonwebtoken";

dotenv.config();

const apiKey = process.env.ZOOM_CLIENT_ID!;
const apiSecret = process.env.ZOOM_CLIENT_SECRET!;

const payload = {
  iss: apiKey,
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // expires in 5 minutes
};

const token = jwt.sign(payload, apiSecret);

interface MeetingDetails {
  topic: string;
  start_time: string;
  type: number;
  duration: number;
  timezone: string;
  agenda: string;
}

export async function getMeetings() {
  try {
    const response = await axios.get(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    let message: string;
    if (error instanceof AxiosError) {
      message = error.response?.data?.message;
    }

    if (error instanceof Error) {
      message = error.message;
    }
    console.error("Error fetching meetings:", message || error);
    throw error;
  }
}

export async function createMeeting(details: MeetingDetails) {
  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        ...details,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: "both",
          auto_recording: "none",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating meeting:",
      error?.response?.data || error.message
    );
    throw error;
  }
}
