// A hack to allow the injector.js content script to use module import syntax.
(async () => {
    const src = chrome.runtime.getURL('injector.js');
    const injectorScript = await import(src);
    injectorScript.main();
  })();