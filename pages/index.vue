<template>
  <div class="root">
    <h1>G-Lao新闻</h1>
    <ul v-if="rssData && rssData.length > 0">
      <li v-for="(feed, index) in rssData" :key="feed.channel.link" class="RssHead">
        <div class="rss-card">
          <div class="rss-title-container" @click="toggleDetails(index)">
            <h3 class="rss-title">{{ feed.channel.title }}</h3>
          </div>
          <ul v-show="isDetailsVisible[index]" class="rss-items">
            <a :href="feed.channel.link" target="_blank" class="rss-link">在贴吧打开</a>
            <li v-for="item in feed.channel.item" :key="item.guid._" class="rss-item">
              <div v-html="sanitizeHtml(item.description)" class="rss-item-description"></div>
              <div v-if="item.images && item.images.length > 0">
                <img v-for="image in item.images" :src="image" alt="RSS Image" class="rss-item-image" max-width="100%">
              </div>
            </li>
            <div class="rss-card-btn-collapse" @click="toggleDetails(index)">
            </div>
          </ul>
        </div>
      </li>
    </ul>
    <p v-else>正在加载数据...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const rssData = ref([]);
const isDetailsVisible = ref([]);

onMounted(async () => {
  try {
    const response = await fetch('/api/rssget');
    const rawData = await response.json();
    if (Array.isArray(rawData)) {
      rssData.value = rawData.map(feed => ({
        channel: {
          title: feed.rss.channel.title.replace(/作者：灬灬G灬灬|来自iPhone客户端|【只看楼主】|来自iPhone客户端|楼层：\d+楼/g, ''), // 清洗标题中的作者和楼层信息
          link: feed.rss.channel.link,
          description: sanitizeHtml(feed.rss.channel.description), // 应用sanitizeHtml在接收数据时立即清洗
          item: Array.isArray(feed.rss.channel.item) ? feed.rss.channel.item.map(item => ({
            ...item,
            description: sanitizeHtml(item.description) // 应用sanitizeHtml在每个项目上
          })) : [feed.rss.channel.item]
        }
      }));
      isDetailsVisible.value = rssData.value.map(() => false); // Initialize visibility array
      adjustImageSizes(); // Adjust image sizes after loading rssData
      window.addEventListener('resize', adjustImageSizes); // Listen for window resize events
    } else {
      console.error('Received data is not an array:', rawData);
    }
  } catch (error) {
    console.error('Error fetching RSS data:', error);
  }
});

const toggleDetails = (index) => {
  isDetailsVisible.value[index] = !isDetailsVisible.value[index];

  if (isDetailsVisible.value[index] && rssData.value[index].channel.item.length === 0) {
    fetchAdditionalContent(index);
  }
}

const sanitizeHtml = (html) => {
  // Sanitization logic to prevent XSS attacks
  let cleanHtml = html.replace(/作者：灬灬G灬灬|楼层：\d+楼/g, ''); // 清洗HTML中的作者和楼层信息
  // Replace this with your actual sanitization function
  return cleanHtml;
}

const adjustImageSizes = () => {
  const images = Array.from(document.querySelectorAll('.rss-item-image'));
  const containerWidth = window.innerWidth; // Get window width
  images.forEach(img => {
    img.removeAttribute('width');
    img.removeAttribute('height');
    const naturalWidth = img.naturalWidth;
    if (naturalWidth > containerWidth) {
      img.style.width = '100%';
      img.style.height = 'auto';
    } else {
      img.style.width = 'auto'; // Reset width and height if no adjustment needed
      img.style.height = 'auto';
    }
  });

  // 添加rss-item-image类和max-width属性
  const rssItemImages = Array.from(document.querySelectorAll('.rss-item-description img'));
  rssItemImages.forEach(img => {
    img.classList.add('rss-item-image');
    img.setAttribute('max-width', '100%');
  });
}
</script>


<style>
.root {
  padding: 1rem;
  max-width: 1280px;
  margin: 0 auto;
}

.root h1,
.root h3 {
  margin: 0;
}

.root h1 {
  text-align: center;
}

.root>ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

.rss-feed {
  margin-bottom: 20px;
}

.rss-card {
  background-color: #2d2d2d;
  border-radius: 1rem;
  overflow: hidden;
}

.rss-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  transition: background-color .2s;
}

.rss-title-container:hover {
  background-color: #3b3b3b;
}

.rss-title-container:active {
  background-color: #4b4b4b;
}

.rss-title {
  margin-bottom: 5px;
  font-size: 18px;
  font-weight: bold;
}

.rss-link {
  display: block;
  font-size: 14px;
  text-decoration: none;
  width: max-content;
  margin-bottom: 1em;
  color: #007bff;
  background-color: #007bff20;
  padding: .5rem 1rem;
  border-radius: 1rem;
  user-select: none;
  transition: background-color .2s, color .2s;
}

.rss-link:hover {
  color: #2b92ff;
  background-color: #007bff40;
}

.rss-link:active {
  background-color: #007bff60;
}

.rss-description {
  margin-bottom: 10px;
  font-size: 16px;
}

.rss-items {
  border-top: 1px solid #ffffff20;
  padding: 1rem;
}

.rss-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

.rss-item-description {
  font-size: 14px;
}

.rss-item-description p {
  margin: 0;
}

.rss-item-description img {
  display: block;
  margin: .5em auto;
  max-width: 100%;
  height: auto;
}

.rss-item-description a {
  display: inline-block;
  color: #007bff;
  background-color: #007bff20;
  text-decoration: none;
  padding: .25em .5em;
  border-radius: .5em;
  transition: background-color .2s, color .2s;
}

.rss-item-description a:hover {
  color: #2b92ff;
  background-color: #007bff40;
}

.rss-item-description a:active {
  background-color: #007bff60;
}

.rss-card-btn-collapse {
  position: relative;
  width: 2em;
  height: 2em;
  margin: 0 auto;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color .2s;
}

.rss-card-btn-collapse:hover {
  background-color: #3b3b3b;
}

.rss-card-btn-collapse:active {
  background-color: #4b4b4b;
}

.rss-card-btn-collapse::before,
.rss-card-btn-collapse::after {
  content: "";
  display: block;
  position: absolute;
  top: 40%;
  left: 50%;
  width: .5em;
  height: 2px;
  background-color: #fff;
  transform-origin: 0 0;
}

.rss-card-btn-collapse::before {
  transform: rotate(45deg);
}

.rss-card-btn-collapse::after {
  transform: scaleX(-1) rotate(45deg);
}
</style>
