console.log("Starting..");

const body = document.querySelector("body");
const logo = document.createElement("h1");
const form = document.createElement("form");
const input = document.createElement("input");
const button = document.createElement("button");
const todoList = document.createElement("div");
const filterButton1 = document.createElement("button");
const filterButton2 = document.createElement("button");
const filterButton3 = document.createElement("button");

const filterButtons = [filterButton1, filterButton2, filterButton3];

const filterButtonContainer = document.createElement("div");

filterButtons.forEach((button) => {
  filterButtonContainer.appendChild(button);
});

filterButtonContainer.classList.add("filterButtons");

const formElements = [input, button];
// If todos are on localstorage available load it else use an empty array as container
let todos = JSON.parse(localStorage.getItem("todos")) || [];
// If currentFilter was already selected load it, else default value ist ALL;
let currentFilter = JSON.parse(localStorage.getItem("filter")) || "ALL";

// IFFE function aka iffy
(() => {
  logo.classList.add("logo");
  logo.innerText = "Vanilla's TODO";
  form.classList.add("form");
  button.type = "Submit";
  button.innerText = "Add Todo";
  todoList.classList.add("todoList");
  filterButton1.innerText = "SHOW ALL";
  filterButton2.innerText = "UNDONE";
  filterButton3.innerText = "DONE";

  filterButton1.addEventListener("click", () => filterTodos("ALL"));
  filterButton2.addEventListener("click", () => filterTodos("UNDONE"));
  filterButton3.addEventListener("click", () => filterTodos("DONE"));

  form.append(...formElements);
  body.append(logo, filterButtonContainer, form, todoList);

  renderTodos();
})();

function filterTodos(selectedFilter) {
  currentFilter = selectedFilter;
  localStorage.setItem("filter", JSON.stringify(selectedFilter));
  renderTodos();
}

function toggleRender(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveAndReloadTodos();
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

  saveAndReloadTodos();
  renderTodos();

  input.value = "";
}

function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) {
    todos = todos.toSpliced(index, 1);
    saveAndReloadTodos();
    renderTodos();
  }
}

function saveAndReloadTodos() {
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
    div.id = `todo-${todo.id}`;
    div.draggable = true;
    if (String(todo.id).slice(-1) === "0") {
      div.draggable = false;
    }
    li.innerText = todo.text;
    li.dataset.id = todo.id;
    toggleBtn.innerText = todo.done ? "✅" : "⬜️";
    editBtn.innerText = "✏️";
    editBtn.classList.add("editBtn");
    deleteBtn.innerText = "X";

    div.addEventListener("dragstart", (e) => dragSTART(e));
    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) => dropped(e));

    toggleBtn.addEventListener("click", () => toggleRender(todo.id));
    editBtn.addEventListener("click", () => editTodo(todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    div.append(toggleBtn, li, editBtn, deleteBtn);
    todoList.append(div);
  });
}

function editTodo(id) {
  const div = document.getElementById(`todo-${id}`);
  if (!div) return;

  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  div.innerHTML = "";
  div.classList.add("editTodo");

  const input = document.createElement("input");
  const saveBtn = document.createElement("button");

  input.type = "text";
  input.classList.add("editInput");
  input.value = todo.text;
  saveBtn.innerText = "💾";

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  });

  saveBtn.addEventListener("click", saveEdit);

  function saveEdit() {
    const newText = input.value.trim();
    if (newText === "") return;

    todo.text = newText;
    saveAndReloadTodos();
    renderTodos();
  }

  div.append(input, saveBtn);
  input.focus();
}

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

  saveAndReloadTodos();
}

function dragSTART(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

form.addEventListener("submit", addTodo);
