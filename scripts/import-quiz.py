"""Import CC0 Wikidata facts with Portuguese labels and references. No runtime API."""
import urllib.request, urllib.parse, json, time, pathlib, re, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT/'.qa/wikidata'; CACHE.mkdir(parents=True,exist_ok=True)
GROUPS=[
 ('cinema-director','cinema','Quem dirigiu o filme “{s}”?','Q11424','P57',1800),
 ('cinema-language','cinema','Qual é o idioma original do filme “{s}”?','Q11424','P364',1200),
 ('books-author','art','Quem escreveu o livro “{s}”?','Q8261','P50',1600),
 ('painting-creator','art','Quem criou a pintura “{s}”?','Q3305213','P170',1200),
 ('album-artist','music','Qual artista lançou o álbum “{s}”?','Q208569','P175',1800),
 ('game-developer','geek','Quem desenvolveu o jogo “{s}”?','Q7889','P178',1200),
 ('game-publisher','geek','Qual empresa publicou o jogo “{s}”?','Q7889','P123',800),
 ('city-country','geography','Em qual país fica a cidade de {s}?','Q515','P17',1500),
 ('people-birthplace','history','Em que cidade nasceu {s}?','Q5','P19',1800),
 ('country-capital','geography','Qual é a capital de {s}?','Q6256','P36',250),
 ('element-symbol','science','Qual é o símbolo químico de {s}?','Q11344','P246',120),
]
HEADERS={'User-Agent':'SphereTap/1.3 (educational offline quiz; github.com/valdo4-20/sphere-tap)','Accept':'application/sparql-results+json'}
outputs=[]
for ident,theme,prompt,kind,prop,limit in GROUPS:
 path=CACHE/(ident+'.json')
 q="""SELECT DISTINCT ?item ?itemLabel ?answer ?answerLabel ?reference WHERE {
 { SELECT DISTINCT ?item ?itemLabel ?answer WHERE {
 ?item wdt:P31 wd:%s; wdt:%s ?answer.
 ?item rdfs:label ?itemLabel FILTER(LANG(?itemLabel)="pt")
 } LIMIT %d }
 FILTER NOT EXISTS { ?item wdt:%s ?other FILTER(?other != ?answer) }
 ?item p:%s ?claim. ?claim ps:%s ?answer; prov:wasDerivedFrom ?ref.
 ?ref (pr:P854|pr:P248) ?reference.
 %s
 }"""%(kind,prop,limit*2,prop,prop,prop,('BIND(STR(?answer) AS ?answerLabel)' if prop=='P246' else 'SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,mul,en". }'))
 if path.exists(): rows=json.loads(path.read_text())
 elif '--cache-only' in sys.argv:continue
 else:
  try:
   url='https://query.wikidata.org/sparql?'+urllib.parse.urlencode({'query':q,'format':'json'})
   r=subprocess.run(['curl','--max-time','45','--fail','--silent','--show-error','--header','Accept: application/sparql-results+json','--user-agent',HEADERS['User-Agent'],url],capture_output=True,text=True,timeout=50,check=True)
   rows=json.loads(r.stdout)['results']['bindings']
   path.write_text(json.dumps(rows,ensure_ascii=False))
  except Exception as e: print(ident,'FAILED',type(e).__name__,flush=True);continue
  time.sleep(.5)
 seen=set();items=[]
 for r in rows:
  label=r['itemLabel']['value'].strip();answer=r['answerLabel']['value'].strip();qid=r['item']['value'].rsplit('/',1)[-1];ref=r['reference']['value']
  if qid in seen or not (2<=len(label)<=110 and 1<=len(answer)<=100) or label==answer or any(x in label for x in ['Wikimedia','desambiguação']):continue
  seen.add(qid);items.append([label,answer,qid,ref])
  if len(items)>=limit:break
 outputs.append({'id':ident,'theme':theme,'property':prop,'prompt':prompt,'rows':items,'query':q})
 print(ident,len(items),flush=True)
# Never invent rows to hit the target. Every retained row has a referenced statement.
seen_prompts=set();total=0
for g in outputs:
 unique=[]
 for row in g['rows']:
  prompt=g['prompt'].replace('{s}',row[0])
  if prompt in seen_prompts:continue
  seen_prompts.add(prompt);unique.append(row);total+=1
 g['rows']=unique
 if total>=10000:break
# Interleave groups to avoid letting a large subject dominate the final bank.
kept=[];count=0
for g in outputs:g['kept']=[]
for i in range(max([len(g['rows']) for g in outputs] or [0])):
 for g in outputs:
  if i<len(g['rows']) and count<10000:g['kept'].append(g['rows'][i]);count+=1
result={'license':'CC0-1.0','source':'https://www.wikidata.org/','retrievedAt':time.strftime('%Y-%m-%d'),'count':count,'groups':[{k:v for k,v in g.items() if k not in ['rows','kept']}|{'rows':g['kept']} for g in outputs if g['kept']]}
out=ROOT/'src/data/question-facts.json';tmp=out.with_suffix('.tmp');tmp.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')));tmp.replace(out)
print('TOTAL',count,flush=True)
