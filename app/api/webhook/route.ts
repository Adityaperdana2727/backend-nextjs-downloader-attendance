import { saveAttendance } from '@/lib/attendanceStore';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    const body = await req.json();
    const { rows, generatedDate } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response('Invalid rows', { status: 400 });
    }

    saveAttendance(userId, rows, generatedDate || '');

    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Webhook error', { status: 500 });
  }
}
