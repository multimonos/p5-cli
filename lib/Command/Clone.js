"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Command = _interopRequireDefault(require("../Command"));

var _chalk = _interopRequireDefault(require("chalk"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _copyDir = _interopRequireDefault(require("copy-dir"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CloneCommand extends _Command.default {
  run(config, templateName, target) {
    const templates = this.templates(_fs.default.realpathSync(config.templates.path));

    if (!this.has(templateName, templates)) {
      return this.error(`template not found ${templateName}`);
    }

    this.info(`cloning template ${_chalk.default.blue(templateName)}`);
    target = this.createTargetFolder(target);
    const template = this.resolve(templateName, templates);
    this.clone(template.path, target);
    this.info(`To run sketch use: cd ${target} && npm install && npm run serve`);
    return this;
  }

  createTargetFolder(folder) {
    if (!_fs.default.existsSync(folder)) {
      (0, _mkdirp.default)(folder);
    } else {
      folder = this.autoIncrementFoldername(folder);
      (0, _mkdirp.default)(folder);
    }

    return folder;
  }

  resolve(name, templates) {
    return _lodash.default.find(templates, {
      "name": name
    });
  }

  has(name, templates) {
    return this.resolve(name, templates) !== undefined;
  }

  clone(src, dst) {
    _copyDir.default.sync(src, dst, {
      filter: (stat, filepath, filename) => {
        if (stat === 'file') {
          this.info(`copying ${filepath} -> ${_chalk.default.green(dst + '/' + filename)}`);
        }

        return true;
      }
    });
  }

  templateNames(dir) {
    return this.templates(dir).map(tpl => tpl.name);
  }

  templates(dir) {
    const paths = [];

    _fs.default.readdirSync(dir).forEach(fname => {
      const fpath = `${dir}/${fname}`;

      if (_fs.default.statSync(fpath).isDirectory()) {
        paths.push({
          name: fname,
          path: _fs.default.realpathSync(fpath)
        });
      }
    });

    return paths;
  }

  autoIncrementFoldername(candidate) {
    let i = 1;
    let filepath = candidate;

    while (_fs.default.existsSync(filepath)) {
      this.warning(`exists ${filepath}`);
      const tag = i.toString().padStart(2, '0');
      filepath = `${candidate}-${tag}`;
      i++;
    }

    this.success(`target ${filepath}`);
    return filepath;
  }

}

exports.default = CloneCommand;