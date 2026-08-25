const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const characterCount = document.getElementById("characterCount");

const totalTasksElement = document.getElementById("totalTasks");

const lists = {
  todo: document.getElementById("todoList"),
  progress: document.getElementById("progressList"),
  done: document.getElementById("doneList"),
};

const counts = {
  todo: document.getElementById("todoCount"),
  progress: document.getElementById("progressCount"),
  done: document.getElementById("doneCount"),
};

// ======================================
// STORAGE
// ======================================

const STORAGE_KEY = "kanbanTasks";

let tasks = loadTasks();

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    return JSON.parse(savedTasks);
  } catch (error) {
    console.error("Could not load tasks:", error);

    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ======================================
// CREATE TASK
// ======================================

function createTask(text) {
  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),

    text: text,

    status: "todo",
  };

  tasks.push(task);

  saveTasks();

  renderTasks();
}

// ======================================
// DELETE TASK
// ======================================

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  renderTasks();
}

// ======================================
// MOVE TASK
// ======================================

function moveTask(taskId, newStatus) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return;
  }

  task.status = newStatus;

  saveTasks();

  renderTasks();
}

// ======================================
// CREATE TASK ELEMENT
// ======================================

function createTaskElement(task) {
  const taskElement = document.createElement("article");

  taskElement.className = "task";

  taskElement.dataset.id = task.id;
  taskElement.dataset.status = task.status;

  taskElement.draggable = true;

  // Status indicator

  const indicator = document.createElement("div");

  indicator.className = "task-indicator";

  // Task text

  const text = document.createElement("p");

  text.className = "task-text";

  text.textContent = task.text;

  // Delete button

  const deleteButton = document.createElement("button");

  deleteButton.className = "delete-task";

  deleteButton.type = "button";

  deleteButton.title = "Delete task";

  deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

  deleteButton.innerHTML = "&times;";

  deleteButton.addEventListener("click", function (event) {
    event.stopPropagation();

    deleteTask(task.id);
  });

  // Drag start

  taskElement.addEventListener("dragstart", function (event) {
    taskElement.classList.add("dragging");

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", task.id);
  });

  // Drag end

  taskElement.addEventListener("dragend", function () {
    taskElement.classList.remove("dragging");

    document.querySelectorAll(".column").forEach((column) => {
      column.classList.remove("drag-over");
    });
  });

  taskElement.appendChild(indicator);
  taskElement.appendChild(text);
  taskElement.appendChild(deleteButton);

  return taskElement;
}

// ======================================
// RENDER TASKS
// ======================================

function renderTasks() {
  // Clear existing tasks

  Object.values(lists).forEach((list) => {
    list.innerHTML = "";
  });

  // Add tasks to their respective columns

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    const list = lists[task.status];

    if (list) {
      list.appendChild(taskElement);
    }
  });

  // Update counts

  counts.todo.textContent = tasks.filter(
    (task) => task.status === "todo",
  ).length;

  counts.progress.textContent = tasks.filter(
    (task) => task.status === "progress",
  ).length;

  counts.done.textContent = tasks.filter(
    (task) => task.status === "done",
  ).length;

  totalTasksElement.textContent = tasks.length;

  // Add empty states

  Object.entries(lists).forEach(([status, list]) => {
    const hasTasks = tasks.some((task) => task.status === status);

    if (!hasTasks) {
      const emptyState = document.createElement("div");

      emptyState.className = "empty-state";

      const message = document.createElement("span");

      if (status === "todo") {
        message.textContent = "No tasks yet";
      }

      if (status === "progress") {
        message.textContent = "Drag a task here";
      }

      if (status === "done") {
        message.textContent = "Completed tasks appear here";
      }

      emptyState.appendChild(message);

      list.appendChild(emptyState);
    }
  });
}

// ======================================
// FORM SUBMISSION
// ======================================

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  // Don't allow empty tasks

  if (!text) {
    taskInput.focus();

    return;
  }

  createTask(text);

  taskInput.value = "";

  updateCharacterCount();

  taskInput.focus();
});

// ======================================
// CHARACTER COUNT
// ======================================

function updateCharacterCount() {
  characterCount.textContent = `${taskInput.value.length}/100`;
}

taskInput.addEventListener("input", updateCharacterCount);

// ======================================
// DRAG & DROP
// ======================================

document.querySelectorAll(".column").forEach((column) => {
  const list = column.querySelector(".task-list");

  // Drag enters column

  column.addEventListener("dragenter", function (event) {
    event.preventDefault();

    column.classList.add("drag-over");
  });

  // Drag over column

  column.addEventListener("dragover", function (event) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    column.classList.add("drag-over");
  });

  // Drag leaves column

  column.addEventListener("dragleave", function (event) {
    if (!column.contains(event.relatedTarget)) {
      column.classList.remove("drag-over");
    }
  });

  // Drop

  column.addEventListener("drop", function (event) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");

    const newStatus = column.dataset.status;

    moveTask(taskId, newStatus);

    column.classList.remove("drag-over");
  });
});

// ======================================
// INITIAL RENDER
// ======================================

renderTasks();

updateCharacterCount();
