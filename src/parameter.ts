export type ParameterValueType = boolean | number | string;

export class Parameter {
    public prefix: string;
    public value: ParameterValueType;
    public comment: string;

    constructor(value: ParameterValueType, prefix: string = "", comment: string = "") {
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

export type Parameters = Parameter[];
