import program from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import logicon from 'log-utils';
import _ from 'lodash';
import copydir from 'copy-dir';
import mkdirp from 'mkdirp';
import { spawn } from 'child_process';
import APP_ROOT from 'app-root-path';
import findUp from 'find-up';

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
    console.log(chalk.magenta(`\n${title}:`));
    return this;
  }

  info(msg) {
    console.log(` ${logicon.info} ${msg}`);
    return this;
  }

  error(msg) {
    console.log(chalk.red(` ${logicon.error} ${msg}`));
    return this;
  }

  success(msg) {
    console.log(chalk.green(` ${logicon.success} ${msg}`));
    return this;
  }

  warning(msg) {
    console.log(chalk.yellow(` ${logicon.warning} ${msg}`));
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
      this.info(`${chalk.blue(path.basename(filepath))} -> ${filepath}`);
    });
    return this;
  }

  templatePaths(folder) {
    const paths = [];
    fs.readdirSync(folder).forEach(file => {
      const filepath = `${folder}/${file}`;

      if (fs.statSync(filepath).isDirectory()) {
        paths.push(fs.realpathSync(filepath));
      }
    });
    return paths;
  }

}

class CloneCommand extends Command {
  run(config, templateName, target) {
    const templates = this.templates(fs.realpathSync(config.templates.path));

    if (!this.has(templateName, templates)) {
      return this.error(`template not found ${templateName}`);
    }

    this.info(`cloning template ${chalk.blue(templateName)}`);
    target = this.createTargetFolder(target);
    const template = this.resolve(templateName, templates);
    this.clone(template.path, target);
    this.info(`To run sketch use: cd ${target} && npm install && npm run serve`);
    return this;
  }

  createTargetFolder(folder) {
    if (!fs.existsSync(folder)) {
      mkdirp(folder);
    } else {
      folder = this.autoIncrementFoldername(folder);
      mkdirp(folder);
    }

    return folder;
  }

  resolve(name, templates) {
    return _.find(templates, {
      "name": name
    });
  }

  has(name, templates) {
    return this.resolve(name, templates) !== undefined;
  }

  clone(src, dst) {
    copydir.sync(src, dst, {
      filter: (stat, filepath, filename) => {
        if (stat === 'file') {
          this.info(`copying ${filepath} -> ${chalk.green(dst + '/' + filename)}`);
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
    fs.readdirSync(dir).forEach(fname => {
      const fpath = `${dir}/${fname}`;

      if (fs.statSync(fpath).isDirectory()) {
        paths.push({
          name: fname,
          path: fs.realpathSync(fpath)
        });
      }
    });
    return paths;
  }

  autoIncrementFoldername(candidate) {
    let i = 1;
    let filepath = candidate;

    while (fs.existsSync(filepath)) {
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
    const entrydir = path.dirname(entrypoint);

    if (!entrypoint) {
      this.error('entry: missing entry point');
      this.error('...    expected <sketch-path> to be something like /path/to/sketch/index.html');
      return this;
    }

    const cmd = `${APP_ROOT}/node_modules/.bin/parcel ${entrypoint} --out-dir ${config.serve.output} --cache-dir ${config.serve.cache}`; // necessary to be specific with path otherwise spawn is very very slow

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
    src = fs.realpathSync(src);
    const stats = fs.lstatSync(src);

    if (stats.isFile()) {
      return src;
    }

    if (stats.isDirectory()) {
      const candidate = path.join(src, 'index.html');

      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  spawn(cmd) {
    spawn(cmd, {
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
  if (fs.existsSync(filepath)) {
    return fs.realpathSync(filepath);
  }

  return path.join(basedir, filepath);
};

const resolveMany = (object, paths, basedir) => {
  paths.forEach(path => {
    if (!_.has(object, path)) {
      return;
    }

    let old = _.get(object, path);

    let resolved = resolve(old, basedir);

    _.set(object, path, resolved);
  });
};

const projectPath = (startdir, configFilename) => {
  //search here
  if (fs.existsSync(path.join(startdir, configFilename))) {
    return startdir;
  } //search up


  const match = findUp.sync(configFilename, {
    type: 'file'
  });

  if (match) {
    return path.dirname(match);
  } //no local config, so, no "project"


  return undefined;
};

const localConfig = (dir, configFilename) => {
  if (dir && configFilename && fs.existsSync(path.join(dir, configFilename))) {
    return require(path.join(dir, configFilename));
  }

  return {};
}; // paths


appdir = APP_ROOT.path;
projectdir = projectPath(process.cwd(), CONFIG_FILENAME); // configs

const defaults = DefaultConfig;
const local = localConfig(projectdir, CONFIG_FILENAME); // get default config

resolveMany(defaults, ['templates.path'], appdir);
resolveMany(defaults, ['serve.output', 'serve.cache'], process.cwd()); // local config

if (local) {
  resolveMany(local, ['templates.path'], projectdir);
  resolveMany(local, ['serve.output', 'serve.cache'], projectdir);
} //merge


const config = _.defaultsDeep({}, local, defaults);

class ConfigCommand extends Command {
  run(config) {
    console.log(JSON.stringify(config, null, 4));
    return this;
  }

}

class DataServerCommand extends Command {
  run(config, options) {
    console.log("options:", options);

    require("p5-dataserver").serve(options);

    return this;
  }

}

program.version('0.1.0');
program.command('templates').alias('tpl').description('list available templates').action(cmd => {
  new TemplatesCommand().title('templates').run(config).close();
});
program.command('clone <template-name> [destination]').description('clone template intto target directory').action((tpl, dst, cmd) => {
  dst = dst || `./${tpl}`;
  new CloneCommand().title('clone').run(config, tpl, dst).close();
});
program.command('config').description('display the current config').action(cmd => {
  new ConfigCommand().title('config').run(config).close();
});
program.command('serve <sketch-path>').description('serve a sketch with parceljs').action((sketchPath, cmd) => {
  new ServeCommand().title('serve').run(config, sketchPath); // .close()
});
program.command('dataserver').alias('data-server').option('-p, --port <port>', 'port to listen on', 3000).option('-d, --debug', 'port to listen on', false).description('serve a sketch with parceljs').action(cmd => {
  new DataServerCommand().title('data-server').run(config, {
    debug: cmd.debug,
    port: cmd.port
  });
});

try {
  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }
} catch (e) {
  if (e instanceof ArgumentError) {
    console.log('error:', e.message);
  } else {
    throw e;
  }
}
//# sourceMappingURL=main.modern.js.map
