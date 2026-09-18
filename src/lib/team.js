/** localStorage list of team member names, for assigning jobs to someone. */

const KEY = "jfm-team-v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? JSON.parse(raw) : [];
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function write(members) {
  try {
    localStorage.setItem(KEY, JSON.stringify(members));
  } catch {
    /* quota or private mode */
  }
}

export function listTeam() {
  return read();
}

export function addTeamMember(name) {
  const trimmed = name.trim();
  if (!trimmed) return read();
  const members = read();
  if (members.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return members;
  const next = [...members, trimmed];
  write(next);
  return next;
}

export function removeTeamMember(name) {
  const next = read().filter((m) => m !== name);
  write(next);
  return next;
}
