/**
 * localStorage database for jobs.
 *
 * Job schema:
 *   { id, clientId, clientName, address, date, time, package, shootType,
 *     droneRequired, notes, status, createdAt, updatedAt }
 *
 * Status pipeline (business-hub-photographer.md):
 *   Inquiry -> Booked -> Confirmed -> Shot -> Delivered -> Invoiced -> Paid
 *   Exception path: Cancelled
 */

const JOBS_KEY = "jfm-jobs-v1";

export const JOB_STATUSES = [
  "inquiry",
  "booked",
  "confirmed",
  "shot",
  "delivered",
  "invoiced",
  "paid",
  "cancelled",
];

export const JOB_STATUS_LABEL = {
  inquiry: "Inquiry",
  booked: "Booked",
  confirmed: "Confirmed",
  shot: "Shot",
  delivered: "Delivered",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

function read() {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(data) {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listJobs() {
  return read();
}

export function getJob(id) {
  return listJobs().find((j) => j.id === id) ?? null;
}

export function saveJob(job) {
  const jobs = listJobs();
  const now = new Date().toISOString();
  const existing = jobs.findIndex((j) => j.id === job.id);

  if (existing >= 0) {
    jobs[existing] = { ...jobs[existing], ...job, updatedAt: now };
  } else {
    jobs.unshift({ ...job, id: job.id ?? uid(), status: job.status || "inquiry", createdAt: now, updatedAt: now });
  }
  write(jobs);
  return jobs[existing >= 0 ? existing : 0];
}

export function updateJobStatus(id, status) {
  const jobs = listJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx < 0) return;
  jobs[idx] = { ...jobs[idx], status, updatedAt: new Date().toISOString() };
  write(jobs);
}

export function deleteJob(id) {
  write(listJobs().filter((j) => j.id !== id));
}
