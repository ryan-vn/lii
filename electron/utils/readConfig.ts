import fs from 'fs'

export function ensureFileExists(filePath: string) {
    if (!fs.existsSync(filePath)) {
      // 配置文件不存在，创建一个默认配置文件
      saveFile(filePath);
    }
  }
  
 export function readFile(filePath: string) {
    ensureFileExists(filePath); // 确保配置文件存在
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.log('Error reading config file:', error);
      return {};
    }
  }


  export function saveFile(filePath: string, data = '{}') {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
    } catch (error) {
      console.log('Error writing config file:', error);
    }
  }
  