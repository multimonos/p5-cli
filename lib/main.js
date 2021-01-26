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
var require$$0 = require('util');

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
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

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

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

const pTry = (fn, ...arguments_) => new Promise(resolve => {
	resolve(fn(...arguments_));
});

var pTry_1 = pTry;
// TODO: remove this in the next major version
var _default = pTry;
pTry_1.default = _default;

const pLimit = concurrency => {
	if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
		return Promise.reject(new TypeError('Expected `concurrency` to be a number from 1 and up'));
	}

	const queue = [];
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.length > 0) {
			queue.shift()();
		}
	};

	const run = (fn, resolve, ...args) => {
		activeCount++;

		const result = pTry_1(fn, ...args);

		resolve(result);

		result.then(next, next);
	};

	const enqueue = (fn, resolve, ...args) => {
		if (activeCount < concurrency) {
			run(fn, resolve, ...args);
		} else {
			queue.push(run.bind(null, fn, resolve, ...args));
		}
	};

	const generator = (fn, ...args) => new Promise(resolve => enqueue(fn, resolve, ...args));
	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount
		},
		pendingCount: {
			get: () => queue.length
		},
		clearQueue: {
			value: () => {
				queue.length = 0;
			}
		}
	});

	return generator;
};

var pLimit_1 = pLimit;
var _default$1 = pLimit;
pLimit_1.default = _default$1;

class EndError extends Error {
	constructor(value) {
		super();
		this.value = value;
	}
}

// The input can also be a promise, so we await it
const testElement = async (element, tester) => tester(await element);

// The input can also be a promise, so we `Promise.all()` them both
const finder = async element => {
	const values = await Promise.all(element);
	if (values[1] === true) {
		throw new EndError(values[0]);
	}

	return false;
};

const pLocate = async (iterable, tester, options) => {
	options = {
		concurrency: Infinity,
		preserveOrder: true,
		...options
	};

	const limit = pLimit_1(options.concurrency);

	// Start all the promises concurrently with optional limit
	const items = [...iterable].map(element => [element, limit(testElement, element, tester)]);

	// Check the promises either serially or concurrently
	const checkLimit = pLimit_1(options.preserveOrder ? 1 : Infinity);

	try {
		await Promise.all(items.map(element => checkLimit(finder, element)));
	} catch (error) {
		if (error instanceof EndError) {
			return error.value;
		}

		throw error;
	}
};

var pLocate_1 = pLocate;
// TODO: Remove this for the next major release
var _default$2 = pLocate;
pLocate_1.default = _default$2;

const {promisify} = require$$0__default['default'];


const fsStat = promisify(fs__default['default'].stat);
const fsLStat = promisify(fs__default['default'].lstat);

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile'
};

function checkType({type}) {
	if (type in typeMappings) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();

var locatePath = async (paths, options) => {
	options = {
		cwd: process.cwd(),
		type: 'file',
		allowSymlinks: true,
		...options
	};
	checkType(options);
	const statFn = options.allowSymlinks ? fsStat : fsLStat;

	return pLocate_1(paths, async path_ => {
		try {
			const stat = await statFn(path__default['default'].resolve(options.cwd, path_));
			return matchType(options.type, stat);
		} catch (_) {
			return false;
		}
	}, options);
};

var sync = (paths, options) => {
	options = {
		cwd: process.cwd(),
		allowSymlinks: true,
		type: 'file',
		...options
	};
	checkType(options);
	const statFn = options.allowSymlinks ? fs__default['default'].statSync : fs__default['default'].lstatSync;

	for (const path_ of paths) {
		try {
			const stat = statFn(path__default['default'].resolve(options.cwd, path_));

			if (matchType(options.type, stat)) {
				return path_;
			}
		} catch (_) {
		}
	}
};
locatePath.sync = sync;

const {promisify: promisify$1} = require$$0__default['default'];

const pAccess = promisify$1(fs__default['default'].access);

var pathExists = async path => {
	try {
		await pAccess(path);
		return true;
	} catch (_) {
		return false;
	}
};

var sync$1 = path => {
	try {
		fs__default['default'].accessSync(path);
		return true;
	} catch (_) {
		return false;
	}
};
pathExists.sync = sync$1;

var findUp = createCommonjsModule(function (module) {




const stop = Symbol('findUp.stop');

module.exports = async (name, options = {}) => {
	let directory = path__default['default'].resolve(options.cwd || '');
	const {root} = path__default['default'].parse(directory);
	const paths = [].concat(name);

	const runMatcher = async locateOptions => {
		if (typeof name !== 'function') {
			return locatePath(paths, locateOptions);
		}

		const foundPath = await name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const foundPath = await runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path__default['default'].resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path__default['default'].dirname(directory);
	}
};

module.exports.sync = (name, options = {}) => {
	let directory = path__default['default'].resolve(options.cwd || '');
	const {root} = path__default['default'].parse(directory);
	const paths = [].concat(name);

	const runMatcher = locateOptions => {
		if (typeof name !== 'function') {
			return locatePath.sync(paths, locateOptions);
		}

		const foundPath = name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath.sync([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const foundPath = runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path__default['default'].resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path__default['default'].dirname(directory);
	}
};

module.exports.exists = pathExists;

module.exports.sync.exists = pathExists.sync;

module.exports.stop = stop;
});

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


  const match = findUp.sync(configFilename, {
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
