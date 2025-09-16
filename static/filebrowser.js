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

// Helper to load files into table
async function loadFiles(path) {
    try {
        let resp = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        let data = await resp.json();
        console.log("📦 Files received:", data);

        let table = $("#file-table");
        table.find("tr.file-list__file").remove(); // clear old

        data.forEach(file => {
            let row = $("<tr>").addClass("file-list__file");
            row.append($("<td>").text(file.name));
            row.append($("<td>").text(file.type));
            row.append($("<td>").text(file.size));
            row.append($("<td>").text("privat")); // static for now
            table.append(row);
        });
    } catch (err) {
        console.error("💥 Error loading files:", err);
    }
}




// ----------------- DEBUG + BUILD TREE -----------------
function buildTree(data) {
    // Case 1: Array -> treat as files
    if (Array.isArray(data)) {
        let ul = $("<ul>").addClass("file-tree__subtree");
        data.forEach(item => {
            let li = $("<li>").addClass("file-tree__item");
            let fileDiv = $("<div>").addClass("folder").text(item);
            li.append(fileDiv);
            ul.append(li);
        });
        return ul;
    }

    // Case 2: Object -> recurse into subfolders
    let ul = $("<ul>").addClass("file-tree__subtree");
    for (let name in data) {
        let li = $("<li>").addClass("file-tree__item");
        let folderDiv = $("<div>").addClass("folder").text(name);
        li.append(folderDiv);

        if (data[name] && Object.keys(data[name]).length > 0) {
            let subTree = buildTree(data[name]);
            li.append(subTree);
        }
        ul.append(li);
    }
    return ul;
}


async function debugLoadProjects() {
    console.log("🔎 debugLoadProjects: starting...");

    const endpoints = ["/testing/html", "/testing/html/data"];
    let json = null;
    let usedEndpoint = null;

    // Try endpoints one by one (log everything)
    for (const ep of endpoints) {
        try {
            console.log("➡️ Trying endpoint:", ep);
            let resp = await fetch(ep, {cache: "no-store"});
            console.log("   -> HTTP status:", resp.status, resp.statusText);

            // If non-JSON or 204 etc, grab text and log
            const text = await resp.text();
            try {
                json = JSON.parse(text);
                usedEndpoint = ep;
                console.log("✅ Parsed JSON from", ep, json);
                break;
            } catch (jsonErr) {
                console.warn("⚠️ Response from", ep, "is not JSON. Raw text:", text.slice(0,1000));
                // continue to next endpoint
            }
        } catch (err) {
            console.error("❌ Fetch error for", ep, err);
        }
    }

    if (!json) {
        console.error("💥 No JSON received from any endpoint. Check backend or endpoint paths.");
        return;
    }

    // Expose for manual inspection
    window.__debugProjectJSON = json;
    console.log("📌 Stored JSON to window.__debugProjectJSON for manual inspection.");

    // Check for UL .file-tree presence
    const treeEls = $(".file-tree");
    console.log("🔍 $('.file-tree') matched count:", treeEls.length, treeEls.get());
    if (treeEls.length === 0) {
        console.error("🚨 No element with class 'file-tree' found in DOM. Check your template HTML and ensure this script runs AFTER DOM is loaded and jQuery is available.");
        return;
    }

    // Append to each matched file-tree UL
    treeEls.each(function(idx, el) {
        const $el = $(el);
        $el.empty();
        console.log(`🧹 Cleared .file-tree #${idx}`);

        let topCount = 0;
        for (let project in json) {
            topCount++;
            let li = $("<li>").addClass("file-tree__item");
            let folderDiv = $("<div>").addClass("folder").text(project);
            li.append(folderDiv);

            if (json[project] && Object.keys(json[project]).length > 0) {
                let subtree = buildTree(json[project]);
                li.append(subtree);
            }
            $el.append(li);
        }

        console.log(`➕ Appended ${topCount} top-level items into .file-tree #${idx}`);
        // Log a small HTML preview to ensure DOM insertion
        let htmlPreview = $el.html().replace(/\s+/g, " ").slice(0, 600);
        console.log("🔬 HTML preview (truncated):", htmlPreview);
    });

    // Re-bind folder click toggles (extended for file loading)
$(".folder").off("click").on("click", function (e) {
    let t = $(this);
    let treeItem = t.closest(".file-tree__item");

    // Toggle open/close
    if (t.hasClass("folder--open")) {
        t.removeClass("folder--open");
        treeItem.removeClass("file-tree__item--open");
    } else {
        t.addClass("folder--open");
        treeItem.addClass("file-tree__item--open");
    }

    // Close siblings
    treeItem
        .siblings()
        .removeClass("file-tree__item--open")
        .find(".folder--open")
        .removeClass("folder--open");

    // ✅ NEW PART: check if this folder has NO subtree
    let hasSubTree = treeItem.children("ul.file-tree__subtree").length > 0;

    if (!hasSubTree) {
        // Build full path from ancestors
        let pathParts = [];
        treeItem.parents(".file-tree__item").each(function () {
            pathParts.unshift($(this).children(".folder").text());
        });
        pathParts.push(t.text());
        let fullPath = pathParts.join("/");

        console.log("📂 Leaf folder clicked, requesting files for:", fullPath);

        // Call the file loader
        loadFiles(fullPath);
    }
});


    console.log("✅ debugLoadProjects finished. Click a folder to test toggle.");
}

// Run on DOM ready
$(document).ready(async () => {
    await debugLoadProjects();
});
