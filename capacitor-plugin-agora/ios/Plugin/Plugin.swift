import Foundation
import Capacitor
import AgoraRtcKit
import UIKit
/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */

@available(iOS 13.0, *)
@objc(CapacitorAgora)
public class CapacitorAgora: CAPPlugin, AgoraRtcEngineDelegate, UIWindowSceneDelegate {
    
    public var window: UIWindow?
    var localVideoView: UIView!
    
    var agoraKit: AgoraRtcEngineKit?
    lazy var userID: UInt = 0

    @available(iOS 13.0, *)
    public func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = ChannelViewController()
        self.window = window
        window.makeKeyAndVisible()
    }

    @objc override public func load() {
    }
    

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success(["value": value])
    }


    @objc func agoraServiceInitializeClient(_ call: CAPPluginCall) {
        let appId = call.getString("appId") ?? ""
        self.agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: appId, delegate: self)
        agoraKit?.setChannelProfile(.liveBroadcasting)
        agoraKit?.setClientRole(.broadcaster)
        agoraKit?.enableDualStreamMode(true);
        agoraKit?.enableWebSdkInteroperability(true);
        agoraKit?.enableVideo();
        agoraKit?.enableAudio();
        call.resolve()
    }

    @objc func agoraServiceGetDevices(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func agoraServiceJoin(_ call: CAPPluginCall) {
        
        let appId = call.getString("appId") ?? ""
        let channelName = call.getString("channelName") ?? ""
        let rtcToken = call.getString("rtcToken") ?? ""
        let uid = call.getString("uid") ?? "0"
        
        print("appId =====>", appId)
        print("channelName =====>", channelName)
        print("rtcToken =====>", rtcToken)
        print("uid =====>", uid)
        
        agoraKit?.enableVideo();
        agoraKit?.enableAudio();
        
        DispatchQueue.main.async {
            
            let channelViewController = ChannelViewController()
            channelViewController.appId = appId
            channelViewController.channelName = channelName
            channelViewController.channelToken = rtcToken
            channelViewController.userID = UInt(Int(uid) ?? 0)
            
            self.bridge.viewController.present(channelViewController, animated: true, completion: nil)
            self.bridge.viewController.view.isHidden = true
        }
        
        call.resolve()
    }

    @objc func agoraServiceJoinAudio(_ call: CAPPluginCall) {
        self.agoraKit?.enableAudio()
        agoraKit?.muteLocalAudioStream(false);
        call.resolve()
    }

    @objc func agoraServiceLeave(_ call: CAPPluginCall) {
        self.agoraKit?.leaveChannel(nil)
        self.agoraKit?.disableVideo();
        self.agoraKit?.disableAudio()
        self.webView.isOpaque = true;
        localVideoView.removeFromSuperview();
        call.resolve()
    }

    @objc func agoraServiceOnRemoteVolumeIndicator(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func agoraServiceOnRemoteUsersStatusChange(_ call: CAPPluginCall) {
        call.resolve()
    }
    
    public func rtcEngineVideoDidStop(_ engine: AgoraRtcEngineKit) {
        print("Agora Engine Video Stopped")
    }
    
    func initLocalVideoView(){
        DispatchQueue.main.async {
            self.localVideoView = UIView()
            self.localVideoView.frame = CGRect(x: 0, y: 44, width: self.bridge.viewController.view.bounds.width, height: self.bridge.viewController.view.bounds.height / 2)
            self.bridge.viewController.view.addSubview(self.localVideoView)
        }
    }
}
