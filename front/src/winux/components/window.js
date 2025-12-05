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
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        this.iframe.style.border = "none";
        this.iframe.style.background = "transparent";
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
     * Creates the internal HTML structure
     */
    buildStructure() {
        const initialContent = this.element.innerHTML;
        this.element.innerHTML = '';
        // --- Create Title Bar ---
        this.titleBar = document.createElement('div');
        this.titleBar.classList.add('title-bar');
        this.titleBar.style.height = "30px";
        this.titleBar.style.display = "flex";
        this.titleBar.style.alignItems = "center";
        this.titleBar.style.justifyContent = "space-between";
        this.titleBar.style.padding = "0 10px";
        this.titleBar.style.boxSizing = "border-box";
        this.titleBar.style.fontFamily = "sans-serif";
        this.titleBar.style.fontSize = "14px";
        this.titleBar.style.userSelect = "none";
        this.element.appendChild(this.titleBar);
        // 1. Title Text
        this.titleText = document.createElement('span');
        this.titleText.innerText = "Loading...";
        this.titleText.style.whiteSpace = "nowrap";
        this.titleText.style.overflow = "hidden";
        this.titleText.style.textOverflow = "ellipsis";
        this.titleText.style.marginRight = "10px";
        this.titleText.style.pointerEvents = "none";
        this.titleText.style.color = "inherit";
        this.titleBar.appendChild(this.titleText);
        // 2. Window Controls Container
        const controls = document.createElement('div');
        controls.style.display = "flex";
        controls.style.gap = "5px";
        this.titleBar.appendChild(controls);
        // 3. Minimize Button
        const minBtn = this.createButton("_", "rgba(255, 255, 255, 0.2)");
        minBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        };
        controls.appendChild(minBtn);
        // 4. Close Button
        const closeBtn = this.createButton("X", "rgba(255, 59, 48, 0.8)");
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.close();
        };
        controls.appendChild(closeBtn);
        // --- Create Content Area ---
        this.contentArea = document.createElement('div');
        this.contentArea.classList.add('window-content');
        this.contentArea.style.height = "calc(100% - 30px)";
        this.contentArea.style.overflow = "hidden";
        this.contentArea.style.backgroundColor = "transparent";
        if (initialContent)
            this.contentArea.innerHTML = initialContent;
        this.element.appendChild(this.contentArea);
    }
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
        btn.style.borderRadius = "50%";
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.transition = "opacity 0.2s";
        btn.onmouseenter = () => btn.style.opacity = "0.8";
        btn.onmouseleave = () => btn.style.opacity = "1";
        return btn;
    }
    initIframeLogic(src) {
        this.iframe.onload = () => {
            var _a, _b;
            try {
                const internalTitle = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.title;
                if (internalTitle) {
                    this.titleText.innerText = internalTitle;
                }
                else {
                    const fileName = ((_b = src.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('?')[0]) || src;
                    this.titleText.innerText = fileName;
                }
            }
            catch (e) {
                console.warn("CORS: Cannot read iframe title.");
                this.titleText.innerText = "Application";
            }
        };
    }
    toggleMinimize() {
        if (this.isMinimized) {
            this.contentArea.style.display = "block";
            this.element.style.height = this.preMinimizeHeight;
            this.isMinimized = false;
        }
        else {
            this.preMinimizeHeight = this.element.style.height;
            this.contentArea.style.display = "none";
            this.element.style.height = "30px";
            this.isMinimized = true;
        }
    }
    close() {
        this.element.remove();
    }
    get innerHTML() {
        return this.contentArea.innerHTML;
    }
    initStyle() {
        const currentStyle = this.element.getAttribute("style") || "";
        const currentIframeStyle = this.iframe.getAttribute("style") || "";
        this.element.setAttribute("style", currentStyle);
        this.element.style.display = "flex";
        this.element.style.flexDirection = "column";
        if (!this.element.style.minWidth)
            this.element.style.minWidth = "200px";
        if (!this.element.style.minHeight)
            this.element.style.minHeight = "100px";
        if (options.DEFAULT_IFRAME_STYLE) {
            this.iframe.setAttribute("style", currentIframeStyle + options.DEFAULT_IFRAME_STYLE);
        }
    }
    // ==========================================
    // AMÉLIORATION MAJEURE ICI : DRAG & DROP
    // ==========================================
    initDrag() {
        this.titleBar.style.cursor = "default";
        this.titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON')
                return;
            // Empêcher le comportement par défaut (sélection de texte, drag d'image fantôme)
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const initialLeft = this.element.offsetLeft;
            const initialTop = this.element.offsetTop;
            // 1. DÉSACTIVER LES ÉVÉNEMENTS DE L'IFRAME
            // Cela empêche l'iframe de "voler" le focus souris si on bouge trop vite
            this.iframe.style.pointerEvents = "none";
            // 2. EMPÊCHER LA SÉLECTION GLOBALE
            document.body.style.userSelect = "none";
            // Fonction de mouvement
            const onMouseMove = (moveEvent) => {
                moveEvent.preventDefault(); // Important
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                this.element.style.left = `${initialLeft + dx}px`;
                this.element.style.top = `${initialTop + dy}px`;
            };
            // Fonction de fin
            const onMouseUp = () => {
                // 3. NETTOYAGE
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                // Réactiver l'iframe
                this.iframe.style.pointerEvents = "auto";
                // Réactiver la sélection
                document.body.style.userSelect = "";
            };
            // Ajout des écouteurs dynamiques sur le DOCUMENT entier
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
    // ==========================================
    // AMÉLIORATION MAJEURE ICI : RESIZE
    // ==========================================
    initResize() {
        const corners = ['nw', 'ne', 'sw', 'se'];
        corners.forEach(corner => {
            const resizer = document.createElement('div');
            resizer.classList.add('resizer', corner);
            // Zone de clic un peu plus confortable tout en restant invisible
            resizer.style.width = '15px';
            resizer.style.height = '15px';
            resizer.style.position = 'absolute';
            resizer.style.zIndex = '1001';
            resizer.style.opacity = '0';
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
        resizer.addEventListener('mousedown', (e) => {
            if (this.isMinimized)
                return;
            e.stopPropagation();
            e.preventDefault(); // Empêche la sélection de texte au début du resize
            const startX = e.clientX;
            const startY = e.clientY;
            const rect = this.element.getBoundingClientRect();
            const startW = rect.width;
            const startH = rect.height;
            const startLeft = rect.left;
            const startTop = rect.top;
            // 1. PROTECTION IFRAME
            this.iframe.style.pointerEvents = "none";
            document.body.style.userSelect = "none";
            const onMouseMove = (moveEvent) => {
                // Pas de preventDefault() ici si on veut que ça reste fluide,
                // mais attention aux effets de bord. Généralement ok ici.
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
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
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                // RESTAURATION
                this.iframe.style.pointerEvents = "auto";
                document.body.style.userSelect = "";
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}
//# sourceMappingURL=window.js.map