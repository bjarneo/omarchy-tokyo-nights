const base = 'install/omarchy-base.packages';
const other = 'install/omarchy-other.packages';
const terminal = 'manual/15-terminal.md';
const development = 'manual/18-development-tools.md';
const guis = 'manual/22-guis.md';
const browsers = 'manual/23-browsers.md';
const ai = 'manual/17-ai.md';

const icon = (id, name, exportName, role, file, term, scope = 'base') => ({ id, name, exportName, role, evidence: { file, term }, scope });
const upstream = (id, name, url, role, file, term, options = {}) => ({ id, name, url, role, evidence: { file, term }, scope: 'base', ...options });

export const LOGO_GROUPS = [
  { id: 'foundation', title: 'THE OMARCHY DESKTOP', subtitle: 'THE DESKTOP AND ITS OPEN-SOURCE ROOTS', entries: [
    { id: 'omarchy', name: 'Omarchy', block: 'omarchy-logo.txt', source: 'https://omarchy.org', role: 'Linux distribution', scope: 'foundation', evidence: { file: 'README.md', term: 'Omarchy' } },
    icon('archlinux', 'Arch Linux', 'siArchlinux', 'Distribution base', 'manual/29-other-packages.md', 'Arch', 'foundation'),
    icon('linux', 'Linux', 'siLinux', 'Kernel', other, 'linux'),
    icon('gnu', 'GNU', 'siGnu', 'System tools', base, 'bash-completion', 'foundation'),
    icon('hyprland', 'Hyprland', 'siHyprland', 'Compositor', base, 'hyprland'),
    icon('wayland', 'Wayland', 'siWayland', 'Display protocol', other, 'egl-wayland'),
    upstream('quickshell', 'Quickshell', 'https://quickshell.org/favicon.svg', 'Desktop shell', base, 'quickshell'),
    upstream('pipewire', 'PipeWire', 'https://quickshell.org/assets/logos/pipewire.svg', 'Audio and video', other, 'pipewire'),
    icon('freedesktop', 'freedesktop.org', 'siFreedesktopdotorg', 'Desktop standards', base, 'xdg-desktop-portal-hyprland', 'foundation'),
    icon('qemu', 'QEMU', 'siQemu', 'Virtual machines', base, 'qemu-user-static-binfmt'),
  ] },
  { id: 'editors', title: 'EDITORS & TERMINALS', subtitle: 'DEFAULTS AND SUPPORTED ALTERNATIVES', entries: [
    icon('neovim', 'Neovim', 'siNeovim', 'Default editor', base, 'nvim'),
    icon('vim', 'Vim', 'siVim', 'Editor option', development, 'Vim', 'optional'),
    icon('emacs', 'Emacs', 'siGnuemacs', 'Editor option', development, 'Emacs', 'optional'),
    icon('helix', 'Helix', 'siHelix', 'Editor option', development, 'Helix', 'optional'),
    icon('zed', 'Zed', 'siZedindustries', 'Editor option', development, 'Zed', 'optional'),
    icon('vscodium', 'VSCodium', 'siVscodium', 'Editor integration', development, 'VSCodium', 'optional'),
    upstream('foot', 'Foot', 'https://codeberg.org/dnkl/foot/raw/branch/master/foot.svg', 'Default terminal', base, 'foot', { local: '/usr/share/icons/hicolor/scalable/apps/foot.svg', license: 'CC-BY-SA-4.0', creator: 'Lennard Hofmann' }),
    icon('alacritty', 'Alacritty', 'siAlacritty', 'Terminal option', terminal, 'Alacritty', 'optional'),
    icon('ghostty', 'Ghostty', 'siGhostty', 'Terminal option', terminal, 'Ghostty', 'optional'),
    upstream('kitty', 'Kitty', 'https://raw.githubusercontent.com/kovidgoyal/kitty/master/logo/kitty.svg', 'Terminal option', terminal, 'Kitty', { scope: 'optional' }),
    icon('tmux', 'tmux', 'siTmux', 'Terminal multiplexer', base, 'tmux'),
    icon('starship', 'Starship', 'siStarship', 'Shell prompt', base, 'starship'),
    icon('bash', 'Bash', 'siGnubash', 'Shell', base, 'bash-completion'),
  ] },
  { id: 'tooling', title: 'TOOLS & FRAMEWORKS', subtitle: 'DEVELOPMENT TOOLS AND SUPPORTED FRAMEWORKS', entries: [
    icon('git', 'Git', 'siGit', 'Version control', base, 'git'),
    upstream('lazygit', 'Lazygit', 'https://user-images.githubusercontent.com/8456633/174470852-339b5011-5800-4bb9-a628-ff230aa8cd4e.png', 'Git interface', base, 'lazygit'),
    icon('docker', 'Docker', 'siDocker', 'Containers', base, 'docker'),
    upstream('mise', 'Mise', 'https://mise.jdx.dev/logo.svg', 'Runtime manager', base, 'mise-bin'),
    icon('bat', 'bat', 'siBat', 'File previews', base, 'bat'),
    upstream('fzf', 'fzf', 'https://raw.githubusercontent.com/junegunn/i/master/fzf-color.png', 'Fuzzy finder', base, 'fzf', { license: 'MIT' }),
    icon('rails', 'Ruby on Rails', 'siRubyonrails', 'Framework option', development, 'Ruby on Rails', 'optional'),
    icon('laravel', 'Laravel', 'siLaravel', 'Framework option', development, 'Laravel', 'optional'),
    icon('symfony', 'Symfony', 'siSymfony', 'Framework option', development, 'Symfony', 'optional'),
    icon('phoenix', 'Phoenix', 'siPhoenixframework', 'Framework option', development, 'Phoenix', 'optional'),
    icon('llvm', 'LLVM', 'siLlvm', 'Compiler tools', base, 'llvm'),
    icon('mariadb', 'MariaDB', 'siMariadb', 'Database libraries', base, 'mariadb-libs'),
    icon('postgresql', 'PostgreSQL', 'siPostgresql', 'Database libraries', base, 'postgresql-libs'),
    icon('opencode', 'OpenCode', 'siOpencode', 'Coding tool option', ai, 'opencode', 'optional'),
    icon('ollama', 'Ollama', 'siOllama', 'Local model option', ai, 'Ollama', 'optional'),
  ] },
  { id: 'languages', title: 'LANGUAGES & RUNTIMES', subtitle: 'RUNTIMES SUPPORTED BY OMARCHY DEVELOPMENT SETUP', entries: [
    icon('ruby', 'Ruby', 'siRuby', 'Programming language', base, 'ruby'),
    icon('python', 'Python', 'siPython', 'Development option', development, 'Python', 'optional'),
    icon('nodejs', 'Node.js', 'siNodedotjs', 'JavaScript runtime', development, 'Node.js', 'optional'),
    icon('bun', 'Bun', 'siBun', 'JavaScript runtime', development, 'Bun', 'optional'),
    icon('deno', 'Deno', 'siDeno', 'JavaScript runtime', development, 'Deno', 'optional'),
    icon('go', 'Go', 'siGo', 'Development option', development, 'Go', 'optional'),
    icon('rust', 'Rust', 'siRust', 'Development option', development, 'Rust', 'optional'),
    icon('zig', 'Zig', 'siZig', 'Development option', development, 'Zig', 'optional'),
    icon('php', 'PHP', 'siPhp', 'Development option', development, 'PHP', 'optional'),
    icon('elixir', 'Elixir', 'siElixir', 'Development option', development, 'Elixir', 'optional'),
    icon('java', 'OpenJDK', 'siOpenjdk', 'Java development', development, 'Java', 'optional'),
    icon('dotnet', '.NET', 'siDotnet', 'Development option', development, '.NET', 'optional'),
    icon('lua', 'Lua', 'siLua', 'Editor and runtime', base, 'lua51'),
    icon('ocaml', 'OCaml', 'siOcaml', 'Development option', development, 'OCaml', 'optional'),
    icon('scala', 'Scala', 'siScala', 'Development option', development, 'Scala', 'optional'),
    icon('clojure', 'Clojure', 'siClojure', 'Development option', development, 'Clojure', 'optional'),
  ] },
  { id: 'apps', title: 'OPEN-SOURCE APPS', subtitle: 'BASE APPLICATIONS AND SUPPORTED OPTIONS', entries: [
    upstream('chromium', 'Chromium', 'https://raw.githubusercontent.com/chromium/chromium/main/chrome/app/theme/chromium/product_logo_256.png', 'Default browser', base, 'chromium'),
    icon('firefox', 'Firefox', 'siFirefoxbrowser', 'Browser option', browsers, 'Firefox', 'optional'),
    icon('libreoffice', 'LibreOffice', 'siLibreoffice', 'Office suite', base, 'libreoffice-fresh'),
    icon('kdenlive', 'Kdenlive', 'siKdenlive', 'Video editor', base, 'kdenlive'),
    icon('obsstudio', 'OBS Studio', 'siObsstudio', 'Capture and stream', base, 'obs-studio'),
    icon('localsend', 'LocalSend', 'siLocalsend', 'Local file transfer', base, 'localsend'),
    icon('mpv', 'mpv', 'siMpv', 'Media player', base, 'mpv'),
    icon('ffmpeg', 'FFmpeg', 'siFfmpeg', 'Media processing', base, 'ffmpegthumbnailer'),
    upstream('imagemagick', 'ImageMagick', 'https://imagemagick.org/image/wizard.png', 'Image tools', base, 'imagemagick'),
    { id: 'cliamp', name: 'Cliamp', block: 'cliamp-logo.txt', source: 'https://cliamp.stream', role: 'Terminal music player', scope: 'base', evidence: { file: base, term: 'cliamp' } },
    icon('signal', 'Signal', 'siSignal', 'Messenger option', guis, 'Signal', 'optional'),
  ] },
];

export const TERMINAL_NAMES = ['btop', 'fastfetch', 'ripgrep', 'fd', 'eza', 'zoxide', 'yay', 'jq', 'tldr', 'yt-dlp', 'herdr', 'gum'];
