import Command from "../Command";
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import copydir from 'copy-dir'
import mkdirp from 'mkdirp'

export default class CloneCommand extends Command {

    run(config, templateName, target) {
        const templates = this.templates(fs.realpathSync(config.templates.path))

        if ( ! this.has(templateName, templates)) {
            return this.error(`template not found ${templateName}`)
        }

        this.info(`cloning template ${chalk.blue(templateName)}`)

        target = this.createTargetFolder(target)

        const template = this.resolve(templateName, templates)

        this.clone(template.path, target)

        this.info(`To run sketch use: cd ${target} && npm install && npm run serve`)

        return this
    }

    createTargetFolder(folder) {

        if ( ! fs.existsSync(folder)) {
            mkdirp(folder)

        } else {
            folder = this.autoIncrementFoldername(folder)
            mkdirp(folder)
        }

        return folder
    }

    resolve(name, templates) {
        return _.find(templates, {"name": name})
    }

    has(name, templates) {
        return this.resolve(name, templates) !== undefined
    }

    clone(src, dst) {
        copydir.sync(src, dst, {
                filter: (stat, filepath, filename) => {
                    if (stat === 'file') {
                        this.info(`copying ${filepath} -> ${chalk.green(dst + '/' + filename)}`)
                    }
                    return true
                }
            }
        )
    }

    templateNames(dir) {
        return this.templates(dir).map(tpl => tpl.name)
    }

    templates(dir) {
        const paths = []
        fs.readdirSync(dir).forEach(fname => {
            const fpath = `${dir}/${fname}`
            if (fs.statSync(fpath).isDirectory()) {
                paths.push({name: fname, path: fs.realpathSync(fpath)})
            }
        });
        return paths;
    }

    autoIncrementFoldername(candidate) {
        let i = 1;
        let filepath = candidate;

        while (fs.existsSync(filepath)) {
            this.warning(`exists ${filepath}`)
            const tag = i.toString().padStart(2, '0');
            filepath = `${candidate}-${tag}`;
            i++;
        }

        this.success(`target ${filepath}`)

        return filepath
    }

}