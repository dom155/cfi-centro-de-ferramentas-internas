from datetime import date, timedelta
from services.dados_demo import validar_cliente, notas_do_mes, estoque_cliente


def diagnosticar_cliente(base, progresso_callback=None):
    cliente = validar_cliente(base)
    hoje = date.today()
    if progresso_callback:
        progresso_callback(status="Preparando diagnóstico com dados fictícios...")
    notas = notas_do_mes(base, hoje.month, hoje.year)
    ate_hoje = [nota for nota in notas if nota["data"] <= hoje.isoformat()]
    anteriores = ate_hoje
    if not anteriores:
        mes_anterior = hoje.replace(day=1) - timedelta(days=1)
        anteriores = notas_do_mes(base, mes_anterior.month, mes_anterior.year)
    ultima = anteriores[-1]["data"] if anteriores else None
    estoque = estoque_cliente(base)
    resultado = {
        "sucesso": True, "demonstracao": True,
        "base": cliente["base"], "cliente": cliente["nome"],
        "ultimo_pedido": ultima + " (simulado)" if ultima else None,
        "ultima_nf": ultima + " (simulada)" if ultima else None,
        "pedidos_hoje": sum(nota["data"] == hoje.isoformat() for nota in notas),
        "pendencias": estoque["baixo"] % 4, "estoque_zerado": estoque["zerado"],
        "ultima_movimentacao": "Há 15 minutos (simulação)",
        "ultima_movimentacao_data": hoje.isoformat() + " (simulada)",
    }
    if progresso_callback:
        progresso_callback(status="Diagnóstico fictício concluído.")
    return resultado
