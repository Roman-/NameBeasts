export const STR = {
  appName: 'NameBeasts!',
  landingBlurb: 'Invent and remember names for mysterious creatures.',
  newGame: 'New game',
  resumeGame: 'Resume game',
  settings: {
    title: 'New game',
    distinctCreatures: 'Different creatures',
    duplicatesPerCreature: 'Copies of each creature',
    totalCards: 'Total cards',
    players: 'Players',
    addPlayer: 'Add player',
    creaturesPanelTitle: 'Creatures',
    playersHelper: 'We pre-filled names, avatars, and colors. Tap a card to personalize.',
    pastPlayers: 'Past players',
    chooseStyle: 'Choose style',
    useThisStyle: 'Use this style',
    resetDefaults: 'Reset to defaults',
    start: 'Start!',
    playerModalTitle: 'Edit player identity',
    playerNameLabel: 'Player name',
    avatarLabel: 'Choose an avatar',
    colorLabel: 'Choose a color palette',
    currentPlayers: 'Current players',
    savePlayer: 'Save changes',
    playerNameRequired: 'Give them a name before continuing.',
    playerNameDuplicate: 'That name is already in use.',
    defaultLabel: 'Default',
    maxPlayersNote: 'Maximum of 8 players reached.',
    playerNameHint: 'Names must be unique. Keep it short and memorable.',
    playerNamePlaceholder: 'Player name',
    removePlayer: (name: string) => `Remove ${name}`,
    tapToEdit: 'Tap to rename or change avatar',
    editPlayer: 'Edit',
    remove: 'Remove',
    paletteLabel: 'palette',
    playerPreviewPlaceholder: 'Player name'
  },
  play: {
    startRound: 'Start Round',
    hint: 'Name this creature',
    noOne: 'No one',
    next: 'Next',
    undo: 'Undo last',
    progress: (i: number, total: number) => `Card ${i} of ${total}`,
    ready: (total: number) => `Ready · ${total} card${total === 1 ? '' : 's'}`,
    noCards: 'No cards',
    points: (value: number) => `${value} point${value === 1 ? '' : 's'}`,
    playerAria: (name: string, score: number) =>
      `${name}. ${score === 0 ? '0 points so far' : `${score} point${score === 1 ? '' : 's'}`}`,
    noOneAria: (score: number) =>
      score === 0
        ? 'No one. 0 points so far'
        : `No one. ${score} point${score === 1 ? '' : 's'}`,
    turnBadge: 'TURN',
    turnLabel: (name: string) => `It's ${name}'s turn`
  },
  finish: {
    title: 'Scores',
    playAgain: 'Play again',
    topScore: 'Top score',
    topScoreTie: 'Top score (tie)'
  }
};