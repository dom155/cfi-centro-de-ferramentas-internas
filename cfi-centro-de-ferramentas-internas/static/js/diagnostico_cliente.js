// =========================================================
// INFO CFI — DIAGNÓSTICO DE CLIENTE
// =========================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        // =================================================
        // ELEMENTOS
        // =================================================

        const form =
            document.getElementById(
                'form-diagnostico-cliente'
            );


        if (!form) {
            return;
        }


        const inputBase =
            document.getElementById(
                'input-base-diagnostico'
            );


        const btnExecutar =
            document.getElementById(
                'btn-executar-diagnostico'
            );


        const secaoConfiguracao =
            document.getElementById(
                'secao-configuracao-diagnostico'
            );


        const secaoProcessamento =
            document.getElementById(
                'secao-processamento-diagnostico'
            );


        const secaoResultado =
            document.getElementById(
                'secao-resultado-diagnostico'
            );


        const processamentoBase =
            document.getElementById(
                'processamento-base-diagnostico'
            );


        const processamentoStatus =
            document.getElementById(
                'processamento-status-diagnostico'
            );


        const resultadoNomeCliente =
            document.getElementById(
                'resultado-nome-cliente'
            );


        const resultadoBase =
            document.getElementById(
                'resultado-base-cliente'
            );


        const resultadoUltimoPedido =
            document.getElementById(
                'resultado-ultimo-pedido'
            );


        const resultadoUltimaNf =
            document.getElementById(
                'resultado-ultima-nf'
            );


        const resultadoPedidosHoje =
            document.getElementById(
                'resultado-pedidos-hoje'
            );


        const resultadoPendencias =
            document.getElementById(
                'resultado-pendencias'
            );


        const resultadoEstoque =
            document.getElementById(
                'resultado-estoque'
            );


        const resultadoUltimaMovimentacao =
            document.getElementById(
                'resultado-ultima-movimentacao'
            );


        const btnNovaConsulta =
            document.getElementById(
                'btn-nova-consulta-diagnostico'
            );


        let tarefaAtualId = null;


        // =================================================
        // ÍCONES
        // =================================================

        function atualizarIcones() {

            if (
                window.lucide &&
                typeof window.lucide.createIcons ===
                'function'
            ) {

                window.lucide.createIcons();
            }
        }


        atualizarIcones();


        // =================================================
        // AGUARDAR
        // =================================================

        function aguardar(ms) {

            return new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        ms
                    )
            );
        }


        // =================================================
        // VALIDAR BASE
        // =================================================

        function validarBase() {

            const base =
                inputBase.value
                    .trim()
                    .toLowerCase();


            if (!base) {

                alert(
                    'Informe a base do cliente.'
                );


                inputBase.focus();


                return null;
            }


            return base;
        }


        // =================================================
        // ESTADOS
        // =================================================

        function mostrarConfiguracao() {

            secaoProcessamento
                .classList
                .add('hidden');


            secaoResultado
                .classList
                .add('hidden');


            secaoConfiguracao
                .classList
                .remove('hidden');
        }


        function mostrarProcessamento(
            base
        ) {

            secaoConfiguracao
                .classList
                .add('hidden');


            secaoResultado
                .classList
                .add('hidden');


            secaoProcessamento
                .classList
                .remove('hidden');


            processamentoBase.textContent =
                base;


            processamentoStatus.textContent =
                'Iniciando diagnóstico...';


            atualizarIcones();
        }


        function mostrarResultado() {

            secaoConfiguracao
                .classList
                .add('hidden');


            secaoProcessamento
                .classList
                .add('hidden');


            secaoResultado
                .classList
                .remove('hidden');


            atualizarIcones();
        }


        // =================================================
        // FORMATAR NÚMERO
        // =================================================

        function formatarNumero(
            valor
        ) {

            const numero =
                Number(
                    valor || 0
                );


            return numero.toLocaleString(
                'pt-BR'
            );
        }


        // =================================================
        // PREENCHER RESULTADO
        // =================================================

        function preencherResultado(
            dados
        ) {

            resultadoNomeCliente.textContent =
                dados.cliente ||
                dados.base ||
                '—';


            resultadoBase.textContent =
                dados.base ||
                '—';


            resultadoUltimoPedido.textContent =
                dados.ultimo_pedido ||
                'Sem pedidos';


            resultadoUltimaNf.textContent =
                dados.ultima_nf ||
                'Sem NF emitida';


            resultadoPedidosHoje.textContent =
                formatarNumero(
                    dados.pedidos_hoje
                );


            // =============================================
            // PENDÊNCIAS
            // =============================================

            const pendencias =
                Number(
                    dados.pendencias || 0
                );


            if (
                pendencias > 0
            ) {

                resultadoPendencias.textContent =
                    `⚠️ ${formatarNumero(pendencias)}`;

            } else {

                resultadoPendencias.textContent =
                    '✅ 0';
            }


            // =============================================
            // ESTOQUE
            // =============================================

            const estoqueZerado =
                Number(
                    dados.estoque_zerado || 0
                );


            if (
                estoqueZerado > 0
            ) {

                resultadoEstoque.textContent =
                    `⚠️ ${formatarNumero(estoqueZerado)} ` +
                    (
                        estoqueZerado === 1
                            ? 'produto com estoque zerado'
                            : 'produtos com estoque zerado'
                    );

            } else {

                resultadoEstoque.textContent =
                    '✅ Nenhum produto com estoque zerado';
            }


            // =============================================
            // ÚLTIMA MOVIMENTAÇÃO
            // =============================================

            resultadoUltimaMovimentacao.textContent =
                dados.ultima_movimentacao ||
                'Sem movimentação';
        }


        // =================================================
        // ATUALIZAR PROGRESSO
        // =================================================

        function atualizarProgresso(
            dados
        ) {

            if (
                dados.base
            ) {

                processamentoBase.textContent =
                    dados.base;
            }


            processamentoStatus.textContent =
                dados.mensagem ||
                'Executando diagnóstico...';
        }


        // =================================================
        // ACOMPANHAR TAREFA
        // =================================================

        async function acompanharTarefa(
            tarefaId
        ) {

            const intervalo =
                1000;


            const maxTentativas =
                180;


            let tentativas =
                0;


            while (
                tentativas <
                maxTentativas
            ) {

                tentativas += 1;


                await aguardar(
                    intervalo
                );


                const resposta =
                    await fetch(
                        `/api/diagnostico-cliente/status/${tarefaId}`
                    );


                const dados =
                    await resposta.json();


                if (
                    !resposta.ok
                ) {

                    throw new Error(
                        dados.erro ||
                        'Não foi possível acompanhar o diagnóstico.'
                    );
                }


                atualizarProgresso(
                    dados
                );


                // =========================================
                // CONCLUÍDO
                // =========================================

                if (
                    dados.status ===
                    'concluido'
                ) {

                    preencherResultado(
                        dados.resultado
                    );


                    mostrarResultado();


                    return;
                }


                // =========================================
                // ERRO
                // =========================================

                if (
                    dados.status ===
                    'erro'
                ) {

                    throw new Error(
                        dados.erro ||
                        'Erro durante o diagnóstico.'
                    );
                }
            }


            throw new Error(
                'O diagnóstico excedeu o tempo máximo de processamento.'
            );
        }


        // =================================================
        // INICIAR
        // =================================================

        async function iniciarDiagnostico(
            base
        ) {

            const resposta =
                await fetch(
                    '/api/diagnostico-cliente/iniciar',
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                base: base
                            })
                    }
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    'Não foi possível iniciar o diagnóstico.'
                );
            }


            if (
                !dados.tarefa_id
            ) {

                throw new Error(
                    'O servidor não retornou o ID da tarefa.'
                );
            }


            tarefaAtualId =
                dados.tarefa_id;


            await acompanharTarefa(
                tarefaAtualId
            );
        }


        // =================================================
        // FORM
        // =================================================

        form.addEventListener(
            'submit',
            async event => {

                event.preventDefault();


                const base =
                    validarBase();


                if (!base) {
                    return;
                }


                inputBase.value =
                    base;


                btnExecutar.disabled =
                    true;


                mostrarProcessamento(
                    base
                );


                try {

                    await iniciarDiagnostico(
                        base
                    );


                } catch (erro) {

                    console.error(
                        'Erro no diagnóstico:',
                        erro
                    );


                    alert(
                        erro.message
                    );


                    mostrarConfiguracao();


                } finally {

                    btnExecutar.disabled =
                        false;
                }
            }
        );


        // =================================================
        // NOVA CONSULTA
        // =================================================

        if (
            btnNovaConsulta
        ) {

            btnNovaConsulta.addEventListener(
                'click',
                () => {

                    tarefaAtualId =
                        null;


                    inputBase.value =
                        '';


                    mostrarConfiguracao();


                    inputBase.focus();
                }
            );
        }

    }
);