from copy import deepcopy
from threading import Lock, Thread
from uuid import uuid4
from io import BytesIO

from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_file,
)

from services.dados_demo import CLIENTES, validar_cliente, validar_mes
from services.analise_clientes import (
    analisar_cliente,
    gerar_planilha_analise,
)
from services.faturamento import (
    consultar_faturamento,
    gerar_planilha_faturamento,
)
from services.diagnostico_cliente import (
    diagnosticar_cliente,
)
app = Flask(__name__)


@app.context_processor
def contexto_demonstracao():
    return {"clientes_demo": CLIENTES}


@app.before_request
def validar_entrada_demo():
    if request.path == "/api/comissao" or request.path.startswith("/api/comissao/"):
        return jsonify({
            "sucesso": False,
            "codigo": "comissao_desativada",
            "erro": "Comissão de clientes desativada nesta versão pública. Geração e download indisponíveis.",
        }), 410
    if request.method != "POST" or request.endpoint is None:
        return None
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"sucesso": False, "erro": "Envie um objeto JSON válido."}), 400
    try:
        if request.endpoint in {"api_analise_clientes", "baixar_analise_clientes"}:
            validar_cliente(dados.get("base"))
            validar_mes(dados.get("mes"), dados.get("ano"))
        elif request.endpoint == "iniciar_diagnostico_cliente":
            validar_cliente(dados.get("base"))
    except ValueError as erro:
        return jsonify({"sucesso": False, "erro": str(erro)}), 400


# =========================================================
# CACHE DO FATURAMENTO
# =========================================================

cache_faturamento = {}

# =========================================================
# TAREFAS - DIAGNÓSTICO DE CLIENTE
# =========================================================

tarefas_diagnostico_cliente = {}
tarefas_diagnostico_cliente_lock = Lock()


# =========================================================
# PÁGINAS
# =========================================================

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/comissao")
def comissao():
    return render_template("comissao.html")

@app.route("/analise-clientes")
def analise_clientes():
    return render_template("analise_clientes.html")

@app.route("/faturamento")
def faturamento():
    return render_template("faturamento.html")


@app.route("/diagnostico-cliente")
def diagnostico_cliente():
    return render_template(
        "diagnostico_cliente.html"
    )


# =========================================================
# API ANTIGA
# Mantemos por enquanto para compatibilidade.
# =========================================================


# =========================================================
# ANÁLISE DE CLIENTES
# =========================================================

@app.route(
    "/api/analise-clientes",
    methods=["POST"],
)
def api_analise_clientes():

    try:

        dados = request.get_json(
            silent=True
        ) or {}

        base = str(
            dados.get("base", "")
        ).strip().lower()

        mes = dados.get("mes")
        ano = dados.get("ano")

        # =====================================================
        # VALIDAÇÕES
        # =====================================================

        if not base:

            return jsonify({
                "sucesso": False,
                "erro": "Informe a base do cliente.",
            }), 400

        try:

            mes = int(mes)
            ano = int(ano)

        except (TypeError, ValueError):

            return jsonify({
                "sucesso": False,
                "erro": "Mês ou ano inválido.",
            }), 400

        if mes < 1 or mes > 12:

            return jsonify({
                "sucesso": False,
                "erro": "Mês inválido.",
            }), 400

        # =====================================================
        # EXECUTA ANÁLISE
        # =====================================================

        resultado = analisar_cliente(
            base=base,
            mes=mes,
            ano=ano,
        )

        return jsonify(resultado)

    except ValueError as erro:

        return jsonify({
            "sucesso": False,
            "erro": str(erro),
        }), 400

    except Exception as erro:

        app.logger.exception("Erro ao analisar dados fictícios")
        mensagem = "Não foi possível analisar o cliente fictício."

        return jsonify({
            "sucesso": False,
            "erro": mensagem,
        }), 500

# =========================================================
# BAIXAR PLANILHA - ANÁLISE DE CLIENTES
# =========================================================

@app.route(
    "/api/analise-clientes/baixar",
    methods=["POST"],
)
def baixar_analise_clientes():

    try:

        dados = request.get_json(
            silent=True
        ) or {}

        base = str(
            dados.get("base", "")
        ).strip().lower()

        mes = dados.get("mes")
        ano = dados.get("ano")

        # =====================================================
        # VALIDAÇÕES
        # =====================================================

        if not base:

            return jsonify({
                "sucesso": False,
                "erro": "Informe a base do cliente.",
            }), 400

        try:

            mes = int(mes)
            ano = int(ano)

        except (TypeError, ValueError):

            return jsonify({
                "sucesso": False,
                "erro": "Mês ou ano inválido.",
            }), 400

        if mes < 1 or mes > 12:

            return jsonify({
                "sucesso": False,
                "erro": "Mês inválido.",
            }), 400

        # =====================================================
        # REALIZA A ANÁLISE
        # =====================================================

        resultado = analisar_cliente(
            base=base,
            mes=mes,
            ano=ano,
        )

        # =====================================================
        # GERA PLANILHA
        # =====================================================

        planilha = gerar_planilha_analise(
            resultado
        )

        # =====================================================
        # NOME DO ARQUIVO
        # =====================================================

        meses = [
            "janeiro",
            "fevereiro",
            "marco",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
        ]

        nome_empresa = (
            resultado
            .get(
                "nome_empresa",
                base,
            )
            .strip()
            .replace(" ", "_")
        )

        nome_arquivo = (
            f"analise_"
            f"{nome_empresa}_"
            f"{meses[mes - 1]}_"
            f"{ano}.xlsx"
        )

        # =====================================================
        # DOWNLOAD
        # =====================================================

        return send_file(
            planilha,
            as_attachment=True,
            download_name=nome_arquivo,
            mimetype=(
                "application/"
                "vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )

    except Exception as erro:

        app.logger.exception(
            "Erro ao gerar planilha da análise"
        )

        return jsonify({
            "sucesso": False,
            "erro": (
                "Não foi possível gerar "
                "a planilha."
            ),
        }), 500

# =========================================================
# FATURAMENTO
# =========================================================

@app.route(
    "/api/faturamento",
    methods=["POST"],
)
def api_faturamento():

    try:

        dados = request.get_json(
            silent=True
        ) or {}

        mes_inicial = dados.get(
            "mes_inicial"
        )

        ano_inicial = dados.get(
            "ano_inicial"
        )

        mes_final = dados.get(
            "mes_final"
        )

        ano_final = dados.get(
            "ano_final"
        )

        # =====================================================
        # VALIDAÇÕES
        # =====================================================

        try:

            mes_inicial = int(
                mes_inicial
            )

            ano_inicial = int(
                ano_inicial
            )

            mes_final = int(
                mes_final
            )

            ano_final = int(
                ano_final
            )

        except (
            TypeError,
            ValueError,
        ):

            return jsonify({
                "sucesso": False,
                "erro": (
                    "Período inválido."
                ),
            }), 400


        if not (
            1 <= mes_inicial <= 12
        ):

            return jsonify({
                "sucesso": False,
                "erro": (
                    "Mês inicial inválido."
                ),
            }), 400


        if not (
            1 <= mes_final <= 12
        ):

            return jsonify({
                "sucesso": False,
                "erro": (
                    "Mês final inválido."
                ),
            }), 400


        periodo_inicial = (
            ano_inicial * 12
            + mes_inicial
        )

        periodo_final = (
            ano_final * 12
            + mes_final
        )


        if (
            periodo_final
            <
            periodo_inicial
        ):

            return jsonify({
                "sucesso": False,
                "erro": (
                    "O período final não pode ser "
                    "anterior ao período inicial."
                ),
            }), 400


        # =====================================================
        # CONSULTAR FATURAMENTO
        # =====================================================

        resultado = (
            consultar_faturamento(
                mes_inicial=mes_inicial,
                ano_inicial=ano_inicial,
                mes_final=mes_final,
                ano_final=ano_final,
            )
        )


        # =====================================================
        # GUARDAR RESULTADO COMPLETO PARA O EXCEL
        # =====================================================

        chave_cache = (
            mes_inicial,
            ano_inicial,
            mes_final,
            ano_final,
        )

        cache_faturamento[
            chave_cache
        ] = resultado


        # =====================================================
        # RESPOSTA PARA A TELA
        #
        # Não enviamos detalhado nem ranking completo
        # para o navegador.
        # =====================================================

        resposta = {

            "sucesso": True,

            "mes_inicial":
                resultado[
                    "mes_inicial"
                ],

            "ano_inicial":
                resultado[
                    "ano_inicial"
                ],

            "mes_final":
                resultado[
                    "mes_final"
                ],

            "ano_final":
                resultado[
                    "ano_final"
                ],

            "demonstracao": True,

            "faturamento_total":
                resultado[
                    "faturamento_total"
                ],

            "ocs_faturadas":
                resultado[
                    "ocs_faturadas"
                ],

            "bases_consultadas":
                resultado[
                    "bases_consultadas"
                ],

            "bases_com_faturamento":
                resultado[
                    "bases_com_faturamento"
                ],

            "bases_sem_faturamento":
                resultado[
                    "bases_sem_faturamento"
                ],

            "bases_com_erro":
                resultado[
                    "bases_com_erro"
                ],

            "faturamento_mensal":
                resultado[
                    "faturamento_mensal"
                ],

            # Tela mostra somente Top 5
            "ranking":
                resultado[
                    "ranking"
                ][:5],
        }


        return jsonify(
            resposta
        )


    except ValueError as erro:

        return jsonify({
            "sucesso": False,
            "erro": str(
                erro
            ),
        }), 400


    except Exception as erro:

        app.logger.exception(
            "Erro ao consultar faturamento"
        )

        return jsonify({
            "sucesso": False,
            "erro": (
                "Não foi possível consultar "
                "o faturamento."
            ),
        }), 500

# =========================================================
# BAIXAR PLANILHA - FATURAMENTO
# =========================================================

@app.route(
    "/api/faturamento/baixar",
    methods=["POST"],
)
def baixar_planilha_faturamento():

    try:

        dados = request.get_json(
            silent=True
        ) or {}

        mes_inicial = dados.get(
            "mes_inicial"
        )

        ano_inicial = dados.get(
            "ano_inicial"
        )

        mes_final = dados.get(
            "mes_final"
        )

        ano_final = dados.get(
            "ano_final"
        )


        # =====================================================
        # VALIDAÇÃO
        # =====================================================

        try:

            mes_inicial = int(
                mes_inicial
            )

            ano_inicial = int(
                ano_inicial
            )

            mes_final = int(
                mes_final
            )

            ano_final = int(
                ano_final
            )

        except (
            TypeError,
            ValueError,
        ):

            return jsonify({
                "sucesso": False,
                "erro": "Período inválido.",
            }), 400


        if not (
            1 <= mes_inicial <= 12
        ):

            return jsonify({
                "sucesso": False,
                "erro": "Mês inicial inválido.",
            }), 400


        if not (
            1 <= mes_final <= 12
        ):

            return jsonify({
                "sucesso": False,
                "erro": "Mês final inválido.",
            }), 400


        periodo_inicial = (
            ano_inicial * 12
            + mes_inicial
        )

        periodo_final = (
            ano_final * 12
            + mes_final
        )


        if (
            periodo_final
            <
            periodo_inicial
        ):

            return jsonify({
                "sucesso": False,
                "erro": (
                    "O período final não pode ser "
                    "anterior ao período inicial."
                ),
            }), 400


        # =====================================================
        # RECUPERAR RESULTADO DA CONSULTA JÁ REALIZADA
        # =====================================================

        chave_cache = (
            mes_inicial,
            ano_inicial,
            mes_final,
            ano_final,
        )

        resultado = cache_faturamento.get(
            chave_cache
        )

        
        # =====================================================
        # CASO NÃO EXISTA NO CACHE
        # =====================================================

        if resultado is None:

            resultado = consultar_faturamento(
                mes_inicial=mes_inicial,
                ano_inicial=ano_inicial,
                mes_final=mes_final,
                ano_final=ano_final,
            )

            cache_faturamento[
                chave_cache
            ] = resultado

        # =====================================================
        # GERAR EXCEL
        # =====================================================

        planilha = gerar_planilha_faturamento(
            resultado
        )


        # =====================================================
        # NOME DO ARQUIVO
        # =====================================================

        meses = [
            "",
            "janeiro",
            "fevereiro",
            "marco",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
        ]


        nome_arquivo = (
            f"faturamento_"
            f"{meses[mes_inicial]}_"
            f"{ano_inicial}_a_"
            f"{meses[mes_final]}_"
            f"{ano_final}.xlsx"
        )


        # =====================================================
        # DOWNLOAD
        # =====================================================

        return send_file(
            planilha,
            as_attachment=True,
            download_name=nome_arquivo,
            mimetype=(
                "application/"
                "vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )


    except ValueError as erro:

        return jsonify({
            "sucesso": False,
            "erro": str(erro),
        }), 400


    except Exception as erro:

        app.logger.exception(
            "Erro ao gerar planilha de faturamento"
        )

        return jsonify({
            "sucesso": False,
            "erro": (
                "Não foi possível gerar "
                "a planilha de faturamento."
            ),
        }), 500


    


# =========================================================
# DIAGNÓSTICO DE CLIENTE - INICIAR
# =========================================================

@app.route(
    "/api/diagnostico-cliente/iniciar",
    methods=["POST"],
)
def iniciar_diagnostico_cliente():

    dados = request.get_json(
        silent=True
    ) or {}


    base = str(
        dados.get(
            "base",
            "",
        )
    ).strip().lower()


    if not base:

        return jsonify({
            "sucesso": False,
            "erro": "Informe a base do cliente.",
        }), 400


    tarefa_id = uuid4().hex


    with tarefas_diagnostico_cliente_lock:

        tarefas_diagnostico_cliente[
            tarefa_id
        ] = {
            "id": tarefa_id,
            "base": base,
            "status": "aguardando",
            "mensagem": "Aguardando início...",
            "resultado": None,
            "erro": None,
        }


    thread = Thread(
        target=executar_tarefa_diagnostico,
        args=(
            tarefa_id,
            base,
        ),
        daemon=True,
    )


    thread.start()


    return jsonify({
        "sucesso": True,
        "tarefa_id": tarefa_id,
    }), 202

# =========================================================
# DIAGNÓSTICO DE CLIENTE - STATUS
# =========================================================

@app.route(
    "/api/diagnostico-cliente/status/<tarefa_id>",
    methods=["GET"],
)
def status_diagnostico_cliente(
    tarefa_id,
):

    with tarefas_diagnostico_cliente_lock:

        tarefa = tarefas_diagnostico_cliente.get(
            tarefa_id
        )


        if not tarefa:

            return jsonify({
                "sucesso": False,
                "erro": (
                    "Diagnóstico não encontrado."
                ),
            }), 404


        dados = deepcopy(
            tarefa
        )


    return jsonify(
        dados
    )

# =========================================================
# ATUALIZAR PROGRESSO - DIAGNÓSTICO DE CLIENTE
# =========================================================

def atualizar_progresso_diagnostico(
    tarefa_id,
    status,
):

    with tarefas_diagnostico_cliente_lock:

        tarefa = tarefas_diagnostico_cliente.get(
            tarefa_id
        )

        if not tarefa:
            return

        tarefa["mensagem"] = status

# =========================================================
# EXECUTAR DIAGNÓSTICO EM BACKGROUND
# =========================================================

def executar_tarefa_diagnostico(
    tarefa_id,
    base,
):

    try:

        with tarefas_diagnostico_cliente_lock:

            tarefa = tarefas_diagnostico_cliente.get(
                tarefa_id
            )

            if not tarefa:
                return

            tarefa["status"] = "processando"
            tarefa["mensagem"] = (
                "Iniciando diagnóstico..."
            )


        # =================================================
        # SERVICE REAL
        # =================================================

        resultado = diagnosticar_cliente(
            base=base,
            progresso_callback=(
                lambda status:
                atualizar_progresso_diagnostico(
                    tarefa_id=tarefa_id,
                    status=status,
                )
            ),
        )


        # =================================================
        # CONCLUÍDO
        # =================================================

        with tarefas_diagnostico_cliente_lock:

            tarefa = tarefas_diagnostico_cliente.get(
                tarefa_id
            )

            if not tarefa:
                return

            tarefa["status"] = "concluido"
            tarefa["mensagem"] = (
                "Diagnóstico concluído."
            )
            tarefa["resultado"] = resultado


    except Exception as erro:

        mensagem_erro = "Não foi possível realizar o diagnóstico. Tente novamente com um cliente fictício."

        app.logger.exception(
            f"Erro no diagnóstico da base {base}"
        )


        with tarefas_diagnostico_cliente_lock:

            tarefa = tarefas_diagnostico_cliente.get(
                tarefa_id
            )

            if tarefa:

                tarefa["status"] = "erro"
                tarefa["erro"] = mensagem_erro
                tarefa["mensagem"] = mensagem_erro

                


# =========================================================
# INICIAR SERVIDOR
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )
