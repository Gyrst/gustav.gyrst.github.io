/**
 * SKILLS VISUALIZATION
 * ---------------------------------------------------------------------------
 * Tabbed hub-and-spoke diagram for the About page "Skills" section. Each tab
 * swaps in a panel whose tags are laid out radially around a hub (pure CSS,
 * via the --i custom property set on each node in the markup).
 *
 * Plain vanilla JS, no dependencies: toggles aria-selected/hidden and the
 * active classes that drive the CSS transition.
 */
(function () {
    "use strict";

    var viz = document.getElementById("skills-viz");
    if (!viz) {
        return;
    }

    var tabs = Array.prototype.slice.call(viz.querySelectorAll(".skills-viz-tab"));
    var panels = Array.prototype.slice.call(viz.querySelectorAll(".skills-viz-panel"));

    function activate(tab) {
        var targetId = tab.getAttribute("data-target");

        tabs.forEach(function (t) {
            var isActive = t === tab;
            t.classList.toggle("is-active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        panels.forEach(function (panel) {
            var isActive = panel.id === targetId;
            panel.classList.toggle("is-active", isActive);
            if (isActive) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            activate(tab);
        });
    });

    viz.querySelector(".skills-viz-tabs").addEventListener("keydown", function (e) {
        var currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex === -1) {
            return;
        }

        var nextIndex = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        if (nextIndex !== null) {
            e.preventDefault();
            tabs[nextIndex].focus();
            activate(tabs[nextIndex]);
        }
    });
})();
