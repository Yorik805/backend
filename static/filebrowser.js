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



// Recursively build the tree
function buildTree(data) {
    let ul = $("<ul>").addClass("file-tree__subtree");

    for (let name in data) {
        let li = $("<li>").addClass("file-tree__item");
        let folderDiv = $("<div>").addClass("folder").text(name);
        li.append(folderDiv);

        // If subfolders exist (non-empty object)
        if (Object.keys(data[name]).length > 0) {
            let subTree = buildTree(data[name]);
            li.append(subTree);
        }

        ul.append(li);
    }

    return ul;
}

// Load projects dynamically
async function loadProjects() {
    try {
        let response = await fetch("/testing/html/data"); // 👈 endpoint returning JSON
        let data = await response.json();

        let tree = $(".file-tree");
        tree.empty(); // clear old items

        // Top-level projects
        for (let project in data) {
            let li = $("<li>").addClass("file-tree__item");
            let folderDiv = $("<div>").addClass("folder").text(project);
            li.append(folderDiv);

            // Subfolders
            if (Object.keys(data[project]).length > 0) {
                let subTree = buildTree(data[project]);
                li.append(subTree);
            }

            tree.append(li);
        }

        // Re-bind click toggles
        $(".folder").off("click").on("click", function(e) {
            var t = $(this);
            var treeItem = t.closest(".file-tree__item");

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
        });

    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

// Call on startup
$(document).ready(() => {
    loadProjects();
});
