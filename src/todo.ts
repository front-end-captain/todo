import path from "path";
import fs from "fs-extra";
import { error } from "@luban-cli/cli-shared-utils";
import { v4 as uuidv4 } from "uuid";

import { Author, TodoItem } from "./definitions";
import { TODO_STORE_FILE, TOGO_CONFIG_FILE } from "./constant";

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

    this.todoList = this.loadUserLocalTodoStore(this.storeFilePath);

    this.authors = this.loadUserLocalConfigFile(this.configFilePath);
  }

  private loadUserLocalConfigFile(configFilePath: string) {
    let localConfigFile: Author[] = [];

    if (!fs.existsSync(configFilePath)) {
      fs.writeFileSync(configFilePath, "[]", { encoding: "utf-8" });
      return localConfigFile;
    }

    try {
      const fileContent = fs.readFileSync(configFilePath, {
        encoding: "utf-8",
      });

      if (fileContent.trim() !== "" && fileContent !== "[]") {
        localConfigFile = JSON.parse(fileContent);
      }
    } catch (e) {
      error("load user local config file failed", e);
    }

    return localConfigFile;
  }

  private writeUserLocalConfigFile(configFilePath: string, data: Author[]) {
    try {
      if (fs.existsSync(configFilePath)) {
        fs.writeJSON(configFilePath, data);
      }
    } catch (e) {
      error("write user local config file failed", e);
    }
  }

  private loadUserLocalTodoStore(storeFilePath: string) {
    let userLocalTodoStore: TodoItem[] = [];

    if (!fs.existsSync(storeFilePath)) {
      fs.writeFileSync(storeFilePath, "[]", { encoding: "utf-8" });
    }

    try {
      const fileContent = fs.readFileSync(storeFilePath, { encoding: "utf-8" });

      if (fileContent.trim() !== "" && fileContent !== "[]") {
        userLocalTodoStore = JSON.parse(fileContent);
      }
    } catch (e) {
      error("load user local todo store file failed", e);
    }

    return userLocalTodoStore;
  }

  private writeUserLocalTodoStore(storeFilePath: string, data: TodoItem[]) {
    try {
      if (fs.existsSync(storeFilePath)) {
        fs.writeJSON(storeFilePath, data);
      }
    } catch (e) {
      error("write user local todo store file failed", e);
    }
  }

  public add(title: string, callback?: () => void) {
    const id = uuidv4();
    const index = this.todoList.length + 1;

    const now = new Date().getTime();

    const user = this.authors.find((author) => author.login);

    this.todoList.push({
      id,
      index,
      title,
      content: "",
      status: "doing",
      createTime: now,
      updateTime: now,
      deleteTime: null,
      author: user || null,
    });

    this.writeUserLocalTodoStore(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public done(todoIndex: number, callback?: () => void) {
    this.todoList = this.todoList.map((todoItem) => {
      if (todoIndex === todoItem.index) {
        return { ...todoItem, status: "done" };
      }

      return todoItem;
    });

    this.writeUserLocalTodoStore(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public del(todoIndex: number, callback?: () => void) {
    const now = new Date().getTime();

    this.todoList = this.todoList.map((todoItem) => {
      if (todoIndex === todoItem.index) {
        return { ...todoItem, status: "delete", deleteTime: now };
      }

      return todoItem;
    });

    this.writeUserLocalTodoStore(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  private logoutEveryAuthor() {
    this.authors = this.authors.map((author) => ({ ...author, login: false }));
  }

  private findSpecifyAuthor(authorName: string) {
    return this.authors.find((author) => author.name === authorName);
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
          callback("invalid name or password");
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

    this.writeUserLocalConfigFile(this.configFilePath, this.authors);

    if (typeof callback === "function") {
      callback();
    }
  }

  public logout(callback?: () => void) {
    this.logoutEveryAuthor();

    this.writeUserLocalConfigFile(this.configFilePath, this.authors);

    if (typeof callback === "function") {
      callback();
    }
  }

  public getTodoList(all = false) {
    const currentLoginAuthor = this.authors.find((author) => author.login);

    let filteredTodoList = this.todoList.filter(
      (todoItem) => todoItem.status === "doing",
    );

    if (all) {
      filteredTodoList = this.todoList.filter(
        (todoItem) => todoItem.status !== "delete",
      );
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
    this.writeUserLocalTodoStore(this.storeFilePath, []);
    this.todoList = [];

    if (typeof callback === "function") {
      callback();
    }
  }
}

export { Todo };
