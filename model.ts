// TypeTasks — Part 1: the typed model.

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

// Next id is one past the current max, so ids stay unique even after deletes.
function nextId(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export function addTask(tasks: Task[], title: string): Task[] {
  const task: Task = { id: nextId(tasks), title, status: "todo" };
  return [...tasks, task];
}

export function completeTask(tasks: Task[], id: number): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, status: "done" } : t));
}

export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

// --- My own operations -------------------------------------------------

// Exhaustive map: adding a new TaskStatus makes this a compile error until handled.
const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "done",
};

/** Moves a task one step along todo -> in-progress -> done. */
export function advanceTask(tasks: Task[], id: number): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, status: NEXT_STATUS[t.status] } : t
  );
}

export function deleteTask(tasks: Task[], id: number): Task[] {
  return tasks.filter((t) => t.id !== id);
}

export function countByStatus(tasks: Task[], status: TaskStatus): number {
  return filterByStatus(tasks, status).length;
}

// --- Type-safety proofs (each line below must FAIL to compile) ----------
// Uncomment one at a time to see the error, then re-comment.
//
// const a: Task = { id: 1, title: "x" };                 // Property 'status' is missing
// const b: Task = { id: "3", title: "x", status: "todo" }; // 'string' is not assignable to 'number'
// filterByStatus([], "finished");                        // '"finished"' not assignable to 'TaskStatus'
