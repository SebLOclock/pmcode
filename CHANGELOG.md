# Changelog

All notable changes to this project will be documented in this file.

## [1.0.5] - 2025-01-21

### fixed
- Fixed a bug where the extension would not load the tasks from the project files.


## [1.0.5] - 2024-11-15
## added
- Reading more files in the project to extract tasks from formatted comments.
  - Supported file extensions: `.js`, `.ts`, `.jsx`, `.tsx`, `.html`, `.css`, `.scss`, `.less`, `.json`, `.md`, `.markdown`, `.yaml`, `.yml`, `.xml`, `.php`, `.py`, `.java`, `.c`, `.cpp`, `.h`, `.hpp`, `.cs`, `.vb`, `.fs`, `.fsx`, `.fsi`, `.sql`, `.sh`, `.bat`, `.cmd`, `.ps1`, `.psm1`, `.psd1`, `.pl`, `.pm`, `.t`, `.r`, `.rb`, `.rake`, `.gemspec`, `.lua`, `.go`, `.dart`, `.swift`, `.m`, `.mm`, `.groovy`, `.kt`, `.kts`, `.clj`, `.cljs`, `.cljc`, `.edn`, `.scala`, `.sc`, `.sbt`, `.gradle`, `.rs`, `.toml`
- Adding a tittle to the Kanban view.

## [1.0.4] - 2024-11-08
## fixed
- Security control to avoid the execution of malicious code.
- Security control to avoid the execution of unallowed commands.

## changed
- Removing the 'Go to code' button from the task view.
- Adding the path of the file in the task view.
- Adding action on file path to open the file in the editor.

## [1.0.3] - 2024-11-08
## added
- Refactor the code into a MVC architecture.

## [1.0.2] - 2024-11-07
## fixed
- Incoherence between the category of the extension and the command name.

## [1.0.1] - 2024-11-07
## added
- The extension has now its own icon.

## [1.0.0] - 2024-11-07
### Added
- Initial release of the **PMCode** extension.
- Project file analysis to extract tasks from formatted comments (`pmcode.todo`, `pmcode.wip`, etc.).
- Display tasks in columns representing their status (TODO, WIP, Blocked, Done).
- `PMCode: Open Kanban View` command to open the Kanban view in VS Code.
- Drag-and-drop functionality to move tasks between columns in the Kanban board.
- Code navigation support: click on a task to open the corresponding file at the correct line.
- Dynamic task display with buttons for navigating to sections and changing task status.
