// TypeTasks — Part 2: a thin typed UI over the Part 1 model.

import {
  addTask,
  advanceTask,
  countByStatus,
  deleteTask,
  filterByStatus,
  type Task,
  type TaskStatus,
} from "./model.js";

type Filter = "all" | TaskStatus;

const STATUSES: readonly TaskStatus[] = ["todo", "in-progress", "done"];
const FILTERS: readonly Filter[] = ["all", ...STATUSES];
const STORAGE_KEY = "tickmark.tasks";

const LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

const ADVANCE_LABEL: Record<TaskStatus, string> = {
  todo: "Start",
  "in-progress": "Complete",
  done: "Done",
};

const titleInput = document.getElementById("title") as HTMLInputElement;
const form = document.getElementById("add-form") as HTMLFormElement;
const list = document.getElementById("task-list") as HTMLUListElement;
const emptyNote = document.getElementById("empty") as HTMLParagraphElement;
const filterBar = document.getElementById("filters") as HTMLElement;

function isStatus(value: unknown): value is TaskStatus {
  return STATUSES.some((s) => s === value);
}

function isFilter(value: unknown): value is Filter {
  return FILTERS.some((f) => f === value);
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v["id"] === "number" && typeof v["title"] === "string" && isStatus(v["status"]);
}

function load(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

function save(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage can be unavailable (private mode); the app still works in memory.
  }
}

let tasks: Task[] = load();
let filter: Filter = "all";

function visibleTasks(): Task[] {
  return filter === "all" ? tasks : filterByStatus(tasks, filter);
}

function button(className: string, text: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}

function renderRow(task: Task): HTMLLIElement {
  const li = document.createElement("li");
  li.className = `row ${task.status}`;

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title;

  const actions = document.createElement("div");
  actions.className = "actions";
  if (task.status !== "done") {
    actions.append(
      button("act", ADVANCE_LABEL[task.status], () => {
        tasks = advanceTask(tasks, task.id);
        commit();
      }),
    );
  }
  actions.append(
    button("act del", "Delete", () => {
      tasks = deleteTask(tasks, task.id);
      commit();
    }),
  );

  const meta = document.createElement("div");
  meta.className = "meta";
  const badge = document.createElement("span");
  badge.className = `badge ${task.status}`;
  badge.textContent = LABEL[task.status];
  const id = document.createElement("span");
  id.className = "id";
  id.textContent = `No. ${String(task.id).padStart(3, "0")}`;
  meta.append(badge, id);

  li.append(title, actions, meta);
  return li;
}

function render(): void {
  list.replaceChildren(...visibleTasks().map(renderRow));

  for (const chip of filterBar.querySelectorAll<HTMLButtonElement>(".chip")) {
    const value = chip.dataset["filter"];
    if (!isFilter(value)) continue;
    chip.setAttribute("aria-pressed", String(value === filter));
    const count = chip.querySelector("b");
    if (count) count.textContent = String(value === "all" ? tasks.length : countByStatus(tasks, value));
  }

  const none = list.children.length === 0;
  emptyNote.hidden = !none;
  if (none) {
    emptyNote.textContent =
      tasks.length === 0 ? "The ledger is empty. Add your first entry above." : "No entries with this status.";
  }
}

function commit(): void {
  save(tasks);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === "") return;
  tasks = addTask(tasks, title);
  titleInput.value = "";
  titleInput.focus();
  commit();
});

filterBar.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const value = target.closest<HTMLButtonElement>(".chip")?.dataset["filter"];
  if (!isFilter(value)) return;
  filter = value;
  render();
});

render();
