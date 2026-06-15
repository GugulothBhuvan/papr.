# Papr - Pending Features & Hardcoded UI Elements To-Do

The following is a comprehensive checklist of all UI elements and buttons that are currently hardcoded placeholders. These need to be wired up to actual backend logic or state management.

## Home Dashboard
- [ ] **Import functionality**
  - [ ] Implement `Import archive (.zip, .tar.gz)` logic
  - [ ] Implement `Import Folder` logic
- [ ] **Projects Filtering & Views**
  - [ ] Connect `Shared with you` tab to backend logic (currently hardcoded to empty state)
  - [ ] Implement `Grid View` vs `List View` layout toggle logic
- [ ] **Table Sorting**
  - [ ] Implement sorting by `Name` 
  - [ ] Implement sorting by `Created` date

## Project Editor Mode
- [ ] **Project Header Dropdown**
  - [ ] Implement `Share and collaborate` logic
  - [ ] Implement `Duplicate` project logic
  - [ ] Implement `Export (zip)` functionality
  - [ ] Implement `XeLaTeX / LuaLaTeX` compiler engine toggle
- [ ] **Sidebar Features**
  - [ ] Wire up `Search` (magnifying glass icon) in the files tab
  - [ ] Replace hardcoded `Outline` tab data with dynamic LaTeX document parsing
- [ ] **Editor Tools**
  - [ ] Hook up the `Tools` menu (grid icon) in the editor header
- [ ] **Chat Interface Enhancements**
  - [ ] Implement `Paperclip` (Attachment upload) functionality for AI context
  - [ ] Implement `Mic` (Voice input to text) for chat prompts

## Profile & Settings (Global)
- [ ] **Profile Dropdown Menus**
  - [ ] Connect `Invite` button to workspace/project sharing logic
  - [ ] Connect `support@papr.com` button (e.g., mailto link or support modal)
  - [ ] Connect `Join the Papr discord` to actual discord invite link
  - [ ] Implement robust `Sign in` authentication flow
- [ ] **Settings Modal: Editor Preferences**
  - [ ] Connect `Language` dropdown to i18n logic
  - [ ] Connect `Font size` dropdown to Monaco editor font settings
  - [ ] Implement state & logic for `Auto Formatting` toggle
  - [ ] Implement state & logic for `Realtime compilation` toggle
  - [ ] Implement state & logic for `Vim Mode` toggle (Monaco vim bindings)
  - [ ] Implement state & logic for `Equation hover` live previews
- [ ] **Settings Modal: Additional Tabs**
  - [ ] Build out `PDF Viewer` settings panel
  - [ ] Build out `File Management` settings panel
  - [ ] Build out `Data Controls` settings panel
  - [ ] Build out `Integrations` settings panel
