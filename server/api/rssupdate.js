// server/api/updateRss.js
import { updateRssData } from './rssFetcher.js';

export default defineEventHandler(async (event) => {
  try {
    await updateRssData();
    return { success: true, message: 'RSS data updated successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
