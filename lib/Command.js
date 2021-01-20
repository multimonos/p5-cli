"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _logUtils = _interopRequireDefault(require("log-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Command {
  run(config) {
    console.log("first argument to run() is always 'config'");
    return this;
  }

  title(title) {
    console.log(_chalk.default.magenta(`\n${title}:`));
    return this;
  }

  info(msg) {
    console.log(` ${_logUtils.default.info} ${msg}`);
    return this;
  }

  error(msg) {
    console.log(_chalk.default.red(` ${_logUtils.default.error} ${msg}`));
    return this;
  }

  success(msg) {
    console.log(_chalk.default.green(` ${_logUtils.default.success} ${msg}`));
    return this;
  }

  warning(msg) {
    console.log(_chalk.default.yellow(` ${_logUtils.default.warning} ${msg}`));
    return this;
  }

  close() {
    this.success('done\n');
    return this;
  }

}

exports.default = Command;