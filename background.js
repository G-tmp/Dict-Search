const ROOT_MENU_ID = "dictionary-root";

/* default dictionary (first install) */
const DEFAULT_SITES = [
  {
    id: "cambridge",
    name: "Cambridge",
    url: "https://dictionary.cambridge.org/dictionary/english/{word}"
  }
];

// create menu and submenus
async function createMenus(sites) {
  browser.menus.removeAll();

  browser.menus.create({
    id: ROOT_MENU_ID,
    title: "Search Dictionary",
    contexts: ["selection"]
  });

  for (const site of sites) {
    const base64Icon = await downloadIcon(new URL(site.url).origin + "/favicon.ico");
    browser.menus.create({
      id: site.id,
      parentId: ROOT_MENU_ID,
      title: site.name,
      icons: {
        16: base64Icon,
      }, 
      contexts: ["selection"]
    });
  }
}

// First install
browser.runtime.onInstalled.addListener(async () => {
  const { sites } = await browser.storage.sync.get("sites");

  if (!sites) {
    await browser.storage.sync.set({ sites: DEFAULT_SITES });
    createMenus(DEFAULT_SITES);
  } else {
    createMenus(sites);
  }
});

// right click
browser.menus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) 
    return;

  const word = info.selectionText.trim().toLowerCase();
  const { sites } = await browser.storage.sync.get("sites");

  const site = sites.find(s => s.id === info.menuItemId);
  if (!site) 
    return;

  const url = site.url.replace("{word}", encodeURIComponent(word));
  browser.tabs.create({ url });
});


/* rebuild menus when options change */
browser.storage.onChanged.addListener(async () => {
  browser.storage.sync.get("sites").then(({ sites }) => {
    createMenus(sites || []);
  });
});


// get icon blob data
async function downloadIcon(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // base64
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}