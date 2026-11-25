// Contenido extraído de «Actividad de Evaluación 1 - Sostenibilidad y desarrollo sostenible».

export const meta = {
  title: 'Sostenibilidad y desarrollo sostenible',
  subject: 'Sostenibilidad aplicada al sistema productivo',
  course: '2º ASIR 26-27',
  authors: ['Nicolás David Gilbert González', 'Oleg Basov', 'Javier Maeso Abreu', 'Fabián Estévez García'],
};

export const index = [
  'Sostenibilidad y desarrollo sostenible',
  'Ambiental, económica y social',
  'Línea del tiempo',
  'La ONU, punto de encuentro',
  'El secretario general',
  'Criterios ASG en la empresa',
  'Los criterios ASG en mi vida',
  '¿Son alcanzables los ODS?',
  'Acciones para cada ODS',
];

export const pillars = [
  {
    key: 'ambiental',
    title: 'Ambiental',
    text: 'Proteger los ecosistemas, cuidar la salud del planeta y conservar la biodiversidad sin renunciar al progreso económico y social.',
    examples: [
      'Gestión responsable del agua y reducción de contaminantes hídricos.',
      'Energías renovables (solar, eólica) y eficiencia energética.',
      'Reducción y separación de residuos; adiós a los plásticos de un solo uso.',
    ],
  },
  {
    key: 'economica',
    title: 'Económica',
    text: 'Administrar recursos financieros y materiales generando rentabilidad duradera y empleo responsable, sin agotar el patrimonio natural del futuro.',
    examples: [
      'Reciclaje de materias primas bajo modelos de economía circular.',
      'Planes de ahorro de energía y optimización de recursos.',
      'Promoción del consumo responsable entre clientes y ciudadanos.',
    ],
  },
  {
    key: 'social',
    title: 'Social',
    text: 'Que todas las personas tengan acceso equitativo a recursos y servicios clave para una vida digna, con inclusión, cohesión y derechos humanos.',
    examples: [
      'Urbanismo, edificios y transporte accesibles.',
      'Igualdad de oportunidades y trato digno; sin explotación laboral ni infantil.',
      'Acceso universal a sanidad, educación y vivienda digna.',
    ],
  },
] as const;

export const timeline = [
  { date: 'S. XVIII–XIX', title: 'Primeras alertas', text: 'Malthus y Ricardo analizan si la Tierra puede sostener el crecimiento de la población.' },
  { date: '1968', title: 'Club de Roma', text: 'Nace para concienciar sobre un crecimiento económico sostenible.' },
  { date: '1972', title: 'Estocolmo', text: 'Primera Conferencia de la ONU sobre el Medio Humano y «Los límites del crecimiento».' },
  { date: '1987', title: 'Informe Brundtland', text: '«Nuestro futuro común» formula el desarrollo sostenible y sus tres pilares.' },
  { date: '1997–2015', title: 'Kioto y París', text: 'Tratados clave y marcos globales contra el cambio climático.' },
  { date: '25·IX·2015', title: 'Agenda 2030', text: 'La ONU aprueba los 17 ODS y sus 169 metas.' },
  { date: '2022–hoy', title: 'Regulación', text: 'CSRD y Pacto Verde Europeo; en España, la Ley 1/2023 de Cooperación.' },
];

export const unReasons = [
  {
    title: 'Membresía universal real',
    text: '193 Estados miembros: prácticamente todos los países soberanos. Ninguna otra organización tiene esa representatividad.',
  },
  {
    title: 'Neutralidad y extraterritorialidad',
    text: 'Su sede en Manhattan es suelo internacional neutral: cualquier diplomático puede negociar allí con seguridad y en igualdad.',
  },
  {
    title: 'Un marco normativo común',
    text: 'La Carta de la ONU obliga a todos a reconocer a la Asamblea General como órgano deliberante para canalizar crisis y buscar consensos.',
  },
];

export const sgFunctions = [
  { title: 'Gestión administrativa', text: 'Dirige la Secretaría: presupuesto, personal y coordinación de agencias.' },
  { title: 'Mediación y diplomacia', text: 'Previene, media y resuelve disputas con independencia e imparcialidad.' },
  { title: 'Alerta de crisis', text: 'Art. 99: avisa al Consejo de Seguridad de amenazas a la paz.' },
  { title: 'Representación global', text: 'Portavoz de los pueblos: derechos humanos, desarrollo sostenible y cooperación.' },
];

export const esgCompany = [
  {
    letter: 'A',
    name: 'Ambientales',
    text: 'Impacto directo e indirecto de la empresa sobre el planeta, el cambio climático y los recursos naturales.',
    example: 'Reducir emisiones de GEI, usar renovables, optimizar el agua, reciclar y gestionar residuos.',
  },
  {
    letter: 'S',
    name: 'Sociales',
    text: 'Relación con las personas: condiciones laborales, proveedores, clientes e impacto en la comunidad.',
    example: 'Políticas de igualdad, medidas de conciliación y proyectos comunitarios sanitarios, educativos o culturales.',
  },
  {
    letter: 'G',
    name: 'Gobernanza',
    text: 'Estructura organizativa, ética directiva, transparencia y forma de tomar decisiones.',
    example: 'Políticas anticorrupción, transparencia fiscal y códigos éticos que garanticen diversidad en la Junta Directiva.',
  },
];

export const esgPersonal = [
  {
    letter: 'A',
    how: 'Eficiencia energética, menos consumo eléctrico y gestión responsable de residuos tecnológicos.',
    example: 'Apagar o programar el apagado de servidores de pruebas y máquinas virtuales; llevar cables, discos y placas al punto limpio.',
  },
  {
    letter: 'S',
    how: 'Inclusión, trabajo colaborativo, derechos digitales y privacidad de los usuarios.',
    example: 'Configurar bien la privacidad y la protección de datos en los proyectos de clase y compartir conocimiento con los compañeros.',
  },
  {
    letter: 'G',
    how: 'Ética profesional y académica, transparencia y respeto a licencias y normas de ciberseguridad.',
    example: 'Usar software legal o de código abierto; nada de credenciales ajenas, piratería ni hacking fuera de un laboratorio controlado.',
  },
];

// Colores oficiales de los ODS (Naciones Unidas)
export const sdgs = [
  { n: 1, name: 'Fin de la pobreza', color: '#E5243B', action: 'Apoyar los proyectos y campañas sociales de la empresa para colectivos vulnerables.' },
  { n: 2, name: 'Hambre cero', color: '#DDA63A', action: 'Reducir el desperdicio de comida y consumir con responsabilidad en el comedor.' },
  { n: 3, name: 'Salud y bienestar', color: '#4C9F38', action: 'Mantener un entorno seguro y limpio, respetando la prevención de riesgos.' },
  { n: 4, name: 'Educación de calidad', color: '#C5192D', action: 'Participar en la formación continua y el reciclaje de habilidades.' },
  { n: 5, name: 'Igualdad de género', color: '#FF3A21', action: 'Tratar a todos con equidad y aplicar las políticas de igualdad.' },
  { n: 6, name: 'Agua limpia y saneamiento', color: '#26BDE2', action: 'Usar el agua con eficiencia: cerrar grifos y evitar despilfarros.' },
  { n: 7, name: 'Energía asequible y no contaminante', color: '#FCC30B', action: 'Apagar luces, ordenadores y equipos al terminar la jornada.' },
  { n: 8, name: 'Trabajo decente y crecimiento económico', color: '#A21942', action: 'Trabajar con ética, rechazar la precariedad y promover condiciones dignas.' },
  { n: 9, name: 'Industria, innovación e infraestructura', color: '#FD6925', action: 'Proponer mejoras y procesos más eficientes que reduzcan el impacto.' },
  { n: 10, name: 'Reducción de las desigualdades', color: '#DD1367', action: 'Fomentar un entorno integrador que respete la diversidad.' },
  { n: 11, name: 'Ciudades y comunidades sostenibles', color: '#FD9D24', action: 'Ir al trabajo en transporte público, compartido o andando.' },
  { n: 12, name: 'Producción y consumo responsables', color: '#BF8B2E', action: 'Separar y reciclar residuos y limitar los plásticos de un solo uso.' },
  { n: 13, name: 'Acción por el clima', color: '#3F7E44', action: 'Priorizar documentos digitales para reducir papel y emisiones de CO₂.' },
  { n: 14, name: 'Vida submarina', color: '#0A97D9', action: 'No verter sustancias contaminantes ni plásticos por los desagües.' },
  { n: 15, name: 'Vida de ecosistemas terrestres', color: '#56C02B', action: 'Imprimir solo lo necesario y elegir material de oficina ecológico.' },
  { n: 16, name: 'Paz, justicia e instituciones sólidas', color: '#00689D', action: 'Ética, transparencia y tolerancia cero con la corrupción y el fraude.' },
  { n: 17, name: 'Alianzas para lograr los objetivos', color: '#19486A', action: 'Colaborar con compañeros, proveedores y otras entidades en proyectos sostenibles.' },
];
