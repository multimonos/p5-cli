"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _Command = _interopRequireDefault(require("../Command"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TemplatesCommand extends _Command.default {
  run(config) {
    this.templatePaths(config.templates.path).map(filepath => {
      this.info(`${_chalk.default.blue(_path.default.basename(filepath))} -> ${filepath}`);
    });
    return this;
  }

  templatePaths(folder) {
    const paths = [];

    _fs.default.readdirSync(folder).forEach(file => {
      const filepath = `${folder}/${file}`;

      if (_fs.default.statSync(filepath).isDirectory()) {
        paths.push(_fs.default.realpathSync(filepath));
      }
    });

    return paths;
  }

}

exports.default = TemplatesCommand;