import { FeedSourceService } from './feedSourceService.js';

export class FeedSyncScheduler {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;
  private static defaultIntervalMs = 20 * 60 * 1000; // 20 minutes

  /**
   * Initialize and start the background sync scheduler
   */
  public static init(intervalMs: number = this.defaultIntervalMs): void {
    if (this.intervalId) {
      console.log('[FeedSyncScheduler] Scheduler already running.');
      return;
    }

    console.log(`[FeedSyncScheduler] Initialized background sync worker (Interval: ${intervalMs / 60000} mins)`);

    // Run first sync shortly after startup (10s delay to allow DB & network readiness)
    setTimeout(() => {
      this.runSync('startup');
    }, 10000);

    // Set recurring timer
    this.intervalId = setInterval(() => {
      this.runSync('scheduled');
    }, intervalMs);
  }

  /**
   * Run a sync cycle across all subscribed podcast feeds
   */
  public static async runSync(triggerType: 'scheduled' | 'startup' | 'manual' = 'scheduled'): Promise<void> {
    if (this.isRunning) {
      console.log(`[FeedSyncScheduler] Sync already in progress. Skipping ${triggerType} trigger.`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log(`[FeedSyncScheduler] Starting ${triggerType} feed sync cycle...`);

    try {
      const summary = await FeedSourceService.syncAllFeedSources();
      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(
        `[FeedSyncScheduler] Sync completed in ${durationSec}s | Feeds: ${summary.syncedCount}/${summary.totalSources} synced (${summary.failedCount} errors) | New Episodes Found: ${summary.newEpisodes}`
      );
    } catch (err: any) {
      console.error('[FeedSyncScheduler] Error during feed sync cycle:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the background sync scheduler
   */
  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[FeedSyncScheduler] Background sync scheduler stopped.');
    }
  }
}
