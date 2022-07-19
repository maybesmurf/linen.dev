import { AccountWithSlackAuthAndChannels } from '../../types/partialTypes';
import { joinChannel } from '../../fetch_all_conversations';
import { channelIndex, createManyChannel } from '../../lib/models';
import { getSlackChannels } from '.';
import { sleep } from '../../utilities/retryPromises';

export async function createChannels({
  slackTeamId,
  token,
  accountId,
}: {
  slackTeamId: string;
  token: string;
  accountId: string;
}) {
  const channelsResponse = await getSlackChannels(slackTeamId, token);
  const channelsParam = channelsResponse.body.channels.map(
    (channel: { id: any; name: any }) => {
      return {
        externalChannelId: channel.id,
        channelName: channel.name,
        accountId,
      };
    }
  );

  try {
    await createManyChannel(channelsParam);
  } catch (e) {
    console.log('Error creating Channels:', e);
  }

  const channels = await channelIndex(accountId);

  console.log('Joining channels started');
  let sleeping = sleep(60 * 1000);
  let counter = 0;
  const filteredChannels = channels.filter(
    (c) => c.externalPageCursor !== 'completed'
  );

  for (let channel of filteredChannels) {
    counter++;
    await joinChannel(channel.externalChannelId, token);
    // Slack's api can handle bursts
    // so only wait for requests if there are more than 50 messages
    if (counter >= 50) {
      await sleeping;
      counter = 0;
      sleeping = sleep(60 * 1000);
    }
  }
  console.log('Joining channels ended');

  return channels;
}

export async function syncChannels({
  account,
  token,
  accountId,
  channelId,
}: {
  account: AccountWithSlackAuthAndChannels;
  token: string;
  accountId: string;
  channelId?: string;
}) {
  let channels = await createChannels({
    slackTeamId: account.slackTeamId as string,
    token,
    accountId,
  });

  // If channelId is part of parameter only sync the specific channel
  if (!!channelId) {
    const channel = channels.find((c) => c.id === channelId);
    if (!!channel) {
      channels = [channel];
    }
  }
  return channels;
}
