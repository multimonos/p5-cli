import DefaultConfig from "./p5-cli.config.json";
import findUp from 'find-up'
import apppath from 'app-root-path'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

const CONFIG_FILENAME = 'p5-cli.config.json'

const resolve = (filepath, basedir) => {
    if (fs.existsSync(filepath)) {
        return fs.realpathSync(filepath)
    }
    return path.join(basedir, filepath)
    console.log('filepath:', filepath, 'not found')
    const candidate = path.join(basedir, filepath)

    if (fs.existsSync(candidate)) {
        return fs.realpathSync(candidate)
    }

    return filepath
}

const resolveMany = (object, paths, basedir) => {
    paths.forEach(path => {
        if ( ! _.has(object, path)) {
            return
        }
        let old = _.get(object, path)
        let resolved = resolve(old, basedir)
        _.set(object, path, resolved)
    })
}

const projectPath = (startdir, configFilename) => {
    //search here
    if (fs.existsSync(path.join(startdir, configFilename))) {
        return startdir
    }
    //search up
    const match = findUp.sync(configFilename, {type: 'file'})
    if (match) {
        return path.dirname(match)
    }
    //no local config, so, no "project"
    return undefined
}

const localConfig = (dir, configFilename) => {
    if (dir && configFilename && fs.existsSync(path.join(dir, configFilename))) {
        return require(path.join(dir, configFilename))
    }
    return {}
}

// paths
appdir = apppath.path
projectdir = projectPath(process.cwd(), CONFIG_FILENAME)

// configs
const defaults = DefaultConfig
const local = localConfig(projectdir, CONFIG_FILENAME)

// get default config
resolveMany(defaults, ['templates.path'], appdir)
resolveMany(defaults, ['serve.output', 'serve.cache'], process.cwd())

// local config
if (local) {
    resolveMany(local, ['templates.path'], projectdir)
    resolveMany(local, ['serve.output','serve.cache'], projectdir)
}

//merge
const config = _.defaultsDeep({}, local, defaults)

export default config
