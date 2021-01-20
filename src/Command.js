import chalk from 'chalk'

export default class Command {


    run(config,) {
        console.log("first argument to run() is always 'config'")
        return this
    }

    title(title) {
        console.log(chalk.yellow(`\n${title}:`))
        return this
    }

    error(err) {
        console.log(chalk.red(`! ${err}`))
        return this
    }
}