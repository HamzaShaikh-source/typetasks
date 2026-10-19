// TypeTasks — Part 1: the typed model.
// Next id is one past the current max, so ids stay unique even after deletes.
function nextId(tasks) {
    return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}
export function addTask(tasks, title) {
    const task = { id: nextId(tasks), title, status: "todo" };
    return [...tasks, task];
}
export function completeTask(tasks, id) {
    return tasks.map((t) => (t.id === id ? { ...t, status: "done" } : t));
}
export function filterByStatus(tasks, status) {
    return tasks.filter((t) => t.status === status);
}
// --- My own operations -------------------------------------------------
// Exhaustive map: adding a new TaskStatus makes this a compile error until handled.
const NEXT_STATUS = {
    todo: "in-progress",
    "in-progress": "done",
    done: "done",
};
/** Moves a task one step along todo -> in-progress -> done. */
export function advanceTask(tasks, id) {
    return tasks.map((t) => t.id === id ? { ...t, status: NEXT_STATUS[t.status] } : t);
}
export function deleteTask(tasks, id) {
    return tasks.filter((t) => t.id !== id);
}
export function countByStatus(tasks, status) {
    return filterByStatus(tasks, status).length;
}
// --- Type-safety proofs (each line below must FAIL to compile) ----------
// Uncomment one at a time to see the error, then re-comment.
//
// const a: Task = { id: 1, title: "x" };                 // Property 'status' is missing
// const b: Task = { id: "3", title: "x", status: "todo" }; // 'string' is not assignable to 'number'
// filterByStatus([], "finished");                        // '"finished"' not assignable to 'TaskStatus'
//# sourceMappingURL=model.js.map