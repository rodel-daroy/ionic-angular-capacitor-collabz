import AgoraRtcKit

@available(iOS 13.0, *)
extension ChannelViewController: AgoraRtcEngineDelegate {
    func rtcEngineVideoDidStop(_ engine: AgoraRtcEngineKit) {
        print("Agora Engine Video Stopped")
    }

    /// Called when we get a new video feed from a remote user
    /// - Parameters:
    ///   - engine: Agora Engine.
    ///   - uid: ID of the remote user.
    ///   - size: Size of the video feed.
    ///   - elapsed: Time elapsed (ms) from the remote user sharing their video until this callback fired.
    func rtcEngine(_ engine: AgoraRtcEngineKit, firstRemoteVideoDecodedOfUid uid: UInt, size: CGSize, elapsed: Int) {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = uid
        let hostingView = UIView()
        self.agoraVideoHolder.addSubview(hostingView)
        videoCanvas.view = hostingView
        videoCanvas.renderMode = .hidden
        self.agkit.setupRemoteVideo(videoCanvas)
        userVideoLookup[uid] = videoCanvas
    }

    /// Called when the local user role successfully changes
    /// - Parameters:
    ///   - engine: AgoraRtcEngine of this session.
    ///   - oldRole: Previous role of the user.
    ///   - newRole: New role of the user.
    func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        didClientRoleChanged oldRole: AgoraClientRole,
        newRole: AgoraClientRole
    ) {
        if #available(iOS 13.0, *) {
            let hostButton = self.getHostButton()
        } else {
            // Fallback on earlier versions
        }
        hostButton!.isEnabled = true
        let isHost = newRole == .broadcaster
        hostButton!.backgroundColor = isHost ? .systemGreen : .systemRed
        hostButton!.setTitle("Host" + (isHost ? "ing" : ""), for: .normal)
        if isHost {
            if #available(iOS 13.0, *) {
                self.setupLocalAgoraVideo()
            } else {
                // Fallback on earlier versions
            }
        } else {
            userVideoLookup.removeValue(forKey: self.userID)
        }

        // Only show the camera options when we are broadcasting
        if #available(iOS 13.0, *) {
            self.getControlContainer().isHidden = !isHost
        } else {
            // Fallback on earlier versions
        }
    }

    func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        didJoinedOfUid uid: UInt,
        elapsed: Int
    ) {
        // Keeping track of all broadcasters in the session
        remoteUserIDs.insert(uid)
    }

    func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        didOfflineOfUid uid: UInt,
        reason: AgoraUserOfflineReason
    ) {
        // Removing on quit and dropped only
        // the other option is `.becomeAudience`,
        // which means it's still relevant.
        if reason == .quit || reason == .dropped {
            remoteUserIDs.remove(uid)
        } else {
            // User is no longer hosting, need to change the lookups
            // and remove this view from the list
            userVideoLookup.removeValue(forKey: uid)
        }
    }

    func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        tokenPrivilegeWillExpire token: String
    ) {
        if let tokenURL = ChannelViewController.tokenBaseURL {
            AgoraToken.fetchToken(
                urlBase: tokenURL,
                channelName: channelName,
                userId: self.userID) { result in
                switch result {
                case .failure(let err):
                    fatalError("Could not refresh token: \(err)")
                case .success(let newToken):
                    if #available(iOS 13.0, *) {
                        self.updateToken(newToken)
                    } else {
                        // Fallback on earlier versions
                    }
                }
            }
        }
    }
}
