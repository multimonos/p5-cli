import Command from "../Command";
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import copydir from 'copy-dir'
export default class CloneCommand extends Command {

    run(config, name, target) {
        const dst = path.join(target, name)
        const templates = this.templates(fs.realpathSync(config.templates.path))

        if ( ! this.has(name, templates)) {
            return this.error(`template not found ${name}`)
        }

        const tpl = this.resolve(name, templates)
        console.log(`  attempting to clone ${chalk.blue(name)} -> ${chalk.white(dst)}`)

        this.clone(tpl.path, dst)

        return this
    }

    resolve(name, templates) {
        return _.find(templates, {"name": name})
    }

    has(name, templates) {
        return this.resolve(name, templates) !== undefined
    }

    clone(src, dst) {

        dst = this.autoIncrementFoldername(dst)

        copydir.sync(src, dst, {
                filter: (stat, filepath, filename) => {
                    if (stat === 'file') {
                        console.log(`  copy: ${filepath} -> ${chalk.green(dst + '/' + filename)}`)
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
            console.log(chalk.red(`  exists: ${filepath}`))
            const tag = i.toString().padStart(2, '0');
            filepath = `${candidate}-${tag}`;
            i++;
        }

        console.log(chalk.green(`  target: ${filepath}`))

        return filepath
    }

}