// --- DOM Elements ---
const body = document.querySelector("body"); // Creating body
const logo = document.createElement("h1"); // Logo as String
const form = document.createElement("form"); // Form for creating new Todos
const input = document.createElement("input"); // Inputfield
const button = document.createElement("button"); // Button for submit
const todoList = document.createElement("div"); // Container for todos
const filterButton1 = document.createElement("button"); // Filter: All
const filterButton2 = document.createElement("button"); // Filter: Undone
const filterButton3 = document.createElement("button"); // Filter: Done
const filterButtonContainer = document.createElement("div"); // Container for filter buttons
const deleteBtnContainer = document.createElement("div"); // Container for switchable buttons

// --- Delete-Switch-Button Setup ---
const changeButtonFunction = ["Delete All", "Delete Done", "Delete Undone"]; // Array of String for button text
const leftButton = document.createElement("button"); // Change button
const rightButton = document.createElement("button"); // Change button
const deleteButton = document.createElement("button"); // current delete button
let currentButtonIndex = 0; // Index of current delete button

leftButton.innerText = "<"; // Icon for left button
rightButton.innerText = ">"; // Icon for right button
deleteButton.innerText = changeButtonFunction[currentButtonIndex]; // default delete button text
deleteBtnContainer.classList.add("deleteBtnContainer");
leftButton.classList.add("leftBtn");
rightButton.classList.add("rightBtn");
deleteButton.classList.add("changeBtn");

// Change logic for delete buttons
leftButton.addEventListener("click", () => {
  currentButtonIndex =
    (currentButtonIndex - 1 + changeButtonFunction.length) %
    changeButtonFunction.length;
  deleteButton.innerText = changeButtonFunction[currentButtonIndex];
});
rightButton.addEventListener("click", () => {
  currentButtonIndex = (currentButtonIndex + 1) % changeButtonFunction.length;
  deleteButton.innerText = changeButtonFunction[currentButtonIndex];
});
deleteButton.addEventListener("click", () => handleBtnChange());

// Deletes todos based on the current selection
const handleBtnChange = () => {
  if (changeButtonFunction[currentButtonIndex] === "Delete All") {
    deleteAllTodos();
  } else if (changeButtonFunction[currentButtonIndex] === "Delete Done") {
    deleteDone();
  } else if (changeButtonFunction[currentButtonIndex] === "Delete Undone") {
    deleteUndone();
  }
};

deleteBtnContainer.append(leftButton, deleteButton, rightButton);

// --- Filter-Buttons Setup ---
const filterButtons = [filterButton1, filterButton2, filterButton3]; // Array of filter buttons
const formElements = [input, button]; // Array of form elements
let todos = JSON.parse(localStorage.getItem("todos")) || []; // Array of todos
let currentFilter = JSON.parse(localStorage.getItem("filter")) || "ALL"; // Current filter

const buttonTexts = ["ALL", "UNDONE", "DONE"]; // Texts for filter buttons

// Initialize filter buttons
filterButtons.forEach((button, i) => {
  filterButtonContainer.appendChild(button);
  button.innerText = buttonTexts[i];
  button.addEventListener("click", () => {
    currentFilter = button.innerText;
    localStorage.setItem("filter", JSON.stringify(buttonTexts[i]));
    renderTodos();
  });
});

filterButtonContainer.classList.add("filterButtons");

// --- UI Setup ---
logo.classList.add("logo");
logo.innerText = "Vanilla's TODO";
form.classList.add("form");
todoList.classList.add("todoList");
button.type = "Submit";
button.innerText = "Add Todo";
form.addEventListener("submit", (e) => {
  addTodo(e);
});
form.append(...formElements);
body.append(logo, filterButtonContainer, form, todoList, deleteBtnContainer);

// Marks a todo as done/undone
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodo();
  renderTodos();
}

// Adds a new todo
function addTodo(e) {
  e.preventDefault();
  if (input.value.trim() === "") return;
  const newTodo = {
    id: Date.now(),
    text: input.value,
    done: false,
  };
  todos.push(newTodo);
  saveTodo();
  renderTodos();
  input.value = "";
}

// Saves todos in localStorage
function saveTodo() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Renders todos and updates visibility of delete-switch-button
function renderTodos() {
  todoList.innerHTML = "";
  let filteredTodos = todos;
  if (currentFilter === "DONE") {
    filteredTodos = todos.filter((todo) => todo.done);
  } else if (currentFilter === "UNDONE") {
    filteredTodos = todos.filter((todo) => !todo.done);
  }
  filteredTodos.forEach((todo) => {
    const div = document.createElement("div");
    const li = document.createElement("li");
    const toggleBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");
    const editBtn = document.createElement("button");
    div.classList.add("todo");
    li.classList.add("todo-text");
    editBtn.classList.add("editBtn");
    deleteBtn.classList.add("delete-todo-button");
    div.id = `todo-${todo.id}`;
    div.draggable = true;
    li.innerText = todo.text;
    li.dataset.id = todo.id;
    toggleBtn.innerText = todo.done ? "✅" : "⬜️";
    editBtn.innerText = "✏️";
    deleteBtn.innerText = "X";
    div.addEventListener("dragstart", (e) => dragSTART(e));
    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) => dropped(e));
    toggleBtn.addEventListener("click", () => toggleTodo(todo.id));
    editBtn.addEventListener("click", () => editTodo(div, todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));
    div.append(toggleBtn, li, editBtn, deleteBtn);
    todoList.append(div);
  });
  // Show delete-switch-button only if more than 2 todos
  if (filteredTodos.length > 2) {
    deleteBtnContainer.classList.remove("hidden");
  } else {
    deleteBtnContainer.classList.add("hidden");
  }
}

// Allows editing a todo
const editTodo = (todoContainer, id) => {
  const todo = todos.find((todo) => todo.id === id);
  todoContainer.innerHTML = "";
  const input = document.createElement("input");
  const button = document.createElement("button");
  button.innerText = "Save";
  input.value = todo.text;
  input.classList.add("editInput");
  button.classList.add("save-button");
  todoContainer.append(input, button);
  function saveEdit() {
    if (input.value.trim() === "") return;
    todo.text = input.value;
    saveTodo();
    renderTodos();
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      input.value = todo.text;
      saveEdit();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  });
  button.addEventListener("click", () => saveEdit());
};

// Enables drag & drop sorting of todos
function dropped(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text/plain");
  const draggedElement = document.getElementById(draggedId);
  const targetElement = e.currentTarget;
  if (!draggedElement || draggedElement === targetElement) return;
  const isLast = targetElement === todoList.lastElementChild;
  if (isLast) {
    todoList.appendChild(draggedElement);
  } else {
    todoList.insertBefore(draggedElement, targetElement);
  }
  const newOrder = [...todoList.children].map((el) => {
    const id = parseInt(el.querySelector("li").dataset.id);
    return todos.find((t) => t.id === id);
  });
  todos = newOrder;
  saveTodo();
}

// Starts drag & drop for a todo
function dragSTART(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

// Deletes a single todo
function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) {
    todos = todos.toSpliced(index, 1);
    saveTodo();
    renderTodos();
  }
}

// Deletes all done todos
const deleteDone = () => {
  todos = todos.filter((todo) => !todo.done);
  saveTodo();
  renderTodos();
};

// Deletes all undone todos
const deleteUndone = () => {
  todos = todos.filter((todo) => todo.done);
  saveTodo();
  renderTodos();
};

// Deletes all todos
const deleteAllTodos = () => {
  todos.length = 0;
  localStorage.removeItem("todos");
  saveTodo();
  renderTodos();
};

// Initial render of todos
renderTodos();
