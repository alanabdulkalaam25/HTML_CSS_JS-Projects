/* =========================================
   ELEMENTS
========================================= */

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const characterCount = document.getElementById("characterCount");

const totalTasksElement = document.getElementById("totalTasks");

const themeToggle = document.getElementById("themeToggle");

const themeIcon = document.getElementById("themeIcon");

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

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY = "kanbanTasks";

const THEME_KEY = "kanbanTheme";

let tasks = loadTasks();

let draggedTaskId = null;

let dropTarget = null;

/* =========================================
   LOAD TASKS
========================================= */

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    const parsed = JSON.parse(savedTasks);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((task) => {
      return (
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        ["todo", "progress", "done"].includes(task.status)
      );
    });
  } catch (error) {
    console.error("Could not load tasks:", error);

    return [];
  }
}

/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================================
   CREATE TASK
========================================= */

function createTask(text) {
  const task = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,

    text: text,

    status: "todo",
  };

  tasks.push(task);

  saveTasks();

  renderTasks();
}

/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  renderTasks();
}

/* =========================================
   FIND LAST TASK INDEX
========================================= */

function findLastTaskIndex(status) {
  let lastIndex = -1;

  tasks.forEach((task, index) => {
    if (task.status === status) {
      lastIndex = index;
    }
  });

  return lastIndex;
}

/* =========================================
   MOVE / REORDER TASK
========================================= */

function moveTask(taskId, newStatus, beforeTaskId = null) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return;
  }

  const [task] = tasks.splice(taskIndex, 1);

  task.status = newStatus;

  /*
        Insert before the selected task.
    */

  if (beforeTaskId) {
    const targetIndex = tasks.findIndex((task) => task.id === beforeTaskId);

    if (targetIndex !== -1) {
      tasks.splice(targetIndex, 0, task);
    } else {
      tasks.push(task);
    }
  } else {
    /*
            No task underneath the cursor,
            therefore place it at the bottom
            of the selected column.
        */

    const lastIndex = findLastTaskIndex(newStatus);

    tasks.splice(lastIndex + 1, 0, task);
  }

  saveTasks();

  renderTasks();
}

/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {
  const taskElement = document.createElement("article");

  taskElement.className = "task";

  taskElement.dataset.id = task.id;

  taskElement.dataset.status = task.status;

  taskElement.draggable = true;

  /* Status indicator */

  const indicator = document.createElement("div");

  indicator.className = "task-indicator";

  /* Text */

  const text = document.createElement("p");

  text.className = "task-text";

  text.textContent = task.text;

  /* Delete button */

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";

  deleteButton.className = "delete-task";

  deleteButton.title = "Delete task";

  deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

  deleteButton.innerHTML = "&times;";

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();

    deleteTask(task.id);
  });

  /* =====================================
       DRAG START
    ===================================== */

  taskElement.addEventListener("dragstart", (event) => {
    draggedTaskId = task.id;

    taskElement.classList.add("dragging");

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", task.id);
  });

  /* =====================================
       DRAG END
    ===================================== */

  taskElement.addEventListener("dragend", () => {
    taskElement.classList.remove("dragging");

    draggedTaskId = null;

    clearDropIndicator();

    document.querySelectorAll(".column").forEach((column) => {
      column.classList.remove("drag-over");
    });
  });

  taskElement.appendChild(indicator);

  taskElement.appendChild(text);

  taskElement.appendChild(deleteButton);

  return taskElement;
}

/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {
  Object.values(lists).forEach((list) => {
    list.innerHTML = "";
  });

  /*
        The order of `tasks` is also the
        visual order of the board.
    */

  tasks.forEach((task) => {
    const list = lists[task.status];

    if (!list) {
      return;
    }

    list.appendChild(createTaskElement(task));
  });

  updateCounts();

  createEmptyStates();
}

/* =========================================
   UPDATE COUNTS
========================================= */

function updateCounts() {
  const todoCount = tasks.filter((task) => task.status === "todo").length;

  const progressCount = tasks.filter(
    (task) => task.status === "progress",
  ).length;

  const doneCount = tasks.filter((task) => task.status === "done").length;

  counts.todo.textContent = todoCount;

  counts.progress.textContent = progressCount;

  counts.done.textContent = doneCount;

  totalTasksElement.textContent = tasks.length;
}

/* =========================================
   EMPTY STATES
========================================= */

function createEmptyStates() {
  Object.entries(lists).forEach(([status, list]) => {
    const hasTasks = tasks.some((task) => task.status === status);

    if (hasTasks) {
      return;
    }

    const emptyState = document.createElement("div");

    emptyState.className = "empty-state";

    const message = document.createElement("span");

    if (status === "todo") {
      message.textContent = "No tasks yet";
    } else if (status === "progress") {
      message.textContent = "Drag a task here";
    } else {
      message.textContent = "Completed tasks appear here";
    }

    emptyState.appendChild(message);

    list.appendChild(emptyState);
  });
}

/* =========================================
   FIND DROP TARGET
========================================= */

function getDropTarget(list, mouseY) {
  const taskElements = [...list.querySelectorAll(".task:not(.dragging)")];

  let closestTask = null;

  let closestOffset = Number.NEGATIVE_INFINITY;

  taskElements.forEach((taskElement) => {
    const box = taskElement.getBoundingClientRect();

    const offset = mouseY - (box.top + box.height / 2);

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;

      closestTask = taskElement;
    }
  });

  return closestTask;
}

/* =========================================
   SHOW DROP INDICATOR
========================================= */

function showDropIndicator(list, target) {
  clearDropIndicator();

  const indicator = document.createElement("div");

  indicator.className = "drop-indicator";

  if (target) {
    list.insertBefore(indicator, target);
  } else {
    list.appendChild(indicator);
  }

  dropTarget = {
    list: list,

    target: target,

    indicator: indicator,
  };
}

/* =========================================
   CLEAR DROP INDICATOR
========================================= */

function clearDropIndicator() {
  if (dropTarget && dropTarget.indicator) {
    dropTarget.indicator.remove();
  }

  dropTarget = null;
}

/* =========================================
   DRAG & DROP
========================================= */

document.querySelectorAll(".column").forEach((column) => {
  const list = column.querySelector(".task-list");

  /* Drag enter */

  column.addEventListener("dragenter", (event) => {
    event.preventDefault();

    column.classList.add("drag-over");
  });

  /* Drag over */

  column.addEventListener("dragover", (event) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    column.classList.add("drag-over");

    const target = getDropTarget(list, event.clientY);

    showDropIndicator(list, target);
  });

  /* Drag leave */

  column.addEventListener("dragleave", (event) => {
    if (!column.contains(event.relatedTarget)) {
      column.classList.remove("drag-over");

      clearDropIndicator();
    }
  });

  /* Drop */

  column.addEventListener("drop", (event) => {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");

    if (!taskId) {
      return;
    }

    const newStatus = column.dataset.status;

    let beforeTaskId = null;

    if (dropTarget && dropTarget.target) {
      beforeTaskId = dropTarget.target.dataset.id;
    }

    moveTask(taskId, newStatus, beforeTaskId);

    clearDropIndicator();

    column.classList.remove("drag-over");
  });
});

/* =========================================
   FORM SUBMISSION
========================================= */

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();

    return;
  }

  createTask(text);

  taskInput.value = "";

  updateCharacterCount();

  taskInput.focus();
});

/* =========================================
   CHARACTER COUNT
========================================= */

function updateCharacterCount() {
  characterCount.textContent = `${taskInput.value.length}/100`;
}

taskInput.addEventListener("input", updateCharacterCount);

/* =========================================
   THEME
========================================= */

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-theme", isDark);

  if (isDark) {
    themeIcon.textContent = "☀";

    themeToggle.setAttribute("aria-label", "Switch to light theme");

    themeToggle.title = "Switch to light theme";
  } else {
    themeIcon.textContent = "☾";

    themeToggle.setAttribute("aria-label", "Switch to dark theme");

    themeToggle.title = "Switch to dark theme";
  }

  localStorage.setItem(THEME_KEY, theme);
}

/* =========================================
   LOAD THEME
========================================= */

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);

    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(prefersDark ? "dark" : "light");
}

/* =========================================
   THEME TOGGLE
========================================= */

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-theme");

  applyTheme(isDark ? "light" : "dark");
});

/* =========================================
   INITIALIZATION
========================================= */

loadTheme();

renderTasks();

updateCharacterCount();
