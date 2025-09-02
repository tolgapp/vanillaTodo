const body = document.querySelector("body");
const logo = document.createElement("h1");
const form = document.createElement("form");
const input = document.createElement("input");
const button = document.createElement("button");
const todoList = document.createElement("div");
const filterButton1 = document.createElement("button");
const filterButton2 = document.createElement("button");
const filterButton3 = document.createElement("button");
const filterButtonContainer = document.createElement("div");
const deleteAllButton = document.createElement("button");

const filterButtons = [filterButton1, filterButton2, filterButton3];
const formElements = [input, button];
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = JSON.parse(localStorage.getItem("filter")) || "ALL";

const buttonTexts = ["ALL", "UNDONE", "DONE"];

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

logo.classList.add("logo");
logo.innerText = "Vanilla's TODO";
deleteAllButton.classList.add("deleteAllBtn");
form.classList.add("form");
todoList.classList.add("todoList");

button.type = "Submit";

button.innerText = "Add Todo";
deleteAllButton.innerText = "Delete All"

deleteAllButton.addEventListener("click", () => deleteAllTodos());
form.addEventListener("submit", (e) => {
  addTodo(e);
});

form.append(...formElements);
body.append(logo, filterButtonContainer, deleteAllButton, form, todoList);

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodo();
  renderTodos();
}

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

function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) {
    todos = todos.toSpliced(index, 1);
    saveTodo();
    renderTodos();
  }
}

function saveTodo() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

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

    if (String(todo.id).slice(-1) === "0") {
      div.draggable = false;
    }

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
}

const editTodo = (todoContainer, id) => {
  const todo = todos.find((todo) => todo.id === id);

  todoContainer.innerHTML = "";

  const input = document.createElement("input");
  const button = document.createElement("button");
  button.innerText = "Save";
  input.value = todo.text;

  input.classList.add("edit-input")
  button.classList.add("save-button")

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

function dragSTART(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

const deleteAllTodos = () => {
  todos.length = 0;
  localStorage.removeItem("todos");
  saveTodo();
  renderTodos();
};

renderTodos();
