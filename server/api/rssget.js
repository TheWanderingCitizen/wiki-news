import { promises as fs } from 'fs'; // 使用 fs 的 promise 版本
import { resolve } from 'path';

export default defineEventHandler(async (event) => {
    const filePath = resolve('public/rssData.json');
  
    try {
      const data = await fs.readFile(filePath, 'utf8'); // 使用异步读取文件
      return JSON.parse(data); // 解析并返回 JSON 数据
    } catch (error) {
      // 如果发生错误（例如文件不存在），返回错误消息
      return { error: 'RSS data not found.', details: error.message };
    }
});
