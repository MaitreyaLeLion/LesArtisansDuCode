import { options } from "./options.js";
export class WINUXWindow {
    constructor(id, iframeSrc) {
        // State
        this.isMinimized = false;
        this.preMinimizeHeight = "";
        this.element = document.getElementById(id);
        // Create Iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = iframeSrc;
        this.iframe.frameBorder = "0";
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        // 1. Force absolute position for movement
        this.element.style.position = "absolute";
        // 2. Build the internal structure
        this.buildStructure();
        // 3. Initialize features
        this.initStyle();
        this.initDrag();
        this.initResize();
        this.initIframeLogic(iframeSrc);
        // 4. Add iframe to content
        this.contentArea.appendChild(this.iframe);
    }
    /**
     * Creates the internal HTML structure: Title Bar (Text + Buttons) + Content
     */
    buildStructure() {
        // Clear existing content
        const initialContent = this.element.innerHTML;
        this.element.innerHTML = '';
        // --- Create Title Bar ---
        this.titleBar = document.createElement('div');
        this.titleBar.style.height = "30px"; // Slightly taller for buttons
        this.titleBar.style.backgroundColor = "#333";
        this.titleBar.style.color = "white";
        this.titleBar.style.display = "flex"; // Use Flexbox
        this.titleBar.style.alignItems = "center";
        this.titleBar.style.justifyContent = "space-between";
        this.titleBar.style.padding = "0 10px";
        this.titleBar.style.boxSizing = "border-box";
        this.titleBar.style.fontFamily = "sans-serif";
        this.titleBar.style.fontSize = "14px";
        this.element.appendChild(this.titleBar);
        // 1. Title Text
        this.titleText = document.createElement('span');
        this.titleText.innerText = "Loading...";
        this.titleText.style.whiteSpace = "nowrap";
        this.titleText.style.overflow = "hidden";
        this.titleText.style.textOverflow = "ellipsis";
        this.titleText.style.marginRight = "10px";
        this.titleText.style.pointerEvents = "none"; // Let clicks pass through to drag
        this.titleBar.appendChild(this.titleText);
        // 2. Window Controls Container
        const controls = document.createElement('div');
        controls.style.display = "flex";
        controls.style.gap = "5px";
        this.titleBar.appendChild(controls);
        // 3. Minimize Button
        const minBtn = this.createButton("_", "#555");
        minBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent drag start
            this.toggleMinimize();
        };
        controls.appendChild(minBtn);
        // 4. Close Button
        const closeBtn = this.createButton("X", "#c9302c");
        closeBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent drag start
            this.close();
        };
        controls.appendChild(closeBtn);
        // --- Create Content Area ---
        this.contentArea = document.createElement('div');
        this.contentArea.style.height = "calc(100% - 30px)"; // Subtract titlebar height
        this.contentArea.style.backgroundColor = "white";
        this.contentArea.style.overflow = "hidden"; // Hide overflow for iframe
        if (initialContent)
            this.contentArea.innerHTML = initialContent;
        this.element.appendChild(this.contentArea);
    }
    /**
     * Helper to create title bar buttons
     */
    createButton(text, bgColor) {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.style.background = bgColor;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.width = "20px";
        btn.style.height = "20px";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";
        btn.style.borderRadius = "3px";
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        return btn;
    }
    /**
     * Tries to get the iframe title.
     * NOTE: Will fail for external sites (CORS) and fallback to src.
     */
    initIframeLogic(src) {
        this.iframe.onload = () => {
            var _a;
            try {
                // Try to read title from the page inside
                const internalTitle = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.title;
                if (internalTitle) {
                    this.titleText.innerText = internalTitle;
                }
                else {
                    this.titleText.innerText = src;
                }
            }
            catch (e) {
                // Security error (CORS) happens if domain is different
                console.warn("Cannot read iframe title due to CORS (Cross-Origin). Using URL.");
                this.titleText.innerText = "External: " + src;
            }
        };
    }
    toggleMinimize() {
        if (this.isMinimized) {
            // Restore
            this.contentArea.style.display = "block";
            this.element.style.height = this.preMinimizeHeight;
            this.isMinimized = false;
        }
        else {
            // Minimize
            this.preMinimizeHeight = this.element.style.height;
            this.contentArea.style.display = "none";
            this.element.style.height = "30px"; // Height of titlebar
            this.isMinimized = true;
        }
    }
    close() {
        this.element.remove();
    }
    // --- EXISTING LOGIC BELOW (Style, Drag, Resize) ---
    get innerHTML() {
        return this.contentArea.innerHTML;
    }
    initStyle() {
        const currentStyle = this.element.getAttribute("style") || "";
        this.element.setAttribute("style", currentStyle + options.DEFAULT_WINDOW_STYLE);
        this.element.style.minWidth = "150px";
        // Ensure we don't start smaller than titlebar
        this.element.style.minHeight = "30px";
        this.element.style.display = "flex";
        this.element.style.flexDirection = "column";
        if (options.DEFAULT_IFRAME_STYLE) {
            this.iframe.setAttribute("style", options.DEFAULT_IFRAME_STYLE);
        }
    }
    initDrag() {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;
        this.titleBar.style.cursor = "move";
        this.titleBar.addEventListener('mousedown', (e) => {
            // Check if we clicked a button inside titlebar, if so, don't drag
            if (e.target.tagName === 'BUTTON')
                return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = this.element.offsetLeft;
            initialTop = this.element.offsetTop;
            this.element.style.zIndex = "1000";
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging)
                return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.element.style.left = `${initialLeft + dx}px`;
            this.element.style.top = `${initialTop + dy}px`;
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    initResize() {
        const corners = ['nw', 'ne', 'sw', 'se'];
        corners.forEach(corner => {
            const resizer = document.createElement('div');
            resizer.classList.add('resizer', corner);
            // Style
            resizer.style.width = '10px';
            resizer.style.height = '10px';
            resizer.style.position = 'absolute';
            resizer.style.zIndex = '1001';
            // Position
            if (corner.includes('n'))
                resizer.style.top = '-5px';
            if (corner.includes('s'))
                resizer.style.bottom = '-5px';
            if (corner.includes('w'))
                resizer.style.left = '-5px';
            if (corner.includes('e'))
                resizer.style.right = '-5px';
            resizer.style.cursor = (corner === 'nw' || corner === 'se') ? 'nwse-resize' : 'nesw-resize';
            this.element.appendChild(resizer);
            this.setupResizerEvents(resizer, corner);
        });
    }
    setupResizerEvents(resizer, corner) {
        let isResizing = false;
        let startX = 0, startY = 0, startW = 0, startH = 0, startLeft = 0, startTop = 0;
        resizer.addEventListener('mousedown', (e) => {
            // Cannot resize if minimized
            if (this.isMinimized)
                return;
            isResizing = true;
            e.stopPropagation();
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.element.getBoundingClientRect();
            startW = rect.width;
            startH = rect.height;
            startLeft = rect.left;
            startTop = rect.top;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing)
                return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (corner.includes('e'))
                this.element.style.width = `${startW + dx}px`;
            if (corner.includes('s'))
                this.element.style.height = `${startH + dy}px`;
            if (corner.includes('w')) {
                this.element.style.width = `${startW - dx}px`;
                this.element.style.left = `${startLeft + dx}px`;
            }
            if (corner.includes('n')) {
                this.element.style.height = `${startH - dy}px`;
                this.element.style.top = `${startTop + dy}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }
}
//# sourceMappingURL=window.js.map