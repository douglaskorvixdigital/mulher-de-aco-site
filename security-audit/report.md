# Relatório de auditoria de supply chain — `mulher-de-aco-site`

| Campo | Valor |
|---|---|
| Commit auditado | `7a62961913cc` (branch `main`) |
| Data da coleta | 2026-11-22 05:31 UTC |
| Manifestos | `package.json`, `package-lock.json` (lockfileVersion 3) |
| Dependências diretas | 11 (3 de produção, 8 de desenvolvimento) |
| Entradas no lockfile | 432 (414 nomes únicos) |
| Findings | CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 3 · INFO 8 |
| Dados estruturados | [`findings.json`](findings.json) |

## 1. Resumo executivo

Nenhuma vulnerabilidade conhecida (CVE/GHSA) afeta as versões travadas no lockfile. A conclusão vale para as 11 dependências diretas e para os 416 pacotes transitivos verificados no registro. Duas fontes independentes chegaram ao mesmo resultado: OSV, pelo coletor da Trail of Bits, e `npm audit`.

A integridade da árvore está íntegra:
- as 432 entradas vêm de `registry.npmjs.org` com hash sha512;
- os 358 pacotes instalados têm assinatura de registro verificada;
- nenhum pacote executa script durante a instalação.

O que exige ação são três riscos LOW, nenhum dos quais chega ao site publicado:

1. **SCA-001:** `eslint@9.39.5` é uma versão marcada como *deprecated* pelo registro ("no longer supported").
2. **SCA-002:** os pacotes `@types/*` são publicados por uma única conta humana e não têm provenance.
3. **SCA-003:** a ferramenta de design Impeccable roda um binário baixado em todo evento de edição, por meio de hooks em `.claude/settings.local.json`.

O código que chega aos visitantes do site sai de 17 dependências de produção. A maior parte da superfície de risco está nas ferramentas de build (378 dependências de desenvolvimento).

Parte dos critérios não pôde ser medida: as quatro checagens do OpenSSF Scorecard e 6 de 11 avaliações de concentração de publicadores (seção 7). Para esses critérios, a ausência de findings indica falta de medição, não aprovação.

## 2. Metodologia

1. Instalação da skill `supply-chain-risk-auditor` a partir de `trailofbits/skills` em `.claude/skills/supply-chain-risk-auditor/`. Os scripts foram revisados antes do uso: usam só a biblioteca padrão do Python e fazem apenas requisições HTTP de leitura (OSV, npm registry, deps.dev, GitHub API, OpenSSF Scorecard).
2. Execução do coletor e do renderizador oficiais, conforme o `SKILL.md`:
   - `uv run --no-project collect.py . --json findings.json`
   - `uv run --no-project render.py findings.json --out report.md`

   A saída bruta está em `raw/trailofbits-findings.json` e `raw/trailofbits-report.md`.
3. Verificações complementares, sem alterar o projeto:
   - `npm audit --json` (saída em `raw/npm-audit.json`);
   - `npm audit signatures` (saída em `raw/npm-audit-signatures.txt`);
   - `npm ls --all` para validar a consistência entre a árvore instalada e o lockfile (exit 0);
   - `npm outdated` e `npm view` para versões, deprecação e data de publicação;
   - análise do `package-lock.json` via Node: origem (`resolved`), `integrity`, algoritmo de hash, `hasInstallScript` e campo `deprecated`;
   - varredura de `node_modules/**/package.json` atrás de `preinstall`, `install`, `postinstall` e `prepare`;
   - revisão manual dos 414 nomes resolvidos em busca de typosquatting;
   - inspeção dos hooks e ferramentas de terceiros que rodam no ambiente de desenvolvimento.
4. Restrições respeitadas: nenhum código-fonte foi alterado, nenhuma dependência foi atualizada ou removida, nenhum script de pacote foi executado e nada foi publicado.

## 3. Ferramentas e versões

| Ferramenta | Versão |
|---|---|
| Trail of Bits `supply-chain-risk-auditor` (scripts) | 0.1.0 |
| Python | 3.13.17 |
| uv | 0.13.9 |
| Node.js | 26.13.1 |
| npm | 11.20.0 |
| GitHub CLI | 2.105.0 (não autenticado) |

## 4. Análise das dependências

### 4.1 Dependências diretas

| Pacote | Versão travada | Tipo | Advisories | Downloads/semana | Observações |
|---|---|---|---|---|---|
| `next` | 16.4.6 | prod | nenhuma | 98.723.467 | publica via CI com provenance; publicado em 2026-11-09 |
| `react` | 19.3.0 | prod | nenhuma | — | patch 19.3.1 disponível |
| `react-dom` | 19.3.0 | prod | nenhuma | — | patch 19.3.1 disponível |
| `@tailwindcss/turbopack` | 4.3.3 | dev | nenhuma | 3.058.665 | sem política de segurança; patch 4.3.5 disponível |
| `tailwindcss` | 4.3.3 | dev | nenhuma | — | sem política de segurança; patch 4.3.5 disponível |
| `eslint` | 9.39.5 | dev | nenhuma | 216.652.348 | **versão deprecated** (SCA-001); sem provenance |
| `eslint-config-next` | 16.4.6 | dev | nenhuma | 50.435.234 | — |
| `typescript` | 5.9.3 | dev | nenhuma | — | sem provenance; 7.0.2 disponível (major) |
| `@types/node` | 20.19.43 | dev | nenhuma | 668.203.298 | publicador único (SCA-002); runtime local é Node 26 |
| `@types/react` | 19.3.0 | dev | nenhuma | 248.043.232 | publicador único (SCA-002) |
| `@types/react-dom` | 19.3.0 | dev | nenhuma | 210.611.836 | publicador único (SCA-002) |

Os números de download foram copiados sem alteração da saída do coletor. A célula "—" indica que o relatório renderizado não listou o número para aquele pacote; o dado está em `raw/trailofbits-findings.json`.

Os critérios do coletor para as diretas tiveram esta cobertura:
- advisories, deprecated/yanked, repositório arquivado, atividade de manutenção e script de instalação: avaliados para 11 de 11, nenhum sinalizado;
- concentração de publicadores: avaliada para 5 de 11, com 3 sinalizados.

### 4.2 Árvore transitiva

- **Composição:** 432 entradas no lockfile. Pelo `npm audit` são 17 de produção, 378 de desenvolvimento e 82 opcionais (binários por plataforma de `sharp`, `@next/swc`, `lightningcss`, `@tailwindcss/oxide` e `unrs-resolver`).
- **Advisories:** nenhuma advisory nos 416 pacotes transitivos verificados no registro, nas versões travadas.
- **Origem e integridade:** 0 URLs fora do registro npm, 0 entradas sem `integrity`, 0 hashes sha1. O projeto não tem `.npmrc`, então usa o registro padrão.
- **Assinaturas:** 358 pacotes instalados com assinatura de registro verificada e 88 com attestations verificadas. As 74 entradas restantes são binários opcionais de outros sistemas operacionais, que não são instalados no Windows.
- **Scripts de instalação:**
  - nenhuma entrada com `hasInstallScript` e nenhum `preinstall`, `install` ou `postinstall` em `node_modules`;
  - 21 cópias instaladas declaram só `prepare` (por exemplo `acorn`, `minimatch`, `lightningcss` e `keyv`), e o npm não executa esse script para tarballs vindos do registro.
- **Consistência:** `npm ls --all` terminou sem erros, então a árvore instalada corresponde ao lockfile.

## 5. Vulnerabilidades

Nenhuma CVE ou GHSA afeta as versões travadas. As duas fontes concordam:

| Fonte | Escopo | Resultado |
|---|---|---|
| OSV (coletor Trail of Bits) | 11 diretas e 416 transitivas | 0 advisories |
| `npm audit` (GitHub Advisory Database) | 432 dependências | info 0, low 0, moderate 0, high 0, critical 0 |

## 6. Riscos e evidências

### SCA-001 — LOW — `eslint@9.39.5` deprecated
- **Evidência:**
  - o `package-lock.json` traz `"deprecated": "This version is no longer supported..."`;
  - `npm view eslint@9.39.5 deprecated` confirma a mensagem;
  - as dist-tags mostram `maintenance = 9.39.5` e `latest = 10.15.0`.
- **Divergência com o coletor:** o coletor registrou "not deprecated", porque avalia a deprecação do pacote inteiro e não da versão. A divergência foi resolvida pelo dado direto do registro.
- **Impacto:** afeta só o build. Correções de segurança futuras para a linha 9.x não estão garantidas.
- **Caminho:** `mulher-de-aco-site` → `eslint@9.39.5` (devDependency).
- **Recomendação:** migrar para eslint 10.x quando o `eslint-config-next` declarar suporte. É uma mudança de versão major e exige revisar a configuração de lint.

### SCA-002 — LOW — `@types/node`, `@types/react` e `@types/react-dom` com publicador único
- **Evidência:**
  - coletor: "single human publisher (types) of 1 listed" para os três pacotes, sem provenance;
  - as assinaturas de registro foram verificadas.
- **Impacto:** afeta só o build. Se a conta publicadora for comprometida, o código malicioso chega à próxima instalação que não esteja travada pelo lockfile. Esses pacotes não colocam código no site publicado.
- **Caminho:** `mulher-de-aco-site` → `@types/*` (devDependencies).
- **Recomendação:** manter o `package-lock.json` versionado e instalar com `npm ci`. Nenhuma substituição é necessária.

### SCA-003 — LOW — Hooks do Impeccable executam um binário de terceiros automaticamente
- **Evidência:**
  - `.claude/settings.local.json` registra hooks `SessionStart`, `PostToolUse` (Edit|Write) e `Stop`, que chamam `.claude/skills/impeccable/scripts/impeccable hook`;
  - o binário está em `%USERPROFILE%\.impeccable\bin\0.1.27\impeccable.exe`;
  - a ferramenta não consta em `skills-lock.json`.
- **Impacto:** está fora da árvore npm e do site publicado. Uma atualização comprometida da ferramenta rodaria com as permissões do desenvolvedor a cada edição neste projeto.
- **Caminho:** estação de trabalho → hooks do Claude Code → `impeccable.exe` 0.1.27.
- **Recomendação:**
  - manter `settings.local.json` fora do Git;
  - atualizar a ferramenta só de forma deliberada, rodando `npx impeccable check` antes de qualquer `update`;
  - rodar `/impeccable hooks off` se a execução automática não for desejada.

### Achados INFO (detalhes em `findings.json`)
- **SCA-004:** nenhuma vulnerabilidade conhecida em dependências diretas ou transitivas.
- **SCA-005:** integridade do lockfile. Todas as entradas são sha512 do registro, e 358 assinaturas foram verificadas.
- **SCA-006:** nenhum script executado na instalação.
- **SCA-007:** nenhum candidato a typosquatting. Esta checagem é avaliação manual, não medição.
- **SCA-008:** provenance ausente em 5 de 11 diretas, e política de segurança ausente em 2 de 11.
- **SCA-009:** há atualizações patch (react, tailwindcss) e major (typescript, @types/node, eslint) disponíveis, sem advisory associada. O `@types/node` 20 diverge do runtime Node 26.
- **SCA-010:** a superfície de produção é pequena: 17 de 432 dependências.
- **SCA-011:** critérios de higiene de repositório não puderam ser avaliados nesta execução.

## 7. Limitações

- A API do OpenSSF Scorecard não respondeu para nenhuma dependência. Por isso, quatro critérios ficaram com 0 de 11 avaliados: workflow de CI perigoso, permissões de token, binários versionados e revisão por segunda pessoa.
- O `gh` não estava autenticado: o limite é de 60 requisições por hora, contra 5.000 com login. Das requisições HTTP, 35 foram feitas e 11 retornaram erro.
- A concentração de publicadores foi avaliada só para 5 de 11 diretas. As outras 6 publicam via CI com provenance, e nesse caso o conjunto efetivo de publicadores não é observável de fora.
- Os critérios além de advisories (manutenção, arquivamento, publicadores, provenance) cobrem só as 11 dependências diretas. Na árvore transitiva foram verificados advisories, integridade, scripts de instalação e nomes.
- As 74 entradas opcionais de outras plataformas não foram instaladas, então suas assinaturas não foram verificadas localmente.
- O código-fonte das dependências não foi lido nem executado. A auditoria usa metadados de registro, de advisories e de repositório.
- A avaliação de typosquatting é revisão manual da lista de nomes.
- Os resultados refletem as bases de advisories em 2026-11-22.

## 8. Recomendações priorizadas

1. **Instalação reprodutível:** instalar sempre com `npm ci` e manter o `package-lock.json` versionado. `npm ci --ignore-scripts` é viável neste projeto, porque a árvore atual não tem scripts de instalação, e protege contra um script introduzido no futuro. Custo: nenhum.
2. **Repetir a auditoria com autenticação:** rodar `gh auth login` e executar o coletor de novo para preencher os critérios do Scorecard (SCA-011). Custo: alguns minutos.
3. **Patches de rotina:** atualizar react e react-dom para 19.3.1 e tailwindcss e `@tailwindcss/turbopack` para 4.3.5 (SCA-009). Custo baixo, sem mudança major.
4. **eslint 10:** planejar a migração quando o `eslint-config-next` declarar suporte (SCA-001). Custo: revisar a configuração de lint.
5. **Alinhar `@types/node`** com a versão major do Node usada em produção (SCA-009).
6. **Hooks do Impeccable:** decidir se a execução automática deve continuar e atualizar a ferramenta só de forma deliberada (SCA-003).
7. **CI:** ativar alertas de dependência (Dependabot) no repositório e rodar `npm audit` e `npm audit signatures` em CI Linux, onde os binários de plataforma são instalados e verificados (SCA-004 e SCA-005).

Nenhuma dessas recomendações foi aplicada nesta auditoria.

## 9. Arquivos

- `security-audit/findings.json`: findings estruturados.
- `security-audit/report.md`: este relatório.
- `security-audit/raw/trailofbits-findings.json` e `raw/trailofbits-report.md`: saída original da skill.
- `security-audit/raw/npm-audit.json` e `raw/npm-audit-signatures.txt`: saída original do npm.
