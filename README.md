# Conversation Titles for ChatGPT

A lightweight Chrome extension that restores missing context in the ChatGPT UI by always displaying the current conversation title and project name, with easy copy functionality using modifier clicks.

## Features

- Always displays the current conversation title
- Shows project name when conversation belongs to a project
- Copy in multiple formats with modifier clicks (customizable in Options):
  - **Click**: Copy as Markdown link
  - **Shift + Click**: Copy project name and title
  - **Cmd/Ctrl + Click**: Copy title only
  - **Cmd/Ctrl + Shift + Click**: Copy raw URL

## Installation

### From Source (Development)

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From Chrome Web Store

[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/conversation-titles-for-chatgpt/kgjldbijkcbbjbnfdaebkfbpgdoogfjo)

## Usage

Once installed, the extension automatically displays the conversation title:

- **Primary location**: Top-center navigation bar (when available)
- **Fallback location**: Footer area (replaces disclaimer text)

Hover over the title to see copy instructions. Click with modifier keys to copy in different formats.

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with hot reload
npm run dev
```

## Supported Domains

- `chatgpt.com`
- `chat.openai.com`

## Publishing

| Field | Value |
|-------|-------|
| Publisher | Śavvy AI |
| Publisher ID | `df3fb377-c0da-4b93-a6fb-872b2fe2b99a` |
| Extension ID | `kgjldbijkcbbjbnfdaebkfbpgdoogfjo` |
| Support | wil.moore@wilmoore.com |

**Links:**
- [Developer Dashboard](https://chrome.google.com/webstore/devconsole/df3fb377-c0da-4b93-a6fb-872b2fe2b99a)
- [Store Listing Editor](https://chrome.google.com/webstore/devconsole/df3fb377-c0da-4b93-a6fb-872b2fe2b99a/kgjldbijkcbbjbnfdaebkfbpgdoogfjo/edit)

See [docs/PUBLISHING.md](./docs/PUBLISHING.md) for automated release instructions.

## Privacy

This extension:
- Does not collect any user data
- Does not make any network requests
- Only requires clipboard write permission for copy functionality
- Operates entirely client-side

## License

MIT
