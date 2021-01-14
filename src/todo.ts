import path from "path";
import fs from "fs-extra";
import { error } from "@luban-cli/cli-shared-utils";
import { v4 as uuidv4 } from "uuid";

import { Author, TodoItem } from "./definitions";
import {
  TODO_STORE_FILE,
  TOGO_CONFIG_FILE,
  LOGIN_FAILED_MSG,
} from "./constant";

class Todo {
  private userDir: string;
  private storeFilePath: string;
  private configFilePath: string;

  private todoList: TodoItem[];

  private authors: Author[];

  constructor() {
    this.userDir = process.env.HOME || process.env.USERPROFILE || "";

    this.storeFilePath = path.join(this.userDir, TODO_STORE_FILE);
    this.configFilePath = path.join(this.userDir, TOGO_CONFIG_FILE);

    this.todoList = this.loadDataFromSpecifyFile(this.storeFilePath);

    this.authors = this.loadDataFromSpecifyFile(this.configFilePath);
  }

  private loadDataFromSpecifyFile<T extends unknown[]>(path: string): T {
    let data = [];

    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, "[]", { encoding: "utf-8" });
    }

    try {
      const fileContent = fs.readFileSync(path, { encoding: "utf-8" });

      if (fileContent.trim() !== "" && fileContent !== "[]") {
        data = JSON.parse(fileContent);
      }
    } catch (e) {
      error(`load data from ${path} failed`, e);
    }

    return data as T;
  }

  private writeDataToSpecifyFile<T>(path: string, data: T) {
    try {
      if (fs.existsSync(path)) {
        fs.writeJSONSync(path, data);
      }
    } catch (e) {
      error(`write ${path} failed`, e);
    }
  }

  private logoutEveryAuthor() {
    this.authors = this.authors.map((author) => ({ ...author, login: false }));
  }

  private findSpecifyAuthor(authorName: string) {
    return this.authors.find((author) => author.name === authorName);
  }

  private findLoginAuthor() {
    return this.authors.find((author) => author.login);
  }

  private findSpecifyTodoItemOnIndex(todoIndex: number) {
    const currentLoginAuthor = this.findLoginAuthor();

    if (currentLoginAuthor) {
      return this.todoList
        .filter(
          (todoItem) =>
            todoItem.author?.id === currentLoginAuthor.id &&
            todoItem.status !== "delete",
        )
        .find((_, index) => index + 1 === todoIndex);
    }

    return this.todoList
      .filter((todoItem) => !todoItem.author && todoItem.status !== "delete")
      .find((_, index) => index + 1 === todoIndex);
  }

  public add(title: string, callback?: () => void) {
    const id = uuidv4();

    const now = new Date().getTime();

    const user = this.findLoginAuthor();

    this.todoList.push({
      id,
      title,
      content: "",
      status: "doing",
      createTime: now,
      updateTime: now,
      author: user,
    });

    this.writeDataToSpecifyFile(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public done(todoIndex: number, callback?: () => void) {
    const targetTodoItemId = this.findSpecifyTodoItemOnIndex(todoIndex)?.id;

    this.todoList = this.todoList.map((todoItem) => {
      if (targetTodoItemId === todoItem.id) {
        return { ...todoItem, status: "done" };
      }

      return todoItem;
    });

    this.writeDataToSpecifyFile(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public del(todoIndex: number, callback?: () => void) {
    const now = new Date().getTime();

    const targetTodoItemId = this.findSpecifyTodoItemOnIndex(todoIndex)?.id;

    this.todoList = this.todoList.map((todoItem) => {
      if (targetTodoItemId === todoItem.id) {
        return { ...todoItem, status: "delete", deleteTime: now };
      }

      return todoItem;
    });

    this.writeDataToSpecifyFile(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public login(
    authorName: string,
    password: string,
    callback?: (msg?: string) => void,
  ) {
    this.logoutEveryAuthor();

    const targetAuthor = this.findSpecifyAuthor(authorName);

    if (targetAuthor) {
      if (password !== targetAuthor.password) {
        if (typeof callback === "function") {
          callback(LOGIN_FAILED_MSG);
          return;
        }
      }
    }

    this.authors.push({
      id: uuidv4(),
      name: authorName,
      password,
      login: true,
    });

    this.writeDataToSpecifyFile(this.configFilePath, this.authors);

    if (typeof callback === "function") {
      callback();
    }
  }

  public logout(callback?: () => void) {
    this.logoutEveryAuthor();

    this.writeDataToSpecifyFile(this.configFilePath, this.authors);

    if (typeof callback === "function") {
      callback();
    }
  }

  public getTodoList(all = false) {
    const currentLoginAuthor = this.findLoginAuthor();

    let filteredTodoList = this.todoList.filter(
      (todoItem) => todoItem.status === "doing",
    );

    if (all) {
      filteredTodoList = this.todoList;
    }

    if (currentLoginAuthor) {
      filteredTodoList = filteredTodoList.filter(
        (todoItem) => todoItem.author?.id === currentLoginAuthor.id,
      );
    } else {
      filteredTodoList = filteredTodoList.filter(
        (todoItem) => !todoItem.author,
      );
    }

    return filteredTodoList;
  }

  public clear(callback?: () => void) {
    this.writeDataToSpecifyFile(this.storeFilePath, []);
    this.todoList = [];

    if (typeof callback === "function") {
      callback();
    }
  }

  public getSpecifiedTodoItem(todoIndex: number) {
    return this.getTodoList(true).find((_, index) => index + 1 === todoIndex);
  }

  public getSpecifiedTodoItemStatus(index: number) {
    return this.getSpecifiedTodoItem(index)?.status;
  }

  public getAuthors() {
    return this.authors;
  }
}

export { Todo };
