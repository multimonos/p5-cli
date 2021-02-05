import program from "commander";
import ArgumentError from "./ArgumentError";
import TemplatesCommand from "./Command/Templates";
import CloneCommand from "./Command/Clone";
import ServeCommand from "./Command/Serve";
import config from "./config";
import ConfigCommand from "./Command/Config";
import DataServerCommand from "./Command/DataServer";



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
            .close()
    })

program
    .command('clone <template-name> [destination]')
    .description('clone template intto target directory')
    .action((tpl, dst, cmd) => {

        dst = dst || `./${tpl}`

        new CloneCommand()
            .title('clone')
            .run(config, tpl, dst)
            .close()
    })

program
    .command('config')
    .description('display the current config')
    .action((cmd)=>{
        new ConfigCommand()
            .title('config')
            .run(config)
            .close()
    })

program
    .command('serve <sketch-path>')
    .description('serve a sketch with parceljs')
    .action((sketchPath, cmd) => {

        new ServeCommand()
            .title('serve')
            .run(config, sketchPath)
            // .close()
    })

program
    .command('dataserver')
    .alias('data-server')
    .option('-p, --port <port>', 'port to listen on', 3000)
    .option('-d, --debug', 'port to listen on', false)
    .description('serve a sketch with parceljs')
    .action((cmd) => {
        new DataServerCommand()
            .title('data-server')
            .run(config, {
                debug: cmd.debug,
                port: cmd.port,
            })
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
