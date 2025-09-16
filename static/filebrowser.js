var ui = $(".ui"),
    sidebar = $(".ui__sidebar"),
    main = $(".ui__main"),
    uploadDrop = $(".upload-drop");

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
        const resp = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        const files = await resp.json();
        console.log("📦 [DEBUG] Files received:", files);

        const table = $("#file-table");
        table.find("tr.file-list__file").remove();

        files.forEach(file => {
            const row = $("<tr>").addClass("file-list__file");
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
        const resp = await fetch(`/api/folders?path=${encodeURIComponent(path)}`);
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
    const endpoints = ["/testing/html", "/testing/html/data"];
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
