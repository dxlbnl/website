---
pageType: note
title: <% tp.file.folder(false).replace(/^\d+-/, '') %>
date: <% tp.date.now("YYYY-MM-DD") %>
kind: BUILD
tags: []
lede: ""
images: []
productId: ""
---
<%*
  // 1. Get current folder info
  const currentFolder = app.vault.getAbstractFileByPath(tp.file.folder(true));
  if (!currentFolder) return;

  const folderName = currentFolder.name;
  const notesFolder = app.vault.getAbstractFileByPath("notes");

  // 2. Only rename if we are inside the 'notes' directory and don't have a prefix yet
  if (notesFolder && currentFolder.parent && currentFolder.parent.path === "notes" && !folderName.match(/^\d+-/)) {
    let maxNum = 0;
    notesFolder.children.forEach(child => {
      const match = child.name.match(/^(\d+)-/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const newFolderName = `${nextNum}-${folderName}`;
    const newFolderPath = `notes/${newFolderName}`;
    
    await app.fileManager.renameFile(currentFolder, newFolderPath);
  }

  // 3. Create the media folder (using the updated folder path)
  const updatedFolder = app.vault.getAbstractFileByPath(tp.file.folder(true));
  if (updatedFolder) {
    const mediaPath = updatedFolder.path + "/media";
    if (!(await app.vault.adapter.exists(mediaPath))) {
      await app.vault.adapter.mkdir(mediaPath);
    }
  }
%>
