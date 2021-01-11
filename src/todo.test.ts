import { Todo } from "./todo";

const todo = new Todo();

test("Todo", () => {
  todo.add("go home");

  expect(todo.getTodoList().length === 1);

  todo.done(1);

  expect(todo.getTodoList().length === 0);
});
