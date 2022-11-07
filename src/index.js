const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  selectedTodo.title = title;
  selectedTodo.deadline = new Date(deadline);

  response.status(201).json(selectedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    response.status(404).json({ error: "Todo not found!" });
  }

  selectedTodo.done = true;

  response.status(201).json(selectedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(selectedTodo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
