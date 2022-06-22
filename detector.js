import { scripts, Message } from './shared.js';

export function main() {
    document.addEventListener('dart-app-ready', function (_) {
        chrome.runtime.sendMessage(new Message(scripts.BACKGROUND, scripts.DETECTOR, 'Dart app detected!'));
    });
}

