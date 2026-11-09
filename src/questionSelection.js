// Editorial policy shared by both modes. History belongs to the local profile.
export const normalizeQuestion=text=>String(text).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function factKey(q){
 if(q.factKey)return q.factKey;
 const id=q.id||'';
 if(/^(capital-|country-|daily-world-)/.test(id))return 'capital:'+id.replace(/^(capital-|country-|daily-world-)/,'');
 return normalizeQuestion(q.prompt);
}
export function subjectKey(q){
 if(q.subjectKey)return q.subjectKey;
 const id=q.id||'';
 if(/^art-accessible-night-/.test(id))return 'art:night';
 if(/^art-accessible-memory-/.test(id))return 'art:memory';
 if(/^art-[1-3]$/.test(id))return 'art:mona-lisa';
 if(/^cinema-[1-3]$/.test(id))return 'cinema:return-king';
 if(/^cinema-[45]$/.test(id))return 'cinema:titanic';
 return factKey(q);
}
export function validQuestionHistory(h){return Array.isArray(h)&&h.length<=600&&h.every(x=>x&&typeof x.key==='string'&&x.key.length<=600&&typeof x.subject==='string'&&x.subject.length<=600)}
export function rememberQuestion(history,q){const h=validQuestionHistory(history)?history:[];const entry={key:factKey(q),subject:subjectKey(q)};return [...h.filter(x=>x.key!==entry.key),entry].slice(-600)}
export function selectQuestions(pool,count,{history=[],used=[],tier=2,golden=false,themeFor,shuffle}){
 const unique=new Map();
 for(const q of pool){if(q.difficulty<=tier&&q.options.length===4&&new Set(q.options).size===4&&q.options[q.correct]&&!unique.has(factKey(q)))unique.set(factKey(q),q)}
 const candidates=shuffle([...unique.values()]),chosen=[],keys=new Set(used.map(factKey)),subjects=new Set(used.map(subjectKey)),themes=new Map();
 for(const q of used){const t=themeFor(q).id;themes.set(t,(themes.get(t)||0)+1)}
 const h=validQuestionHistory(history)?history:[],last=new Map(h.map((x,i)=>[x.key,i+1])),lastSubject=new Map(h.map((x,i)=>[x.subject,i+1]));
 const metadata=new Map(candidates.map(q=>[q,{key:factKey(q),subject:subjectKey(q),theme:themeFor(q).id}]));
 const recent=new Map(candidates.map(q=>[q,Math.max(last.get(factKey(q))||0,lastSubject.get(subjectKey(q))||0)]));
 // Prefer unseen facts; then the least recently encountered. Never exceed the tier.
 while(chosen.length<count){
  const available=candidates.filter(q=>!keys.has(metadata.get(q).key)&&!subjects.has(metadata.get(q).subject));
  if(!available.length)break;
  available.sort((a,b)=>{
   const fresh=q=>recent.get(q)===0?0:1;
   const crowded=q=>(themes.get(metadata.get(q).theme)||0)>=Math.ceil((count+used.length)/(golden?9:7))?1:0;
   const cooling=q=>recent.get(q)>Math.max(0,h.length-60)?1:0;
   return cooling(a)-cooling(b)||crowded(a)-crowded(b)||fresh(a)-fresh(b)||recent.get(a)-recent.get(b)||(themes.get(metadata.get(a).theme)||0)-(themes.get(metadata.get(b).theme)||0);
  });
  const q=available[0];chosen.push(q);keys.add(factKey(q));subjects.add(subjectKey(q));const t=themeFor(q).id;themes.set(t,(themes.get(t)||0)+1);
 }
 return chosen;
}
export function tierForLevel(level){return level<=10?1:level<=35?2:3}
