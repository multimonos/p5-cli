
import Command from "../Command";

export default class ConfigCommand extends Command {
    run(config) {
        console.log(JSON.stringify(config,null, 4))
        return this
    }
}
