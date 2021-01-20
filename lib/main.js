var program = require('commander');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var logicon = require('log-utils');
var _ = require('lodash');
var copydir = require('copy-dir');
var mkdirp = require('mkdirp');
var APP_PATH = require('app-root-path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var program__default = /*#__PURE__*/_interopDefaultLegacy(program);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var logicon__default = /*#__PURE__*/_interopDefaultLegacy(logicon);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);
var copydir__default = /*#__PURE__*/_interopDefaultLegacy(copydir);
var mkdirp__default = /*#__PURE__*/_interopDefaultLegacy(mkdirp);
var APP_PATH__default = /*#__PURE__*/_interopDefaultLegacy(APP_PATH);

class ArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ArgumentError';
  }

}

class Command {
  run(config) {
    console.log("first argument to run() is always 'config'");
    return this;
  }

  title(title) {
    console.log(chalk__default['default'].magenta(`\n${title}:`));
    return this;
  }

  info(msg) {
    console.log(` ${logicon__default['default'].info} ${msg}`);
    return this;
  }

  error(msg) {
    console.log(chalk__default['default'].red(` ${logicon__default['default'].error} ${msg}`));
    return this;
  }

  success(msg) {
    console.log(chalk__default['default'].green(` ${logicon__default['default'].success} ${msg}`));
    return this;
  }

  warning(msg) {
    console.log(chalk__default['default'].yellow(` ${logicon__default['default'].warning} ${msg}`));
    return this;
  }

  close() {
    this.success('done\n');
    return this;
  }

}

class TemplatesCommand extends Command {
  run(config) {
    this.templatePaths(config.templates.path).map(filepath => {
      this.info(`${chalk__default['default'].blue(path__default['default'].basename(filepath))} -> ${filepath}`);
    });
    return this;
  }

  templatePaths(folder) {
    const paths = [];
    fs__default['default'].readdirSync(folder).forEach(file => {
      const filepath = `${folder}/${file}`;

      if (fs__default['default'].statSync(filepath).isDirectory()) {
        paths.push(fs__default['default'].realpathSync(filepath));
      }
    });
    return paths;
  }

}

class CloneCommand extends Command {
  run(config, templateName, target) {
    const templates = this.templates(fs__default['default'].realpathSync(config.templates.path));

    if (!this.has(templateName, templates)) {
      return this.error(`template not found ${templateName}`);
    }

    this.info(`cloning template ${chalk__default['default'].blue(templateName)}`);
    target = this.createTargetFolder(target);
    const template = this.resolve(templateName, templates);
    this.clone(template.path, target);
    this.info(`To run sketch use: cd ${target} && npm install && npm run serve`);
    return this;
  }

  createTargetFolder(folder) {
    if (!fs__default['default'].existsSync(folder)) {
      mkdirp__default['default'](folder);
    } else {
      folder = this.autoIncrementFoldername(folder);
      mkdirp__default['default'](folder);
    }

    return folder;
  }

  resolve(name, templates) {
    return ___default['default'].find(templates, {
      "name": name
    });
  }

  has(name, templates) {
    return this.resolve(name, templates) !== undefined;
  }

  clone(src, dst) {
    copydir__default['default'].sync(src, dst, {
      filter: (stat, filepath, filename) => {
        if (stat === 'file') {
          this.info(`copying ${filepath} -> ${chalk__default['default'].green(dst + '/' + filename)}`);
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
    fs__default['default'].readdirSync(dir).forEach(fname => {
      const fpath = `${dir}/${fname}`;

      if (fs__default['default'].statSync(fpath).isDirectory()) {
        paths.push({
          name: fname,
          path: fs__default['default'].realpathSync(fpath)
        });
      }
    });
    return paths;
  }

  autoIncrementFoldername(candidate) {
    let i = 1;
    let filepath = candidate;

    while (fs__default['default'].existsSync(filepath)) {
      this.warning(`exists ${filepath}`);
      const tag = i.toString().padStart(2, '0');
      filepath = `${candidate}-${tag}`;
      i++;
    }

    this.success(`target ${filepath}`);
    return filepath;
  }

}

const config = {
  templates: {
    path: `${APP_PATH__default['default']}/templates`,
    default: "basic"
  }
};
program__default['default'].version('0.1.0');
program__default['default'].command('templates').alias('tpl').description('list available templates').action(cmd => {
  new TemplatesCommand().title('templates').run(config).close();
});
program__default['default'].command('clone <template-name> [destination]').description('clone template intto target directory').action((tpl, dst, cmd) => {
  dst = dst || `./${tpl}`;
  new CloneCommand().title('clone').run(config, tpl, dst).close();
});

try {
  program__default['default'].parse(process.argv);

  if (!process.argv.slice(2).length) {
    program__default['default'].help();
  }
} catch (e) {
  if (e instanceof ArgumentError) {
    console.log('error:', e.message);
  } else {
    throw e;
  }
}
//# sourceMappingURL=main.js.map
