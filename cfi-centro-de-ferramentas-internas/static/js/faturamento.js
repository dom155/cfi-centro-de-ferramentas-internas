document.addEventListener(
    'DOMContentLoaded',
    () => {

        // =========================================================
        // LUCIDE ICONS
        // =========================================================

        function atualizarIcones() {

            if (
                window.lucide &&
                typeof window.lucide.createIcons === 'function'
            ) {
                window.lucide.createIcons();
            }
        }


        atualizarIcones();


        // =========================================================
        // ELEMENTOS
        // =========================================================

        const form =
            document.getElementById(
                'form-faturamento'
            );

        const selectMesInicial =
            document.getElementById(
                'select-mes-inicial-faturamento'
            );

        const selectAnoInicial =
            document.getElementById(
                'select-ano-inicial-faturamento'
            );

        const selectMesFinal =
            document.getElementById(
                'select-mes-final-faturamento'
            );

        const selectAnoFinal =
            document.getElementById(
                'select-ano-final-faturamento'
            );

        const btnConsultar =
            document.getElementById(
                'btn-consultar-faturamento'
            );

        const secaoConfiguracao =
            document.getElementById(
                'secao-configuracao-faturamento'
            );

        const secaoProcessamento =
            document.getElementById(
                'secao-processamento-faturamento'
            );

        const secaoResultado =
            document.getElementById(
                'secao-resultado-faturamento'
            );

        const resultadoPeriodo =
            document.getElementById(
                'resultado-periodo-faturamento'
            );

        const resultadoFaturamentoTotal =
            document.getElementById(
                'resultado-faturamento-total'
            );

        const resultadoOcsFaturadas =
            document.getElementById(
                'resultado-ocs-faturadas'
            );

        const resultadoBasesComFaturamento =
            document.getElementById(
                'resultado-bases-com-faturamento'
            );

        const resultadoBasesSemFaturamento =
            document.getElementById(
                'resultado-bases-sem-faturamento'
            );

        const tabelaFaturamentoMensal =
            document.getElementById(
                'tabela-faturamento-mensal'
            );

        const tabelaRanking =
            document.getElementById(
                'tabela-ranking-faturamento'
            );

        const btnBaixar =
            document.getElementById(
                'btn-baixar-faturamento'
            );

        const btnNovaConsulta =
            document.getElementById(
                'btn-nova-consulta-faturamento'
            );


        // =========================================================
        // VERIFICAÇÃO
        // =========================================================

        if (!form) {
            return;
        }


        // =========================================================
        // MESES
        // =========================================================

        const nomesMeses = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
        ];


        function obterNomeMes(mes) {

            return nomesMeses[
                Number(mes) - 1
            ];
        }


        // =========================================================
        // ANO ATUAL
        // =========================================================

        function adicionarAnoSeNecessario(
            select,
            ano
        ) {

            const existe =
                Array.from(
                    select.options
                ).some(
                    option =>
                        Number(option.value) === ano
                );


            if (!existe) {

                const option =
                    document.createElement(
                        'option'
                    );

                option.value =
                    String(ano);

                option.textContent =
                    String(ano);

                select.appendChild(
                    option
                );
            }
        }


        function configurarPeriodoPadrao() {

            const hoje =
                new Date();

            const mesAtual =
                hoje.getMonth() + 1;

            const anoAtual =
                hoje.getFullYear();


            adicionarAnoSeNecessario(
                selectAnoInicial,
                anoAtual
            );

            adicionarAnoSeNecessario(
                selectAnoFinal,
                anoAtual
            );


            selectMesInicial.value =
                String(mesAtual);

            selectMesFinal.value =
                String(mesAtual);

            selectAnoInicial.value =
                String(anoAtual);

            selectAnoFinal.value =
                String(anoAtual);
        }


        configurarPeriodoPadrao();


        // =========================================================
        // FORMATADORES
        // =========================================================

        const formatadorMoeda =
            new Intl.NumberFormat(
                'pt-BR',
                {
                    style: 'currency',
                    currency: 'BRL'
                }
            );


        function formatarMoeda(valor) {

            return formatadorMoeda.format(
                Number(valor) || 0
            );
        }


        function formatarNumero(valor) {

            return Number(
                valor || 0
            ).toLocaleString(
                'pt-BR'
            );
        }


        // =========================================================
        // PERÍODO
        // =========================================================

        function obterValorPeriodo(
            mes,
            ano
        ) {

            return (
                Number(ano) * 12 +
                Number(mes)
            );
        }


        function validarPeriodo() {

            const mesInicial =
                Number(
                    selectMesInicial.value
                );

            const anoInicial =
                Number(
                    selectAnoInicial.value
                );

            const mesFinal =
                Number(
                    selectMesFinal.value
                );

            const anoFinal =
                Number(
                    selectAnoFinal.value
                );


            if (
                !mesInicial ||
                !anoInicial ||
                !mesFinal ||
                !anoFinal
            ) {

                alert(
                    'Informe o período completo.'
                );

                return false;
            }


            const periodoInicial =
                obterValorPeriodo(
                    mesInicial,
                    anoInicial
                );

            const periodoFinal =
                obterValorPeriodo(
                    mesFinal,
                    anoFinal
                );


            if (
                periodoFinal <
                periodoInicial
            ) {

                alert(
                    'O período final não pode ser anterior ao período inicial.'
                );

                return false;
            }


            return true;
        }


        function montarTextoPeriodo(
            mesInicial,
            anoInicial,
            mesFinal,
            anoFinal
        ) {

            return (
                `${obterNomeMes(mesInicial)}/${anoInicial}` +
                ' a ' +
                `${obterNomeMes(mesFinal)}/${anoFinal}`
            );
        }


        // =========================================================
        // LISTAR MESES DO PERÍODO
        // =========================================================

        function montarMesesPeriodo(
            mesInicial,
            anoInicial,
            mesFinal,
            anoFinal
        ) {

            const meses = [];

            let mes =
                Number(mesInicial);

            let ano =
                Number(anoInicial);


            while (
                ano < Number(anoFinal) ||
                (
                    ano === Number(anoFinal) &&
                    mes <= Number(mesFinal)
                )
            ) {

                meses.push({
                    mes,
                    ano
                });


                mes++;


                if (mes > 12) {

                    mes = 1;
                    ano++;
                }
            }


            return meses;
        }


        // =========================================================
        // LIMPAR RESULTADOS
        // =========================================================

        function limparResultado() {

            resultadoPeriodo.textContent =
                '—';

            resultadoFaturamentoTotal.textContent =
                '—';

            resultadoOcsFaturadas.textContent =
                '—';

            resultadoBasesComFaturamento.textContent =
                '—';

            resultadoBasesSemFaturamento.textContent =
                '—';


            tabelaFaturamentoMensal.innerHTML =
                '';

            tabelaRanking.innerHTML =
                '';
        }


        // =========================================================
        // ESTADOS DA TELA
        // =========================================================

        function mostrarConfiguracao() {

            secaoConfiguracao.classList.remove(
                'hidden'
            );

            secaoProcessamento.classList.add(
                'hidden'
            );

            secaoResultado.classList.add(
                'hidden'
            );


            secaoConfiguracao.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }


        function mostrarProcessamento() {

            secaoConfiguracao.classList.add(
                'hidden'
            );

            secaoResultado.classList.add(
                'hidden'
            );

            secaoProcessamento.classList.remove(
                'hidden'
            );


            secaoProcessamento.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });


            atualizarIcones();
        }


        function mostrarResultado() {

            secaoConfiguracao.classList.add(
                'hidden'
            );

            secaoProcessamento.classList.add(
                'hidden'
            );

            secaoResultado.classList.remove(
                'hidden'
            );


            secaoResultado.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });


            atualizarIcones();
        }


       
        // =========================================================
        // INDICADORES
        // =========================================================

        function preencherIndicadores(
            resultado
        ) {

            resultadoFaturamentoTotal.textContent =
                formatarMoeda(
                    resultado.faturamento_total
                );


            resultadoOcsFaturadas.textContent =
                formatarNumero(
                    resultado.ocs_faturadas
                );


            resultadoBasesComFaturamento.textContent =
                formatarNumero(
                    resultado.bases_com_faturamento
                );


            resultadoBasesSemFaturamento.textContent =
                formatarNumero(
                    resultado.bases_sem_faturamento
                );
        }


        // =========================================================
        // TABELA FATURAMENTO MENSAL
        // =========================================================

        function preencherFaturamentoMensal(
            dados
        ) {

            tabelaFaturamentoMensal.innerHTML =
                '';


            dados.forEach(
                item => {

                    const linha =
                        document.createElement(
                            'tr'
                        );


                    const colunaMes =
                        document.createElement(
                            'td'
                        );

                    colunaMes.textContent =
                        `${obterNomeMes(item.mes)}/${item.ano}`;


                    const colunaOcs =
                        document.createElement(
                            'td'
                        );

                    colunaOcs.classList.add(
                        'is-numeric'
                    );

                    colunaOcs.textContent =
                        formatarNumero(
                            item.ocs_faturadas
                        );


                    const colunaFaturamento =
                        document.createElement(
                            'td'
                        );

                    colunaFaturamento.classList.add(
                        'is-numeric'
                    );

                    colunaFaturamento.textContent =
                        formatarMoeda(
                            item.faturamento
                        );


                    linha.appendChild(
                        colunaMes
                    );

                    linha.appendChild(
                        colunaOcs
                    );

                    linha.appendChild(
                        colunaFaturamento
                    );


                    tabelaFaturamentoMensal.appendChild(
                        linha
                    );
                }
            );
        }


        // =========================================================
        // RANKING TOP 5
        // =========================================================

        function preencherRanking(
            ranking
        ) {

            tabelaRanking.innerHTML =
                '';


            ranking
                .slice(
                    0,
                    5
                )
                .forEach(
                    item => {

                        const linha =
                            document.createElement(
                                'tr'
                            );


                        const colunaPosicao =
                            document.createElement(
                                'td'
                            );

                        colunaPosicao.textContent =
                            item.posicao;


                        const colunaBase =
                            document.createElement(
                                'td'
                            );

                        colunaBase.textContent =
                            item.base;


                        const colunaOcs =
                            document.createElement(
                                'td'
                            );

                        colunaOcs.classList.add(
                            'is-numeric'
                        );

                        colunaOcs.textContent =
                            formatarNumero(
                                item.ocs_faturadas
                            );


                        const colunaFaturamento =
                            document.createElement(
                                'td'
                            );

                        colunaFaturamento.classList.add(
                            'is-numeric'
                        );

                        colunaFaturamento.textContent =
                            formatarMoeda(
                                item.faturamento
                            );


                        linha.appendChild(
                            colunaPosicao
                        );

                        linha.appendChild(
                            colunaBase
                        );

                        linha.appendChild(
                            colunaOcs
                        );

                        linha.appendChild(
                            colunaFaturamento
                        );


                        tabelaRanking.appendChild(
                            linha
                        );
                    }
                );
        }


        // =========================================================
        // PREENCHER RESULTADO
        // =========================================================

        function preencherResultado(
            resultado
        ) {

            resultadoPeriodo.textContent =
                montarTextoPeriodo(
                    resultado.mes_inicial,
                    resultado.ano_inicial,
                    resultado.mes_final,
                    resultado.ano_final
                );


            preencherIndicadores(
                resultado
            );


            preencherFaturamentoMensal(
                resultado.faturamento_mensal
            );


            preencherRanking(
                resultado.ranking
            );
        }


        // =========================================================
// CONSULTAR FATURAMENTO
// =========================================================

async function consultarFaturamento() {

    if (
        !validarPeriodo()
    ) {
        return;
    }


    const dados = {

        mes_inicial:
            Number(
                selectMesInicial.value
            ),

        ano_inicial:
            Number(
                selectAnoInicial.value
            ),

        mes_final:
            Number(
                selectMesFinal.value
            ),

        ano_final:
            Number(
                selectAnoFinal.value
            )
    };


    console.log(
        'Dados da consulta de faturamento:',
        dados
    );


    limparResultado();

    mostrarProcessamento();


    try {

        // =====================================================
        // API FLASK
        // =====================================================

        const resposta =
            await fetch(
                '/api/faturamento',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            dados
                        )
                }
            );


        const resultado =
            await resposta.json();


        // =====================================================
        // VALIDAR RESPOSTA
        // =====================================================

        if (
            !resposta.ok
        ) {

            throw new Error(
                resultado.erro ||
                'Não foi possível consultar o faturamento.'
            );
        }


        if (
            !resultado.sucesso
        ) {

            throw new Error(
                resultado.erro ||
                'Não foi possível consultar o faturamento.'
            );
        }


        console.log(
            'Resultado real do faturamento:',
            resultado
        );


        // =====================================================
        // PREENCHER TELA
        // =====================================================

        preencherResultado(
            resultado
        );


        mostrarResultado();


    } catch (erro) {

        console.error(
            'Erro ao consultar faturamento:',
            erro
        );


        secaoProcessamento.classList.add(
            'hidden'
        );

        secaoResultado.classList.add(
            'hidden'
        );

        secaoConfiguracao.classList.remove(
            'hidden'
        );


        alert(
            erro.message ||
            'Não foi possível consultar o faturamento.'
        );


    } finally {

        atualizarIcones();
    }
}


        // =========================================================
        // BOTÃO CONSULTAR
        // =========================================================

        btnConsultar.addEventListener(
            'click',
            consultarFaturamento
        );


        // =========================================================
        // FORMULÁRIO
        // =========================================================

        form.addEventListener(
            'submit',
            event => {

                event.preventDefault();

                consultarFaturamento();
            }
        );


        // =========================================================
        // NOVA CONSULTA
        // =========================================================

        btnNovaConsulta.addEventListener(
            'click',
            () => {

                limparResultado();

                mostrarConfiguracao();
            }
        );


       // =========================================================
// BAIXAR PLANILHA
// =========================================================

btnBaixar.addEventListener(
    'click',
    async () => {

        const dados = {

            mes_inicial:
                Number(
                    selectMesInicial.value
                ),

            ano_inicial:
                Number(
                    selectAnoInicial.value
                ),

            mes_final:
                Number(
                    selectMesFinal.value
                ),

            ano_final:
                Number(
                    selectAnoFinal.value
                )
        };


        if (!validarPeriodo()) {
            return;
        }


        const textoOriginal =
            btnBaixar.innerHTML;


        btnBaixar.disabled =
            true;


        btnBaixar.innerHTML = `
            <i
                data-lucide="loader-circle"
                class="spin"
            ></i>
            Gerando planilha...
        `;


        atualizarIcones();


        try {

            const resposta =
                await fetch(
                    '/api/faturamento/baixar',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


            if (!resposta.ok) {

                let mensagem =
                    'Não foi possível gerar a planilha.';


                try {

                    const erroResposta =
                        await resposta.json();


                    mensagem =
                        erroResposta.erro ||
                        mensagem;

                } catch (erroJson) {

                    console.error(
                        'Erro ao interpretar resposta:',
                        erroJson
                    );
                }


                throw new Error(
                    mensagem
                );
            }


            const blob =
                await resposta.blob();


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;


            let nomeArquivo =
                'faturamento.xlsx';


            const contentDisposition =
                resposta.headers.get(
                    'Content-Disposition'
                );


            if (contentDisposition) {

                const utf8Match =
                    contentDisposition.match(
                        /filename\*=UTF-8''([^;]+)/i
                    );


                const normalMatch =
                    contentDisposition.match(
                        /filename="?([^";]+)"?/i
                    );


                if (
                    utf8Match &&
                    utf8Match[1]
                ) {

                    nomeArquivo =
                        decodeURIComponent(
                            utf8Match[1]
                        );

                } else if (
                    normalMatch &&
                    normalMatch[1]
                ) {

                    nomeArquivo =
                        normalMatch[1];
                }
            }


            link.download =
                nomeArquivo;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (erro) {

            console.error(
                'Erro ao baixar planilha:',
                erro
            );


            alert(
                erro.message
            );


        } finally {

            btnBaixar.disabled =
                false;


            btnBaixar.innerHTML =
                textoOriginal;


            atualizarIcones();
        }
    }
);

    }
);