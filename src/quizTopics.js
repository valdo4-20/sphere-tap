import {corpusCandidates} from './questionCorpus.js';
import {editorialQuestions} from './quizEditorial.js';
import {countries} from './quizGeography.js';
export const quizThemes={
 cinema:{name:'Cinema',color:'#e6a08b',ink:'#92462c'},geek:{name:'Geek',color:'#95cbaa',ink:'#306c48'},math:{name:'Matemática',color:'#d6b28b',ink:'#76542d'},history:{name:'História',color:'#e7bf70',ink:'#78520b'},geography:{name:'Países e Geografia',color:'#b5bc87',ink:'#5b642f'},science:{name:'Ciências',color:'#bca8cc',ink:'#685078'},biology:{name:'Corpo humano',color:'#e4a0af',ink:'#963b56'},art:{name:'Arte',color:'#c4a2e5',ink:'#754398'},music:{name:'Música',color:'#dba8dc',ink:'#89478a'},sport:{name:'Esportes',color:'#a4ca85',ink:'#426d25'},culture:{name:'Cultura',color:'#e9ac83',ink:'#8c4b20'},logic:{name:'Lógica',color:'#b8a7dd',ink:'#655080'}
};
export function themeFor(question){
 const c=question.category||'',id=question.id||'';
 const key=question.theme||(/Cinema/.test(c)||id.startsWith('cinema-')?'cinema':/Geek/.test(c)||id.startsWith('geek-')?'geek':id.startsWith('body-')?'biology':id.startsWith('art-')?'art':id.startsWith('sport-')?'sport':id.startsWith('brhistory-')||/História/.test(c)?'history':/Mundo|Geografia/.test(c)?'geography':/Música/.test(c)?'music':/Ciência/.test(c)?'science':/Esporte/.test(c)?'sport':/Cultura|Cinema|Literatura/.test(c)?'culture':/números|orçamento|Tempo|dia a dia/.test(c)?'math':'logic');
 return {id:key,...(quizThemes[key]||quizThemes.logic)};
}
export const praise=['Bom trabalho!','Fenomenal!','Muito bem!','Você mandou bem!','Excelente descoberta!','Brilhante!','É isso aí!','Que acerto!'];
export function praiseFor(level,index){return praise[(level+index)%praise.length]}
const vessels='https://openstax.org/books/anatomy-and-physiology-2e/pages/20-1-structure-and-function-of-blood-vessels';
const heart='https://openstax.org/books/biology-2e/pages/40-3-mammalian-heart-and-blood-vessels';
const constitution='https://noticias.stf.jus.br/postsnoticias/constituicao-30-anos-as-constituicoes-brasileiras-de-1824-a-1988/';
const louvre='https://www.louvre.fr/en/explore/the-palace/from-the-mona-lisa-to-the-wedding-feast-at-cana';
const olympics='https://www.olympics.com/ioc/olympic-rings';
const oscar='https://www.oscars.org/oscars/ceremonies/2004/memorable-moments';
const yoda='https://www.starwars.com/databank/yoda';
const facts=[
 ['cinema-1','Cinema',1,'Quem dirigiu O Senhor dos Anéis: O Retorno do Rei?',['Peter Jackson','Steven Spielberg','James Cameron','Christopher Nolan'],'Peter Jackson dirigiu o filme e ganhou o Oscar de direção em 2004.',oscar],
 ['cinema-2','Cinema',2,'Quantos Oscars O Retorno do Rei ganhou na cerimônia de 2004?',['11','3','7','14'],'O filme venceu as 11 categorias em que estava indicado.',oscar],
 ['cinema-3','Cinema',2,'Into the West venceu o Oscar de canção original por qual filme?',['O Retorno do Rei','Titanic','Avatar','Jurassic Park'],'A canção faz parte de O Senhor dos Anéis: O Retorno do Rei.',oscar],
 ['cinema-4','Cinema',1,'Quem dirigiu Titanic, lançado em 1997?',['James Cameron','Peter Jackson','George Lucas','Tim Burton'],'James Cameron dirigiu Titanic.','https://www.oscars.org/collection-highlights/titanic?fid=62961'],
 ['cinema-5','Cinema',2,'My Heart Will Go On faz parte de qual filme?',['Titanic','Avatar','Star Wars','Matrix'],'A canção de Titanic venceu o Oscar em 1998.','https://www.oscars.org/oscars/ceremonies/1998/memorable-moments'],
 ['geek-5','Geek',1,'Qual é o nome do irmão de Mario?',['Luigi','Link','Sonic','Kirby'],'Mario e Luigi são irmãos.','https://play.nintendo.com/news-tips/news/learn-more-mushroom-kingdom-friends/'],
 ['geek-6','Geek',1,'Qual criatura de Minecraft é conhecida por se aproximar e explodir?',['Creeper','Vaca','Galinha','Aldeão'],'O creeper é uma das criaturas mais conhecidas de Minecraft.','https://www.minecraft.net/pt-pt/article/meet-creeper'],
 ['geek-1','Geek',1,'Em Star Wars, Yoda é um mestre de qual ordem?',['Jedi','Sith','Vingadores','X-Men'],'Yoda é um dos mestres da Ordem Jedi.',yoda],
 ['geek-2','Geek',1,'Qual destes personagens é treinado por Yoda?',['Luke Skywalker','Bruce Wayne','Tony Stark','Peter Parker'],'Yoda participa do treinamento Jedi de Luke Skywalker.',yoda],
 ['geek-3','Geek',2,'Em Star Wars, como se chama a energia com a qual os Jedi se conectam?',['A Força','A Matrix','O Multiverso','O Éter'],'Os Jedi, como Yoda, se conectam com a Força.','https://www.starwars.com/databank/the-force'],
 ['geek-4','Geek',1,'Qual destas franquias tem o personagem Darth Vader?',['Star Wars','Star Trek','Pokémon','Minecraft'],'Darth Vader é um personagem da saga Star Wars.','https://www.starwars.com/databank/darth-vader'],
 ['body-1','Corpo humano',1,'Qual vaso leva o sangue para fora do coração?',['Artéria','Veia','Ureter','Traqueia'],'Artérias conduzem o sangue para fora do coração.',vessels],
 ['body-2','Corpo humano',1,'Qual vaso traz o sangue de volta ao coração?',['Veia','Artéria','Brônquio','Ureter'],'Veias conduzem o sangue de volta ao coração.',vessels],
 ['body-3','Corpo humano',2,'Onde ocorre a principal troca de substâncias entre o sangue e os tecidos?',['Nos capilares','Na traqueia','No esôfago','Nos tendões'],'Os capilares têm paredes finas que permitem essas trocas.',vessels],
 ['body-4','Corpo humano',2,'Quantas câmaras tem o coração humano?',['Quatro','Duas','Três','Cinco'],'São dois átrios e dois ventrículos.',heart],
 ['brhistory-1','História',1,'Em que ano foi proclamada a Independência do Brasil?',['1822','1889','1500','1988'],'A Independência foi proclamada em 7 de setembro de 1822.',constitution],
 ['brhistory-2','História',2,'Qual foi a primeira Constituição do Brasil?',['A de 1824','A de 1889','A de 1988','A de 1500'],'A Constituição de 1824 foi a primeira do país, durante o Império.',constitution],
 ['brhistory-3','História',2,'A Constituição brasileira de 1824 pertence a qual período?',['Império','República Velha','Estado Novo','Período colonial'],'A Constituição de 1824 foi a Constituição do Império.',constitution],
 ['brhistory-4','História',1,'A atual Constituição brasileira foi promulgada em qual ano?',['1988','1824','1964','2000'],'A Constituição de 1988 inaugurou a ordem constitucional atual.',constitution],
 ['art-1','Arte',1,'Quem pintou a Mona Lisa?',['Leonardo da Vinci','Claude Monet','Pablo Picasso','Vincent van Gogh'],'A Mona Lisa é uma pintura de Leonardo da Vinci.',louvre],
 ['art-2','Arte',1,'Em qual museu está a Mona Lisa?',['Louvre','Prado','MASP','Museu do Amanhã'],'A obra é exposta na Salle des États do Louvre, em Paris.',louvre],
 ['art-3','Arte',2,'Qual destas obras é um retrato?',['Mona Lisa','Um mapa rodoviário','Uma tabela periódica','Uma planta de metrô'],'A Mona Lisa representa Lisa Gherardini e é um retrato.',louvre],
 ['art-4','Arte',2,'Em que ano a Mona Lisa foi roubada do Louvre?',['1911','1822','1969','2001'],'O roubo aconteceu em 21 de agosto de 1911.',louvre],
 ['sport-1','Esportes',1,'Quantos anéis formam o símbolo olímpico?',['Cinco','Quatro','Seis','Sete'],'O símbolo olímpico tem cinco anéis entrelaçados.',olympics],
 ['sport-2','Esportes',1,'Qual destas cores faz parte dos anéis olímpicos?',['Verde','Roxo','Rosa','Laranja'],'As cores dos anéis são azul, amarelo, preto, verde e vermelho.',olympics],
 ['sport-3','Esportes',2,'Quem criou o símbolo dos anéis olímpicos?',['Pierre de Coubertin','Leonardo da Vinci','Albert Einstein','Isaac Newton'],'Pierre de Coubertin desenhou o símbolo em 1913.',olympics],
 ['sport-4','Esportes',2,'Os anéis olímpicos aparecem de qual forma no símbolo?',['Entrelaçados','Empilhados sem se tocar','Em uma espiral','Dentro de um quadrado'],'Os cinco anéis aparecem entrelaçados no símbolo olímpico.',olympics]
];
export const topicQuestions=facts.map(([id,category,difficulty,prompt,options,explanation,source])=>({id,category,difficulty,prompt,options,correct:0,explanation,source,sourceName:id.startsWith('body')?'OpenStax · Rice University':id.startsWith('brhistory')?'STF':id.startsWith('art')?'Museu do Louvre':id.startsWith('cinema')?'Academia do Oscar':id.startsWith('geek')?(source.includes('nintendo')?'Nintendo':source.includes('minecraft')?'Mojang · Minecraft':'Star Wars · Lucasfilm'):'Comitê Olímpico Internacional'}));
const geography=countries.map((c,i)=>({id:`daily-world-${c.id}`,category:'Geografia',difficulty:1,prompt:`Em qual país fica ${c.capital}?`,options:[c.country,...countries.filter(x=>x.country!==c.country).slice(i%5,i%5+3).map(x=>x.country)],correct:0,explanation:`${c.capital} é a capital de ${c.country}.`,source:c.source,sourceName:'Wikidata · CC0'}));
const dailyBank=[...topicQuestions,...editorialQuestions,...geography];
export function mixDailyTopics(items,level,shuffle){
 const pool=[...dailyBank,...corpusCandidates(level)],themes=['biology','history','art','sport','science','geography','music','cinema','geek'],used=new Set(),chosen=[];
 // Twenty-eight facts; two short practical challenges remain optional variety.
 for(let i=0;i<28;i++){
  const theme=themes[(i+level)%themes.length],candidates=pool.filter(q=>themeFor(q).id===theme&&!used.has(q.prompt));
  const q=candidates[(level*7+i)%candidates.length];if(!q)continue;used.add(q.prompt);chosen.push(q);
 }
 const order=shuffle(chosen);let at=0;
 return items.map((q,i)=>{if(i===9||i===24||at>=order.length)return q;const fact=order[at++],right=fact.options[fact.correct],options=shuffle(fact.options);return {...fact,id:`personal-fact-${level}-${fact.id}`,theme:themeFor(fact).id,phase:q.phase,phaseIndex:q.phaseIndex,options,correct:options.indexOf(right)}});
}
