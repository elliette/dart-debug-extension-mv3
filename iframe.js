import { Message, Deferred, scripts } from './shared.js';

const deferredDartDebugInfo = new Deferred();
const deferredWs = new Deferred();
const deferredDebuggee = new Deferred();

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
                await startDebugging(sender.tab.id);
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

async function startDebugging(tabId) {
    listenForExecutionContextCreated();

    const debuggee = { tabId: tabId };
    deferredDebuggee.resolve(debuggee);
    await chrome.debugger.attach(debuggee, '1.0');
    await chrome.debugger.sendCommand(debuggee, 'Runtime.enable');
}

function listenForExecutionContextCreated() {
    chrome.debugger.onEvent.addListener(async function (_, method, params) {
        if (method != 'Runtime.executionContextCreated') return;

        const { origin } = await deferredDartDebugInfo.promise;
        if (origin == params.context.origin) {
            maybeConnectToDwds(params.context);
        }
    });
}

async function maybeConnectToDwds(context) {
    const { extensionUri } = await deferredDartDebugInfo.promise;
    const ws = new WebSocket(extensionUri);
  
    ws.onopen = function() {
        deferredWs.resolve(ws);
    }

    forwardChromeDebuggerEventsToDwds();
    forwardDwdsEventsToChromeDebugger();
    sendDevToolsRequestToDwds(context.id);
}

async function sendDevToolsRequestToDwds(contextId) {
    const ws = await deferredWs.promise;
    const { origin, appId, instanceId } = await deferredDartDebugInfo.promise;
    const message = [
        'DevToolsRequest',
        'appId', appId,
        'instanceId', instanceId,
        'contextId', contextId,
        'tabUrl', origin,
        'uriOnly', false
    ];

    ws.send(JSON.stringify(message));
}

function forwardChromeDebuggerEventsToDwds() {
    chrome.debugger.onEvent.addListener(async function (_, method, params) {
        const ws = await deferredWs.promise;
        if (ws.readyState != 1) return;

        const message = [
            'ExtensionEvent',
            'params', JSON.stringify(params),
            'method', JSON.stringify(method)
        ];
        const msg = JSON.stringify(message);
        ws.send(msg);
    });
}

async function forwardDwdsEventsToChromeDebugger() {
    const ws = await deferredWs.promise;

    ws.onmessage = async function (event) {
        const message = JSON.parse(event.data);
        if (message[0] == 'ExtensionRequest') {
            const id = message[2];
            const command = message[4];
            const params = message[6];
            const debuggee = await deferredDebuggee.promise;
            const response = await chrome.debugger.sendCommand(debuggee, command, JSON.parse(params));
            const responseMessage = [
                'ExtensionResponse',
                'id', id,
                'success', true,
                'result', JSON.stringify(response)
            ];
            ws.send(JSON.stringify(responseMessage));
        }
    };
}
