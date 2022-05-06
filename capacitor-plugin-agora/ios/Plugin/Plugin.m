#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(CapacitorAgora, "CapacitorAgora",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);

           CAP_PLUGIN_METHOD(agoraServiceInitializeClient, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceGetDevices, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceJoin, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceJoinAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceLeave, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceOnRemoteVolumeIndicator, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(agoraServiceOnRemoteUsersStatusChange, CAPPluginReturnPromise);
)
