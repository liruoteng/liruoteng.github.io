const downloads = {
  macos: {
    command:
      "curl -L https://liruoteng.github.io/software/downloads/grapheme-macos.dmg -o Grapheme.dmg",
    href: "./downloads/grapheme-macos.dmg",
  },
  windows: {
    command:
      "curl.exe -L https://liruoteng.github.io/software/downloads/grapheme-windows.msi -o Grapheme.msi",
    href: "./downloads/grapheme-windows.msi",
  },
  linux: {
    command:
      "curl -L https://liruoteng.github.io/software/downloads/grapheme-linux.AppImage -o Grapheme.AppImage && chmod +x Grapheme.AppImage",
    href: "./downloads/grapheme-linux.AppImage",
  },
};

const command = document.querySelector("#install-command");
const directDownload = document.querySelector("#direct-download");
const copyButton = document.querySelector("[data-copy-command]");

for (const tab of document.querySelectorAll("[data-platform]")) {
  tab.addEventListener("click", () => {
    const download = downloads[tab.dataset.platform];
    command.textContent = download.command;
    directDownload.href = download.href;

    for (const item of document.querySelectorAll("[data-platform]")) {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    }
  });
}

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(command.textContent);
  copyButton.textContent = "Copied";

  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1600);
});
