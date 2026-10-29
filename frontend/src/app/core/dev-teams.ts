export interface DevMember {
  name: string;
  role: string;
  photo: string;
}

export interface DevTeam {
  label: string;
  members: DevMember[];
}

export const DEV_TEAMS: DevTeam[] = [
  {
    label: 'IT 009 — Section A',
    members: [
      { name: 'Duran, Kevin Rio D.',      role: 'Lead Developer / Project Lead', photo: '/developers/kevin-duran.jpg' },
      { name: 'Marbella, Aelous Matthew', role: 'Lead Frontend Developer',       photo: '/developers/aelous-marbella.jpg' },
      { name: 'Marrero, John Carlo',      role: 'Backend Developer',             photo: '/developers/john-carlo-marrero.jpg' },
      { name: 'Reyes, Mariane E.',        role: 'Lead Frontend Designer',        photo: '/developers/mariane-reyes.jpg' },
      { name: 'Roxas, Ardee',             role: 'Frontend Designer / Developer', photo: '/developers/ardee-roxas.jpg' }
    ]
  },
  {
    label: 'IT 005 — Section B',
    members: [
      { name: 'Duran, Kevin Rio D.',        role: 'Lead Developer / Project Lead',    photo: '/developers/kevin-duran.jpg' },
      { name: 'Marrero, John Carlo',        role: 'Backend Developer',                photo: '/developers/john-carlo-marrero.jpg' },
      { name: 'Del Castillo, Gwenverselle', role: 'Technical Writer / QA',            photo: '/developers/gwenverselle-del-castillo.jpg' },
      { name: 'Menguito, John Harvey',      role: 'Frontend Support / Accessibility', photo: '/developers/john-harvey-menguito.jpg' },
      { name: 'Palijado, Jennard Joseph',   role: 'Compliance & Legal Pages',         photo: '/developers/jennard-palijado.jpg' },
      { name: 'Reyes, Mariane E.',          role: 'Lead Frontend Designer',           photo: '/developers/mariane-reyes.jpg' }
    ]
  }
];