export type AttendanceRow = Record<string, string>;

type AttendancePayload = {
  rows: AttendanceRow[];
  generatedDate: string;
};

const store = new Map<string, AttendancePayload>();

export function saveAttendance(
  userId: string,
  rows: AttendanceRow[],
  generatedDate: string
) {
  store.set(userId, { rows, generatedDate });
}

export function getAttendance(userId: string): AttendancePayload | undefined {
  return store.get(userId);
}

export function clearAttendance(userId: string) {
  store.delete(userId);
}
