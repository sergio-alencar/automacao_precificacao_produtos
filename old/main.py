# src/main.py

import os
import logging
import old.product_calculator as calc
from generators import pptx_generator
import old.logger_setup as logger_setup
from typing import List, Tuple, Optional, Dict, Any


logger = logging.getLogger(__name__)

PRODUCT_REGISTRY = {
    "CFURH": {
        "name": "CFURH – Compensação Recursos Hídricos",
        "func": calc.calculate_cfurh,
        "inputs": [
            "municipal_flooded_area_km2",
            "energy_generated_mwh",
        ],
    },
    "CFEM": {
        "name": "CFEM – Exploração Recursos Minerais",
        "func": calc.calculate_cfem,
        "inputs": [
            "cfem_last_year_revenue",
            "state_uf",
        ],
    },
    "IRRF": {
        "name": "IRRF – Imposto de Renda Retido na Fonte",
        "func": calc.calculate_irrf,
        "inputs": ["annual_current_revenue"],
    },
    "VERBAS": {
        "name": "Verbas Indenizatórias",
        "func": calc.calculate_verbas,
        "inputs": [
            "num_servidores",
            "folha_mensal",
        ],
    },
    "RAT_FAP": {
        "name": "RAT/FAP",
        "func": calc.calculate_rat_fap,
        "inputs": ["folha_mensal"],
    },
    "FUNDEB_VAAR": {
        "name": "FUNDEB VAAR",
        "func": calc.calculate_fundeb_vaar,
        "inputs": ["num_alunos"],
    },
    "FUNDEB_VAAT": {
        "name": "FUNDEB VAAT",
        "func": calc.calculate_fundeb_vaat,
        "inputs": ["num_alunos"],
    },
    "FPM": {
        "name": "FPM",
        "func": calc.calculate_fpm,
        "inputs": ["annual_current_revenue"],
    },
    "VAF": {
        "name": "VAF",
        "func": calc.calculate_vaf,
        "inputs": ["icms_anual"],
    },
    "TUNEP": {
        "name": "TUNEP",
        "func": calc.calculate_tunep,
        "inputs": ["populacao"],
    },
    "COMPREV": {
        "name": "COMPREV",
        "func": calc.calculate_comprev,
        "inputs": [
            "populacao",
            "possui_rpps",
        ],
    },
}


def run_pricing_process(
    municipal_name: str,
    state_uf: str,
    all_inputs: Dict[str, Any],
    selected_products: Dict[str, bool],
    template_pptx_path: str,
):
    logger.info(f"--- Processing Scenario: {municipal_name}/{state_uf} ---")

    final_results: List[Tuple[str, Optional[float]]] = []

    for key, is_selected in selected_products.items():
        if not is_selected:
            continue

        if key not in PRODUCT_REGISTRY:
            logger.warning(f"Product '{key}' selected but not in PRODUCT_REGISTRY.")
            continue

        product = PRODUCT_REGISTRY[key]
        product_name = product["name"]
        calc_func = product["func"]
        required_inputs = product["inputs"]

        kwargs = {}
        missing_input = False

        for input_key in required_inputs:
            if input_key == "state_uf":
                kwargs["state_uf"] = state_uf
                continue

            value = all_inputs.get(input_key)

            if value is None:
                logger.error(f"Input ausente para '{product_name}' ('{key}'): '{input_key}'")
                missing_input = True
                break

            kwargs[input_key] = value

        if missing_input:
            final_results.append((product_name, None))
            continue

        try:
            logger.info(f"Calculating {product_name}...")
            result_value = calc_func(**kwargs)
            final_results.append((product_name, result_value))

            if result_value is not None:
                logger.info(f"{product_name} Value: {result_value:,.2f}")
            else:
                logger.info(f"{product_name} Value: Not Applicable")

        except calc.InputError as e:
            logger.error(f"INPUT ERROR calculating {product_name}: {e}")
            final_results.append((product_name, None))
        except Exception as e:
            logger.error(f"UNEXPECTED ERROR calculating {product_name}: {e}", exc_info=True)
            final_results.append((product_name, None))

    if not final_results:
        logger.warning("No products selected or calculated. PPTX will not be generated.")
        return

    output_pptx_filename = f"Apresentacao_MSL_{municipal_name.replace(' ', '_')}_{state_uf}.pptx"

    try:
        pptx_generator.generate_pptx_presentation(
            template_path=template_pptx_path,
            municipal_name=municipal_name,
            state_uf=state_uf,
            product_results=final_results,
            output_filename=output_pptx_filename,
            export_to_pdf=True,
        )
        logger.info(f"Process finished. Generated PPTX at: {os.path.abspath(output_pptx_filename)}")
    except Exception as e:
        logger.error(f"Fatal error generating PPTX: {e}", exc_info=True)


if __name__ == "__main__":
    logger_setup.setup_logging()

    TEMPLATE_PPTX_PATH = "templates/presentation_template.pptx"

    if not os.path.exists("templates"):
        os.makedirs("templates")
        logger.warning(f"Folder 'templates' created. Please put '{os.path.basename(TEMPLATE_PPTX_PATH)}' inside it.")
    elif not os.path.exists(TEMPLATE_PPTX_PATH):
        logger.warning(
            f"Folder 'templates' exists, but template '{os.path.basename(TEMPLATE_PPTX_PATH)}' not found inside it."
        )

    inputs_1 = {
        "municipal_flooded_area_km2": 50.0,
        "energy_generated_mwh": 150_000.0,
        "cfem_last_year_revenue": 1_000_000.0,
        "annual_current_revenue": 500_000_000.0,
        "folha_mensal": 3_000_000.0,
        "num_servidores": 800,
        "num_alunos": 1500,
        "icms_anual": 10_000_000.0,
        "populacao": 7_000,
        "possui_rpps": True,
    }

    selection_1 = {key: True for key in PRODUCT_REGISTRY}

    run_pricing_process(
        municipal_name="Capitólio",
        state_uf="MG",
        all_inputs=inputs_1,
        selected_products=selection_1,
        template_pptx_path=TEMPLATE_PPTX_PATH,
    )

    inputs_2 = {
        "municipal_flooded_area_km2": 20.0,
        "energy_generated_mwh": 100000.0,
        "cfem_last_year_revenue": 10_000_000.0,
        "annual_current_revenue": 300_000_000.0,
        "folha_mensal": 1_500_000.0,
        "num_servidores": 400,
        "num_alunos": 1000,
        "icms_anual": 5_000_000.0,
        "populacao": 25000,
        "possui_rpps": False,
    }

    selection_2 = {
        "CFURH": True,
        "CFEM": True,
        "IRRF": True,
        "VERBAS": False,
        "RAT_FAP": True,
        "FUNDEB_VAAR": False,
        "FUNDEB_VAAT": False,
        "FPM": True,
        "VAF": False,
        "TUNEP": True,
        "COMPREV": True,
    }

    run_pricing_process(
        municipal_name="Paraty",
        state_uf="RJ",
        all_inputs=inputs_2,
        selected_products=selection_2,
        template_pptx_path=TEMPLATE_PPTX_PATH,
    )
