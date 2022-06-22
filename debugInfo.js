import { Message, scripts } from './shared.js';

const debugInfo = readDartDebugInfo();
sendDebugInfoToIframeScript(debugInfo);

// TODO: Need to handle nested frames here.
function readDartDebugInfo() {
    return {
        origin: window.location.origin,
        extensionUri: window.$dartExtensionUri,
        appId: window.$dartAppId,
        instanceId: window.$dartAppInstanceId,
    };
}

function sendDebugInfoToIframeScript(info) {
    const iframe = document.getElementById('dartDebugExtensionIframe');
    iframe.contentWindow.postMessage(new Message(scripts.IFRAME, scripts.DEBUG_INFO, info), '*');
}
