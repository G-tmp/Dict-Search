const list = document.getElementById("list");
const nameInput = document.getElementById("name");
const urlInput = document.getElementById("url");

// Update and show rule list
async function update() {
  const { sites = [] } = await browser.storage.sync.get("sites");
  list.innerHTML = "";

  for (const site of sites) {
    const div = document.createElement("div");
    div.className = "site";
    div.textContent = `${site.name} - ${site.url}`;

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.onclick = async () => {
      nameInput.value = site.name;
      urlInput.value = site.url;
    };

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = async () => {
      const newSites = sites.filter(s => s.id !== site.id);
      await browser.storage.sync.set({ sites: newSites });
      update();
    };

    div.appendChild(edit);
    div.appendChild(del);
    list.appendChild(div);
  }
}

document.getElementById("add").onclick = async (e) => {
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!name || !url || !url.includes("{word}")) {
    e.preventDefault();
    return;
  }

  let { sites = [] } = await browser.storage.sync.get("sites");
  // unique site name 
  sites = sites.filter(s => s.name.toLowerCase() !== name.toLowerCase())

  sites.push({
    id: crypto.randomUUID(),
    name,
    url
  });

  await browser.storage.sync.set({ sites });

  nameInput.value = "";
  urlInput.value = "";
  update();
};

update();
