declare module '@capacitor/core' {
  interface PluginRegistry {
    CapacitorAgora: CapacitorAgoraPlugin;
  }
}

export interface CapacitorAgoraPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  agoraServiceInitializeClient(options: { appId: string }): Promise<any>;
  agoraServiceGetDevices(): Promise<any>;
  agoraServiceJoin(options: {
    appId: string,
    channelName: string,
    rtcToken: string,
    uid: string;
  }): Promise<any>;
  agoraServiceJoinAudio(): Promise<any>;
  agoraServiceLeave(): Promise<any>;
  agoraServiceOnRemoteVolumeIndicator(): Promise<any>;
  agoraServiceOnRemoteUsersStatusChange(): Promise<any>;
}
