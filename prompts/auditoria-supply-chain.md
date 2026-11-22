# Prompt — Auditoria de supply chain (Trail of Bits)

> Skill: `supply-chain-risk-auditor` (instalada em `.claude/skills/supply-chain-risk-auditor/`)
> Pré-requisitos para rodar: Python 3.11+, `uv` e `gh` autenticado (`gh auth login`). Em 22/11/2026 nenhum dos três estava instalado nesta máquina.

---

Utilize a skill supply-chain-risk-auditor, da Trail of Bits, neste projeto.

Fonte oficial:
https://github.com/trailofbits/skills/tree/main/plugins/supply-chain-risk-auditor

Você deve cuidar de todo o processo: verificar se a skill está disponível, instalar/configurar o que for necessário para utilizá-la, consultar a documentação oficial e executar uma auditoria completa de segurança da cadeia de dependências deste projeto.

Analise todas as dependências diretas e indiretas, a árvore completa do lockfile, CVEs conhecidas, pacotes abandonados, reputação e histórico dos publicadores, typosquatting, possíveis pacotes comprometidos, scripts de instalação e execução automática, integridade das versões, dependências transitivas e quaisquer riscos de supply chain.

Não se limite a uma análise superficial. Inspecione o projeto real, utilize ferramentas apropriadas, verifique evidências e identifique riscos concretos. Não invente vulnerabilidades nem resultados. Se alguma verificação não puder ser realizada, documente a limitação.

Não altere o código-fonte, não atualize nem remova dependências e não faça mudanças na produção. Evite executar scripts suspeitos ou comandos potencialmente destrutivos.

Ao finalizar, crie a pasta security-audit/ contendo:

* findings.json — findings estruturados, com pacote, versão, severidade, CVE quando aplicável, evidências, impacto, caminho da dependência e recomendação.
* report.md — relatório completo com resumo executivo, metodologia, ferramentas e versões, análise das dependências, vulnerabilidades, riscos, evidências, limitações e recomendações priorizadas.

Classifique os riscos como CRITICAL, HIGH, MEDIUM, LOW ou INFO.

Faça tudo de ponta a ponta, incluindo a instalação ou configuração necessária para utilizar a skill, a auditoria, a geração dos arquivos e a validação final do JSON e do relatório. Não fique apenas me ensinando os passos: execute o trabalho diretamente no projeto e apresente o resultado final, destacando os riscos mais importantes encontrados e o caminho dos arquivos gerados.
