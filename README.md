# @atlassian/ts-dev

_Typescript dev loop in a box._

### Quick start

Install:

```sh
npm i -D @atlassian/ts-dev
# or
yarn add -D @atlassian/ts-dev
```

Add a dev script to your `package.json`:

```json
{
    "scripts": {
        "dev": "ts-dev ./src/main.ts"
    }
}
```

Run that script and it should automatically pick up your project configuration and start compiling and running.

### Why use this instead of ts-node?

ts-node does not behave identically to Typescript in some situations which can lead to bugs and differences between programs running in production and development. ts-dev was created because ts-node could not run for a project I was working on. It offers a simple and fast dev loop which is closer to the production build by compiling a project in watch mode, then running the compiled Javascript files in Node, restarting on recompilation. `require()` can be patched to handle Typescript files by mapping them to their compiled JS files.
