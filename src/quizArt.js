// Short original questions in Portuguese, checked against the linked primary sources.
const night='https://www.moma.org/collection/works/79802';
const dali='https://www.moma.org/collection/works/79018';
const munch='https://www.munch.no/en/the-scream';
const tarsila='https://www.gov.br/funarte/pt-br/assuntos/noticias/todas-noticias/voce-conhece-o-abaporu/';
const machado='https://www.academia.org.br/academicos/machado-de-assis/bibliografia';
const alencar='https://www.academia.org.br/academicos/jose-de-alencar/biografia';
const rows=[
 ['night-painter','Quem pintou “A Noite Estrelada”?',['Vincent van Gogh','Salvador Dalí','Tarsila do Amaral','Leonardo da Vinci'],'Van Gogh pintou A Noite Estrelada, com seu céu noturno em movimento.',night,'MoMA'],
 ['night-scene','Em “A Noite Estrelada”, de Van Gogh, qual cenário aparece?',['Um céu noturno sobre uma vila','Uma corrida de cavalos','Um mercado à beira-mar','Uma sala de aula'],'A pintura mostra um céu noturno e uma vila abaixo dele.',night,'MoMA'],
 ['memory-painter','Quem pintou os relógios moles de “A Persistência da Memória”?',['Salvador Dalí','Vincent van Gogh','Edvard Munch','Tarsila do Amaral'],'Os relógios moles aparecem na pintura A Persistência da Memória, de Dalí.',dali,'MoMA'],
 ['memory-objects','Que objetos parecem derreter na pintura “A Persistência da Memória”?',['Relógios','Guarda-chuvas','Instrumentos musicais','Livros'],'Dalí representou relógios amolecidos nessa pintura surrealista.',dali,'MoMA'],
 ['scream-painter','Qual artista criou a obra “O Grito”?',['Edvard Munch','Leonardo da Vinci','Salvador Dalí','Tarsila do Amaral'],'O Grito é uma obra de Edvard Munch, criada em diferentes versões.',munch,'Museu MUNCH'],
 ['abaporu-painter','Qual artista brasileira pintou “Abaporu”?',['Tarsila do Amaral','Anita Malfatti','Lygia Clark','Beatriz Milhazes'],'Tarsila do Amaral pintou Abaporu, uma obra marcante da arte brasileira.',tarsila,'Funarte'],
 ['casmurro-author','Quem escreveu “Dom Casmurro”?',['Machado de Assis','José de Alencar','Carlos Drummond de Andrade','Cecília Meireles'],'Dom Casmurro é um romance de Machado de Assis.',machado,'Academia Brasileira de Letras'],
 ['bras-author','“Memórias Póstumas de Brás Cubas” é um romance de qual escritor?',['Machado de Assis','José de Alencar','Carlos Drummond de Andrade','Cecília Meireles'],'Machado de Assis escreveu Memórias Póstumas de Brás Cubas.',machado,'Academia Brasileira de Letras'],
 ['iracema-author','Quem escreveu o romance “Iracema”?',['José de Alencar','Machado de Assis','Cecília Meireles','Carlos Drummond de Andrade'],'Iracema é um romance de José de Alencar.',alencar,'Academia Brasileira de Letras'],
 ['guarani-author','“O Guarani” é um romance de qual autor brasileiro?',['José de Alencar','Machado de Assis','Carlos Drummond de Andrade','Cecília Meireles'],'José de Alencar escreveu O Guarani.',alencar,'Academia Brasileira de Letras']
];
export const accessibleArtQuestions=rows.map(([id,prompt,options,explanation,source,sourceName])=>({id:`art-accessible-${id}`,theme:'art',category:'Arte',difficulty:1,prompt,options,correct:0,explanation,source,sourceName}));
