import { scripts } from './shared.js';

chrome.runtime.onMessage.addListener(maybeUpdateIcon);
chrome.action.onClicked.addListener(executeInjectorScript);

function maybeUpdateIcon(e) {
    if (e.to == scripts.BACKGROUND && e.body == 'Dart app detected!') {
        chrome.action.setIcon({path: 'dart.png'});
    }
}

async function executeInjectorScript() {
    const tabId = await getTabId();
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["injectorLoader.js"],
    });
}

async function getTabId() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}