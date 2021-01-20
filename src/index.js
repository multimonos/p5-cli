#!/usr/bin/env node

import program from "commander";
import ArgumentError from "./ArgumentError";
import TemplatesCommand from "./Command/Templates";
import CloneCommand from "./Command/Clone";
import APP_PATH from 'app-root-path'

const config = {
    templates: {
        path: `${APP_PATH}/templates`,
        default: "basic"
    }
}

program
    .version('0.1.0')

program
    .command('templates')
    .alias('tpl')
    .description('list available templates')
    .action((cmd) => {
        new TemplatesCommand()
            .title('templates')
            .run(config)
    })

program
    .command('clone <template> <destination>')
    .description('clone template to local directory')
    .action((tpl, dst, cmd) => {
        new CloneCommand()
            .title('clone')
            .run(config, tpl, dst)
    })


try {
    program.parse(process.argv);

    if ( ! process.argv.slice(2).length) {
        program.help();
    }

} catch (e) {
    if (e instanceof ArgumentError) {
        console.log('error:', e.message);
    } else {
        throw e;
    }
}
