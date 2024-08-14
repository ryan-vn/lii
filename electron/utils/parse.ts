
import * as luaParser from 'luaparse';
import fs from 'fs'

const baseTime = new Date(2020, 0, 1, 0).getTime();

export function luaToJson(lua: string): any {
    return luaParser.parse(lua);
  }

function calculateCurrentTime(result) {
  // 首先将结果乘以 86400000 转换为毫秒
  const timeDifferenceInMillis = result * 86400000;

  // 2020 年 1 月 1 日 0 时的时间戳

  // 计算当前时间戳
  const currentTimeStamp = baseTime + timeDifferenceInMillis;

  // 将时间戳转换为 Date 对象

  return currentTimeStamp;
}

export function parseLuaAST(ast: luaParser.Chunk) {
  const result = {};

  ast.body.forEach((statement) => {
    if (statement.type === 'AssignmentStatement') {
      const key = statement.variables[0].name;
      const init = statement.init[0];

      if (init.type === 'TableConstructorExpression') {
        const fields = init.fields;
        let value;

        // Check if it's an array-like table or a key-value table
        if (fields.every((field) => field.type === 'TableValue')) {
          value = fields.map((field) => parseValue(field.value));
        } else {
          value = {};
          fields.forEach((field) => {
            if (field.type === 'TableKey') {
              value[field.key.raw.replace(/"/g, '')] = parseValue(field.value);
            } else if (field.type === 'TableValue') {
              // Handle nested tables
              if (!Array.isArray(value)) {
                value = [];
              }
              value.push(parseValue(field.value));
            }
          });
        }
        result[key] = value;
      }
    }
  });

  return result;
}

function parseValue(value: any) {
  switch (value.type) {
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return value.value;
    case 'StringLiteral':
      return value.raw.replace(/"/g, '');
    case 'TableConstructorExpression':
      // For nested table constructor expressions, handle both array-like and key-value tables
      const isKeyValueTable = value.fields.some(
        (field:any) => field.type === 'TableKey',
      );
      if (isKeyValueTable) {
        const obj = {};
        value.fields.forEach((field) => {
          if (field.type === 'TableKey') {
            obj[field.key.raw.replace(/"/g, '')] = parseValue(field.value);
          }
        });
        return obj;
      } else {
        return value.fields.map((field: any) => parseValue(field.value));
      }
    default:
      return null;
  }
}

const keys = ['a', 'l', 'h', 'm'];

export function extractAndTransform(obj:any) {
  return keys.reduce((acc, key) => {
    if (key === 'm') {
      // Directly assign 'm' without transformation
      acc[key] = obj[key];
    } else {
      acc[key] = Object.entries(obj[key]).map(([oldKey, value]) => {
        const newKey = calculateCurrentTime(oldKey); // Assuming this function is defined elsewhere
        return { [newKey]: value };
      });
    }
    return acc;
  }, {});
}

export async function readLuaToJson(filePath: string) {
  if(!fs.existsSync(filePath)){
      console.log(`Error: File ${filePath} does not exist.`);
      return; 
  }
  try {
      // 读取文件内容
      const content = await fs.readFileSync(filePath, 'utf8');
      // 解析 Lua 代码获取 AST
      const ast = luaParser.parse(content);
      // 处理 AST 并生成 JSON 对象
      return parseLuaAST(ast); 
  } catch (err) {
      // 当读取文件出错时，抛出错误信息
      if (err.code === 'ENOENT') {
          throw new Error(`File not found: ${filePath}`);
      } else if (err instanceof SyntaxError) {
      // 当解析 Lua 代码出错时，抛出错误信息
          throw new Error(`Syntax error in file: ${filePath}\n${err.message}`);
      } else {
          // 处理其他未知错误
          throw new Error(`An error occurred while reading the file: ${filePath}\n${err.message}`);
      }
  }
}