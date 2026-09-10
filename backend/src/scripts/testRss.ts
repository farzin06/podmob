import { db } from '../config/db.js';
import { FeedSourceService } from '../services/feedSourceService.js';
import { PodcastService } from '../services/podcastService.js';
import { EpisodeService } from '../services/episodeService.js';

async function runTest() {
  console.log('--- Starting Backend & RSS Verification ---');
  await db.init();

  // Test RSS feed: NPR News Now & Syntax FM
  const testFeeds = [
    { url: 'https://feeds.npr.org/500005/podcast.xml', title: 'NPR News Now' },
    { url: 'https://lexfridman.com/feed/podcast/', title: 'Lex Fridman Podcast' },
    { url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss', title: 'BBC Global News Podcast' },
  ];

  for (const item of testFeeds) {
    console.log(`\n📥 Ingesting feed: ${item.title} (${item.url})...`);
    try {
      const result = await FeedSourceService.addAndSyncFeedSource(item.url, item.title);
      console.log(`✅ Success: Podcast "${result.podcast.title}" by "${result.podcast.author}"`);
      console.log(`   Episodes found: ${result.feedSource.episode_count}`);
    } catch (err: any) {
      console.error(`❌ Ingestion failed for ${item.url}:`, err.message);
    }
  }

  // Verify Creators List
  console.log('\n--- Checking Creators List ---');
  const creators = await PodcastService.getCreators();
  console.log(`Found ${creators.length} creators:`);
  creators.forEach((c) => {
    console.log(` - Creator: "${c.creator}" | Podcasts: ${c.podcast_count} | Episodes: ${c.episode_count}`);
  });

  // Verify Filtering Episodes by Creator
  if (creators.length > 0) {
    const sampleCreator = creators[0].creator;
    console.log(`\n--- Filtering Episodes by Creator: "${sampleCreator}" ---`);
    const filtered = await EpisodeService.getEpisodes({ creator: sampleCreator, limit: 3 });
    console.log(`Found ${filtered.total} total episodes for creator. First 3:`);
    filtered.episodes.forEach((ep) => {
      console.log(`   • [${ep.duration}] ${ep.title} (${ep.published_at})`);
    });
  }

  console.log('\n--- Test Completed Successfully ---');
  await db.close();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
