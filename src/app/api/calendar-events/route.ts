// src/app/api/calendar-events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calendar, authenticate } from "@/app/_lib/googleCalendar";
import { calendar_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { parseISO } from "date-fns";

interface GoogleApiError {
  error: {
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
    code: number;
    message: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate().getClient();
    const calendarId = "rubenaguirrelizcano@gmail.com"; // Replace with your calendar ID

    const response: GaxiosResponse<calendar_v3.Schema$Events> =
      await calendar.events.list({
        auth: auth as any,
        calendarId,
        timeMin: new Date().toISOString(), // Fetch events from now onwards
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });

    const events = response.data.items || [];
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    const err = error as GoogleApiError;
    return NextResponse.json(
      { error: err.error.message },
      { status: err.error.code || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { summary, start, end } = await req.json();
    const auth = await authenticate().getClient();
    const calendarId = "rubenaguirrelizcano@gmail.com";

    const startDate = parseISO(start);
    const endDate = parseISO(end);

    const startUTC = startDate.toISOString();
    const endUTC = endDate.toISOString();

    console.log("Creating event with start:", startUTC, "and end:", endUTC);

    const response: GaxiosResponse<calendar_v3.Schema$Event> =
      await calendar.events.insert({
        auth: auth as any,
        calendarId,
        requestBody: {
          summary,
          start: { dateTime: startUTC, timeZone: "UTC" }, // Store in UTC
          end: { dateTime: endUTC, timeZone: "UTC" }, // Store in UTC
        },
      });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error creating event:", error);
    const err = error as GoogleApiError;
    return NextResponse.json(
      { error: err.error.message },
      { status: err.error.code || 500 }
    );
  }
}
