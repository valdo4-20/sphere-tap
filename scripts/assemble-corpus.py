"""Assemble factual metadata snapshots. See docs/QUESTION_SOURCES.md for licenses.
Inputs in .qa/catalogs: GeoNames cities15000, Gutenberg pg_catalog, PokéAPI CSV.
Wikidata input is the separately referenced output of import-quiz.py.
This script never downloads or copies prose from books or ready-made quiz questions.
"""
import pathlib,json,collections
root=pathlib.Path(__file__).resolve().parents[1];cache=root/'.qa/catalogs'
read=lambda name:json.loads((cache/(name+'.json')).read_text())
path=root/'src/data/question-facts.json';old=json.loads(path.read_text())
groups=[g for g in old['groups'] if g['id']=='cinema-director']
assert sum(len(g['rows']) for g in groups)==1550
for g in groups:g.update(sourceName='Wikidata · referência na ficha',license='CC0-1.0')
def add(id,theme,prompt,rows,source,license):
 assert len({r[0].casefold() for r in rows})==len(rows)
 groups.append(dict(id=id,theme=theme,prompt=prompt,rows=rows,sourceName=source,license=license))
add('books-author','art','Quem assina a obra “{s}”?',read('book-questions')[:2900],'Project Gutenberg · catálogo','Bibliographic facts; original question templates')
add('cities-country','geography','Em qual país fica a cidade de {s}?',read('geo-questions')[:3500],'GeoNames','CC-BY-4.0')
names={int(p['id']):p['identifier'].replace('-',' ').title() for p in read('pokemon') if p['is_default']=='1'}
types=collections.defaultdict(list)
for t in read('pokemon_types'):types[int(t['pokemon_id'])].append(int(t['type_id']))
labels=['','Normal','Lutador','Voador','Venenoso','Terrestre','Pedra','Inseto','Fantasma','Aço','Fogo','Água','Planta','Elétrico','Psíquico','Gelo','Dragão','Sombrio','Fada']
species=read('pokemon_species');rows=[];gens=[]
for s in species:
 id=int(s['id']);name=names[id]
 rows.append([name,' / '.join(labels[t] for t in sorted(types[id])),str(id),f'https://pokeapi.co/api/v2/pokemon/{id}/'])
 gens.append([name,f"{s['generation_id']}ª geração",str(id),f'https://pokeapi.co/api/v2/pokemon-species/{id}/'])
add('pokemon-types','geek','Qual é a combinação de tipos de {s} na forma padrão?',rows,'PokéAPI','BSD-3-Clause')
add('pokemon-generation','geek','Em qual geração Pokémon {s} estreou?',gens,'PokéAPI','BSD-3-Clause')
count=sum(len(g['rows']) for g in groups);assert count==10000,count
path.write_text(json.dumps(dict(count=count,retrievedAt='2026-11-07',license='See license on each group and docs/QUESTION_SOURCES.md',groups=groups),ensure_ascii=False,separators=(',',':'))+'\n')
print({g['id']:len(g['rows']) for g in groups})
