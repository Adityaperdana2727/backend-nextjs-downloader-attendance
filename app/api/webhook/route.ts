import { saveAttendance } from "@/lib/attendanceStore";

export async function GET() {
  return new Response("Webhook endpoint is alive", { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    const body = await req.json();
    const rows = body.rows;
    const generatedDate = body.generatedDate;

    if (!Array.isArray(rows)) {
      return new Response("Invalid rows payload", { status: 400 });
    }

    if (!generatedDate) {
      return new Response("Missing generatedDate", { status: 400 });
    }

    saveAttendance(userId, rows, generatedDate);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
