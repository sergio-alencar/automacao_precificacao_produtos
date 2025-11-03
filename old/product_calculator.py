# src/product_calculator.py

import logging
from typing import Optional

logger = logging.getLogger(__name__)

MINIMUM_FLOOR = 500_000.00
CFEM_FLOOR = 2_500_000.00


class InputError(Exception):
    pass


def apply_minimum_floor(value: float) -> float:
    return max(value, MINIMUM_FLOOR)


def calculate_cfurh(
    municipal_flooded_area_km2: float,
    energy_generated_mwh: float,
    tar_ref: float = 79.62,
    total_reservoir_area_km2: float = 250.0,
) -> float:
    if municipal_flooded_area_km2 is None:
        raise InputError("CFURH: 'municipal_flooded_area_km2' é obrigatório.")
    if energy_generated_mwh is None:
        raise InputError("CFURH: 'energy_generated_mwh' é obrigatório.")
    if total_reservoir_area_km2 == 0:
        raise InputError("CFURH: 'total_reservoir_area_km2' não pode ser zero.")

    area_ratio = municipal_flooded_area_km2 / total_reservoir_area_km2
    base_value = energy_generated_mwh * tar_ref * area_ratio
    estimated_value = base_value * 1.2
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_cfem(
    cfem_last_year_revenue: float,
    state_uf: str,
) -> Optional[float]:
    normalized_state = state_uf.strip().upper()
    if normalized_state not in ("MG", "PA"):
        logger.info(f"CFEM: Ignorando. Estado '{normalized_state}' não é MG ou PA.")
        return None

    if cfem_last_year_revenue is None:
        raise InputError("CFEM: 'cfem_last_year_revenue' é obrigatório para MG e PA.")

    base_value = cfem_last_year_revenue * 5 * 0.15
    final_value = max(base_value, CFEM_FLOOR)

    return final_value


def calculate_irrf(annual_current_revenue: float) -> float:
    if annual_current_revenue is None:
        raise InputError("IRRF: 'annual_current_revenue' (RCL) é obrigatório.")

    rcl = annual_current_revenue
    fator_comum = 0.25

    parte1 = rcl * fator_comum * 0.10 * 0.0024
    parte2 = rcl * fator_comum * 0.20 * 0.010
    parte3 = rcl * fator_comum * 0.30 * 0.020
    parte4 = rcl * fator_comum * 0.40 * 0.035

    soma_base = parte1 + parte2 + parte3 + parte4

    estimated_value = soma_base * 5 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_verbas(
    num_servidores: int,
    folha_mensal: float,
) -> float:
    if num_servidores is None:
        raise InputError("VERBAS: 'num_servidores' é obrigatório.")
    if folha_mensal is None:
        raise InputError("VERBAS: 'folha_mensal' é obrigatório.")

    folha_acrescida = folha_mensal * 1.20

    if num_servidores <= 300:
        percentual = 1.00
    elif num_servidores <= 600:
        percentual = 0.90
    elif num_servidores <= 1000:
        percentual = 0.80
    elif num_servidores <= 2000:
        percentual = 0.70
    else:
        percentual = 0.60

    estimated_value = folha_acrescida * percentual
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_rat_fap(folha_mensal: float) -> float:
    if folha_mensal is None:
        raise InputError("RAT/FAP: 'folha_mensal' é obrigatório.")

    estimated_value = folha_mensal * 60 * 0.01 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_fundeb_vaar(num_alunos: int) -> float:
    if num_alunos is None:
        raise InputError("FUNDEB VAAR: 'num_alunos' é obrigatório.")

    estimated_value = num_alunos * 32.50 * 1 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_fundeb_vaat(num_alunos: int) -> float:
    if num_alunos is None:
        raise InputError("FUNDEB VAAT: 'num_alunos' é obrigatório.")

    estimated_value = num_alunos * 97.5 * 2 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_fpm(annual_current_revenue: float) -> float:
    if annual_current_revenue is None:
        raise InputError("FPM: 'annual_current_revenue' (RCL) é obrigatório.")

    estimated_value = annual_current_revenue * 0.03 * 5 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_vaf(icms_anual: float) -> float:
    if icms_anual is None:
        raise InputError("VAF: 'icms_anual' é obrigatório.")

    estimated_value = icms_anual * 0.04 * 5 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_tunep(populacao: int) -> float:
    if populacao is None:
        raise InputError("TUNEP: 'populacao' é obrigatório.")

    estimated_value = populacao * 180 * 5 * 1.15
    final_value = apply_minimum_floor(estimated_value)

    return final_value


def calculate_comprev(populacao: int, possui_rpps: bool) -> Optional[float]:
    if possui_rpps is None:
        raise InputError("COMPREV: 'possui_rpps' (True/False) é obrigatório.")

    if not possui_rpps:
        logger.info("COMPREV: Ignorando. Município não possui RPPS.")
        return None

    if populacao is None:
        raise InputError("COMPREV: 'populacao' é obrigatório se possui RPPS.")

    base_value = (populacao * 0.055) * 2500
    estimated_value = base_value * 1.2
    final_value = apply_minimum_floor(estimated_value)

    return final_value
