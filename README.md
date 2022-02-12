# Gap Script

## 简介

gap-script 支持脚本的序列化与反序列化、行的解析等功能

## 用法

创建 NodeJs 项目，并安装 TypeScript

```shell
mkdir demo
cd demo
npm init -y
npm install --save-dev typescript
npm install --save-dev @types/node
tsc --init
```

安装 gap-script

```shell
npm install --save gap-script
```

在项目中使用 `Document`、`Line`、`Parameter` 等概念

```ts
import { Document } from "gap-script";

const filename: string = "path-to-js-file.js";
let doc = new Document();
doc.open(filename);
doc.saveAs(`new-${filename}`);
```
