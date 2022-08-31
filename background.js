import { scripts } from './shared.js';

chrome.runtime.onMessage.addListener(maybeUpdateIcon);
chrome.action.onClicked.addListener(async () => {
    await openDebugConnectionTab();
    executeInjectorScript();
});

function maybeUpdateIcon(e) {
    if (e.to == scripts.BACKGROUND && e.body == 'Dart app detected!') {
        chrome.action.setIcon({ path: 'dart.png' });
    }
}

async function openDebugConnectionTab() {
    const url = chrome.runtime.getURL('debugConnection.html')
    return chrome.tabs.create(
        {
            url,
            active: false,
            pinned: true,
        }
    );
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