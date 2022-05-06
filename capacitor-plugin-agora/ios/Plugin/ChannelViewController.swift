import UIKit
import AgoraRtcKit

@available(iOS 13.0, *)
class ChannelViewController: UIViewController {

    var appId: String = ""
    var channelName: String = ""
    var channelToken: String? = ""
    static var tokenBaseURL: String? = ""

    lazy var userID: UInt = 0

    var userRole: AgoraClientRole = .audience

    lazy var agkit: AgoraRtcEngineKit = {
        let engine = AgoraRtcEngineKit.sharedEngine(
            withAppId: appId,
            delegate: self
        )
        engine.setChannelProfile(.liveBroadcasting)
        engine.setClientRole(self.userRole)
        return engine
    }()

    var hostButton: UIButton?
    var closeButton: UIButton?

    var controlContainer: UIView?
    var camButton: UIButton?
    var micButton: UIButton?
    var flipButton: UIButton?
    var beautyButton: UIButton?

    var beautyOptions: AgoraBeautyOptions = {
        let bOpt = AgoraBeautyOptions()
        bOpt.smoothnessLevel = 1
        bOpt.rednessLevel = 0.1
        return bOpt
    }()

    var agoraVideoHolder = UIView()

    var remoteUserIDs: Set<UInt> = []
    var userVideoLookup: [UInt: AgoraRtcVideoCanvas] = [:] {
        didSet {
            reorganiseVideos()
        }
    }

    lazy var localVideoView: UIView = {
        let vview = UIView()
        return vview
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.addSubview(self.agoraVideoHolder)
        self.agoraVideoHolder.frame = self.view.bounds
        self.agoraVideoHolder.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        print("appId 2 =====>", appId)
        print("channelName 2 =====>", channelName)
        print("rtcToken 2 =====>", channelToken)
        print("uid 2 =====>", userID)
        if channelToken == nil {
            self.joinChannelWithFetch()
        } else {
            self.joinChannel()
        }
    }

    required init() {
        super.init(nibName: nil, bundle: nil)
        self.modalPresentationStyle = .fullScreen
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
