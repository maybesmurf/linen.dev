import {
  TwoWaySyncType,
  emailNotificationPayloadType,
  notificationListenerType,
  SyncJobType,
  SlackEvent,
} from '@linen/types';
import { makeWorkerUtils, type WorkerUtils } from 'graphile-worker';
import { downloadCert, getDatabaseUrl } from '@linen/database';

let instance: WorkerUtils | undefined;
class WorkerSingleton {
  private static async createInstance() {
    await downloadCert();
    return makeWorkerUtils({
      connectionString: getDatabaseUrl({
        dbUrl: process.env.DATABASE_URL,
        cert: process.env.RDS_CERTIFICATE,
      }),
    });
  }
  static async getInstance() {
    if (!instance) {
      instance = await this.createInstance();
    }
    return instance;
  }
}

export async function createWebhookJob(payload: SlackEvent) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('webhook', payload, {
    jobKey: `webhook:${payload.event_id}`,
    maxAttempts: 1,
  });
}

export async function createSyncJob(payload: SyncJobType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('sync', payload, {
    jobKey: `sync:${payload.account_id}`,
  });
}

export async function createMailingJob(
  jobKey: string,
  runAt: Date,
  payload: emailNotificationPayloadType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('notification-send-email', payload, {
    jobKey: `notification-send-email:${jobKey}`,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'preserve_run_at',
  });
}

export async function createRemindMeJob(
  jobKey: string,
  runAt: Date,
  payload: any
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('remind-me-later-queue', payload, {
    jobKey: `remind-me-later-queue:${jobKey}`,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'replace',
  });
}

export async function createMarkAllAsReadJob(
  jobKey: string,
  payload: { communityId: string; userId: string }
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('mark-all-as-read-queue', payload, {
    jobKey: `mark-all-as-read-queue:${jobKey}`,
    maxAttempts: 1,
    jobKeyMode: 'replace',
  });
}

export async function createNewEventJob(
  jobKey: string,
  payload: notificationListenerType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('notification-new-event', payload, {
    jobKey: `notification-new-event:${jobKey}`,
    maxAttempts: 1,
  });
}

export async function createTwoWaySyncJob(payload: TwoWaySyncType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('two-way-sync', payload, {
    maxAttempts: 1,
  });
}

export async function createIntegrationDiscord() {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(
    'integration-discord',
    {},
    {
      maxAttempts: 1,
    }
  );
}

export async function createRemoveCommunityJob(accountId: string) {
  const worker = await WorkerSingleton.getInstance();
  const dayInMs = 24 * 60 * 60 * 1000;
  const runAt = new Date(Date.now() + dayInMs);
  return await worker.addJob(
    'remove-community',
    { accountId },
    {
      jobKey: `remove-community:${accountId}`,
      runAt,
    }
  );
}

export async function createTypesenseDeletion(payload: {
  accountId: string;
  threadId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseDeletion', payload, {
    maxAttempts: 1,
  });
}

export async function createTypesenseUserNameUpdate(payload: {
  accountId: string;
  userId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseOnUserNameUpdate', payload, {
    maxAttempts: 1,
  });
}

export async function createTypesenseChannelNameUpdate(payload: {
  channelId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseOnChannelNameUpdate', payload, {
    maxAttempts: 1,
  });
}

export async function createTypesenseChannelTypeUpdate(payload: {
  channelId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseOnChannelTypeUpdate', payload, {
    maxAttempts: 1,
  });
}

export async function createTypesenseCommunityTypeUpdate(payload: {
  accountId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseOnCommunityTypeUpdate', payload, {
    maxAttempts: 1,
  });
}

export async function createTypesenseOnNewCommunity(payload: {
  accountId: string;
}) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('typesenseSetup', payload, {
    maxAttempts: 1,
  });
}
