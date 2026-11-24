// Lista de diapositivas: el orden aquí es el orden de la presentación.
// Se usa para la barra lateral de miniaturas y para los enlaces del índice.
export interface SlideMeta {
  id: string;
  title: string;
  img?: string; // nombre del fichero en public/img (sin extensión)
}

export const slides: SlideMeta[] = [
  { id: 'portada', title: 'Portada', img: 'portada' },
  { id: 'indice', title: 'Índice', img: 'indice' },
  { id: 'reto', title: '1 · El reto', img: 'reto' },
  { id: 'causas', title: '2 · Causas', img: 'causas' },
  { id: 'medio', title: '3 · En el medioambiente', img: 'medio' },
  { id: 'personas', title: '3 · En las personas', img: 'personas' },
  { id: 'empresas', title: '3 · En las empresas', img: 'empresas' },
  { id: 'espana', title: '4 · Datos de España' },
  { id: 'canarias', title: '4 · Datos de Canarias', img: 'datos' },
  { id: 'mundo', title: '4 · Contexto mundial', img: 'contra' },
  { id: 'soluciones', title: '5 · Soluciones', img: 'soluciones' },
  { id: 'instituto', title: '6.1 · En el instituto', img: 'instituto' },
  { id: 'barrio', title: '6.2 · En el barrio', img: 'barrio' },
  { id: 'tenerife', title: '6.3 · En Tenerife', img: 'tenerife' },
  { id: 'conclusion', title: '7 · Conclusión', img: 'conclusion' },
  { id: 'fuentes', title: '8 · Fuentes' },
  { id: 'contra', title: 'Contraportada', img: 'portada' },
];

export const idx = (id: string) => slides.findIndex((s) => s.id === id);
