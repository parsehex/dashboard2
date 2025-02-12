# Data Dashboard

This is an Electron app that I made for work. It mainly allows creating and viewing reports.

### Features

- **Reports**: Create and view reports.
- **Charting**: View generated and interactive charts for associated reports.
- **Data Persistence**: The app maintains a level of data persistence, allowing you to keep your work and progress even after closing the app.
- **Organized File Management**: Easily swap input files to change the report.

### Setup

Node v18 is recommended.

#. Clone the repository.
#. `npm install`
#. `npm run compile` to make a dev build. Run the app's binary at `./dist/*-unpacked/Dashboard`.

#### GitHub Desktop `npx` Error On Commit

See [here](https://github.com/toplenboren/simple-git-hooks/tree/master#i-am-getting-npx-command-not-found-error-in-a-gui-git-client).

If that doesn't work, go to `./.git/hooks/pre-commit` and comment out the `npx` line.

### Project Structure

The structure of this template is very similar to the structure of a monorepo.

The entire source code of the program is divided into three modules (packages) that are bundled each independently:

- [`packages/main`](packages/main)
  Electron [**main script**](https://www.electronjs.org/docs/tutorial/quick-start#create-the-main-script-file).
- [`packages/preload`](packages/preload)
  Used in `BrowserWindow.webPreferences.preload`. See [Checklist: Security Recommendations](https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content).
- [`packages/renderer`](packages/renderer)
  Electron [**web page**](https://www.electronjs.org/docs/tutorial/quick-start#create-a-web-page).

### Build web resources

Packages `main` and `preload` are built in [library mode](https://vitejs.dev/guide/build.html#library-mode) as it is a simple javascript.
`renderer` package build as regular web app.

The build of web resources is performed in the [`scripts/build.js`](scripts/build.js). Its analogue is a sequential call to `vite build` for each package.

### Compile App

Next step is run packaging and compilation a ready for distribution Electron app for macOS, Windows and Linux with "auto update" support out of the box.

To do this, using the [electron-builder]:

- In npm script `compile`: This script is configured to compile the application as quickly as possible. It is not ready for distribution, is compiled only for the current platform and is used for debugging.
- In GitHub Action: The application is compiled for any platform and ready-to-distribute files are automatically added to the draft GitHub release.

### Using Node.js API in renderer

According to [Electron's security guidelines](https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content), Node.js integration is disabled for remote content. This means that **you cannot call any Node.js api in the `packages/renderer` directly**. To do this, you **must** describe the interface in the `packages/preload` where Node.js api is allowed:

```ts
// packages/preload/src/index.ts
import { readFile } from 'fs/promises';

const api = {
	readConfig: () => readFile('/path/to/config.json', { encoding: 'utf-8' }),
};

contextBridge.exposeInMainWorld('electron', api);
```

```ts
// packages/renderer/src/App.vue
import { useElectron } from '/@/use/electron';

const { readConfig } = useElectron();
```

[Read more about Security Considerations](https://www.electronjs.org/docs/tutorial/context-isolation#security-considerations).

**Note**: Context isolation disabled for `test` environment. See [#693](https://github.com/electron-userland/spectron/issues/693#issuecomment-747872160).

### Modes and Environment Variables

All environment variables set as part of the `import.meta`, so you can access them as follows: `import.meta.env`.

You can also build type definitions of your variables by running `scripts/buildEnvTypes.js`. This command will create `types/env.d.ts` file with describing all environment variables for all modes.

The mode option is used to specify the value of `import.meta.env.MODE` and the corresponding environment variables files that needs to be loaded.

By default, there are two modes:

- `production` is used by default
- `development` is used by `npm run watch` script
- `test` is used by `npm test` script

When running building, environment variables are loaded from the following files in your project root:

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified env mode
.env.[mode].local   # only loaded in specified env mode, ignored by git
```

**Note:** only variables prefixed with `VITE_` are exposed to your code (e.g. `VITE_SOME_KEY=123`) and `SOME_KEY=123` will not. you can access `VITE_SOME_KEY` using `import.meta.env.VITE_SOME_KEY`. This is because the `.env` files may be used by some users for server-side or build scripts and may contain sensitive information that should not be exposed in code shipped to browsers.

### Issues With Vue DevTools

The Vue DevTools extension that gets installed isn't compatible out of the box with Electron.

Run the app once, and then run `npm run fix-vue` to fix Vue DevTools until you reset the app again.

### Reset App Data

To start the app fresh, run `npm run reset`.
