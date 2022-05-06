import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { AgoraConfig } from "../agora-config";
import { IVideoTrack, IJoinChannelApply, IVideoJoinChannel } from "../core/interfaces";
import { VideoTrack } from "./video-track";

export class JoinVideoChannel implements IVideoJoinChannel<IVideoTrack>{
    private localVideoTrack !: ILocalVideoTrack;
    private requestInWait!: Promise<ILocalVideoTrack>;

    constructor(
        public client: IAgoraRTCClient,
        public config: AgoraConfig,
        public channelName: string,
        public token: string,
        public uid?: string
    ) { }

    public WithMediaStream(mediaStream: MediaStreamTrack): IJoinChannelApply<IVideoTrack> {
        this.localVideoTrack = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: mediaStream });
        return this;
    }

    public WithCamera(cameraId: string): IJoinChannelApply<IVideoTrack> {
        this.requestInWait = AgoraRTC.createCameraVideoTrack({ cameraId, optimizationMode: 'motion' });
        return this;
    }

    public async Apply(): Promise<IVideoTrack> {


        await this.client.join(this.config.AppID, this.channelName, this.token, this.uid);

        let localTrack: any;
        if (this.requestInWait) { localTrack = await this.requestInWait; }
        else if (this.localVideoTrack) { localTrack = this.localVideoTrack; }
        else { localTrack = await AgoraRTC.createCameraVideoTrack({optimizationMode: 'motion'}); }

        await this.client.publish(localTrack);

        const videTrack = new VideoTrack(localTrack);

        return new Promise<IVideoTrack>((resolve, reject) => {
            resolve(videTrack);
            reject();
        });

    }

}
