export class Parameter {
    public prefix: string;
    public value: string;
    public comment: string;

    constructor(value: string, prefix: string = "", comment: string = "") {
        this.prefix = prefix;
        this.value = value;
        this.comment = comment;
    }

    getLiteral(): string {
        let commentLiteral = "";
        if (this.comment.length) {
            commentLiteral = `/*${this.comment}*/`;
        }
        return `${this.prefix}${this.value}${commentLiteral}`;
    }
}
