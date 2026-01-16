// app/api/download/route.ts

import ExcelJS from 'exceljs';
import {
  getAttendance,
  clearAttendance,
  type AttendanceRow
} from '../../../lib/attendanceStore';

const NETLIFY_BASE = 'https://capable-pothos-695186.netlify.app/';

function makePreviewLink(url: string, rowId: string) {
  return (
    NETLIFY_BASE +
    '?u=' +
    encodeURIComponent(url) +
    '&row_id=' +
    encodeURIComponent(rowId)
  );
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return new Response('Missing userId', { status: 400 });

    const data = getAttendance(userId);
    if (!data) return new Response('No attendance data found', { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Employee ID', key: 'employee_id' },
      { header: 'Employee Name', key: 'employee_name' },
      { header: 'Company', key: 'company' },
      { header: 'Location', key: 'location' },
      { header: 'Date', key: 'date' },
      { header: 'Status', key: 'status' },

      { header: 'Selfie In', key: 'selfie_in' },
      { header: 'Check In', key: 'check_in' },
      { header: 'Location In', key: 'location_in' },
      { header: 'Latlong In', key: 'latlong_in' },
      { header: 'Radius In', key: 'radius_in' },
      { header: 'Remark In', key: 'remark_in' },

      { header: 'Selfie Out', key: 'selfie_out' },
      { header: 'Check Out', key: 'check_out' },
      { header: 'Location Out', key: 'location_out' },
      { header: 'Latlong Out', key: 'latlong_out' },
      { header: 'Radius Out', key: 'radius_out' },
      { header: 'Remark Out', key: 'remark_out' },

      { header: 'Working Hours', key: 'working_hours' }
    ];

    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    data.rows.forEach((r: AttendanceRow) => {
      const selfieIn = asString(r['selfie_in']);
      const selfieOut = asString(r['selfie_out']);
      const rowId = asString(r['row_id']);

      // isi row normal (tampilan cell selfie diganti jadi label link)
      const row = sheet.addRow({
        ...r,
        selfie_in: selfieIn ? 'Link Selfie In' : '',
        selfie_out: selfieOut ? 'Link Selfie Out' : ''
      });

      if (selfieIn && rowId) {
        row.getCell('selfie_in').value = {
          text: 'Link Selfie In',
          hyperlink: makePreviewLink(selfieIn, rowId)
        };
      }

      if (selfieOut && rowId) {
        row.getCell('selfie_out').value = {
          text: 'Link Selfie Out',
          hyperlink: makePreviewLink(selfieOut, rowId)
        };
      }
    });

    // AUTO WIDTH - FIX "possibly undefined"
    for (const col of sheet.columns) {
      const header = col.header ? String(col.header) : '';
      let max = header.length;

      // col.eachCell bisa dianggap optional oleh TS, jadi kita cek dulu
      if (typeof col.eachCell === 'function') {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const value = cell.value;
          const len = value ? String(value).length : 0;
          if (len > max) max = len;
        });
      }

      col.width = Math.min(40, Math.max(8, max + 2));
    }

    const buffer = await workbook.xlsx.writeBuffer();

    clearAttendance(userId);

    return new Response(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="AttendanceReport.xlsx"'
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download error', { status: 500 });
  }
}
