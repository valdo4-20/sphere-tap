let corpus=[],loading;
const categories={cinema:'Cinema',art:'Arte e livros',music:'Música',geek:'Geek',geography:'Países e Geografia',history:'História',science:'Ciências'};
export async function loadQuestionCorpus(){
 loading??=import('./data/question-facts.json',{with:{type:'json'}}).then(({default:data})=>{
  corpus=data.groups.filter(g=>new Set(g.rows.map(r=>r[1])).size>=4).map(g=>({...g,answers:[...new Set(g.rows.map(r=>r[1]))]}));return corpus.reduce((n,g)=>n+g.rows.length,0);
 }).catch(error=>{loading=undefined;throw error});return loading;
}
function explanationFor(group,subject,answer){
 if(group==='cinema-director')return `A direção de “${subject}” é creditada a ${answer} na referência indicada.`;
 if(group==='books-author')return `“${subject}” aparece com autoria de ${answer} no catálogo indicado.`;
 if(group==='cities-country')return `${subject} fica em ${answer}, conforme o registro geográfico da fonte.`;
 if(group==='pokemon-types')return `Na forma padrão, ${subject} tem os tipos: ${answer}. A fonte apresenta os dados dessa forma.`;
 if(group==='pokemon-generation')return `${subject} estreou na ${answer}, conforme a referência da espécie.`;
 return `${subject}: ${answer}.`;
}
function question(g,row,index){
 const [subject,answer,qid,reference]=row,others=[];let offset=index%g.answers.length;while(others.length<3){const text=g.answers[offset++%g.answers.length];if(text!==answer&&!others.includes(text))others.push(text)}
 return {id:`catalog-${g.id}-${qid}`,sourced:true,theme:g.theme,category:categories[g.theme],difficulty:2,prompt:g.prompt.replace('{s}',subject),options:[answer,...others],correct:0,explanation:explanationFor(g.id,subject,answer),source:g.property?`https://www.wikidata.org/wiki/${qid}#${g.property}`:reference,sourceName:g.sourceName,reference,license:g.license};
}
export function corpusCandidates(level,countPerGroup=24){return corpus.flatMap(g=>Array.from({length:Math.min(countPerGroup,g.rows.length)},(_,i)=>{const index=((level-1)*countPerGroup+i)%g.rows.length;return question(g,g.rows[index],index)}))}
export function corpusCount(){return corpus.reduce((n,g)=>n+g.rows.length,0)}

// Only explicitly curated familiar subjects enter general rounds. The full archive remains auditable.
const familiar={
 'cities-country':new Set(['Shanghai','Paris','London','Tokyo','Rome','Madrid','Barcelona','Lisbon','Berlin','Amsterdam','Buenos Aires','Rio de Janeiro','São Paulo','New York City','Los Angeles','Sydney','Toronto','Cairo','Athens','Lima','Santiago','Mexico City','Beijing']),
 'cinema-director':new Set(['Titanic','Avatar','Jurassic Park','O Castelo no Céu','O Conto da Princesa Kaguya','Spirited Away','A Viagem de Chihiro','The Matrix','Jaws','E.T. the Extra-Terrestrial','Finding Nemo','Toy Story','Pulp Fiction']),
 'pokemon-types':new Set(['Pikachu','Bulbasaur','Charmander','Squirtle','Charizard','Eevee','Snorlax','Gengar','Meowth','Psyduck'])
};
export function playableCorpusCandidates(level){return corpus.flatMap(g=>{
 const rows=g.rows.filter(row=>familiar[g.id]?.has(row[0])),answers=[...new Set(rows.map(row=>row[1]))];
 if(answers.length<4)return [];
 return rows.map((row,index)=>({...question({...g,answers},row,index),difficulty:2,subjectKey:`catalog:${g.id}:${row[2]}`}));
})}
