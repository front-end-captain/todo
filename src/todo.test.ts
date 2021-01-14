import fs from "fs-extra";
import md5 from "md5";
import path from "path";

import {
  TODO_STORE_FILE,
  TOGO_CONFIG_FILE,
  LOGIN_FAILED_MSG,
} from "./constant";
import { Todo } from "./todo";

const userHomeDir = process.env.HOME || process.env.USERPROFILE || "";
const storeFilePath = path.join(userHomeDir, TODO_STORE_FILE);
const configFilePath = path.join(userHomeDir, TOGO_CONFIG_FILE);

const testAuthorName = "front-end-captain";
const testPassword = "123456";

describe("Todo", () => {
  beforeAll(() => {
    if (fs.existsSync(storeFilePath)) {
      fs.removeSync(storeFilePath);
    }

    if (fs.existsSync(configFilePath)) {
      fs.removeSync(configFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(storeFilePath)) {
      fs.writeJSONSync(storeFilePath, [], { encoding: "utf-8" });
    }

    if (fs.existsSync(configFilePath)) {
      fs.writeJSONSync(configFilePath, [], { encoding: "utf-8" });
    }
  });

  test("should create .togo.store and .togo.config in user home dir", () => {
    // eslint-disable-next-line no-new
    new Todo();

    expect(fs.existsSync(storeFilePath)).toBe(true);
    expect(fs.existsSync(configFilePath)).toBe(true);
  });

  test("should add a todo item", () => {
    const todo = new Todo();

    todo.add("coding 10 minutes");

    expect(todo.getTodoList().length === 1).toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBe(true);
  });

  test("should complete a todo item", () => {
    const todo = new Todo();

    todo.add("coding 10 minutes");

    expect(todo.getTodoList().length === 1).toBe(true);

    todo.done(1);

    expect(todo.getSpecifiedTodoItemStatus(1) === "done").toBe(true);
  });

  test("should delete a todo item", () => {
    const todo = new Todo();

    todo.add("coding 10 minutes");

    expect(todo.getTodoList().length === 1).toBe(true);

    todo.del(1);

    const status = todo.getSpecifiedTodoItemStatus(1);
    console.log(status);

    expect(todo.getSpecifiedTodoItemStatus(1) === "delete").toBe(true);
  });

  test("should list all 'doing' todo item", () => {
    const todo = new Todo();

    todo.add("coding 10 minutes");
    todo.add("go home");
    todo.add("eating");

    expect(todo.getTodoList().length === 3).toBe(true);

    todo.done(2);

    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(2) === "done").toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(3) === "doing").toBe(true);

    expect(todo.getTodoList().length === 2);
  });

  test("should list all todo item, include doing, done and deleted", () => {
    const todo = new Todo();

    todo.add("coding 10 minutes");
    todo.add("go home");
    todo.add("eating");
    todo.add("writing");

    expect(todo.getTodoList().length === 4).toBe(true);

    todo.done(2);
    todo.del(3);

    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(2) === "done").toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(3) === "delete").toBe(true);
    expect(todo.getSpecifiedTodoItemStatus(4) === "doing").toBe(true);

    expect(todo.getTodoList(true).length === 4).toBe(true);
  });

  test("should login with a author name", () => {
    const todo = new Todo();

    todo.login(testAuthorName, testPassword);

    expect(todo.getAuthors().length === 1).toBe(true);

    const loginAuthor = todo
      .getAuthors()
      .find((author) => author.name === testAuthorName);

    expect(loginAuthor?.login).toBeTruthy();
    expect(md5(loginAuthor?.password || "") === md5(testPassword)).toBe(true);
  });

  test("should logout current login author", () => {
    const todo = new Todo();

    todo.login(testAuthorName, testPassword);

    expect(todo.getAuthors().length === 1).toBeTruthy();

    todo.logout();

    expect(todo.getAuthors().every((author) => !author.login)).toBeTruthy();
  });

  test("add todo item with login author", () => {
    const todo = new Todo();

    todo.login(testAuthorName, testPassword);

    expect(todo.getAuthors().length === 1).toBeTruthy();

    todo.add("coding 10 minutes");

    expect(todo.getTodoList().length === 1).toBeTruthy();

    expect(
      todo
        .getTodoList()
        .find((todoItem) => todoItem.author?.name === testAuthorName)?.title,
    ).toBe("coding 10 minutes");
  });

  test("should list author's todo items", () => {
    const todo = new Todo();

    const unLoginTodoItemTitle = "coding 20 minutes";
    const loginTodoItemTitle = "coding 10 minutes";

    todo.add(unLoginTodoItemTitle);

    expect(todo.getTodoList().length === 1).toBeTruthy();
    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBeTruthy();
    expect(
      todo.getSpecifiedTodoItem(1)?.title === unLoginTodoItemTitle,
    ).toBeTruthy();

    todo.login(testAuthorName, testPassword);

    expect(todo.getAuthors().length === 1).toBeTruthy();

    todo.add(loginTodoItemTitle);

    expect(todo.getTodoList().length === 1).toBeTruthy();
    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBeTruthy();
    expect(
      todo.getSpecifiedTodoItem(1)?.title === loginTodoItemTitle,
    ).toBeTruthy();

    todo.logout();

    expect(todo.getTodoList().length === 1).toBeTruthy();
    expect(todo.getSpecifiedTodoItemStatus(1) === "doing").toBeTruthy();
    expect(
      todo.getSpecifiedTodoItem(1)?.title === unLoginTodoItemTitle,
    ).toBeTruthy();
  });

  test("should clear all local todo items", () => {
    const todo = new Todo();

    const unLoginTodoItemTitle = "coding 20 minutes";
    const loginTodoItemTitle = "coding 10 minutes";

    todo.add(unLoginTodoItemTitle);
    todo.login(testAuthorName, testPassword);
    todo.add(loginTodoItemTitle);
    todo.logout();
    todo.clear();

    expect(
      fs.readFileSync(storeFilePath, { encoding: "utf-8" }) === "[]\n",
    ).toBeTruthy();
  });

  test("should invoke callback", () => {
    const todo = new Todo();

    const addCb = jest.fn(() => console.log("added"));
    const doneCb = jest.fn(() => console.log("done"));
    const delCb = jest.fn(() => console.log("deleted"));
    const loginCb = jest.fn(() => console.log("login"));
    const logoutCb = jest.fn(() => console.log("logout"));
    const clearCb = jest.fn(() => console.log("clear"));

    todo.login(testAuthorName, testPassword, loginCb);

    todo.add("coding", addCb);
    todo.done(1, doneCb);
    todo.del(1, delCb);
    todo.logout(logoutCb);
    todo.clear(clearCb);

    expect(loginCb.mock.calls.length).toBe(1);
    expect(logoutCb.mock.calls.length).toBe(1);
    expect(addCb.mock.calls.length).toBe(1);
    expect(doneCb.mock.calls.length).toBe(1);
    expect(delCb.mock.calls.length).toBe(1);
    expect(clearCb.mock.calls.length).toBe(1);
  });

  test(`should remind '${LOGIN_FAILED_MSG}' while login with wrong password`, () => {
    const todo = new Todo();

    const loginCb = jest.fn((msg) =>
      expect(msg === LOGIN_FAILED_MSG).toBeTruthy(),
    );

    todo.login(testAuthorName, testPassword);
    todo.logout();

    todo.login(testAuthorName, "123457", loginCb);
  });
});
