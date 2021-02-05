var program = require('commander');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var logicon = require('log-utils');
var _ = require('lodash');
var copydir = require('copy-dir');
var mkdirp = require('mkdirp');
var child_process = require('child_process');
var APP_ROOT = require('app-root-path');
var findUp = require('find-up');
var dataserver = require('@multimonos/p5-dataserver');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var program__default = /*#__PURE__*/_interopDefaultLegacy(program);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var logicon__default = /*#__PURE__*/_interopDefaultLegacy(logicon);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);
var copydir__default = /*#__PURE__*/_interopDefaultLegacy(copydir);
var mkdirp__default = /*#__PURE__*/_interopDefaultLegacy(mkdirp);
var APP_ROOT__default = /*#__PURE__*/_interopDefaultLegacy(APP_ROOT);
var findUp__default = /*#__PURE__*/_interopDefaultLegacy(findUp);
var dataserver__default = /*#__PURE__*/_interopDefaultLegacy(dataserver);

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

class ServeCommand extends Command {
  run(config, entry) {
    const entrypoint = this.guessEntrypoint(entry);
    const entrydir = path__default['default'].dirname(entrypoint);

    if (!entrypoint) {
      this.error('entry: missing entry point');
      this.error('...    expected <sketch-path> to be something like /path/to/sketch/index.html');
      return this;
    }

    const cmd = `${APP_ROOT__default['default']}/node_modules/.bin/parcel ${entrypoint} --out-dir ${config.serve.output} --cache-dir ${config.serve.cache}`; // necessary to be specific with path otherwise spawn is very very slow

    this.info(`entry: ${entrypoint}`);
    this.info(`${cmd}`);
    this.success('building files ... ( this might take a while )');
    this.spawn(cmd);
    return this;
  }

  outputDirectory(src) {
    return src;
  }

  guessEntrypoint(src) {
    src = fs__default['default'].realpathSync(src);
    const stats = fs__default['default'].lstatSync(src);

    if (stats.isFile()) {
      return src;
    }

    if (stats.isDirectory()) {
      const candidate = path__default['default'].join(src, 'index.html');

      if (fs__default['default'].existsSync(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  spawn(cmd) {
    child_process.spawn(cmd, {
      stdio: 'inherit',
      shell: true
    });
  }

}

var templates = {
	path: "templates",
	"default": "basic"
};
var serve = {
	output: "dist",
	cache: ".cache"
};
var DefaultConfig = {
	templates: templates,
	serve: serve
};

const CONFIG_FILENAME = 'p5-cli.config.json';

const resolve = (filepath, basedir) => {
  if (fs__default['default'].existsSync(filepath)) {
    return fs__default['default'].realpathSync(filepath);
  }

  return path__default['default'].join(basedir, filepath);
};

const resolveMany = (object, paths, basedir) => {
  paths.forEach(path => {
    if (!___default['default'].has(object, path)) {
      return;
    }

    let old = ___default['default'].get(object, path);

    let resolved = resolve(old, basedir);

    ___default['default'].set(object, path, resolved);
  });
};

const projectPath = (startdir, configFilename) => {
  //search here
  if (fs__default['default'].existsSync(path__default['default'].join(startdir, configFilename))) {
    return startdir;
  } //search up


  const match = findUp__default['default'].sync(configFilename, {
    type: 'file'
  });

  if (match) {
    return path__default['default'].dirname(match);
  } //no local config, so, no "project"


  return undefined;
};

const localConfig = (dir, configFilename) => {
  if (dir && configFilename && fs__default['default'].existsSync(path__default['default'].join(dir, configFilename))) {
    return require(path__default['default'].join(dir, configFilename));
  }

  return {};
}; // paths


appdir = APP_ROOT__default['default'].path;
projectdir = projectPath(process.cwd(), CONFIG_FILENAME); // configs

const defaults = DefaultConfig;
const local = localConfig(projectdir, CONFIG_FILENAME); // get default config

resolveMany(defaults, ['templates.path'], appdir);
resolveMany(defaults, ['serve.output', 'serve.cache'], process.cwd()); // local config

if (local) {
  resolveMany(local, ['templates.path'], projectdir);
  resolveMany(local, ['serve.output', 'serve.cache'], projectdir);
} //merge


const config = ___default['default'].defaultsDeep({}, local, defaults);

class ConfigCommand extends Command {
  run(config) {
    console.log(JSON.stringify(config, null, 4));
    return this;
  }

}

class DataServerCommand extends Command {
  run(config, options) {
    console.log("options:", options);
    dataserver__default['default'].serve(options);
    return this;
  }

}

program__default['default'].version('0.1.0');
program__default['default'].command('templates').alias('tpl').description('list available templates').action(cmd => {
  new TemplatesCommand().title('templates').run(config).close();
});
program__default['default'].command('clone <template-name> [destination]').description('clone template intto target directory').action((tpl, dst, cmd) => {
  dst = dst || `./${tpl}`;
  new CloneCommand().title('clone').run(config, tpl, dst).close();
});
program__default['default'].command('config').description('display the current config').action(cmd => {
  new ConfigCommand().title('config').run(config).close();
});
program__default['default'].command('serve <sketch-path>').description('serve a sketch with parceljs').action((sketchPath, cmd) => {
  new ServeCommand().title('serve').run(config, sketchPath); // .close()
});
program__default['default'].command('dataserver').alias('data-server').option('-p, --port <port>', 'port to listen on', 3000).option('-d, --debug', 'port to listen on', false).description('serve a sketch with parceljs').action(cmd => {
  new DataServerCommand().title('data-server').run(config, {
    debug: cmd.debug,
    port: cmd.port
  });
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
