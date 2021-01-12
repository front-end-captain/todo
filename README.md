# togo-cli
A TODO project to be used in the terminal


## 安装
> 使用前请确保安装了 [node.js](https://nodejs.org/zh-cn/) 和 [npm](http://npmjs.com/), 同时确保 nodejs 版本是 >= 10+ 的.
> 可以在终端中这样查看其版本：
>
> ```shell
> # 查看 node 版本
> node -v
> ```
> 
>```shell
> # 查看 npm 版本
> npm -v
> ```
> 

终端输入以下命令就可以安装了：

```shell
npm install togo-cli -g
```

若提示权限异常，可以使用 `sodo npm install togo-cli -g`.

安装成功，就会获得全局的 `togo` 可执行命令，可以使用 `togo --help` 查看帮助文档：

```shell
$ togo -h

Usage: togo <command>

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  add <title>       add TODO item
  done <itemIndex>  complete a TODO item
  del <itemIndex>   delete a TODO item
  clear             clear all todo item
  list [options]    list TODO items
  login <username>  login togo with username
  logout            logout togo
  export            export all todo items, include doing and done
  import <file>     import todo items from a file
  help [command]    display help for command


# Usage
  Check version: togo version
  Help: togo help

# GitHub
  https://github.com/front-end-captain/todo#readme
```

然后，就可以使用 togo 了.