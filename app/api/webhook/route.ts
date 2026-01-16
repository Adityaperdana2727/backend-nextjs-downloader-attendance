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
    let rows = body.rows;

    // 🔥 FIX UTAMA: handle Glide JSON string
    if (typeof rows === 'string') {
      try {
        rows = JSON.parse(rows);
      } catch {
        return new Response('Rows is not valid JSON', { status: 400 });
      }
    }

    if (!Array.isArray(rows)) {
      return new Response('Rows must be an array', { status: 400 });
    }

    // ✅ generatedDate dibuat di server
    const generatedDate = new Date().toISOString();

    saveAttendance(userId, rows, generatedDate);

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
