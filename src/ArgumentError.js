export default class ArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArgumentError';
    }
}
