# CFI — Centro de Ferramentas Internas

**Automação de consultas, integração de dados e geração de relatórios em uma aplicação web.**

O CFI surgiu da minha experiência com suporte a sistemas e análise de dados, com o objetivo de centralizar ferramentas utilizadas em tarefas recorrentes. A proposta é facilitar consultas, reduzir etapas manuais e transformar informações de diferentes fontes em resultados úteis para o trabalho.

## O projeto original

A versão original foi desenvolvida para trabalhar com informações reais do ambiente operacional, utilizando conexões com bancos de dados e integração com APIs da MadeiraMadeira.

Entre os recursos do projeto estão:

* **Consultas a bancos PostgreSQL e MySQL:** extração de informações por meio de consultas SQL para análise e acompanhamento de clientes.
* **Integração com APIs da MadeiraMadeira:** consulta e extração de informações de produtos, apoiando a conferência entre os dados da API e do banco.
* **Análise de clientes:** consulta de indicadores, faturamento e comparação entre períodos.
* **Comissão de clientes:** consulta de dados reais e processamento das informações necessárias para gerar relatórios de comissão.
* **Faturamento consolidado:** levantamento por período, detalhamento mensal e comparação entre clientes.
* **Diagnóstico operacional:** consulta de informações sobre pedidos, notas fiscais, estoque e movimentações.
* **Extração e geração de planilhas:** organização dos resultados em arquivos Excel para conferência, análise e acompanhamento.

A interface web reúne essas rotinas para facilitar sua execução, sem a necessidade de abrir e executar cada script separadamente.

## Fluxo de funcionamento

Na versão original, o usuário seleciona uma ferramenta e informa os filtros da consulta. A aplicação busca os dados no banco ou na API, conforme a funcionalidade, aplica as regras de processamento e apresenta os resultados na tela ou em planilhas para download.

O projeto conecta atividades de **consulta SQL, integração com APIs, tratamento de dados e automação de relatórios** a uma interface construída com Python e Flask.

## Sobre este repositório

Este repositório disponibiliza uma **versão demonstrativa**, adaptada a partir do projeto original.

As credenciais, conexões com bancos privados e integrações com APIs da MadeiraMadeira foram removidas. Os módulos disponíveis utilizam somente **clientes, pedidos e valores fictícios**.

A comissão de clientes está desativada, incluindo a geração e o download de relatórios, pois depende de consultas reais e regras internas que não fazem parte da versão pública.

## Tecnologias

* **Python e Flask:** processamento e aplicação web.
* **SQL, PostgreSQL e MySQL:** consultas e acesso aos dados no projeto original.
* **APIs HTTP:** integração com serviços externos no projeto original.
* **openpyxl:** geração de planilhas Excel na versão pública.
* **HTML, CSS e JavaScript:** interface e interação com as ferramentas.

## Apoio de IA

O projeto contou com o auxílio da **IA** na implementação, revisão de código, ajustes da interface e elaboração da documentação.

A IA também apoiou a preparação da versão demonstrativa, incluindo a criação de dados fictícios, integrações privadas e a desativação das funcionalidades dependentes do ambiente original.

A IA foi utilizada como ferramenta de apoio ao desenvolvimento. As consultas e análises da aplicação são executadas por regras implementadas em código.

## Autor

**Juan Carlos**

[Meu perfil no Linkedin](https://www.linkedin.com/in/juan-carlos-77324427a/)
