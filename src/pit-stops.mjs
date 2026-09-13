import { CHARACTERS } from './characters.mjs';

export const PIT_TOPICS = Object.freeze([
  {
    id: 'themes', title: 'TOKYO NIGHT EVERYWHERE', source: 'Omarchy manual/06-themes.md',
    lines: [
      'Omarchy themes style the desktop, terminal, Neovim, and shell together.',
      'Where do I change the theme?',
      'Open Style > Theme in the Omarchy menu. Tokyo Night is one of the included themes.',
      'These colors suit the city. Let us finish the delivery.',
    ],
  },
  {
    id: 'backgrounds', title: 'A DIFFERENT BACKGROUND', source: 'Omarchy manual/06-themes.md',
    lines: [
      'Each Omarchy theme includes background images.',
      'Can I change the background without changing the theme?',
      'Super + Ctrl + Space changes the background within the current theme.',
      'A night skyline belongs on this desktop.',
    ],
  },
  {
    id: 'workspaces', title: 'ROOM FOR EACH PROJECT', source: 'Omarchy manual/04-navigation.md',
    lines: [
      'Hyprland workspaces keep groups of windows together.',
      'How do I move a window to workspace two?',
      'Super + Shift + 2 moves the focused window there. Super + 2 switches to workspace two.',
      'That gives each project its own space.',
    ],
  },
  {
    id: 'layouts', title: 'DWINDLE OR SCROLLING', source: 'Omarchy manual/04-navigation.md',
    lines: [
      'Omarchy can use a different window layout on each workspace.',
      'What if I want windows in a horizontal row?',
      'Super + L switches a workspace between dwindle and scrolling layouts.',
      'That suits an editor and a terminal.',
    ],
  },
  {
    id: 'clipboard', title: 'FIND THAT COPY', source: 'Omarchy manual/08-unified-clipboard-history.md',
    lines: [
      'Omarchy clipboard history keeps text and images.',
      'Where can I find something I copied earlier?',
      'Super + Ctrl + V opens the history. Type to search, then select an entry.',
      'That avoids another search in the original window.',
    ],
  },
  {
    id: 'terminal', title: 'YOUR TERMINAL', source: 'Omarchy manual/15-terminal.md',
    lines: [
      'Omarchy supports Foot, Alacritty, Ghostty, and Kitty.',
      'Where do I choose a terminal?',
      'Open Install > Terminal in the Omarchy menu. Setup > Defaults > Terminal selects the default.',
      'Good. A familiar terminal helps.',
    ],
  },
  {
    id: 'captures', title: 'CAPTURE THE GARAGE', source: 'Omarchy manual/12-screenshots-recording.md',
    lines: [
      'Print Screen opens the Omarchy screenshot picker.',
      'Does it save the picture or copy it?',
      'Both. The screenshot goes to a PNG file and the clipboard.',
      'The crew needs a picture when everyone reaches the arcade.',
    ],
  },
  {
    id: 'hotkeys', title: 'START WITH THE KEYBOARD', source: 'Omarchy manual/07-hotkeys.md',
    lines: [
      'The default shortcut for the Omarchy menu is Super + Space.',
      'How do I find the rest of the shortcuts?',
      'Super + K shows the main bindings. Super + Return opens a terminal.',
      'Three shortcuts are a useful start.',
    ],
  },
  {
    id: 'groups', title: 'KEEP WINDOWS TOGETHER', source: 'Omarchy manual/04-navigation.md',
    lines: [
      'Related windows can share a group in Hyprland.',
      'What starts a window group?',
      'Super + G toggles a group. Super + Ctrl + Left or Right moves between its windows.',
      'The project tools can stay together.',
    ],
  },
].map((topic) => Object.freeze({ ...topic, lines: Object.freeze(topic.lines) })));

export function createPitConversation(random, playerId, previousTopic = null) {
  const members = CHARACTERS.filter(({ id }) => id !== playerId);
  const topics = PIT_TOPICS.filter(({ id }) => id !== previousTopic);
  const companion = members[Math.min(members.length - 1, Math.floor(random() * members.length))];
  const topic = topics[Math.min(topics.length - 1, Math.floor(random() * topics.length))];
  return {
    companionId: companion.id,
    topicId: topic.id,
    title: topic.title,
    lines: topic.lines.map((text, index) => ({ speaker: index % 2 === 0 ? 'crew' : 'driver', text })),
  };
}
