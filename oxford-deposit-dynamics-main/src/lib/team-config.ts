export const TEAM_DEFINITIONS = {
  'Business Banking': [
    'Mark Morrison',
    'Brad Kirkland',
    'Cary Listerman',
    'Josh Copen',
    'Jose Morales',
    'Marlon Attiq',
    'Scott McCurdy',
    'Bryan Ford',
    'Jack Korth',
    'Hans Dessureault',
    'Tracey Brinkman',
    'Thomas Merrill',
    'Daniel McCarthy',
    'Mohamed Arfaoui'
  ],
  'OCF': [
    'John Trendell',
    'Steve Tomasello',
    'Robyn Barrett',
    'Kori Bezemek-Hogston',
    'Matthew Bacich',
    'Mark Matheson'
  ],
  'Personal Banking': [] as string[] // Catch-all for all other officers
};

export type TeamName = keyof typeof TEAM_DEFINITIONS;

export function getOfficerTeam(officerName: string): TeamName {
  for (const [team, officers] of Object.entries(TEAM_DEFINITIONS)) {
    if (officers.includes(officerName)) {
      return team as TeamName;
    }
  }
  return 'Personal Banking';
}

export function getTeamOfficers(teamName: TeamName, allOfficers: string[]): string[] {
  if (teamName === 'Personal Banking') {
    // Personal Banking is everyone not in Business Banking or OCF
    const businessBanking = new Set(TEAM_DEFINITIONS['Business Banking']);
    const ocf = new Set(TEAM_DEFINITIONS['OCF']);
    return allOfficers.filter(officer => !businessBanking.has(officer) && !ocf.has(officer));
  }
  return [...TEAM_DEFINITIONS[teamName]];
}

export const TEAM_COLORS = {
  'Business Banking': 'hsl(var(--primary))',
  'OCF': 'hsl(var(--accent))',
  'Personal Banking': 'hsl(var(--secondary))'
};
