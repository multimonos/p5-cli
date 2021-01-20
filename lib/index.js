#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _ArgumentError = _interopRequireDefault(require("./ArgumentError"));

var _Templates = _interopRequireDefault(require("./Command/Templates"));

var _Clone = _interopRequireDefault(require("./Command/Clone"));

var _appRootPath = _interopRequireDefault(require("app-root-path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const config = {
  templates: {
    path: `${_appRootPath.default}/templates`,
    default: "basic"
  }
};

_commander.default.version('0.1.0');

_commander.default.command('templates').alias('tpl').description('list available templates').action(cmd => {
  new _Templates.default().title('templates').run(config).close();
});

_commander.default.command('clone <template-name> [destination]').description('clone template intto target directory').action((tpl, dst, cmd) => {
  dst = dst || `./${tpl}`;
  new _Clone.default().title('clone').run(config, tpl, dst).close();
});

try {
  _commander.default.parse(process.argv);

  if (!process.argv.slice(2).length) {
    _commander.default.help();
  }
} catch (e) {
  if (e instanceof _ArgumentError.default) {
    console.log('error:', e.message);
  } else {
    throw e;
  }
}