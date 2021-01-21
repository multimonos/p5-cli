import Command from "../Command";
import fs from 'fs'
import path from 'path'
import {spawn, exec} from "child_process";
import APP_ROOT from 'app-root-path'


export default class ServeCommand extends Command {

    run(config, sketchPath) {
        this.info(`path: ${sketchPath}`)
        const entrypoint = this.guessEntrypoint(sketchPath)

        if ( ! entrypoint) {
            this.error('entry: missing entry point')
            this.error('...    expected <sketch-path> to be something like /path/to/sketch/index.html')
            return this
        }

        this.info(`entry: ${entrypoint}`)
        this.success('building files ... ( this may take a while )')

        // this.exec(entrypoint)
        this.spawn(entrypoint)

        return this
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

    spawn(src) {
        this.info('using spawn()')
        const parcel = `${APP_ROOT}/node_modules/.bin/parcel` // necessary speed enhancement otherwise spawn is very very slow
        const cmd = spawn(`${parcel} ${src}`, {
            stdio: 'inherit',
            shell: true
        })
    }

}