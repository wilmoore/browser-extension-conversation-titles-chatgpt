# Implementation Todo List

## Phase 1: Project Setup
- [ ] Initialize npm project with package.json
- [ ] Install Vite, TypeScript, and @crxjs/vite-plugin
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Configure Vite for Chrome extension
- [ ] Create manifest.json (Manifest V3)
- [ ] Add extension icons (16, 48, 128px)

## Phase 2: Context Extraction
- [ ] Create `src/content/selectors.ts` with selector arrays
- [ ] Create `src/types/index.ts` with TypeScript interfaces
- [ ] Implement `src/content/context-extractor.ts`
  - [ ] getConversationTitle()
  - [ ] getProjectName()
  - [ ] getConversationUrl()
  - [ ] getFullContext()

## Phase 3: Placement Management
- [ ] Create `src/content/placement-manager.ts`
  - [ ] PlacementLocation enum
  - [ ] Top nav detection with 700ms stability timer
  - [ ] Footer detection and disclaimer replacement
  - [ ] Placement state machine
  - [ ] Promotion/demotion logic

## Phase 4: Title Rendering
- [ ] Create `src/styles/content.css`
- [ ] Create `src/content/title-renderer.ts`
  - [ ] createElement with unique ID
  - [ ] formatDisplayText()
  - [ ] render(context, location)
  - [ ] cleanup/removal function

## Phase 5: Copy Handlers
- [ ] Create `src/content/copy-handler.ts`
  - [ ] Modifier key detection
  - [ ] getTitleOnly()
  - [ ] getFullContext()
  - [ ] getMarkdownLink()
  - [ ] getRawUrl()
  - [ ] Clipboard write

## Phase 6: Observer Setup
- [ ] MutationObserver initialization
- [ ] Route change detection
- [ ] Update debouncing
- [ ] Cleanup on page unload

## Phase 7: Integration
- [ ] Create `src/content/index.ts` entry point
- [ ] Wire all modules together
- [ ] Build and test unpacked extension

## Phase 8: Testing & Verification
- [ ] Test on chatgpt.com
- [ ] Test on chat.openai.com
- [ ] Test all copy modes
- [ ] Test placement promotion/demotion
- [ ] Test navigation transitions
- [ ] Verify no console errors
- [ ] Verify no duplicate elements

## Known Issues to Address Later
(To be filled during implementation)
