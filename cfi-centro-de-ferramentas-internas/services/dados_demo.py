from calendar import monthrange
from datetime import date

CLIENTES = (
    {"base": "demo_aurora", "nome": "Loja Aurora (fictícia)"},
    {"base": "demo_boreal", "nome": "Loja Boreal (fictícia)"},
    {"base": "demo_cedro", "nome": "Loja Cedro (fictícia)"},
    {"base": "demo_dalia", "nome": "Loja Dália (fictícia)"},
    {"base": "demo_estrela", "nome": "Loja Estrela (fictícia)"},
    {"base": "demo_lotus", "nome": "Loja Lótus (fictícia)"},
)


def validar_cliente(base):
    if not isinstance(base, str):
        raise ValueError("Selecione um cliente fictício da demonstração.")
    codigo = base.strip().lower()
    for cliente in CLIENTES:
        if cliente["base"] == codigo:
            return dict(cliente)
    raise ValueError("Cliente desconhecido. Escolha um dos clientes fictícios da demonstração.")


def validar_mes(mes, ano):
    try:
        if isinstance(mes, bool) or isinstance(ano, bool):
            raise ValueError
        if str(mes).strip() != str(int(mes)) or str(ano).strip() != str(int(ano)):
            raise ValueError
        mes, ano = int(mes), int(ano)
        if not 1 <= mes <= 12 or not 2000 <= ano <= 2100:
            raise ValueError
    except (TypeError, ValueError, OverflowError):
        raise ValueError("Informe mês de 1 a 12 e ano de 2000 a 2100.") from None
    return mes, ano


def notas_do_mes(base, mes, ano):
    cliente = validar_cliente(base)
    mes, ano = validar_mes(mes, ano)
    indice = next(i for i, item in enumerate(CLIENTES, 1) if item["base"] == cliente["base"])
    # Valores inteiramente artificiais, reproduzíveis para cada cliente e período.
    quantidade = 0 if indice == 6 and mes % 2 else 3 + (indice + mes) % 4
    limite_dia = monthrange(ano, mes)[1]
    return [
        {
            "oc": f"DEMO-{indice:02d}-{ano}{mes:02d}-{numero:02d}",
            "data": date(ano, mes, min(2 + numero * 4, limite_dia)).isoformat(),
            "nro_nf": f"FICTICIA-{indice:02d}-{numero:03d}",
            "valor_centavos": 15000 + indice * 11000 + mes * 1750 + numero * 2375 + (ano % 5) * 800,
        }
        for numero in range(1, quantidade + 1)
    ]


def valor_total(notas):
    return sum(nota["valor_centavos"] for nota in notas) / 100


def estoque_cliente(base):
    cliente = validar_cliente(base)
    indice = next(i for i, item in enumerate(CLIENTES, 1) if item["base"] == cliente["base"])
    return {"controle": 20 + indice * 3, "sob_demanda": 8 + indice,
            "flex": 3 + indice, "baixo": indice + 1, "zerado": indice % 3}
