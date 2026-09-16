# Fonte de dados do site

## Resultado da auditoria

Foram encontrados 51 HTMLs: 39 na raiz e 12 em `turmas/`. O conteúdo que deve deixar de ser mantido diretamente no HTML é:

| Área / páginas | Dados variáveis |
| --- | --- |
| `material.html`, `infantil.html`, `fundamental1.html`, `fundamental2.html`, `material-desatualizado.html` | faixas etárias, preços, parcelamento, frete, edições, disponibilidade/estoque, lista de materiais e links externos |
| `matriculas.html`, `matricula-individual.html`, `matricula-familia.html`, `pix.html`, `formulario.html` | vigência (hoje, 2026), regras e textos dos planos, chave PIX, QR Code, prazo de confirmação e opções do formulário |
| `tutoria.html`, `curso-pais.html`, `depoimentos.html` | responsável, valor, recorrência, dia/horário, ano, plataforma, investimento, autores, depoimentos e atribuições |
| `aulas-online.html` e `horarios-{1,3,5,7,9}-ano.html` | séries, faixas etárias, grades, dia, hora, matéria, duração, destino do link e situação “sem aula” |
| `materia-*.html` | nome, carga semanal, preço, destinos de professor/áudio/vídeo/material/turmas. Há hoje uma fonte parcial em `assets/js/subject-page.js`. |
| `turmas/turmas-*.html` | título da oferta e, para cada turma: público/faixa etária, nível, hora, professor, valor, duração e dias. As 12 páginas repetem essencialmente a mesma tabela de 15 linhas. |
| `professor-*.html` e `audio-professor-*.html` | nome, tratamento, foto, biografia, versículo, URL de áudio e texto de apresentação. Idades, tempo de experiência e dados familiares também envelhecem. |
| `videos*.html`, `audio-*.html`, `quem-somos.html`, `confessionalidade.html`, `quero-me-candidatar-a-professor.html` | URLs de mídia, pessoas, textos institucionais, períodos, valores, remuneração, mínimo de alunos, campanhas e exemplos numéricos |

`index.html`, `inicio.html`, `menu.html` e as estruturas visuais das páginas têm, em geral, conteúdo estável. Podem continuar estáticos; apenas textos promocionais, links e mídia que se pretendem editar com frequência precisam entrar no JSON.

Também há links locais sem arquivo correspondente: `nosso-chamado.html`, `como-functionamos.html` e `conheca-os-missionarios-que-alcancamos.html` são referidos por `quem-somos.html`; os perfis de professores referem `turmas-ingles.html`, enquanto a página existente está em `turmas/turmas-ingles.html`. Ao centralizar URLs em `rota`/`links`, essa validação deve rodar no build.

## Modelo recomendado

Usar uma única fonte publicada em `assets/data/site-data.v1.json`, baseada em IDs estáveis e referências entre entidades. O arquivo de exemplo está em `assets/data/site-data.example.json`.

Princípios:

- Valores monetários são inteiros em centavos (`precoCentavos: 10000`), nunca `"R$ 100,00"`. A interface formata com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Horas usam `HH:MM`; dias usam ISO-8601 (`1` = segunda, `4` = quinta). A interface transforma isso em “Seg, Ter, Qua e Qui”. Assim a ordenação, filtros e validações não dependem do texto exibido.
- Datas usam ISO (`2026-01-01`) e ano é número. Duração usa minutos. Faixa etária é numérica, com `idadeMin`/`idadeMax`; texto livre só quando for realmente necessário.
- Um `id` nunca deve mudar; nome, preço, horário e página podem mudar. Relacionamentos usam IDs (`professorId`, `materiaId`, `ofertaId`) e não nomes visíveis.
- `ativo: false` preserva histórico sem exibir uma turma/oferta. `ordem` permite controlar a apresentação sem depender da ordem do arquivo.
- Conteúdo longo fica em arrays de parágrafos. Isto evita HTML dentro do JSON e reduz riscos de injeção. O renderizador deve usar `textContent`, não `innerHTML`.

As entidades principais são:

```text
configuracao ──> pagamento, vigencia
materias ──────> professores, ofertas
professores ───> midias (foto e áudio)
ofertas ───────> turmas
series ────────> grade (encontros que apontam a matérias/ofertas)
materiais ─────> niveis de ensino e links
paginas ───────> textos institucionais, tutorias, cursos e depoimentos
```

Não é recomendável criar um campo genérico como `pages: { "qualquer-html": "<texto>" }` para tudo. Ele parece simples no começo, mas perde validação, reaproveitamento e capacidade de filtrar. A estrutura deve descrever o domínio; o HTML define apenas a apresentação.

## Como as páginas devem consumir os dados

## Páginas-modelo e rotas

Em vez de um HTML por registro, usar uma página-modelo por tipo de conteúdo. O identificador vem na *query string* da URL, que é compartilhável, recarregável e funciona com os botões do navegador:

| Conteúdo | Página-modelo | Exemplos de URL |
| --- | --- | --- |
| Oferta/lista de turmas | `turma.html` | `turma.html?oferta=ingles`, `turma.html?oferta=aprendendo-palavra` |
| Perfil de professor | `professor.html` | `professor.html?professor=karine-guillem`, `professor.html?professor=luisa-dresch` |
| Áudio de professor | `audio-professor.html` | `audio-professor.html?professor=karine-guillem` |
| Página de matéria | `materia.html` | `materia.html?materia=matematica` |
| Grade por série | `horarios.html` | `horarios.html?serie=3-ano` |
| Nível de material | `material-nivel.html` | `material-nivel.html?material=infantil` |

O valor do parâmetro é exatamente o `id` do JSON, nunca o nome exibido. O carregador usa `new URLSearchParams(location.search)`, procura a entidade e renderiza-a. Se faltar ou não existir, mostra uma tela 404 amigável, sem tentar adivinhar pelo texto. A URL padrão de uma página-modelo pode redirecionar para uma lista, por exemplo `turma.html` para `aulas-online.html`.

Não usar `#ingles` como identificador principal: hashes não são enviados ao servidor, dificultam analytics, SEO e o fallback de páginas estáticas. Também não usar `turma.html?nome=Inglês`; nomes contêm acentos, podem mudar e não são um identificador seguro.

Os campos `rota` do JSON já exemplificam esse formato. De preferência, o JavaScript deve derivá-los do ID (`turma.html?oferta=${id}`), em vez de armazená-los repetidamente. Assim não há 12 URLs manuais para atualizar, nem o risco de uma página apontar para outra oferta. URLs antigas, como `turmas/turmas-ingles.html`, podem permanecer como redirecionamentos curtos para a nova rota durante a transição.

1. Cada página-modelo mantém HTML semântico mínimo (títulos, regiões e uma área de carregamento), identificado por `data-page`.
2. Um único `assets/js/data-loader.js`, carregado com `defer`, busca a fonte, valida sua versão e renderiza só o trecho da página atual.
3. A tabela de turmas é criada a partir de `turmas` filtradas por `ofertaId`; uma alteração de preço/horário/docente então ocorre uma única vez.
4. A grade é criada a partir de `series[].encontros`; não deve inferir links pelo texto da matéria, como ocorre hoje em `schedule-subject-links.js`.

Para preservar a navegação rápida, não fragmentar inicialmente em muitos JSONs. O catálogo atual é pequeno e um único arquivo minificado, gzip/brotli, será muito menor que imagens e evita várias requisições. Publique-o com nome versionado (`site-data.v1.json`, depois `site-data.v2.json`) e cache longo/imutável. Cada HTML pode antecipar a única requisição:

```html
<link rel="preload" href="assets/data/site-data.v1.json" as="fetch" crossorigin>
<script src="assets/js/data-loader.js" defer></script>
```

Para páginas dentro de `turmas/`, o caminho é `../assets/...`. Em produção o site precisa ser servido por HTTP(S); `fetch()` costuma falhar ao abrir HTML diretamente por `file://`. Durante a migração, pode-se manter os valores atuais no HTML como fallback: a página aparece imediatamente e o JavaScript apenas atualiza os campos quando o JSON chegar.

Só se o catálogo crescer bastante (por exemplo, muitas fotos, biografias ou centenas de turmas), separar em `catalogo.vN.json` (necessário para listas/grades) e `professores.vN.json` (carregado só na bio). Não duplicar professores ou preços entre arquivos.

## Regras de validação antes de publicar

- Todo `professorId`, `materiaId` e `ofertaId` referenciado existe e está ativo.
- `horaInicio` corresponde a `^([01][0-9]|2[0-3]):[0-5][0-9]$`; dias não são vazios; `duracaoMinutos > 0`.
- Preços são inteiros não negativos; ausência de preço é `null` com `rotuloPreco`, por exemplo “Valor sob consulta”.
- Uma turma não pode repetir a mesma oferta, dia e hora sem uma justificativa explícita.
- URLs de mídia/links externos começam por `https://`; caminhos internos são relativos e testados no build.
- `schemaVersion` é incrementado somente quando a forma do arquivo mudar; alterações de conteúdo atualizam `atualizadoEm`.

## Migração em ordem segura

1. Migrar `materias`, `professores`, `ofertas` e `turmas`: são os dados mais repetidos e sujeitos a alterações frequentes.
2. Migrar `series` e renderizar as cinco grades; remover a lógica de link baseada em rótulos visíveis.
3. Migrar preços/regras de materiais, matrícula, PIX, tutoria e curso.
4. Por último, migrar textos institucionais, depoimentos e vídeos, caso se deseje editá-los fora do HTML.

Cada etapa deve comparar visualmente a página renderizada com a versão atual e testar o caso de JSON indisponível. Não colocar chave secreta, token de pagamento, dados de alunos ou credenciais nesse arquivo público.
