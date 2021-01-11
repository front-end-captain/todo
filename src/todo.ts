import path from "path";
import fs from "fs-extra";
import { error } from "@luban-cli/cli-shared-utils";
import { v4 as uuidv4 } from "uuid";

import { TodoItem } from "./definitions";

const TODO_STORE_FILE = ".togo.store";
// const TOGO_CONFIG_FILE = ".togo.config";

class Todo {
  private userDir: string;
  private storeFilePath: string;
  // private configFilePath: string;

  private todoList: TodoItem[];

  constructor() {
    this.userDir = process.env.HOME || process.env.USERPROFILE || "";

    this.storeFilePath = path.join(this.userDir, TODO_STORE_FILE);
    // this.configFilePath = path.join(this.userDir, TOGO_CONFIG_FILE);

    this.todoList = this.loadUserLocalTodoStore(this.storeFilePath);
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

    this.todoList.push({
      id,
      index,
      title,
      content: "",
      status: "doing",
      createTime: now,
      updateTime: now,
      deleteTime: null,
      authorId: null,
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
    this.todoList = this.todoList.map((todoItem) => {
      if (todoIndex === todoItem.index) {
        return { ...todoItem, status: "delete" };
      }

      return todoItem;
    });

    this.writeUserLocalTodoStore(this.storeFilePath, this.todoList);

    if (typeof callback === "function") {
      callback();
    }
  }

  public getTodoList(all = false) {
    if (all) {
      return this.todoList.filter((todoItem) => todoItem.status !== "delete");
    }

    return this.todoList.filter((todoItem) => todoItem.status === "doing");
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
