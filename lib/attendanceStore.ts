// lib/attendanceStore.ts

export type AttendanceRow = Record<string, unknown>;

export type AttendancePayload = {
  rows: AttendanceRow[];
  generatedDate: string;
  createdAt: number;
};

const attendanceStore = new Map<string, AttendancePayload>();

export function saveAttendance(
  userId: string,
  rows: AttendanceRow[],
  generatedDate: string
) {
  attendanceStore.set(userId, {
    rows,
    generatedDate,
    createdAt: Date.now()
  });
}

export function getAttendance(userId: string): AttendancePayload | undefined {
  return attendanceStore.get(userId);
}

export function clearAttendance(userId: string): void {
  attendanceStore.delete(userId);
}
