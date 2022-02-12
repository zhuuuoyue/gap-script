import { Parameter } from "./parameter";

export type ModuleName = ""
    | "JrnWdt"
    | "JrnCmd"
    | "JrnDbg";
export type LineType = ""
    | "Empty"
    | "Comment"
    | "MousePress"
    | "MouseRelease"
    | "MouseDoubleClick"
    | "KeyDown"
    | "KeyUp"
    | "KeyPress"
    | "EditText"
    | "ProcessCommand"
    | "MouseMove"
    | "LButtonDown"
    | "LButtonUp"
    | "RButtonDown"
    | "RButtonUp"
    | "CompareExpectedResult";

export interface ILine {
    isValid(): boolean;
    getLiteral(): string;
    clear(): void;
}

export class ParameterizedLine implements ILine {
    public prefix: string;
    public module: ModuleName;
    public lineType: LineType;
    public parameters: Parameter[];

    constructor(module: ModuleName, lineType: LineType, parameters: Parameter[] = [], prefix: string = "") {
        this.prefix = prefix;
        this.module = module;
        this.lineType = lineType;
        this.parameters = parameters;
    }

    isValid(): boolean {
        return false;
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

export class RawLine implements ILine {
    public content: string;

    constructor(content: string) {
        this.content = content;
    }

    isValid(): boolean {
        return true;
    }
    
    getLiteral(): string {
        return this.content;
    }
    
    clear(): void {
        this.content = "";
    }
}

export type Line = ParameterizedLine | RawLine;
export type Lines = Line[];
