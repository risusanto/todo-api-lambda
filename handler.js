'use strict';
const {todo} = require("./todo/todoController");

module.exports = {
  addTodo: async (event,context,callback) => await todo.addTodo(event,context,callback),
  fetchTodo: async (event,context,callback) => await todo.fetchTodo(event,context,callback),
  getTodo: async (event,context,callback) => await todo.getTodo(event,context,callback),
  updateTodo: async (event,context,callback) => await todo.updateTodo(event,context,callback),
  deleteTodo: async (event,context,callback) => await todo.deleteTodo(event,context,callback),
  getTodoByUser: async (event,context,callback) => await todo.getTodoByUser(event,context,callback)
};
