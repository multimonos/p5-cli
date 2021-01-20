import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import Command from "../Command";

export default class TemplatesCommand extends Command {

    run(config) {
        this.templatePaths(config.templates.path)
            .map(filepath => {
                console.log(`  ${chalk.blue(path.basename(filepath))} -> ${filepath}`)
            })
        console.log(`\nNote: use the ${chalk.yellow('clone')} command to clone a template using it's ${chalk.blue('alias')}`)

        return this
    }


    templatePaths(folder) {
        const paths = []
        fs.readdirSync(folder).forEach(file => {
            const filepath = `${folder}/${file}`
            if (fs.statSync(filepath).isDirectory()) {
                paths.push(fs.realpathSync(filepath))
            }
        });
        return paths;
    }

}