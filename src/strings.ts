export const STR = {
  appName: 'NameBeasts!',
  landingBlurb: 'Invent and remember names for mysterious creatures.',
  newGame: 'New game',
  resumeGame: 'Resume game',
  settings: {
    title: 'Game settings',
    distinctCreatures: 'Different creatures',
    duplicatesPerCreature: 'Copies of each creature',
    totalCards: 'Total cards',
    players: 'Players',
    addPlayer: 'Add player',
    pastPlayers: 'Past players',
    chooseStyle: 'Choose style',
    useThisStyle: 'Use this style',
    resetDefaults: 'Reset to defaults',
    start: 'Start!',
    playerModalTitle: 'Player identity',
    playerNameLabel: 'Player name',
    avatarLabel: 'Choose an avatar',
    colorLabel: 'Choose a color palette',
    currentPlayers: 'Current players',
    savePlayer: 'Save changes',
    playerNameRequired: 'Give them a name before continuing.',
    playerNameDuplicate: 'That name is already in use.',
    defaultLabel: 'Default',
    maxPlayersNote: 'Maximum of 8 players reached.',
    playerNameHint: 'Tap a card below to edit it, or add a new one.',
    playerNamePlaceholder: 'Player name',
    removePlayer: (name: string) => `Remove ${name}`
  },
  play: {
    startRound: 'Start Round',
    hint: 'Name this creature',
    noOne: 'No one',
    next: 'Next',
    undo: 'Undo last',
    progress: (i: number, total: number) => `Card ${i} of ${total}`,
    noCards: 'No cards'
  },
  finish: {
    title: 'Scores',
    playAgain: 'Play again'
  }
};