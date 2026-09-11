document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // LUCIDE
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
        document.getElementById('form-analise-clientes');

    const inputBase =
        document.getElementById('input-base-analise');

    const selectMes =
        document.getElementById('select-mes-analise');

    const selectAno =
        document.getElementById('select-ano-analise');

    const btnAnalisar =
        document.getElementById('btn-analisar-cliente');

    const secaoConfiguracao =
        document.getElementById('secao-configuracao');

    const secaoProcessamento =
        document.getElementById('secao-processamento-analise');

    const secaoResultado =
        document.getElementById('secao-resultado-analise');

    const processamentoBase =
        document.getElementById('processamento-base-nome');

    const resultadoNomeEmpresa =
        document.getElementById('resultado-nome-empresa');

    const resultadoPeriodo =
        document.getElementById('resultado-periodo');

    const resultadoFaturamentoAtual =
        document.getElementById('resultado-faturamento-atual');

    const resultadoPedidos =
        document.getElementById('resultado-pedidos');

    const resultadoFaturamentoAnterior =
        document.getElementById('resultado-faturamento-anterior');

    const resultadoVariacao =
        document.getElementById('resultado-variacao');

    const resultadoSituacao =
        document.getElementById('resultado-situacao');

    const situacaoIcone =
        document.getElementById('situacao-icone');

    const situacaoValor =
        document.getElementById('situacao-valor');

    const analisePrincipal =
        document.getElementById('resultado-analise-principal');

    const analiseSecundaria =
        document.getElementById('resultado-analise-secundaria');

    const btnBaixar =
        document.getElementById('btn-baixar-analise');

    const btnNovaAnalise =
        document.getElementById('btn-nova-analise');


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
        return nomesMeses[Number(mes) - 1];
    }


    // =========================================================
    // PERÍODO ATUAL
    // =========================================================

    function configurarPeriodoAtual() {

        const hoje = new Date();

        const mesAtual =
            hoje.getMonth() + 1;

        const anoAtual =
            hoje.getFullYear();


        if (selectMes) {
            selectMes.value =
                String(mesAtual);
        }


        if (selectAno) {

            const existeAno =
                Array.from(
                    selectAno.options
                ).some(
                    option =>
                        Number(option.value) === anoAtual
                );


            if (!existeAno) {

                const option =
                    document.createElement('option');

                option.value =
                    String(anoAtual);

                option.textContent =
                    String(anoAtual);

                selectAno.appendChild(
                    option
                );
            }


            selectAno.value =
                String(anoAtual);
        }
    }


    configurarPeriodoAtual();


    // =========================================================
    // FORMATAÇÃO DE MOEDA
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

        const numero =
            Number(valor) || 0;

        return formatadorMoeda.format(
            numero
        );
    }


    function formatarVariacao(valor) {

        const numero =
            Number(valor) || 0;


        if (numero > 0) {

            return (
                '+ ' +
                formatadorMoeda.format(
                    numero
                )
            );
        }


        if (numero < 0) {

            return (
                '- ' +
                formatadorMoeda.format(
                    Math.abs(numero)
                )
            );
        }


        return formatadorMoeda.format(
            0
        );
    }


    // =========================================================
    // SITUAÇÃO
    // =========================================================

    function limparSituacao() {

        resultadoSituacao.classList.remove(
            'situacao-crescimento',
            'situacao-queda',
            'situacao-estavel',
            'situacao-sem-faturamento'
        );
    }


    function configurarSituacao(situacao) {

        limparSituacao();

        let icone =
            'minus';

        let classe =
            'situacao-estavel';


        switch (situacao) {

            case 'CRESCIMENTO':

                icone =
                    'trending-up';

                classe =
                    'situacao-crescimento';

                break;


            case 'QUEDA':

                icone =
                    'trending-down';

                classe =
                    'situacao-queda';

                break;


            case 'SEM FATURAMENTO':

                icone =
                    'circle-off';

                classe =
                    'situacao-sem-faturamento';

                break;


            case 'ESTÁVEL':
            default:

                icone =
                    'minus';

                classe =
                    'situacao-estavel';

                break;
        }


        resultadoSituacao.classList.add(
            classe
        );


        situacaoValor.textContent =
            situacao;


        situacaoIcone.setAttribute(
            'data-lucide',
            icone
        );


        atualizarIcones();
    }


    // =========================================================
    // TEXTO AUTOMÁTICO DA ANÁLISE
    // =========================================================

    function configurarTextoAnalise(
        resultado
    ) {

        const variacao =
            Number(
                resultado.variacao
            ) || 0;


        const faturamentoAnterior =
            Number(
                resultado
                    .faturamento_mes_anterior
            ) || 0;


        const valorVariacao =
            formatarMoeda(
                Math.abs(
                    variacao
                )
            );


        switch (resultado.situacao) {

            case 'CRESCIMENTO':

                analisePrincipal.textContent =
                    `O cliente faturou ${valorVariacao} a mais que no mês anterior.`;


                analiseSecundaria.textContent =
                    'O faturamento está em crescimento em relação ao período anterior.';

                break;


            case 'QUEDA':

                analisePrincipal.textContent =
                    `O cliente faturou ${valorVariacao} a menos que no mês anterior.`;


                analiseSecundaria.textContent =
                    'O faturamento apresentou queda em relação ao período anterior.';

                break;


            case 'ESTÁVEL':

                analisePrincipal.textContent =
                    'O faturamento permaneceu no mesmo nível do mês anterior.';


                analiseSecundaria.textContent =
                    'Não houve variação no faturamento em relação ao período anterior.';

                break;


            case 'SEM FATURAMENTO':

                analisePrincipal.textContent =
                    'O cliente não apresentou faturamento no período selecionado.';


                if (
                    faturamentoAnterior > 0
                ) {

                    analiseSecundaria.textContent =
                        `No mês anterior, o faturamento foi de ${formatarMoeda(faturamentoAnterior)}.`;

                } else {

                    analiseSecundaria.textContent =
                        'Também não houve faturamento registrado no mês anterior.';
                }

                break;


            default:

                analisePrincipal.textContent =
                    'Não foi possível determinar a situação do faturamento.';

                analiseSecundaria.textContent =
                    '';
        }
    }


    // =========================================================
    // MOSTRAR PROCESSAMENTO
    // =========================================================

    function mostrarProcessamento(
        base
    ) {

        secaoConfiguracao.classList.add(
            'hidden'
        );

        secaoResultado.classList.add(
            'hidden'
        );

        secaoProcessamento.classList.remove(
            'hidden'
        );


        processamentoBase.textContent =
            base;


        secaoProcessamento.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });


        atualizarIcones();
    }


    // =========================================================
    // MOSTRAR RESULTADO
    // =========================================================

    function mostrarResultado(
        resultado
    ) {

        secaoProcessamento.classList.add(
            'hidden'
        );

        secaoResultado.classList.remove(
            'hidden'
        );


        resultadoNomeEmpresa.textContent =
            resultado.nome_empresa ||
            resultado.base;


        resultadoPeriodo.textContent =
            `${obterNomeMes(resultado.mes)} de ${resultado.ano}`;


        resultadoFaturamentoAtual.textContent =
            formatarMoeda(
                resultado.faturamento_mes
            );


        resultadoPedidos.textContent =
            Number(
                resultado.pedidos || 0
            ).toLocaleString(
                'pt-BR'
            );


        resultadoFaturamentoAnterior.textContent =
            formatarMoeda(
                resultado
                    .faturamento_mes_anterior
            );


        resultadoVariacao.textContent =
            formatarVariacao(
                resultado.variacao
            );


        configurarSituacao(
            resultado.situacao
        );


        configurarTextoAnalise(
            resultado
        );


        secaoResultado.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });


        atualizarIcones();
    }


    // =========================================================
    // MOSTRAR ERRO
    // =========================================================

    function mostrarErro(
        mensagem
    ) {

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
            mensagem ||
            'Ocorreu um erro ao analisar o cliente.'
        );


        inputBase.focus();
    }


    // =========================================================
    // EXECUTAR ANÁLISE
    // =========================================================

    async function executarAnalise() {

        const base =
            inputBase.value
                .trim()
                .toLowerCase();


        const mes =
            Number(
                selectMes.value
            );


        const ano =
            Number(
                selectAno.value
            );


        if (!base) {

            alert(
                'Informe a base do cliente.'
            );

            inputBase.focus();

            return;
        }


        inputBase.value =
            base;


        const dados = {
            base,
            mes,
            ano
        };


        console.log(
            'Dados da análise:',
            dados
        );


        mostrarProcessamento(
            base
        );


        try {

            const resposta =
                await fetch(
                    '/api/analise-clientes',
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


            if (!resposta.ok) {

                throw new Error(
                    resultado.erro ||
                    'Não foi possível analisar o cliente.'
                );
            }


            if (!resultado.sucesso) {

                throw new Error(
                    resultado.erro ||
                    'Não foi possível analisar o cliente.'
                );
            }


            console.log(
                'Resultado da análise:',
                resultado
            );


            mostrarResultado(
                resultado
            );

        } catch (erro) {

            console.error(
                'Erro na análise:',
                erro
            );


            mostrarErro(
                erro.message
            );
        }
    }


    // =========================================================
    // BOTÃO ANALISAR
    // =========================================================

    btnAnalisar.addEventListener(
        'click',
        executarAnalise
    );


    // =========================================================
    // SUBMIT DO FORMULÁRIO
    // =========================================================

    form.addEventListener(
        'submit',
        event => {

            event.preventDefault();

            executarAnalise();
        }
    );


    // =========================================================
    // ENTER NO CAMPO BASE
    // =========================================================

    inputBase.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter'
            ) {

                event.preventDefault();

                executarAnalise();
            }
        }
    );


    // =========================================================
    // NOVA ANÁLISE
    // =========================================================

    btnNovaAnalise.addEventListener(
        'click',
        () => {

            secaoResultado.classList.add(
                'hidden'
            );

            secaoProcessamento.classList.add(
                'hidden'
            );

            secaoConfiguracao.classList.remove(
                'hidden'
            );


            inputBase.focus();


            secaoConfiguracao.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });


            atualizarIcones();
        }
    );


    // =========================================================
    // BAIXAR PLANILHA
    // =========================================================

    btnBaixar.addEventListener(
        'click',
        async () => {

            const base =
                inputBase.value
                    .trim()
                    .toLowerCase();


            const mes =
                Number(
                    selectMes.value
                );


            const ano =
                Number(
                    selectAno.value
                );


            if (!base) {

                alert(
                    'Informe a base do cliente.'
                );

                inputBase.focus();

                return;
            }


            const dados = {
                base,
                mes,
                ano
            };


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
                        '/api/analise-clientes/baixar',
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


                // =====================================================
                // NOME DO ARQUIVO
                // =====================================================

                let nomeArquivo =
                    `analise_${base}_${mes}_${ano}.xlsx`;


                const contentDisposition =
                    resposta.headers.get(
                        'Content-Disposition'
                    );


                if (
                    contentDisposition
                ) {

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

});