import _ from "lodash";
import { ILine, LineType, ModuleName, ParameterizedLine, RawLine } from "./line";
import { Parameter } from "./parameter";

const FULL_LINE_PATTERN: RegExp = /^\/\*(\[\d{4}-[\s\d]{1}\d-[\s\d]{1}\d\s[\s\d]{1}\d:[\s\d]{1}\d:[\s\d]{1}\d\([\s\d]{3}\)\])\*\/\s(.*);$/;
const PURE_LINE_PATTERN: RegExp = /^(Jrn[a-zA-Z]{3}).([a-zA-Z]+)\((.*)\)/;
const PARAMETER_SPLITTER: RegExp = /,\s?/;
const PARAMETERS_PATTERN: RegExp = /^(.*)(\/\*(.*)\*\/)/;

function isString(parameter: string): boolean {
    return parameter.startsWith("\"") && parameter.endsWith("\"");
}

function isStringBegin(parameter: string): boolean {
    return parameter.startsWith("\"") && !parameter.endsWith("\"");
}

function isStringEnd(parameter: string): boolean {
    return !parameter.startsWith("\"") && parameter.endsWith("\"");
}

/**
 * Parse parameter
 * @param parameterLiteral parameter value literal
 * @param prefix prefix string in front of parameter value literal
 * @returns parsed parameter
 */
function parseParameter(parameterLiteral: string, prefix: string = ""): Parameter {
    let valueLiteral: string = parameterLiteral;
    let comment: string = "";
    if (parameterLiteral.endsWith("*/")) {
        const matchResult = parameterLiteral.match(PARAMETERS_PATTERN);
        if (!_.isNull(matchResult)) {
            if (!_.isNull(matchResult[1])) {
                valueLiteral = matchResult[1];
            }
            if (!_.isNull(matchResult[3])) {
                comment = matchResult[3];
            }
        }    
    }
    return new Parameter(valueLiteral, prefix, comment);
}

/**
 * Parse parameter literal and return parameter list
 * @param parameterLiteral a string representing parameter literal
 * @returns parameters
 */
function parseParameters(parameterLiteral: string): Parameter[] {
    let segments: string[] = parameterLiteral.split(PARAMETER_SPLITTER);
    let groups: string[][] = [];
    for (let i = 0; i < segments.length; ++i) {
        let segment: string = segments[i];
        if (isStringBegin(segment)) {
            let temp: string[] = [];
            for (; i < segments.length; ++i) {
                segment = segments[i];
                temp.push(segment);
                if (isStringEnd(segment)) {
                    break;
                }
            }
            groups.push(temp);
        } else {
            groups.push([segment]);
        }
    }
    segments = groups.map((group) => {
        return 1 === group.length ? group[0] : group.join(",");
    });
    if (0 === segments.length) {
        return [];
    }

    let parameters: Parameter[] = [parseParameter(segments[0])];
    let len: number = segments[0].length;
    for (let i = 1; i < segments.length; ++i) {
        ++len;
        let prefix: string = "";
        if (parameterLiteral[len] === " ") {
            ++len;
            prefix = " ";
        }
        parameters.push(parseParameter(segments[i], prefix));
        len += segments[i].length;
    }

    return parameters;
}

/**
 * Parse given line literal and return parsed line
 * @param line a string representing line literal
 * @returns parsed line, including parameterized line and raw line
 */
export function parseLine(line: string): ILine {
    let prefix: string = "";
    let pure: string = line;
    if (line.startsWith("/*")) {
        const matchResult = line.match(FULL_LINE_PATTERN);
        if (!_.isNull(matchResult)) {
            prefix = matchResult[1];
            pure = matchResult[2];
        }
    }
    if (!pure.startsWith("//")) {
        const matchResult = pure.match(PURE_LINE_PATTERN);
        if (!_.isNull(matchResult)) {
            const mod: ModuleName = matchResult[1] as ModuleName;
            const lineType: LineType = matchResult[2] as LineType;
            const parameterLiteral: string = matchResult[3] as string;
            const parameters: Parameter[] = parseParameters(parameterLiteral);
            return new ParameterizedLine(mod, lineType, parameters, prefix);
        }
    }
    return new RawLine(line);
}
