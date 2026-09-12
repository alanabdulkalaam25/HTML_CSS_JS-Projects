const API_URL = "api/todos.php";

let todos = [];
let currentFilter = "all";


// ------------------------------------------------------------
// DOM elements
// ------------------------------------------------------------

const todoForm = document.getElementById("todo-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");

const todoList = document.getElementById("todo-list");

const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const error = document.getElementById("error");

const todoCount = document.getElementById("todo-count");

const filters = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");


// Modal

const modal = document.getElementById("edit-modal");

const editForm = document.getElementById("edit-form");

const editId = document.getElementById("edit-id");
const editTitle = document.getElementById("edit-title");
const editDescription = document.getElementById("edit-description");

const closeModal = document.getElementById("close-modal");
const cancelEdit = document.getElementById("cancel-edit");


// ------------------------------------------------------------
// Load todos
// ------------------------------------------------------------

async function loadTodos() {

  showLoading();

  try {

    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load todos."
      );
    }

    todos = data.todos;

    renderTodos();

  } catch (err) {

    showError(err.message);

  } finally {

    loading.classList.add("hidden");

  }
}


// ------------------------------------------------------------
// Add todo
// ------------------------------------------------------------

todoForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    return;
  }

  const submitButton = todoForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        title,
        description
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to create todo."
      );
    }

    todos.unshift(data.todo);

    todoForm.reset();

    renderTodos();

    titleInput.focus();

  } catch (err) {

    showError(err.message);

  } finally {

    submitButton.disabled = false;

  }
});


// ------------------------------------------------------------
// Toggle completed
// ------------------------------------------------------------

async function toggleTodo(id, completed) {

  try {

    const response = await fetch(API_URL, {

      method: "PATCH",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id,
        completed
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to update todo."
      );
    }

    const todo = todos.find(
      todo => todo.id === id
    );

    if (todo) {
      todo.completed = completed;
    }

    renderTodos();

  } catch (err) {

    showError(err.message);

  }
}


// ------------------------------------------------------------
// Open edit modal
// ------------------------------------------------------------

function openEditModal(id) {

  const todo = todos.find(
    todo => todo.id === id
  );

  if (!todo) {
    return;
  }

  editId.value = todo.id;

  editTitle.value = todo.title;

  editDescription.value = todo.description || "";

  modal.classList.remove("hidden");

  editTitle.focus();
}


// ------------------------------------------------------------
// Close edit modal
// ------------------------------------------------------------

function closeEditModal() {

  modal.classList.add("hidden");

  editForm.reset();

}


// ------------------------------------------------------------
// Save edited todo
// ------------------------------------------------------------

editForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const id = Number(editId.value);

  const title = editTitle.value.trim();

  const description = editDescription.value.trim();

  if (!title) {
    return;
  }

  const submitButton = editForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;

  try {

    const response = await fetch(API_URL, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id,
        title,
        description
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to update todo."
      );
    }

    const index = todos.findIndex(
      todo => todo.id === id
    );

    if (index !== -1) {

      todos[index] = data.todo;

    }

    closeEditModal();

    renderTodos();

  } catch (err) {

    showError(err.message);

  } finally {

    submitButton.disabled = false;

  }
});


// ------------------------------------------------------------
// Delete todo
// ------------------------------------------------------------

async function deleteTodo(id) {

  const todo = todos.find(
    todo => todo.id === id
  );

  if (!todo) {
    return;
  }

  const confirmed = confirm(
    `Delete "${todo.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await fetch(API_URL, {

      method: "DELETE",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to delete todo."
      );
    }

    todos = todos.filter(
      todo => todo.id !== id
    );

    renderTodos();

  } catch (err) {

    showError(err.message);

  }
}


// ------------------------------------------------------------
// Render todos
// ------------------------------------------------------------

function renderTodos() {

  error.classList.add("hidden");

  todoList.innerHTML = "";

  let filteredTodos = todos;

  if (currentFilter === "active") {

    filteredTodos = todos.filter(
      todo => !todo.completed
    );

  }

  if (currentFilter === "completed") {

    filteredTodos = todos.filter(
      todo => todo.completed
    );

  }


  // Update count

  const remaining = todos.filter(
    todo => !todo.completed
  ).length;

  todoCount.textContent =
    `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  clearCompletedButton.classList.toggle(
    "hidden",
    !todos.some(todo => todo.completed)
  );


  // Empty state

  if (filteredTodos.length === 0) {

    empty.classList.remove("hidden");

    return;

  }

  empty.classList.add("hidden");


  // Create todo elements

  filteredTodos.forEach(todo => {

    const todoElement = document.createElement("article");

    todoElement.className = "todo";

    if (todo.completed) {
      todoElement.classList.add("completed");
    }


    // Checkbox

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.className = "todo-checkbox";

    checkbox.checked = todo.completed;

    checkbox.addEventListener("change", () => {

      toggleTodo(
        todo.id,
        checkbox.checked
      );

    });


    // Content

    const content = document.createElement("div");

    content.className = "todo-content";


    const title = document.createElement("h3");

    title.className = "todo-title";

    title.textContent = todo.title;

    content.appendChild(title);


    if (todo.description) {

      const description =
        document.createElement("p");

      description.className =
        "todo-description";

      description.textContent =
        todo.description;

      content.appendChild(description);

    }


    // Actions

    const actions = document.createElement("div");

    actions.className = "todo-actions";


    const editButton =
      document.createElement("button");

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {

      openEditModal(todo.id);

    });


    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";

    deleteButton.textContent = "Delete";

    deleteButton.classList.add("delete");

    deleteButton.addEventListener("click", () => {

      deleteTodo(todo.id);

    });


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    // Assemble

    todoElement.appendChild(checkbox);

    todoElement.appendChild(content);

    todoElement.appendChild(actions);

    todoList.appendChild(todoElement);

  });

}


// ------------------------------------------------------------
// Filters
// ------------------------------------------------------------

filters.forEach(button => {

  button.addEventListener("click", () => {

    filters.forEach(filter => {
      filter.classList.remove("active");
      filter.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    currentFilter =
      button.dataset.filter;

    renderTodos();

  });

});


// ------------------------------------------------------------
// Modal controls
// ------------------------------------------------------------

closeModal.addEventListener(
  "click",
  closeEditModal
);

cancelEdit.addEventListener(
  "click",
  closeEditModal
);


modal.addEventListener("click", (event) => {

  if (event.target === modal) {

    closeEditModal();

  }

});


document.addEventListener("keydown", (event) => {

  if (event.key === "Escape" && !modal.classList.contains("hidden")) {

    closeEditModal();

  }

});


// ------------------------------------------------------------
// Clear completed todos
// ------------------------------------------------------------

clearCompletedButton.addEventListener("click", async () => {

  const completedCount = todos.filter(todo => todo.completed).length;

  if (completedCount === 0) {
    return;
  }

  const confirmed = confirm(
    `Clear ${completedCount} completed ${completedCount === 1 ? "task" : "tasks"}?`
  );

  if (!confirmed) {
    return;
  }

  clearCompletedButton.disabled = true;

  try {

    const response = await fetch(API_URL, {

      method: "DELETE",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        clear_completed: true
      })

    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to clear completed todos."
      );
    }

    todos = todos.filter(todo => !todo.completed);

    renderTodos();

  } catch (err) {

    showError(err.message);

  } finally {

    clearCompletedButton.disabled = false;

  }

});


// ------------------------------------------------------------
// UI helpers
// ------------------------------------------------------------

function showLoading() {

  loading.classList.remove("hidden");

  error.classList.add("hidden");

}


function showError(message) {

  error.textContent = message;

  error.classList.remove("hidden");

}


// ------------------------------------------------------------
// Start application
// ------------------------------------------------------------

loadTodos();
