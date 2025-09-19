var ui = $(".ui"),
    sidebar = $(".ui__sidebar"),
    main = $(".ui__main"),
    uploadDrop = $(".upload-drop"),
    Base_Url = "https://ultimately-examples-prevention-brick.trycloudflare.com"

// SIDEBAR TOGGLE
$(".sidebar-toggle").on("click", function(e) {
    e.preventDefault();
    ui.toggleClass("ui__sidebar--open");
});

// MODAL
$("[data-modal]").on("click", function(e) {
    e.preventDefault();
    var target = $(this).data("modal");
    openModal(target);
});

function openModal(id) {
    $("#" + id).toggleClass("info-modal--active");
    $('[data-modal="' + id + '"]').toggleClass("ui__btn--active");
}

// OVERLAY
$("[data-overlay]").on("click", function(e) {
    e.preventDefault();
    var target = $(this).data("overlay");
    openOverlay(target);
});

// Close Overlay on Overlay Background Click
$(".overlay").on("click", function(e) {
    if (e.target !== e.currentTarget) return;
    closeOverlay();
});

$(".overlay__close").on("click", function(e) {
    closeOverlay();
});

function openOverlay(id) {
    $("#" + id + ".overlay").addClass("overlay--active");
}

function closeOverlay() {
    $(".overlay--active").removeClass("overlay--active");
}

// File Tree
$(".folder").on("click", function(e) {
    var t = $(this);
    var tree = t.closest(".file-tree__item");

    if (t.hasClass("folder--open")) {
        t.removeClass("folder--open");
        tree.removeClass("file-tree__item--open");
    } else {
        t.addClass("folder--open");
        tree.addClass("file-tree__item--open");
    }

    // Close all siblings
    tree
        .siblings()
        .removeClass("file-tree__item--open")
        .find(".folder--open")
        .removeClass("folder--open");
});

// DRAG & DROP
var dc = 0;
uploadDrop
    .on("dragover", function(e) {
    dc = 0;
    drag($(this), e);
})
    .on("dragenter", function(e) {
    drag($(this), e);
    dc++;
})
    .on("dragleave", function(e) {
    dragend($(this), e);
    dc--;
})
    .on("drop", function(e) {
    drop($(this), e);
});

function drag(that, e) {
    e.preventDefault();
    e.stopPropagation();
    that.addClass("upload-drop--dragover");
}

function dragend(that, e) {
    e.preventDefault();
    e.stopPropagation();
    if (dc === 0) {
        $(".upload-drop--dragover").removeClass("upload-drop--dragover");
    }
}

function drop(that, e) {
    dc = 0;
    dragend($(this), e);
    // Handle file
    alert("It seems you dropped something!");
}

// SORTING
function sortTable(n, method) {
    var table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
    table = document.getElementById("file-table");
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("tr");

        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[n];
            y = rows[i + 1].getElementsByTagName("td")[n];

            if (method == "123") {
                if (dir == "asc") {
                    if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else {
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

// ----------------- GLOBAL SELECTION CHECK -----------------
function checkSelection() {
    const anySelected = $(".file-list__file.selected").length > 0;
    $(".download-btn").css("display", anySelected ? "inline-block" : "none");
}

// ----------------- CONTEXT MENU -----------------
function showContextMenu(e, $target, isFile) {
    e.preventDefault();
    const name = $target.data("name") || $target.text().trim();
    const path = $target.data("path") || "";

    console.log("⚡ Context Menu Triggered:", { name, path, isFile });

    $("#contextMenu")
        .css({ top: e.pageY + "px", left: e.pageX + "px", display: "block" })
        .data("target", { name, path, isFile });
}

// Hide context menu & clear selection on outside click
$(document).on("click", function(e) {
    if (!$(e.target).closest(".file-list__file, .folder, .download-btn").length) {
        $("#contextMenu").hide();
        $(".selected").removeClass("selected");
        checkSelection();
    }
});

$(document).on("click", function(e) {
    // Hide context menu if clicking anywhere
    $("#contextMenu").hide();

    // Only remove checkboxes if the click was outside a file row or download button
    if (!$(e.target).closest(".file-list__file, .download-btn").length) {
        $(".file-select").closest("td").remove();
        $(".file-list__header th.selection-space").remove();
        $(".download-btn").hide();
        $("#file-table").removeClass("selection-mode");
    }
});

// ----------------- ROW CLICK IN SELECTION MODE -----------------
$(document).on("click", ".file-list__file", function(e) {
    const table = $("#file-table");
    if (!table.hasClass("selection-mode")){
        $(".file-list__file").removeClass("selected");
        $(this).addClass("selected");
        checkSelection();
        return
    };

    const $row = $(this);
    const $chk = $row.find(".file-select");

    // if the click was on the checkbox, don't toggle twice
    if ($(e.target).is(".file-select")) return;

    // Toggle checkbox & row highlight
    $chk.prop("checked", !$chk.prop("checked"));
    $row.toggleClass("selected", $chk.prop("checked"));
    checkSelection();
});

// ----------------- CHECKBOX CLICK -----------------
$(document).on("click", ".file-select", function(e) {
    const $chk = $(this);
    const $row = $chk.closest(".file-list__file");

    $row.toggleClass("selected", $chk.prop("checked"));
    checkSelection();

    e.stopPropagation(); // ✅ prevent row click from firing
});

// ----------------- FILE DOUBLE CLICK -----------------
$(document).on("dblclick", ".file-list__file", function(e) {
    const $row = $(e.currentTarget);
    const name = $row.data("name");
    const path = $row.data("path");

    if (!name) return console.error("⚠️ No data-name found:", $row);

    const ext = name.split(".").pop().toLowerCase();
    if (["py","js","html","css"].includes(ext)) {
        $("#previewOptionsModal").show().data({ file: name, path: path });
    } else {
        previewFile(name, path);
    }
});

// ----------------- FOLDER RIGHT CLICK -----------------
$(document).on("contextmenu", ".folder", function(e) {
    e.preventDefault();
    const folderName = $(this).text();

    // remove old selections
    $(".folder").removeClass("folder-selected");
    // add new selection
    $(this).addClass("folder-selected");

    // reset file selection UI
    $(".file-select").closest("td").remove();
    $(".download-btn").hide();
    $(".file-list__header th.selection-space").remove();
    $("#file-table").removeClass("selection-mode");

    // show context menu
    $("#contextMenu")
        .html("<li id='download-folder'>Download as ZIP</li>")
        .css({ top: e.pageY, left: e.pageX, display: "block" })
        .data("folder", folderName);
});

function getFolderPaths(clickedFolder) {
    console.log("📂 [getFolderPath] START");

    let pathParts = [];
    let current = $(clickedFolder);

    while (current.length) {
        if (current.hasClass("folder")) {
            let folderName = current.clone()       // clone node
                                .children()        // remove child elements
                                .remove()         
                                .end()
                                .text()
                                .trim();
            if (folderName) {
                pathParts.unshift(folderName);
                console.log("✅ Added folder:", folderName);
            }
        }
        current = current.closest("li").parent("ul").closest("li").children(".folder");
    }

    let path = pathParts.join("/"); // ⚡ THIS IS THE STRING
    console.log("🏁 FINAL PATH (STRING!):", path, typeof path);
    return path; // MUST RETURN STRING, not pathParts array
}




$(document).on("click", "#download-folder", function() {
    console.log("🔥 CLICK detected on #download-folder");

    let download = [];

    const $row = $(".folder-selected");
    console.log("👉 Selected DOM element(s):", $row.get());

    if ($row.length === 0) {
        console.warn("⚠ No folder selected! Aborting download.");
        return;
    }

    const path = getFolderPaths($row);
    console.log("✅ Path returned from getFolderPath:", path);

    download.push({ name: null, path: path });

    console.log("⬇️ Sending to download_this():", download);

    download_this(download);
});


// ----------------- LONG PRESS SELECTION -----------------
let pressTimer;

$(document).on("mousedown", ".file-list__file", function(e) {
    const $file = $(this);
    pressTimer = setTimeout(() => enableSelectionMode(), 700); // 0.7s
})
.on("mouseup mouseleave", ".file-list__file", function() {
    clearTimeout(pressTimer);
});

function enableSelectionMode() {
    const table = $("#file-table");
    
        $(".file-list__file").removeClass("selected");

    // Add extra <th> if not present
    const header = table.find(".file-list__header");
    if (header.find("th.selection-space").length === 0) {
        header.prepend('<th class="selection-space" style="width: 20px;"></th>');
    }

    // Add checkboxes if missing
    table.find(".file-list__file").each(function() {
        const $row = $(this);
        if ($row.find(".file-select").length === 0) {
            const $chk = $('<input type="checkbox" class="file-select">');
            $row.prepend($("<td>").append($chk));
        }
    });

    table.addClass("selection-mode");
}

// Checkbox change listener
$(document).on("change", ".file-select", function() {
    const anySelected = $(".file-select:checked").length > 0;
    $(".download-btn").css("display", anySelected ? "block" : "none");
});

// ----------------- DOWNLOAD BUTTON CLICK -----------------
$(document).on("click", ".download-btn", async function() {
    const selectedRows = $(".file-list__file.selected");
    console.log("=> Download button pressed")

    if (selectedRows.length === 0) {
        console.warn("⚠️ No files selected for download!");
        return;
    }

    download = [];

    selectedRows.each(function() {
        const $row = $(this);
        const path = $row.data("path") || "";
        let name;

        // If in selection mode, checkbox is first <td>, so file name is 2nd <td>
        if ($("#file-table").hasClass("selection-mode")) {
            name = $row.children("td").eq(1).text().trim();
        } else {
            name = $row.children("td").eq(0).text().trim();
        }

        download.push({ name: name, path: path });

        console.log("⬇ Selected file/folder:", { name, path });
    });
    
    
    download_this(download);

});


async function download_this(download){
    let type = download.length === 1 
    ? (download[0].name ? "File" : "Folder") 
    : "Files";


    console.log(download);
    console.log(type);
    try {
    const resp = await fetch(`${Base_Url}/download/files?files=${encodeURIComponent(JSON.stringify(download))}`);
    
    if (!resp.ok) throw new Error("Network response was not ok");

    const blob = await resp.blob(); 
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    

    

    if (download.length === 1 && type === "File") {a.download = download[0].name;} else if (type !=="File") {a.download = "selected-files.zip"; }

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    console.log("Download started ✅");
} catch (err) {
    console.error("Download failed:", err);
}


}

// ----------------- NAVIGATE VIA BREADCRUMB ----------------- 
async function navigateToPath(pathArr) {
 const fullPath = pathArr.join("/"); 
 $(".file-tree__item").removeClass("file-tree__item--open") 
 .find(".folder--open").removeClass("folder--open"); 
 let current = $(".file-tree"); 
 for (let name of pathArr) {
     const $folderDiv = current.children(".file-tree__item") 
     .children(".folder") .filter((i, el) => $(el).text() === name) 
     .first(); 
    if (!$folderDiv.length) break;
    $folderDiv.addClass("folder--open"); 
    $folderDiv.closest(".file-tree__item").addClass("file-tree__item--open"); 
    current = $folderDiv.siblings(".file-tree__subtree"); 
} 
await loadFiles(fullPath); 
updateFilePath(pathArr); 
}

// ----------------- BREADCRUMB -----------------
function updateFilePath(pathParts) {
    const ul = $(".file-path").first().empty();

    pathParts.forEach((name, idx) => {
        const li = $("<li>");
        const a = $("<a>")
            .text(name)
            .attr("href", "#");

        // When clicking breadcrumb → navigate back
        a.on("click", e => {
            e.preventDefault();
            navigateToPath(pathParts.slice(0, idx + 1));
        });

        li.append(a);
        ul.append(li);
    });
}


// ----------------- FILE LOADER -----------------
async function loadFiles(path) {
    try {
        console.log("📂 [DEBUG] loadFiles called for path:", path);
        const resp = await fetch(`${Base_Url}/api/files?path=${encodeURIComponent(path)}`);
        const files = await resp.json();
        console.log("📦 [DEBUG] Files received:", files);

        const table = $("#file-table");
        table.find("tr.file-list__file").remove();

        files.forEach(file => {
            const row = $("<tr>").addClass("file-list__file").attr("data-name", file.name).attr("data-path", path);   // 👈 full path you already have
            row.append($("<td>").text(file.name));
            row.append($("<td>").text(file.type));
            row.append($("<td>").text(file.size));
            row.append($("<td>").text("privat"));
            table.append(row);
        });
    } catch (err) {
        console.error("💥 [DEBUG] Error loading files:", err);
    }
}

// ----------------- GET FULL PATH -----------------
function getFolderPath(treeItem) {
    const pathParts = [];
    let current = treeItem;
    while (current.length) {
        const folderName = current.children(".folder").first().text();
        pathParts.unshift(folderName);
        current = current.parent().closest(".file-tree__item");
    }
    console.log("📌 [DEBUG] Computed pathParts:", pathParts);
    return pathParts;
}

// ----------------- LAZY LOAD SUBFOLDERS -----------------
async function loadSubfolders(treeItem, path) {
    if (treeItem.children("ul.file-tree__subtree").length) {
        console.log("✅ [DEBUG] Subtree already exists for", path);
        return;
    }

    console.log("🔍 [DEBUG] Fetching subfolders for:", path);
    try {
        const resp = await fetch(`${Base_Url}/api/folders?path=${encodeURIComponent(path)}`);
        const data = await resp.json();
        console.log("📦 [DEBUG] Subfolders response:", data);

        const ul = $("<ul>").addClass("file-tree__subtree");

        data.folders.forEach(sub => {
            const li = $("<li>").addClass("file-tree__item");
            const folderDiv = $("<div>").addClass("folder").text(sub);
            li.append(folderDiv);
            ul.append(li);
        });

        treeItem.append(ul);

        // Debug: show DOM insertion
        console.log("🌳 [DEBUG] Updated treeItem HTML:", treeItem.html());

        // Re-bind click handler for newly added folders
        $(".folder").off("click").on("click", async function () {
            await folderClickHandler($(this));
        });
    } catch (err) {
        console.error("💥 [DEBUG] Error loading subfolders for", path, err);
    }
}

// ----------------- FOLDER CLICK -----------------
async function folderClickHandler(t) {
    const treeItem = t.closest(".file-tree__item");

    // Toggle open/close on clicked folder
    const isOpen = t.hasClass("folder--open");
    t.toggleClass("folder--open", !isOpen);
    treeItem.toggleClass("file-tree__item--open", !isOpen);

    // Close siblings (hide their subtrees too)
    treeItem.siblings()
            .removeClass("file-tree__item--open")
            .find(".folder--open").removeClass("folder--open")
            .siblings("ul.file-tree__subtree").slideUp();

    const pathParts = getFolderPath(treeItem);
    const fullPath = pathParts.join("/");

    console.log("📂 [DEBUG] Folder clicked:", fullPath);

    // Lazy-load subfolders if they don't exist
    await loadSubfolders(treeItem, fullPath);

    // Hide children by default if newly loaded
    const $subtree = treeItem.children("ul.file-tree__subtree");
    if ($subtree.length) {
        if (isOpen) {
            $subtree.slideUp();  // closing folder → hide children
        } else {
            $subtree.hide().slideDown(); // newly loaded → hide then show with animation
        }
    }

    // Load files for clicked folder
    await loadFiles(fullPath);

    // Update breadcrumb
    updateFilePath(pathParts);
}


// ----------------- INIT TREE -----------------
async function debugLoadProjects() {
    console.log("🔎 debugLoadProjects: starting...");
    const endpoints = [`${Base_Url}/testing/html`, `${Base_Url}/testing/html/data`];
    let json = null;

    for (const ep of endpoints) {
        try {
            const resp = await fetch(ep, {cache: "no-store"});
            const text = await resp.text();
            json = JSON.parse(text);
            console.log("✅ [DEBUG] JSON from endpoint:", ep, json);
            break;
        } catch (err) {
            console.warn("⚠️ [DEBUG] Failed to parse JSON from", ep, err);
        }
    }

    if (!json) return console.error("💥 No JSON received from endpoints.");

    window.__debugProjectJSON = json;

    const treeEls = $(".file-tree");
    if (!treeEls.length) return console.error("🚨 No .file-tree element found.");

    treeEls.each((idx, el) => {
        const $el = $(el).empty();
        for (let project in json) {
            const li = $("<li>").addClass("file-tree__item");
            const folderDiv = $("<div>").addClass("folder").text(project);
            li.append(folderDiv);
            $el.append(li);
        }
    });

    $(".folder").off("click").on("click", async function () {
        await folderClickHandler($(this));
    });

    console.log("✅ debugLoadProjects finished.");
}

// ----------------- DOM READY -----------------
$(document).ready(debugLoadProjects);
