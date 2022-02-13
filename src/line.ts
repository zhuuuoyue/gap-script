import { Parameter } from "./parameter";

export interface ILine {
    isValid(): boolean;
    isEmpty(): boolean;
    getLiteral(): string;
    clear(): void;
}

/**
 * Parameterized line
 */
export class ParameterizedLine implements ILine {
    public prefix: string;
    public module: string;
    public lineType: string;
    public parameters: Parameter[];

    constructor(module: string, lineType: string, parameters: Parameter[] = [], prefix: string = "") {
        this.prefix = prefix;
        this.module = module;
        this.lineType = lineType;
        this.parameters = parameters;
    }

    isValid(): boolean {
        return false;
    }

    isEmpty(): boolean {
        return this.prefix.length === 0 && this.module === "" && this.lineType === "" && this.parameters.length === 0;
    }

    getLiteral(paramSep: string = ","): string {
        let prefixLiteral = "";
        if (this.prefix.length) {
            prefixLiteral = `/*${this.prefix}*/ `;
        }
        return `${prefixLiteral}${this.module}.${this.lineType}(${this.getParameterLiteral(paramSep)});`;
    }

    clear(): void {
        this.prefix = "";
        this.module = "";
        this.lineType = "";
        this.parameters = [];
    }

    private getParameterLiteral(sep: string = ","): string {
        const segments: string[] = this.parameters.map((param) => {
            return param.getLiteral();
        });
        return segments.join(sep);
    }
}

/**
 * Parameter without parameterization
 * Empty line and comment line should be stored using RawLine.
 */
export class RawLine implements ILine {
    public content: string;

    constructor(content: string) {
        this.content = content;
    }

    isValid(): boolean {
        return true;
    }
    
    isEmpty(): boolean {
        return this.content.length === 0;
    }

    getLiteral(): string {
        return this.content;
    }
    
    clear(): void {
        this.content = "";
    }
}
