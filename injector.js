import { scripts, Message } from './shared.js';

export function main() {
    listenForMessagesFromIframeScript();
    injectIframe();
}

function injectIframe() {
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('iframe.html');
    iframe.id = 'dartDebugExtensionIframe';
    document.body.append(iframe);
}

function listenForMessagesFromIframeScript() {
    window.addEventListener('message', function (event) {
        if (event.data.from == scripts.IFRAME && event.data.body == 'ready!') {
            // At this point, we can inject the script. This
            // will get the Dart debugging global variables:
            injectDebugInfoScript();
            // Send a message back to the IFRAME so that it
            // has access to the tab ID to attach the debugger.
            sendMessageToIframe('start debugging!');
        }
    });
}

function injectDebugInfoScript() {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = chrome.runtime.getURL('debugInfo.js');
    document.head.append(script);
}

function sendMessageToIframe(msg) {
    chrome.runtime.sendMessage(new Message(scripts.IFRAME, scripts.INJECTOR, msg));
}
