
import Command from "../Command";
import dataserver from "@multimonos/p5-dataserver"

export default class DataServerCommand extends Command {
    run(config, options) {
        console.log("options:", options)
        dataserver.serve(options)
        return this
    }
}
