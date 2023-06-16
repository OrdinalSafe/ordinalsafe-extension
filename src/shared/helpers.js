export const openTab = (tab) => {
  chrome.tabs.create({ url: `popup.html#/${tab}` });
};
