console.log("Starting..");

const body = document.querySelector("body");
const form = document.createElement("form");
const input = document.createElement("input");
const button = document.createElement("button");
const todoList = document.createElement("div");
const filterButton1 = document.createElement("button");
const filterButton2 = document.createElement("button");
const filterButton3 = document.createElement("button");


const filterButtons = [filterButton1, filterButton2, filterButton3];
const formElements = [input, button];
// If todos on localstorage available load it else use an empty array as container
let todos = JSON.parse(localStorage.getItem("todos")) || [];
// If currentFilter was already selected load it, else default value ist ALL;
let currentFilter = JSON.parse(localStorage.getItem("filter")) || "ALL";

// IFFE function aka iffy
(() => {
  button.type = "Submit";
  button.innerText = "Add Todo";
  todoList.classList = "todoList";
  filterButton1.innerText = "ALL";
  filterButton2.innerText = "UNDONE";
  filterButton3.innerText = "DONE";

  filterButton1.addEventListener("click", () => filterTodos("ALL"));
  filterButton2.addEventListener("click", () => filterTodos("UNDONE"));
  filterButton3.addEventListener("click", () => filterTodos("DONE"));

  form.append(...formElements);
  body.append(...filterButtons, form, todoList);

  renderTodos();
})();

function filterTodos(selectedFilter) {
  currentFilter = selectedFilter;
  localStorage.setItem("filter", JSON.stringify(selectedFilter));
  renderTodos()
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
  console.log(index);
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

    div.style.display = "flex";
    div.style.gap = "1.5rem";
    li.style.fontSize = "1.3rem";
    li.innerText = todo.text;
    li.dataset.id = todo.id;
    li.style.listStyle = "none";
    li.style.color = "white";
    toggleBtn.innerText = todo.done ? "✅" : "⬜️";

    deleteBtn.innerText = "X";

    toggleBtn.addEventListener("click", () => toggleRender(todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    div.append(toggleBtn, li, deleteBtn);
    todoList.append(div);
  });
}

form.addEventListener("submit", addTodo);
