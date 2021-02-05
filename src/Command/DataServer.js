
import Command from "../Command";

export default class DataServerCommand extends Command {
    run(config, options) {
        console.log("options:", options)
        require("p5-dataserver").serve(options)
        return this
    }
}
