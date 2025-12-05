import { options } from "./options.js";

export class WINUXWindow {
    private element: HTMLDivElement;
    private iframe: HTMLIFrameElement;

    // UI Components
    private titleBar: HTMLDivElement;
    private titleText: HTMLSpanElement;
    private contentArea: HTMLDivElement;

    // State
    private isMinimized: boolean = false;
    private preMinimizeHeight: string = "";

    constructor(id: string, iframeSrc: string) {
        this.element = document.getElementById(id) as HTMLDivElement;

        // Create Iframe
        this.iframe = document.createElement('iframe') as HTMLIFrameElement;
        this.iframe.src = iframeSrc;
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        this.iframe.style.border = "none"; // Suppression de la bordure par défaut
        this.iframe.style.background = "transparent"; // Important pour le glassmorphism

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
    private buildStructure() {
        // Clear existing content
        const initialContent = this.element.innerHTML;
        this.element.innerHTML = '';

        // --- Create Title Bar ---
        this.titleBar = document.createElement('div');
        // AJOUT : Classe CSS pour permettre le styling externe (style.css)
        this.titleBar.classList.add('title-bar');

        // STYLES DE BASE (Layout uniquement, pas de couleurs)
        this.titleBar.style.height = "30px";
        this.titleBar.style.display = "flex";
        this.titleBar.style.alignItems = "center";
        this.titleBar.style.justifyContent = "space-between";
        this.titleBar.style.padding = "0 10px";
        this.titleBar.style.boxSizing = "border-box";
        this.titleBar.style.fontFamily = "sans-serif";
        this.titleBar.style.fontSize = "14px";
        this.titleBar.style.userSelect = "none"; // Empêche la sélection de texte pendant le drag

        // SUPPRIMÉ : BackgroundColor et Color hardcodés pour laisser le CSS agir
        // this.titleBar.style.backgroundColor = "#333";
        // this.titleBar.style.color = "white";

        this.element.appendChild(this.titleBar);

        // 1. Title Text
        this.titleText = document.createElement('span');
        this.titleText.innerText = "Loading...";
        this.titleText.style.whiteSpace = "nowrap";
        this.titleText.style.overflow = "hidden";
        this.titleText.style.textOverflow = "ellipsis";
        this.titleText.style.marginRight = "10px";
        this.titleText.style.pointerEvents = "none";
        // On hérite la couleur du parent (défini par le CSS global)
        this.titleText.style.color = "inherit";
        this.titleBar.appendChild(this.titleText);

        // 2. Window Controls Container
        const controls = document.createElement('div');
        controls.style.display = "flex";
        controls.style.gap = "5px";
        this.titleBar.appendChild(controls);

        // 3. Minimize Button
        // On utilise des couleurs semi-transparentes ou des classes si possible
        const minBtn = this.createButton("_", "rgba(255, 255, 255, 0.2)");
        minBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        };
        controls.appendChild(minBtn);

        // 4. Close Button
        const closeBtn = this.createButton("X", "rgba(255, 59, 48, 0.8)"); // Rouge style mac/winux
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.close();
        };
        controls.appendChild(closeBtn);

        // --- Create Content Area ---
        this.contentArea = document.createElement('div');
        this.contentArea.classList.add('window-content'); // Classe CSS ajoutée

        this.contentArea.style.height = "calc(100% - 30px)";
        this.contentArea.style.overflow = "hidden";

        // SUPPRIMÉ : Fond blanc hardcodé.
        // Important : on laisse transparent pour que le fond de .winux-window (glassmorphism) se voit.
        this.contentArea.style.backgroundColor = "transparent";

        if(initialContent) this.contentArea.innerHTML = initialContent;
        this.element.appendChild(this.contentArea);
    }

    /**
     * Helper to create title bar buttons
     */
    private createButton(text: string, bgColor: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.style.background = bgColor;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.width = "20px";
        btn.style.height = "20px";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";
        btn.style.borderRadius = "50%"; // Plus joli en rond
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.transition = "opacity 0.2s";

        // Petit effet hover
        btn.onmouseenter = () => btn.style.opacity = "0.8";
        btn.onmouseleave = () => btn.style.opacity = "1";

        return btn;
    }

    private initIframeLogic(src: string) {
        this.iframe.onload = () => {
            try {
                const internalTitle = this.iframe.contentDocument?.title;
                if (internalTitle) {
                    this.titleText.innerText = internalTitle;
                } else {
                    // Fallback propre : juste le nom du fichier sans le chemin
                    const fileName = src.split('/').pop()?.split('?')[0] || src;
                    this.titleText.innerText = fileName;
                }
            } catch (e) {
                console.warn("CORS: Cannot read iframe title.");
                this.titleText.innerText = "Application";
            }
        };
    }

    private toggleMinimize() {
        if (this.isMinimized) {
            this.contentArea.style.display = "block";
            this.element.style.height = this.preMinimizeHeight;
            this.isMinimized = false;
        } else {
            this.preMinimizeHeight = this.element.style.height;
            this.contentArea.style.display = "none";
            this.element.style.height = "30px";
            this.isMinimized = true;
        }
    }

    public close() {
        this.element.remove();
    }

    get innerHTML(): string {
        return this.contentArea.innerHTML;
    }

    private initStyle(): void {
        const currentStyle = this.element.getAttribute("style") || "";
        const currentIframeStyle = this.iframe.getAttribute("style") || "";

        // On garde les options par défaut SI elles ne sont pas intrusives
        // Mais on s'assure que flex direction est là
        this.element.setAttribute("style", currentStyle);

        // Styles critiques pour le layout
        this.element.style.display = "flex";
        this.element.style.flexDirection = "column";

        // Dimensions minimales de sécurité
        if (!this.element.style.minWidth) this.element.style.minWidth = "200px";
        if (!this.element.style.minHeight) this.element.style.minHeight = "100px";

        if(options.DEFAULT_IFRAME_STYLE) {
            this.iframe.setAttribute("style", currentIframeStyle + options.DEFAULT_IFRAME_STYLE);
        }
    }

    private initDrag(): void {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        this.titleBar.style.cursor = "default"; // Curseur standard sur la barre

        this.titleBar.addEventListener('mousedown', (e: MouseEvent) => {
            if((e.target as HTMLElement).tagName === 'BUTTON') return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = this.element.offsetLeft;
            initialTop = this.element.offsetTop;

            // Le Z-index est géré par main.js au clic sur la fenêtre entière,
            // mais on peut forcer ici aussi si besoin.
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isDragging) return;
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

    private initResize(): void {
        // La logique de resize reste identique
        const corners = ['nw', 'ne', 'sw', 'se'];

        corners.forEach(corner => {
            const resizer = document.createElement('div');
            resizer.classList.add('resizer', corner);
            resizer.style.width = '15px'; // Zone un peu plus petite pour être discret
            resizer.style.height = '15px';
            resizer.style.position = 'absolute';
            resizer.style.zIndex = '1001';

            // Transparence pour ne pas voir les carrés de resize
            resizer.style.opacity = '0';

            if (corner.includes('n')) resizer.style.top = '-5px';
            if (corner.includes('s')) resizer.style.bottom = '-5px';
            if (corner.includes('w')) resizer.style.left = '-5px';
            if (corner.includes('e')) resizer.style.right = '-5px';

            resizer.style.cursor = (corner === 'nw' || corner === 'se') ? 'nwse-resize' : 'nesw-resize';

            this.element.appendChild(resizer);
            this.setupResizerEvents(resizer, corner);
        });
    }

    private setupResizerEvents(resizer: HTMLElement, corner: string) {
        let isResizing = false;
        let startX = 0, startY = 0, startW = 0, startH = 0, startLeft = 0, startTop = 0;

        resizer.addEventListener('mousedown', (e: MouseEvent) => {
            if(this.isMinimized) return;
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

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isResizing) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (corner.includes('e')) this.element.style.width = `${startW + dx}px`;
            if (corner.includes('s')) this.element.style.height = `${startH + dy}px`;
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