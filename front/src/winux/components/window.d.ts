export declare class WINUXWindow {
    private element;
    private iframe;
    private titleBar;
    private titleText;
    private contentArea;
    private isMinimized;
    private preMinimizeHeight;
    constructor(id: string, iframeSrc: string);
    /**
     * Creates the internal HTML structure: Title Bar (Text + Buttons) + Content
     */
    private buildStructure;
    /**
     * Helper to create title bar buttons
     */
    private createButton;
    private initIframeLogic;
    private toggleMinimize;
    close(): void;
    get innerHTML(): string;
    private initStyle;
    private initDrag;
    private initResize;
    private setupResizerEvents;
}
//# sourceMappingURL=window.d.ts.map