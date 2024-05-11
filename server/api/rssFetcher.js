import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import cron from 'node-cron';

// Function to extract post ID from link
function extractPostId(link) {
  const match = link.match(/p\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchPostDetails(postId) {
  const url = `https:/rsshub.app/baidu/tieba/post/lz/${postId}`;
  try {
    const response = await axios.get(url);
    const detailedData = await parseStringPromise(response.data, { explicitArray: false });

    const cleanRegex = /来自iPhone客户端|本楼含有高级字体|【只看楼主】|作者：[^\s]+|楼层：\d+|楼主/g;
    if (detailedData.rss && detailedData.rss.channel && detailedData.rss.channel.item) {
      let { title, description } = detailedData.rss.channel.item;

      // Clean the title and description
      if (description) {
        detailedData.rss.channel.item.description = description.replace(cleanRegex, '');
      }
      if (title) {
        detailedData.rss.channel.item.title = title.replace(cleanRegex, '');
      }

      // Reverse the order of items if it's an array
      if (Array.isArray(detailedData.rss.channel.item)) {
        detailedData.rss.channel.item.reverse();
      }
    }
    return detailedData;
  } catch (error) {
    console.error(`Failed to fetch details for post ID ${postId}:`, error);
    return null; // Return null in case of an error
  }
}

// Function to update RSS data
export async function updateRssData() {
  console.log('Fetching RSS data...');
  const rssUrl = 'https://rsshub.app/baidu/tieba/user/%E7%81%AC%E7%81%ACG%E7%81%AC%E7%81%AC&';
  const filePath = resolve('public/rssData.json'); // Change the file path to save it in the public folder

  try {
    const response = await axios.get(rssUrl);
    const rssData = response.data;
    const result = await parseStringPromise(rssData, { explicitArray: false });
    let items = result.rss.channel.item;
    items = Array.isArray(items) ? items : [items]; // Ensure it's always an array

    const detailedItems = await Promise.all(items.map(async (item) => {
      const postId = extractPostId(item.link);
      return postId ? await fetchPostDetails(postId) : item;
    }));

    await fs.writeFile(filePath, JSON.stringify(detailedItems, null, 2), 'utf8');
    console.log('RSS data updated and saved to file successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Schedule the cron job to run updateRssData every minute
cron.schedule('* * * * *', updateRssData);
