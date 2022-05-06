import { WebPlugin } from '@capacitor/core';
import { CapacitorAgoraPlugin } from './definitions';

export class CapacitorAgoraWeb extends WebPlugin implements CapacitorAgoraPlugin {
  constructor() {
    super({
      name: 'CapacitorAgora',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }


  async agoraServiceInitializeClient(options: { appId: string }): Promise<any> {
    console.log('agoraServiceInitializeClient =====>', options)
    return;
  }

  async agoraServiceGetDevices(): Promise<any> {
    return;
  }

  async agoraServiceJoin(options: {
    appId: string,
    channelName: string,
    rtcToken: string,
    uid: string
  }): Promise<any> {
    console.log('agoraServiceJoin =====>', options)
    return;
  }

  async agoraServiceJoinAudio(): Promise<any> {
    return;
  }

  async agoraServiceLeave(): Promise<any> {
    return;
  }

  async agoraServiceOnRemoteVolumeIndicator(): Promise<any> {
    return;
  }

  async agoraServiceOnRemoteUsersStatusChange(): Promise<any> {
    return;
  }
}

const CapacitorAgora = new CapacitorAgoraWeb();

export { CapacitorAgora };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(CapacitorAgora);
