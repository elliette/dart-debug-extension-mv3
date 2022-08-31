import { Message, Deferred, scripts } from './shared.js';

const deferredDartDebugInfo = new Deferred();
const channel = new BroadcastChannel('debug-connection');

listenForMessagesFromInjectorScript();
listenForMessagesFromDebugInfoScript();

// Send message to the injector script that the IFRAME has loaded. 
// This allows the injector script to send a message back, so
// that the IFRAME has access to its tab ID.
sendMessageToInjectorScript('ready!');

function sendMessageToInjectorScript(msg) {
    window.parent.postMessage(new Message(scripts.INJECTOR, scripts.IFRAME, msg), '*');
}

function listenForMessagesFromInjectorScript() {
    chrome.runtime.onMessage.addListener(
        async function (request, sender, _) {
            if (request.from == scripts.INJECTOR && request.body == 'start debugging!') {
                const debugInfo = await deferredDartDebugInfo.promise;
                // Send message to the debug connection script so that it can start debugging.
                channel.postMessage(new Message(
                    scripts.DEBUG_CONNECTION,
                    scripts.IFRAME,
                    { ...debugInfo, tabId: sender.tab.id }
                ), '*')
            }
        });
}

function listenForMessagesFromDebugInfoScript() {
    window.addEventListener('message', function (event) {
        if (event.data.from == scripts.DEBUG_INFO) {
            deferredDartDebugInfo.resolve(event.data.body);
        }
    });
}
