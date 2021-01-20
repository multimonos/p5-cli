import chalk from 'chalk'
import logicon from 'log-utils'

export default class Command {

    run(config) {
        console.log("first argument to run() is always 'config'")
        return this
    }

    title(title) {
        console.log(chalk.blue(`\n${title}:`))
        return this
    }

    info(msg) {
        console.log(` ${logicon.info} ${msg}`)
        return this
    }
    error(msg) {
        console.log(chalk.red(` ${logicon.error} ${msg}`))
        return this
    }

    success(msg) {
        console.log(chalk.green(` ${logicon.success} ${msg}`))
        return this
    }

    warning(msg) {
        console.log(chalk.yellow(` ${logicon.warning} ${msg}`))
        return this
    }
}