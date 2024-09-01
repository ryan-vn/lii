
import * as luaParser from 'luaparse';
import fs from 'fs'
import * as readline from 'readline';
import moment from 'moment';
import crypto from 'crypto'
import { store } from './store';

const FACTION = {
  Horde: 1,
  Alliance: 2,
}

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
        (field: any) => field.type === 'TableKey',
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

export function extractAndTransform(obj: any) {
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
  if (!fs.existsSync(filePath)) {
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

function extractKeywords(str: string) {
  const regex = /f@([^@]+) - ([^@]+)@internalData@csvAuctionDBScan/;
  const matches = str.match(regex);
  if (matches && matches.length >= 3) {
    // matches[1] 是第一个关键词，matches[2] 是第二个关键词
    return [matches[1], matches[2]];
  }
  return [];
}


const sprt_word = 'csvAuctionDBScan';


function getIdByName(name: string, data: { id: number, name: string }[]) {
  const item = data.find(item => item.name === name);
  return item ? item.id : '';
}

export function toDbValue(file: string, serverList: { id: number, name: string, }[],): {
  data: any[];
  hashList: string[];
  cacheServerKey: string[]
} {  // 从程序 中拿 到数据
  const hashStore = store.get('hash')
  console.log("cache keys", hashStore);
  const timeStart = Date.now();
  const sqlCommList: any[] = [];
  const hashList = []
  const fileContent = fs.readFileSync(file, 'utf8');
  const lines = fileContent.split('\n');
  const cacheServerKey = new Set()
  for (const ret of lines) {
    if (ret.includes(sprt_word)) {
      const hash = crypto.createHash('sha256').update(ret).digest('hex');
      if (hashStore.indexOf(hash) !== -1) {
        console.log('Find alread data,skip');
        continue
      }
      const idxName = ret.indexOf("internalData@csvAuctionDBScan");
      const subName = ret.substring(5, idxName - 1);
      if (subName) {
        const [fac, region] = extractKeywords(ret)
        if (ret.includes("lastScan")) {
          hashList.push(hash)
          const regionName = getIdByName(region, serverList)
          console.log('有新的拍卖行数据更新', regionName, fac);
          const idxStart = ret.indexOf("lastScan");
          const subStr = ret.substring(idxStart + 10, ret.length - 3);
          const arrItems = subStr.split('\\n');
          if (arrItems.length !== 0) {
            console.log('Find data,use mysql to write data');
            arrItems.forEach((tmp: string) => {
              const sqlTmp = tmp.split(',');
              const itemName = sqlTmp[0].split(":");
              sqlTmp[0] = itemName[1];
              const formattedDate = moment.unix(sqlTmp[5]).format('YYYY-MM-DD HH:mm:ss'); // Process time
              sqlTmp[5] = formattedDate;  // 处理时间
              sqlTmp.push('0');
              cacheServerKey.add(region + '_' + fac)
              sqlTmp.push(regionName);
              sqlTmp.push(FACTION[fac]);
              sqlCommList.push(sqlTmp);
            });
          }
        }
      }
    }
  }

  return {
    data: sqlCommList,
    hashList: hashList,
    cacheServerKey: Array.from(cacheServerKey) as string[]
  };
}


// [
//   { realm: '伦鲁迪洛尔', Alliance: '9923', Horde: '59068' },
//   { realm: '光芒', Alliance: '13590', Horde: '65459' },
//   { realm: '克罗米', Alliance: '60246', Horde: '5183' },
//   { realm: '冰封王座', Alliance: '21656', Horde: '72759' },
//   { realm: '加丁', Alliance: '118082', Horde: '96554' },
//   { realm: '匕首岭', Alliance: '256817', Horde: '9966' },
//   { realm: '卓越', Alliance: '4425', Horde: '108985' },
//   { realm: '厄运之槌', Alliance: '34519', Horde: '51551' },
//   { realm: '吉安娜', Alliance: '193520', Horde: '645356', Neutral: '1' },
//   { realm: '哈霍兰', Alliance: '254672', Horde: '6633' },
//   { realm: '埃提耶什', Alliance: '11520', Horde: '229311' },
//   { realm: '奎尔塞拉', Alliance: '5284', Horde: '69718' },
//   { realm: '奥罗', Alliance: '2832', Horde: '245150' },
//   { realm: '奥金斧', Alliance: '3033', Horde: '238594' },
//   { realm: '娅尔罗', Alliance: '43063', Horde: '1889' },
//   { realm: '安娜丝塔丽', Alliance: '71219', Horde: '1561' },
//   { realm: '审判', Alliance: '172538', Horde: '15328' },
//   { realm: '寒冰之王', Alliance: '118355', Horde: '1883' },
//   { realm: '寒脊山小径', Alliance: '141205', Horde: '33411' },
//   { realm: '巨人追猎者', Alliance: '4110', Horde: '58642' },
//   { realm: '巨龙追猎者', Alliance: '9405', Horde: '108492' },
//   { realm: '巫妖王', Alliance: '272249', Horde: '391885' },
//   { realm: '巴罗夫', Alliance: '1782', Horde: '83765' },
//   { realm: '布鲁', Alliance: '1562', Horde: '237430' },
//   { realm: '希尔盖', Alliance: '1580', Horde: '55644' },
//   { realm: '帕奇维克', Alliance: '1850', Horde: '235980' },
//   { realm: '席瓦莱恩', Alliance: '3506', Horde: '222093' },
//   { realm: '德姆塞卡尔', Alliance: '104730', Horde: '1876' },
//   { realm: '怀特迈恩', Alliance: '50199', Horde: '3092' },
//   { realm: '怒炉', Alliance: '213861', Horde: '3047', Neutral: '2' },
//   { realm: '无尽风暴', Alliance: '928', Horde: '83963' },
//   { realm: '无敌', Alliance: '19226', Horde: '58584' },
//   { realm: '无畏', Alliance: '189133', Horde: '436191' },
//   { realm: '曼多基尔', Alliance: '101445', Horde: '1252' },
//   { realm: '末日之刃', Alliance: '12352', Horde: '93449' },
//   { realm: '死亡猎手', Alliance: '97406', Horde: '531554' },
//   { realm: '毁灭之刃', Alliance: '2308', Horde: '77786' },
//   { realm: '比斯巨兽', Alliance: '1195', Horde: '156452' },
//   { realm: '比格沃斯', Alliance: '16641', Horde: '210549' },
//   { realm: '水晶之牙', Alliance: '1562', Horde: '86575' },
//   { realm: '沙尔图拉', Alliance: '8850', Horde: '78478' },
//   { realm: '沙顶', Alliance: '1469', Horde: '50056' },
//   { realm: '法尔班克斯', Alliance: '205713', Horde: '2877' },
//   { realm: '法琳娜', Alliance: '100130', Horde: '1464' },
//   { realm: '湖畔镇', Alliance: '77142', Horde: '11381' },
//   { realm: '火锤', Alliance: '150517', Horde: '3250' },
//   { realm: '灰烬使者', Alliance: '15416', Horde: '282377' },
//   { realm: '灵风', Alliance: '1621', Horde: '60135' },
//   { realm: '狂野之刃', Alliance: '4888', Horde: '41116' },
//   { realm: '狮心', Alliance: '261289', Horde: '3390' },
//   { realm: '碧玉矿洞', Alliance: '151135', Horde: '101134' },
//   { realm: '碧空之歌', Alliance: '146856', Horde: '23281' },
//   { realm: '祈福', Alliance: '287617', Horde: '11547', Neutral: '1' },
//   { realm: '秩序之源', Alliance: '28907', Horde: '76436' },
//   { realm: '红玉圣殿', Alliance: '255788', Horde: '632106' },
//   { realm: '维克尼拉斯', Alliance: '1045', Horde: '95037' },
//   { realm: '维克洛尔', Alliance: '1776', Horde: '188487' },
//   { realm: '维希度斯', Alliance: '1765', Horde: '223774' },
//   { realm: '艾隆纳亚', Alliance: '66132', Horde: '1226' },
//   { realm: '范克瑞斯', Alliance: '216526', Horde: '2356' },
//   { realm: '范沃森', Alliance: '76255', Horde: '784', Neutral: '1' },
//   { realm: '莫格莱尼', Alliance: '256390', Horde: '2581' },
//   { realm: '萨弗拉斯', Alliance: '1641', Horde: '126700' },
//   { realm: '觅心者', Alliance: '1203', Horde: '125309' },
//   { realm: '诺格弗格', Alliance: '1320', Horde: '102003' },
//   { realm: '赫洛德', Alliance: '16570', Horde: '70101' },
//   { realm: '辛洛斯', Alliance: '89414', Horde: '216157' },
//   { realm: '辛迪加', Alliance: '88547', Horde: '5255' },
//   { realm: '银色北伐军', Alliance: '263764', Horde: '200917' },
//   { realm: '雷德', Alliance: '131051', Horde: '2288' },
//   { realm: '雷霆之击', Alliance: '9499', Horde: '219452' },
//   { realm: '震地者', Alliance: '1928', Horde: '227416' },
//   { realm: '霜语', Alliance: '2842', Horde: '272363' },
//   { realm: '骨火', Alliance: '1838', Horde: '43785' },
//   { realm: '黑曜石之锋', Alliance: '2370', Horde: '47215' },
//   { realm: '龙之召唤', Alliance: '3476', Horde: '242587' },
//   { realm: '龙牙', Alliance: '144660', Horde: '690962', Neutral: '2' }
// ]