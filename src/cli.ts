import { Command, Option } from "commander";
import dedent from "dedent";
import { error, info, log, warn } from "@luban-cli/cli-shared-utils";
import chalk from "chalk";
import inquirer from "inquirer";
import md5 from "md5";
import fs from "fs-extra";
import path from "path";

import { Todo } from "./todo";
import { TodoItemStatus } from "./definitions";

const statusIcon: Record<TodoItemStatus, string> = {
  doing: "🕑",
  done: "✅",
  delete: "❌",
};

function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

function prepareInitOptions(cmd: Command): Record<string, any> {
  const args = {} as Record<string, any>;

  (cmd.options as Array<Option>).forEach((o) => {
    const key = camelize(o.long.replace(/^--/, ""));
    if (typeof cmd[key] !== "function" && typeof cmd[key] !== "undefined") {
      args[key] = cmd[key];
    }
  });

  return args;
}

const todo = new Todo();

const program = new Command();

program
  // eslint-disable-next-line import/no-commonjs
  .version(`togo ${require("../package.json").version}`)
  .usage("<command>");

program
  .command("add <title>")
  .description("add TODO item")
  .action((title: string, cmd: Command) => {
    const programName = `${cmd.parent._name} ${cmd._name}`;

    if (title.replace(/^\s+|\s+$/g, "") === "") {
      console.error("Please specify title:");
      console.log(`  ${chalk.cyan(programName)} ${chalk.green("<title>")}`);
      console.log();
      console.log("For example:");
      console.log(
        `  ${chalk.cyan(programName)} ${chalk.green("coding 10 minutes")}`,
      );
      console.log();
      console.log(
        `Run ${chalk.cyan(`${programName} --help`)} to see all options.`,
      );
      process.exit(1);
    }

    todo.add(title, () => {
      info("add succeed");
    });
  });

program
  .command("done <itemIndex>")
  .description("complete a TODO item")
  .action((itemIndex: string) => {
    const index = Number(itemIndex);

    if (Number.isNaN(index)) {
      console.error("Please specify <itemIndex> as a number");
      process.exit(1);
    }

    todo.done(index, () => {
      info(`todo item ${index} done`);
    });
  });

program
  .command("del <itemIndex>")
  .description("delete a TODO item")
  .action((itemIndex: string) => {
    const index = Number(itemIndex);

    if (Number.isNaN(index)) {
      console.error("Please specify <itemIndex> as a number");
      process.exit(1);
    }

    todo.del(index, () => {
      info(`todo item ${index} deleted`);
    });
  });

program
  .command("clear")
  .description("clear all todo item")
  .action(() => {
    todo.clear(() => {
      info("cleared");
    });
  });

program
  .command("list")
  .description("list TODO items")
  .option("-a --all", "list all TODO items, include done and undone")
  .action((cmd) => {
    const options = prepareInitOptions(cmd);

    const todoList = todo.getTodoList(options.all);

    if (todoList.length === 0) {
      info("There is any todo item exist");
      return;
    }

    console.log();
    info("Print todo list:");
    console.log();

    todoList.forEach((todoItem, i) => {
      const index = chalk.cyan(i + 1);
      const title = chalk.green(todoItem.title);

      console.log(`${statusIcon[todoItem.status]} ${index}. ${title}`);

      console.log();
    });
  });

program
  .command("login <username>")
  .description("login togo with username")
  .action((username) => {
    inquirer
      .prompt<{ password: string }>([
        {
          name: "password",
          type: "password",
          message: "Password:",
          mask: true,
        },
      ])
      .then((answer) => {
        todo.login(username, md5(answer.password), (msg) => {
          if (msg) {
            warn(msg);
            return;
          }

          info("login success");
        });
      })
      .catch((e) => {
        if (e.isTtyError) {
          error("Prompt couldn't be rendered in the current environment");
        } else {
          error("Something else went wrong", e);
        }
      });
  });

program
  .command("logout")
  .description("logout togo")
  .action(() => {
    todo.logout(() => {
      info("logout success");
    });
  });

program
  .command("export")
  .description("export all todo items, include doing and done")
  .action(() => {
    let exportedTodo = "";
    todo.getTodoList(true).forEach((todoItem, index) => {
      exportedTodo += `${index + 1}. ${todoItem.title}\n`;
    });

    process.stdout.write(exportedTodo);
  });

program
  .command("import <file>")
  .description("import todo items from a file")
  .action((file) => {
    const content = fs.readFileSync(path.resolve(file), "utf-8").trim();

    if (content) {
      const items = content.split("\n");
      items.forEach((item) => {
        const title = item.split(".")[1];
        if (title) {
          todo.add(title.trim());
        }
      });

      info("import success");
    } else {
      error(`The specified file ${file} is empty`);
    }
  });

program.on("--help", () => {
  log();
  log(
    `\n${dedent`
      # Usage
        Check version: togo version
        Help: togo help

      # GitHub
        https://github.com/front-end-captain/todo#readme
    `}\n`,
  );
});

program.parse(process.argv);
