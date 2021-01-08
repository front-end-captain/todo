import { Command } from "commander";
import dedent from "dedent";
import { log } from "@luban-cli/cli-shared-utils";

const program = new Command();

program
  // eslint-disable-next-line import/no-commonjs
  .version(`togo ${require("../package.json").version}`)
  .usage("<command>");

program
  .command("add <item>")
  .description("add TODO item")
  .action(() => {
    // TODO
  });

program
  .command("done <itemIndex>")
  .description("complete a TODO item")
  .action(() => {
    // TODO
  });


program
  .command("list")
  .description("list TODO items")
  .option("-a --all", "list all TODO items, include done and undone")
  .action(() => {
    // TODO
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
