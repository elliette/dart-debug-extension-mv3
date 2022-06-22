// A hack to allow the detector.js content script to use module import syntax.
(async () => {
    const src = chrome.runtime.getURL('detector.js');
    const detectorScript = await import(src);
    detectorScript.main();
  })();