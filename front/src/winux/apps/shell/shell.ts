// --- TYPES & INTERFACES ---

type FileType = 'file' | 'dir';

interface Inode {
    type: FileType;
    content: string;
    children: { [name: string]: Inode };
    parent?: Inode | null;
    // Ajout d'une date de modif fictive pour ls -l (timestamp)
    mtime: number;
}

interface CommandResult {
    output: string;
    error?: boolean;
}

const COMMANDS = ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'cat', 'echo', 'rm', 'grep', 'clear', 'color'];
const COMMAND_OPTIONS: { [cmd: string]: string[] } = {
    'ls': ['-l', '-a', '-la', '-al'],
    'rm': ['-r', '-f', '-rf'],
    'grep': ['-i', '-v'],
    'mkdir': ['-p']
};
const HELP_MESSAGES: { [cmd: string]: string } = {
    ls: 'ls: List directory contents.\nUsage: ls [options] [path]\nOptions:\n  -l   Use a long listing format\n  -a   Do not ignore entries starting with .',
    cd: 'cd: Change the shell working directory.\nUsage: cd [dir]\n  ..   Move up one level\n  /    Move to root directory',
    pwd: 'pwd: Print the name of the current working directory.',
    mkdir: 'mkdir: Create the DIRECTORY(ies), if they do not already exist.\nUsage: mkdir [name]',
    touch: 'touch: Update the access and modification times of each FILE to the current time.\nUsage: touch [file]',
    cat: 'cat: Concatenate FILE(s) to standard output.\nUsage: cat [file]',
    echo: 'echo: Display a line of text.\nUsage: echo [STRING]...',
    rm: 'rm: Remove (unlink) the FILE(s).\nUsage: rm [options] [file]\nOptions:\n  -r   Remove directories and their contents recursively',
    grep: 'grep: Search for PATTERN in each FILE or standard input.\nUsage: grep [pattern] [file...]',
    color: 'color: Change the terminal text color.\nUsage: color <name|#hex>\nExample: color #00ff00',
    clear: 'clear: Clear the terminal screen.'
};

// --- SYSTÈME DE FICHIERS VIRTUEL ---

class VirtualFileSystem {
    root: Inode;
    currentPath: string[];

    constructor() {
        this.currentPath = ['home', 'guest'];
        this.root = this.loadState() || this.createDefaultStructure();
        this.rebuildParentLinks(this.root, null);
    }

    private createDefaultStructure(): Inode {
        const now = Date.now();
        return {
            type: 'dir', content: '', mtime: now, children: {
                'bin': { type: 'dir', content: '', mtime: now, children: {} },
                'etc': { type: 'dir', content: '', mtime: now, children: {
                        'hosts': { type: 'file', content: '127.0.0.1 localhost', mtime: now, children: {} }
                    }},
                'home': { type: 'dir', content: '', mtime: now, children: {
                        'guest': { type: 'dir', content: '', mtime: now, children: {
                                '.bashrc': { type: 'file', content: 'export PATH=/bin', mtime: now, children: {} }, // Fichier caché test
                                'readme.txt': { type: 'file', content: 'Bienvenue!', mtime: now, children: {} },
                                'documents': { type: 'dir', content: '', mtime: now, children: {} },
                                'downloads': { type: 'dir', content: '', mtime: now, children: {} }
                            }}
                    }}
            }
        };
    }

    public saveState(): void {
        const json = JSON.stringify(this.root, (key, value) => {
            if (key === 'parent') return undefined;
            return value;
        });
        localStorage.setItem('vfs_state', json);
    }

    private loadState(): Inode | null {
        const state = localStorage.getItem('vfs_state');
        return state ? JSON.parse(state) : null;
    }

    private rebuildParentLinks(node: Inode, parent: Inode | null) {
        node.parent = parent;
        // Si mtime n'existe pas (vieux save), on le met
        if (!node.mtime) node.mtime = Date.now();

        if (node.type === 'dir') {
            for (const key in node.children) {
                this.rebuildParentLinks(node.children[key], node);
            }
        }
    }

    public resolveNode(pathStr: string): Inode | null {
        if (pathStr === '/') return this.root;
        if (pathStr === '' || pathStr === '.') return this.getNodeAt(this.currentPath);

        let parts = pathStr.split('/').filter(p => p.length > 0);
        let currentNode: Inode;

        if (pathStr.startsWith('/')) currentNode = this.root;
        else currentNode = this.getNodeAt(this.currentPath);

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (currentNode.parent) currentNode = currentNode.parent;
                continue;
            }
            if (currentNode.type !== 'dir' || !currentNode.children[part]) return null;
            currentNode = currentNode.children[part];
        }
        return currentNode;
    }

    public getCwdNode(): Inode {
        return this.getNodeAt(this.currentPath);
    }

    private getNodeAt(pathStack: string[]): Inode {
        let node = this.root;
        for (const dir of pathStack) {
            if (node.children && node.children[dir]) node = node.children[dir];
        }
        return node;
    }

    public getAbsolutePath(): string {
        return '/' + this.currentPath.join('/');
    }

    public getCompletionCandidates(partialPath: string): { matches: string[], dirPath: string, searchPrefix: string } {
        let dirPath = '';
        let searchPrefix = '';
        const lastSlashIndex = partialPath.lastIndexOf('/');

        if (lastSlashIndex !== -1) {
            dirPath = partialPath.substring(0, lastSlashIndex + 1);
            searchPrefix = partialPath.substring(lastSlashIndex + 1);
        } else {
            dirPath = '';
            searchPrefix = partialPath;
        }

        const parentNode = dirPath === '' ? this.getCwdNode() : this.resolveNode(dirPath);
        if (!parentNode || parentNode.type !== 'dir') return { matches: [], dirPath, searchPrefix };

        const candidates = Object.keys(parentNode.children).filter(name => name.startsWith(searchPrefix));
        const formattedCandidates = candidates.map(name => {
            if (parentNode.children[name].type === 'dir') return name + '/';
            return name;
        });

        return { matches: formattedCandidates, dirPath, searchPrefix };
    }
}

// --- SHELL ENGINE ---

class Shell {
    fs: VirtualFileSystem;
    historyElem: HTMLElement;
    input: HTMLInputElement;
    promptElem: HTMLElement;

    private commandHistory: string[] = [];
    private historyIndex: number = -1;

    constructor() {
        this.fs = new VirtualFileSystem();
        this.historyElem = document.getElementById('history')!;
        this.input = document.getElementById('cmd-input') as HTMLInputElement;
        this.promptElem = document.getElementById('prompt')!;

        this.updatePrompt();
        this.setupListeners();
        this.setupFocusManagement();
    }

    private updatePrompt() {
        const path = this.fs.getAbsolutePath();
        const displayPath = path.startsWith('/home/guest') ? path.replace('/home/guest', '~') : path;
        this.promptElem.innerText = `guest@webshell:${displayPath}$`;
    }

    private setupFocusManagement() {
        document.addEventListener('click', (e) => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) return;
            this.input.focus();
        });
    }

    private setupListeners() {
        this.input.addEventListener('keydown', async (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
                return;
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'c') {
                if (e.shiftKey) {
                    e.preventDefault();
                    const selection = window.getSelection();
                    if (selection) await navigator.clipboard.writeText(selection.toString());
                    return;
                } else {
                    e.preventDefault();
                    this.printLine(this.promptElem.innerText + ' ' + this.input.value + '^C');
                    this.input.value = '';
                    this.historyIndex = -1;
                    window.scrollTo(0, document.body.scrollHeight);
                    return;
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.commandHistory.length > 0) {
                    if (this.historyIndex === -1) this.historyIndex = this.commandHistory.length - 1;
                    else if (this.historyIndex > 0) this.historyIndex--;
                    this.input.value = this.commandHistory[this.historyIndex];
                }
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex !== -1) {
                    if (this.historyIndex < this.commandHistory.length - 1) {
                        this.historyIndex++;
                        this.input.value = this.commandHistory[this.historyIndex];
                    } else {
                        this.historyIndex = -1;
                        this.input.value = '';
                    }
                }
            }
            else if (e.key === 'Enter') {
                const cmd = this.input.value;
                if (cmd.trim()) this.commandHistory.push(cmd);
                this.historyIndex = -1;
                this.printLine(this.promptElem.innerText + ' ' + this.escapeHtml(cmd)); // Affiche la commande tapée
                this.processInput(cmd);
                this.input.value = '';
                this.updatePrompt();
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
    }

    private handleTabCompletion() {
        const rawInput = this.input.value;
        const parts = rawInput.split(' ');
        const currentToken = parts[parts.length - 1];
        const isCommandPosition = parts.length === 1 && rawInput.trim() !== '';

        let candidates: string[] = [];
        let prefixToReplace = currentToken;
        let baseString = rawInput.substring(0, rawInput.lastIndexOf(currentToken));

        if (rawInput.trim() === '' || isCommandPosition) {
            candidates = COMMANDS.filter(c => c.startsWith(currentToken));
        } else if (currentToken.startsWith('-')) {
            const cmd = parts[0];
            const availableOptions = COMMAND_OPTIONS[cmd] || [];
            candidates = availableOptions.filter(opt => opt.startsWith(currentToken));
        } else {
            const completion = this.fs.getCompletionCandidates(currentToken);
            candidates = completion.matches;
            baseString += completion.dirPath;
            prefixToReplace = completion.searchPrefix;
        }

        if (candidates.length === 0) return;

        if (candidates.length === 1) {
            const completed = candidates[0];
            this.input.value = baseString + completed;
            if (!completed.endsWith('/')) this.input.value += ' ';
        } else {
            this.printLine(this.promptElem.innerText + ' ' + rawInput);
            this.printLine(candidates.join('  '));
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    private printLine(html: string, isError: boolean = false) {
        const div = document.createElement('div');
        div.className = 'output-line';
        div.style.color = isError ? '#ff4444' : (isError === false ? '' : ''); // Hérite de la couleur par défaut
        // CHANGEMENT MAJEUR : innerHTML pour supporter les couleurs <span>
        div.innerHTML = html;
        this.historyElem.appendChild(div);

        const term = document.getElementById('terminal');
        if (term) term.scrollTop = term.scrollHeight;
    }

    // Helper pour éviter les injections XSS quand on echo du texte brut
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    private processInput(input: string) {
        if (!input.trim()) return;

        const segments = input.split('|');
        let pipedInput = '';

        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i].trim();
            let outputFile: string | null = null;
            let inputFile: string | null = null;

            if (segment.includes('>')) {
                const parts = segment.split('>');
                segment = parts[0].trim();
                outputFile = parts[1].trim();
            }

            if (segment.includes('<')) {
                const parts = segment.split('<');
                segment = parts[0].trim();
                inputFile = parts[1].trim();
            }

            let currentStdin = pipedInput;

            if (inputFile) {
                const node = this.fs.resolveNode(inputFile);
                if (node && node.type === 'file') currentStdin = node.content;
                else {
                    this.printLine(`bash: ${inputFile}: No such file`, true);
                    return;
                }
            }

            const result = this.executeCommand(segment, currentStdin);
            if (result.error) {
                this.printLine(result.output, true);
                return;
            }

            if (outputFile) {
                const pathParts = outputFile.split('/');
                const fileName = pathParts.pop()!;
                const dirPath = pathParts.length > 0 ? pathParts.join('/') : '.';

                const dirNode = this.fs.resolveNode(dirPath);
                if (dirNode && dirNode.type === 'dir') {
                    // Strip HTML tags before saving to file (sinon ls > a.txt met des <span> dans le fichier)
                    const cleanContent = result.output.replace(/<[^>]*>?/gm, '');
                    dirNode.children[fileName] = {
                        type: 'file', content: cleanContent, mtime: Date.now(), children: {}, parent: dirNode
                    };
                    this.fs.saveState();
                } else {
                    this.printLine(`bash: ${outputFile}: Directory not found`, true);
                }
                pipedInput = '';
            } else {
                pipedInput = result.output;
            }
        }
        if (pipedInput) this.printLine(pipedInput);
    }

    private executeCommand(cmdString: string, stdin: string): CommandResult {
        const parts = cmdString.split(/\s+/).filter(s => s.length > 0);
        if (parts.length === 0) return { output: '' };
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'ls': return this.cmdLs(args);
            case 'cd': return this.cmdCd(args);
            case 'pwd': return this.cmdPwd(args);
            case 'mkdir': return this.cmdMkdir(args);
            case 'touch': return this.cmdTouch(args);
            case 'cat': return this.cmdCat(args, stdin);
            case 'echo': return this.cmdEcho(args);
            case 'rm': return this.cmdRm(args);
            case 'grep': return this.cmdGrep(args, stdin);
            case 'color': return this.cmdColor(args);
            case 'clear': return this.cmdClear(args);
            default:
                return { output: `bash: ${cmd}: command not found`, error: true };
        }
    }

    // --- IMPLEMENTATION DES COMMANDES ---

    // --- IMPLEMENTATION DES COMMANDES ---

    private cmdLs(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['ls'] };

        let showHidden = false;
        let showLong = false;
        const paths: string[] = [];

        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.includes('a')) showHidden = true;
                if (arg.includes('l')) showLong = true;
            } else {
                paths.push(arg);
            }
        }

        const targetPath = paths[0] || '.';
        const node = this.fs.resolveNode(targetPath);

        if (!node) return { output: `ls: cannot access '${targetPath}': No such file or directory`, error: true };
        if (node.type === 'file') return { output: `<span class="type-file">${targetPath}</span>` };

        let children = Object.keys(node.children);
        if (!showHidden) children = children.filter(c => !c.startsWith('.'));

        const dirs = children.filter(name => node.children[name].type === 'dir');
        const files = children.filter(name => node.children[name].type !== 'dir');
        dirs.sort();
        files.sort();
        const sortedChildren = [...dirs, ...files];

        if (showLong) {
            const lines = sortedChildren.map(name => {
                const child = node.children[name];
                const isDir = child.type === 'dir';
                const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = isDir ? '4096' : child.content.length.toString();
                const date = new Date(child.mtime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit' }).replace(',', '');
                const colorClass = isDir ? 'type-dir' : 'type-file';
                return `${perms} 1 guest guest ${size.padStart(5)} ${date} <span class="${colorClass}">${name}</span>`;
            });
            return { output: lines.join('\n') };
        } else {
            const items = sortedChildren.map(name => {
                const colorClass = node.children[name].type === 'dir' ? 'type-dir' : 'type-file';
                return `<span class="${colorClass}">${name}</span>`;
            });
            return { output: items.join('  ') };
        }
    }

    private cmdCd(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['cd'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (!cleanArgs[0]) return { output: '' };
        const target = this.fs.resolveNode(cleanArgs[0]);
        if (!target) return { output: `cd: ${cleanArgs[0]}: No such file or directory`, error: true };
        if (target.type !== 'dir') return { output: `cd: ${cleanArgs[0]}: Not a directory`, error: true };

        const parts = cleanArgs[0].split('/').filter(p => p);
        if (cleanArgs[0].startsWith('/')) this.fs.currentPath = [];

        for (const p of parts) {
            if (p === '.') continue;
            if (p === '..') {
                if (this.fs.currentPath.length > 0) this.fs.currentPath.pop();
            } else {
                this.fs.currentPath.push(p);
            }
        }
        return { output: '' };
    }

    private cmdPwd(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['pwd'] };
        return { output: this.fs.getAbsolutePath() };
    }

    private cmdMkdir(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['mkdir'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (!cleanArgs[0]) return { output: 'mkdir: missing operand', error: true };
        const cwd = this.fs.getCwdNode();
        if (cwd.children[cleanArgs[0]]) return { output: `mkdir: cannot create '${cleanArgs[0]}': Exists`, error: true };

        cwd.children[cleanArgs[0]] = { type: 'dir', content: '', mtime: Date.now(), children: {}, parent: cwd };
        this.fs.saveState();
        return { output: '' };
    }

    private cmdTouch(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['touch'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (!cleanArgs[0]) return { output: 'touch: missing file operand', error: true };
        const cwd = this.fs.getCwdNode();

        if (!cwd.children[cleanArgs[0]]) {
            cwd.children[cleanArgs[0]] = { type: 'file', content: '', mtime: Date.now(), children: {}, parent: cwd };
        } else {
            cwd.children[cleanArgs[0]].mtime = Date.now();
        }
        this.fs.saveState();
        return { output: '' };
    }

    private cmdCat(args: string[], stdin: string): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['cat'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (cleanArgs.length === 0) return { output: this.escapeHtml(stdin) };
        const node = this.fs.resolveNode(cleanArgs[0]);
        if (!node) return { output: `cat: ${cleanArgs[0]}: No such file`, error: true };
        if (node.type === 'dir') return { output: `cat: ${cleanArgs[0]}: Is a directory`, error: true };
        return { output: this.escapeHtml(node.content) };
    }

    private cmdEcho(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['echo'] };

        let text = args.join(' ');
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.slice(1, -1);
        }
        text = text.replace(/\\n/g, '\n');
        return { output: this.escapeHtml(text) };
    }

    private cmdRm(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['rm'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (!cleanArgs[0]) return { output: 'rm: missing operand', error: true };
        const cwd = this.fs.getCwdNode();
        const targetName = cleanArgs[0];

        if (!cwd.children[targetName]) return { output: `rm: '${targetName}': No such file`, error: true };
        const target = cwd.children[targetName];

        const isRecursive = args.some(a => a.includes('r'));
        if (target.type === 'dir' && Object.keys(target.children).length > 0 && !isRecursive) {
            return { output: `rm: '${targetName}': Not empty (use -r)`, error: true };
        }

        delete cwd.children[targetName];
        this.fs.saveState();
        return { output: '' };
    }

    private cmdGrep(args: string[], stdin: string): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['grep'] };

        const cleanArgs = args.filter(a => !a.startsWith('-'));
        if (cleanArgs.length === 0) return { output: 'grep: usage: grep [pattern] [file]', error: true };

        let pattern = cleanArgs[0];
        if ((pattern.startsWith('"') && pattern.endsWith('"')) || (pattern.startsWith("'") && pattern.endsWith("'"))) {
            pattern = pattern.slice(1, -1);
        }

        let content = '';
        if (cleanArgs.length > 1) {
            const node = this.fs.resolveNode(cleanArgs[1]);
            if (!node || node.type !== 'file') return { output: `grep: ${cleanArgs[1]}: error`, error: true };
            content = node.content;
        } else {
            content = stdin;
        }

        const lines = content.split('\n');
        const matches = lines.filter(l => l.includes(pattern));
        return { output: this.escapeHtml(matches.join('\n')) };
    }

    private cmdColor(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['color'] };

        if (!args[0]) return { output: 'color: usage: color <name|#hex>', error: true };
        const newColor = args[0];
        document.body.style.color = newColor;
        this.input.style.color = newColor;
        return { output: '' };
    }

    private cmdClear(args: string[]): CommandResult {
        if (args.includes('-h') || args.includes('help')) return { output: HELP_MESSAGES['clear'] };
        this.historyElem.innerHTML = '';
        return { output: '' };
    }
}

window.onload = () => {
    new Shell();
};