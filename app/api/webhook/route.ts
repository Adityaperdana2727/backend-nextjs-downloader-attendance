import { saveAttendance } from '@/lib/attendanceStore';

export async function GET() {
  return new Response('Webhook endpoint is alive', { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    const body = await req.json();
    const rows = body.rows;
    // VALIDASI ROWS
    if (!Array.isArray(rows)) {
      return new Response('Invalid rows payload', { status: 400 });
    }

    // ✅ GENERATED DATE DIBUAT DI SERVER (ISO, PASTI VALID)
    const generatedDate = new Date().toISOString();

    saveAttendance(userId, rows, generatedDate);

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
