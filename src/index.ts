import fs from "fs";
import os from "os";
import _ from "lodash";

/**
 * 容器
 */
interface Container {
  /**
   * 是否为空
   */
  isEmpty(): boolean;

  /**
   * 清空
   */
  clear(): void;
}

/**
 * 支持序列化
 */
interface Serializable {
  /**
   * 转换为字符串
   */
  toString(): string;
}

/**
 * 带有有效性验证器
 */
interface WithValidator {
  /**
   * 是否有效
   */
  isValid(): boolean;
}

/**
 * 参数
 */
export interface Parameter extends Serializable, Container, WithValidator {}

/**
 * 解析过的参数
 */
export class ParsedParameter implements Parameter {
  public prefix: string; // 参数值前缀，可能有空格
  public value: string; // 参数值
  public suffix: string; // 参数值后缀，可能有注释

  /**
   * @param value 参数值前缀
   * @param prefix 参数值
   * @param suffix 参数值后缀
   */
  constructor(value: string, prefix: string = "", suffix: string = "") {
    this.prefix = prefix;
    this.value = value;
    this.suffix = suffix;
  }

  isValid(): boolean {
    return !this.isEmpty();
  }

  toString(): string {
    return `${this.prefix}${this.value}${this.suffix}`;
  }

  isEmpty(): boolean {
    return 0 === this.prefix.length && 0 === this.value.length && 0 === this.suffix.length;
  }

  clear(): void {
    this.prefix = "";
    this.value = "";
    this.suffix = "";
  }
}

/**
 * 行
 */
export interface Line extends Serializable, Container, WithValidator {}

/**
 * 参数化的行
 */
export class ParameterizedLine implements Line {
  public prefix: string; // 前缀，行前可能有块注释
  public module: string; // 模块名称
  public action: string; // 行为命令名称
  public parameters: Parameter[]; // 参数列表
  public suffix: string; // 后缀，分号及以后的内容

  constructor(module: string, lineType: string, parameters: Parameter[] = [], prefix: string = "", suffix: string = "") {
    this.prefix = prefix;
    this.module = module;
    this.action = lineType;
    this.parameters = parameters;
    this.suffix = suffix;
  }

  isValid(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return this.prefix.length === 0 && this.module === "" && this.action === "" && this.parameters.length === 0;
  }

  toString(): string {
    const parameters = this.parameters
      .map((param) => {
        return param.toString();
      })
      .join(",");
    return `${this.prefix}${this.module}.${this.action}(${parameters})${this.suffix}`;
  }

  clear(): void {
    this.prefix = "";
    this.module = "";
    this.action = "";
    this.parameters = [];
    this.suffix = "";
  }
}

/**
 * 原始行，包含空行和注释行等
 */
export class RawLine implements Line {
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

  toString(): string {
    return this.content;
  }

  clear(): void {
    this.content = "";
  }
}

/**
 * 文档
 */
export interface Document extends Serializable, Container, WithValidator {
  /**
   * 设置文档路径
   * @param filename 文档路径
   */
  setFilename(filename: string): void;

  /**
   * 获取文档路径
   * @returns 文档路径
   */
  getFilename(): string;

  /**
   * 设置行列表
   * @param lines 行列表
   */
  setLines(lines: Line[]): void;

  /**
   * 获取行列表
   * @returns 行列表
   */
  getLines(): Line[];
}

/**
 * .js 文档
 */
export class JsDocument implements Document {
  private filename: string;
  private lines: Line[];

  constructor() {
    this.filename = "";
    this.lines = [];
  }

  setFilename(filename: string): void {
    this.filename = filename;
  }

  getFilename(): string {
    return this.filename;
  }

  setLines(lines: Line[]): void {
    this.lines = lines;
  }

  getLines(): Line[] {
    return this.lines;
  }

  toString(): string {
    return this.lines
      .map((line) => {
        return line.toString();
      })
      .join(os.EOL);
  }

  isEmpty(): boolean {
    return 0 === this.lines.length;
  }

  isValid(): boolean {
    return true;
  }

  clear(): void {
    this.lines = [];
    this.filename = "";
  }
}

/**
 * 判断文件路径是否有效
 * @param filePath 文件路径
 * @returns 是否有效
 */
function isValidFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  return fs.statSync(filePath).isFile();
}

/**
 * 判断文件夹路径是否有效
 * @param folderPath 文件夹路径
 * @returns 是否有效
 */
function isValidFolder(folderPath: string): boolean {
  if (!fs.existsSync(folderPath)) {
    return false;
  }
  return fs.statSync(folderPath).isDirectory();
}

/**
 * 创建文件夹
 * @param folderPath 待创建的文件的路径
 * @returns 是否创建成功
 */
function createFolder(folderPath: string): boolean {
  return false;
}

/**
 * 以 `utf-8` 编码读取文件文本内容
 * @param filePath 文件路径
 * @returns 文件内容，成功则返回字符串，否则返回 `undefined`
 */
function loadStringAsUtf8(filePath: string): string | undefined {
  if (!isValidFile(filePath)) {
    return undefined;
  }
  return fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
}

/**
 * 将字符串以 `utf-8` 编码形式保存至文本文件
 * @param filePath 文件路径
 * @param content 待保存的内容
 * @returns 是否保存成功
 */
function saveStringAsUtf8(filePath: string, content: string): boolean {
  fs.writeFileSync(filePath, content, {
    encoding: "utf-8",
  });
  return true;
}

// 行模式
// example:
const FULL_LINE_PATTERN: RegExp = /^\/\*(\[\d{4}-[\s\d]{1}\d-[\s\d]{1}\d\s[\s\d]{1}\d:[\s\d]{1}\d:[\s\d]{1}\d\([\s\d]{3}\)\])\*\/\s(.*);$/;

// 纯行模式
// example: (JrnRes).(CompareExpectedResult)(("ExportToGFCCommand", "Gfc导出数据对比成功", "Text"))(;)
const PURE_LINE_PATTERN: RegExp = /^(Jrn[a-zA-Z]{3}).([a-zA-Z]+)\((.*)\)(.*)/;

// 参数分割符模式
// example:
const PARAMETER_SPLITTER: RegExp = /,\s?/;

// 参数模式
// example:
const PARAMETERS_PATTERN: RegExp = /^(.*)(\/\*.*\*\/)/;

/**
 * 判断字符串是否是字符串字面值
 * @param parameter 待判断的字符串
 * @returns 是则返回 true，否则返回 false
 */
function isStringLiteral(parameter: string): boolean {
  return parameter.startsWith('"') && parameter.endsWith('"');
}

/**
 * 判断字符串是否是字符串字面值开头
 * @param parameter 待判断的字符串
 * @returns 是则返回 true，否则返回 false
 */
function isStringLiteralBegin(parameter: string): boolean {
  return parameter.startsWith('"') && !parameter.endsWith('"');
}

/**
 * 判断字符串是否是字符串字面值结尾
 * @param parameter 待判断的字符串
 * @returns 是则返回 true，否则返回 false
 */
function isStringLiteralEnd(parameter: string): boolean {
  return !parameter.startsWith('"') && parameter.endsWith('"');
}

/**
 * 解析参数
 * @param parameterLiteral 参数字符串
 * @param prefix 参数的前缀
 * @returns 参数
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
      if (!_.isNull(matchResult[2])) {
        comment = matchResult[2];
      }
    }
  }
  return new ParsedParameter(valueLiteral, prefix, comment);
}

/**
 * 解析参数列表
 * @param parameterLiteral 参数列表字符串
 * @returns 参数列表
 */
function parseParameterList(parameterLiteral: string): Parameter[] {
  let segments: string[] = parameterLiteral.split(PARAMETER_SPLITTER);
  let groups: string[][] = [];
  for (let i = 0; i < segments.length; ++i) {
    let segment: string = segments[i];
    if (isStringLiteralBegin(segment)) {
      let temp: string[] = [];
      for (; i < segments.length; ++i) {
        segment = segments[i];
        temp.push(segment);
        if (isStringLiteralEnd(segment)) {
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
 * 解析并返回行
 * @param lineLiteral 行字符串
 * @returns 解析后的行
 */
function parseLine(lineLiteral: string): Line {
  let prefix: string = "";
  let pure: string = lineLiteral;
  if (lineLiteral.startsWith("/*")) {
    const matchResult = lineLiteral.match(FULL_LINE_PATTERN);
    if (!_.isNull(matchResult)) {
      prefix = matchResult[1];
      pure = matchResult[2];
    }
  }
  if (!pure.startsWith("//")) {
    const matchResult = pure.match(PURE_LINE_PATTERN);
    if (!_.isNull(matchResult)) {
      const mod: string = matchResult[1];
      const action: string = matchResult[2];
      const parameterLiteral: string = matchResult[3] as string;
      const parameters: Parameter[] = parseParameterList(parameterLiteral);
      const suffix = matchResult[4] as string;
      return new ParameterizedLine(mod, action, parameters, prefix, suffix);
    }
  }
  return new RawLine(lineLiteral);
}

/**
 * 读取文档
 * @param filename 待读取的文档
 * @returns 读取到的文档，失败则返回 undefined
 */
export function loadDocument(filename: string): undefined | Document {
  const content = loadStringAsUtf8(filename);
  if (typeof content === "undefined") {
    return undefined;
  }
  let doc = new JsDocument();
  doc.setFilename(filename);
  const lineStrings = content.split(os.EOL);
  const lines = lineStrings.map((line) => {
    return parseLine(line);
  });
  doc.setLines(lines);
  return doc;
}

/**
 * 保存文档
 * @param filename 保存路径
 * @param doc 待保存的文档
 * @param skipEmptyLine 是否跳过空行
 */
export function saveDocument(filename: string, doc: Document, skipEmptyLine: boolean = false) {
  let content: string = "";
  if (skipEmptyLine) {
    let lines: string[] = [];
    doc.getLines().forEach((line) => {
      if (!line.isEmpty()) {
        lines.push(line.toString());
      }
    });
  } else {
    content = doc.toString();
  }
  saveStringAsUtf8(filename, content);
}
