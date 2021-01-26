import Command from "../Command";
import fs from 'fs'
import path from 'path'
import {spawn, exec} from "child_process";
import APP_ROOT from 'app-root-path'


export default class ServeCommand extends Command {

    run(config, entry) {
        const entrypoint = this.guessEntrypoint(entry)
        const entrydir = path.dirname(entrypoint)

        if ( ! entrypoint) {
            this.error('entry: missing entry point')
            this.error('...    expected <sketch-path> to be something like /path/to/sketch/index.html')
            return this
        }

        const cmd = `${APP_ROOT}/node_modules/.bin/parcel ${entrypoint} --out-dir ${config.serve.output} --cache-dir ${config.serve.cache}` // necessary to be specific with path otherwise spawn is very very slow

        this.info(`entry: ${entrypoint}`)
        this.info(`${cmd}`)
        this.success('building files ... ( this might take a while )')

        this.spawn(cmd)

        return this
    }

    outputDirectory(src) {
        return src
    }

    guessEntrypoint(src) {
        src = fs.realpathSync(src)

        const stats = fs.lstatSync(src)

        if (stats.isFile()) {
            return src
        }

        if (stats.isDirectory()) {
            const candidate = path.join(src, 'index.html')

            if (fs.existsSync(candidate)) {
                return candidate
            }
        }

        return undefined
    }

    spawn(cmd) {
        spawn(cmd, {
            stdio: 'inherit',
            shell: true
        })
    }

}