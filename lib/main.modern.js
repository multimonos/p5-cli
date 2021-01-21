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
  run(config, sketchPath) {
    this.info(`path: ${sketchPath}`);
    const entrypoint = this.guessEntrypoint(sketchPath);

    if (!entrypoint) {
      this.error('entry: missing entry point');
      this.error('...    expected <sketch-path> to be something like /path/to/sketch/index.html');
      return this;
    }

    this.info(`entry: ${entrypoint}`);
    this.success('building files ... ( this may take a while )'); // this.exec(entrypoint)

    this.spawn(entrypoint);
    return this;
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

  spawn(src) {
    this.info('using spawn()');
    const parcel = `${APP_ROOT}/node_modules/.bin/parcel`; // necessary speed enhancement otherwise spawn is very very slow

    const cmd = spawn(`${parcel} ${src}`, {
      stdio: 'inherit',
      shell: true
    });
  }

}

const config = {
  templates: {
    path: `${APP_ROOT}/templates`,
    default: "basic"
  }
};
program.version('0.1.0');
program.command('templates').alias('tpl').description('list available templates').action(cmd => {
  new TemplatesCommand().title('templates').run(config).close();
});
program.command('clone <template-name> [destination]').description('clone template intto target directory').action((tpl, dst, cmd) => {
  dst = dst || `./${tpl}`;
  new CloneCommand().title('clone').run(config, tpl, dst).close();
});
program.command('serve <sketch-path>').description('serve a sketch with parceljs').action((sketchPath, cmd) => {
  new ServeCommand().title('serve').run(config, sketchPath); // .close()
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
