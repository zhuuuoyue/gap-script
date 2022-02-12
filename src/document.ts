import { readFileSync, writeFileSync } from "fs";
import { ILine } from "./line";
import { parseLine } from "./parser";

export class Document {
    public filename: string;
    public lines: ILine[];

    constructor() {
        this.filename = "";
        this.lines = [];
    }

    open(filename: string): void {
        this.load(filename);
        this.filename = filename;
    }

    load(filename: string): void {
        const raw = readFileSync(filename, {
            encoding: "utf-8"
        });
        const lines = raw.split("\r\n");
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            this.lines.push(parseLine(line));
        }
    }

    close(): void {
        this.clear();
    }

    save(): void {
        this.saveAs(this.filename);
    }

    saveAs(filename: string): void {
        const segments = this.getLineLiterals();
        const content = segments.join("\n");
        writeFileSync(filename, content);
    }

    getLineLiterals(): string[] {
        return this.lines.map((line) => {
            return line.getLiteral();
        });
    }

    clear(): void {
        this.lines = [];
        this.filename = "";
    }
}
