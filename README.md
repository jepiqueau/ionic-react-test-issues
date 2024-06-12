<p align="center"><br><img src="https://avatars3.githubusercontent.com/u/16580653?v=4" width="128" height="128" /></p>

<h3 align="center">Ionic/React SQLite Test App</h3>
<p align="center"><strong><code>ionic-react-test-issues</code></strong></p>
<p align="center">Ionic/React application use to fix the issues of the</p>
<p align="center"><strong><code>@capacitor-community/sqlite</code></strong></p>
<br>
<p align="center"><strong><code>this app uses Capacitor 6</code></strong></p>
<br>
<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2024?style=flat-square" />
  <a href="https://github.com/jepiqueau/ionic-react-test-issues"><img src="https://img.shields.io/github/license/jepiqueau/ionic-react-test-issues?style=flat-square" /></a>
  <a href="https://github.com/jepiqueau/ionic-react-test-issues"><img src="https://img.shields.io/github/package-json/v/jepiqueau/ionic-react-test-issues/master?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-1-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer        | GitHub                                    | Social |
| ----------------- | ----------------------------------------- | ------ |
| Quéau Jean Pierre | [jepiqueau](https://github.com/jepiqueau) |        |


## Installation

To start building your App using this Starter App, clone this repo to a new directory:

```bash
git clone https://github.com/jepiqueau/ionic-react-test-issues.git 
cd ionic-react-test-issues
git remote rm origin
```

 - then install it

```bash
npm install
```

## Scripts

These are the following platform's scripts that you can use to start the application

```json
  "scripts": {
    "dev": "npm run copy:sql:wasm && vite",
    "build:web": "npm run copy:sql:wasm && npm run build",
    "build:native": "npm run remove:sql:wasm && npm run build",
    "build": "tsc && vite build",
    "build:force": "rm -rf node_modules/.vite && vite build",
    "ios:start": "npm run build:native && npx cap sync && npx cap copy && npx cap open ios",
    "android:start": "npm run build:native && npx cap sync && npx cap copy && npx cap open android",
    "electron:install": "cd electron && npm install && cd ..",
    "electron:prepare": "npm run remove:sql:wasm && npm run build && npx cap sync @capacitor-community/electron && npx cap copy @capacitor-community/electron",
    "electron:start": "npm run electron:prepare && cd electron && npm run electron:start",
    "preview": "vite preview",
    "copy:sql:wasm": "copyfiles -u 3 node_modules/sql.js/dist/sql-wasm.wasm public/assets",
    "remove:sql:wasm": "rimraf public/assets/sql-wasm.wasm",
    "test.e2e": "cypress run",
    "test.unit": "vitest",
    "lint": "eslint"
  }
  ```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<p align="center">
  <a href="https://github.com/jepiqueau"><img src="https://github.com/jepiqueau.png?size=100" width="50" height="50" /></a>
</p>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
