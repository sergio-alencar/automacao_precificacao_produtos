# src/pdf_writer.py

import locale
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from typing import List, Tuple, Optional
import math

COLOR_MSL_DARK_BLUE = colors.HexColor("#000033")
COLOR_MSL_TEXT = colors.HexColor("#ffffff")
COLOR_MSL_ACCENT = colors.HexColor("#e0e0e0")
COLOR_MSL_HIGHLIGHT = colors.HexColor("#f0f0f0")


def format_currency(value: float) -> str:
    try:
        locale.setlocale(locale.LC_ALL, "pt_BR.UTF-8")
    except locale.Error:
        try:
            locale.setlocale(locale.LC_ALL, "Portuguese_Brazil.1252")
        except locale.Error:
            locale.setlocale(locale.LC_ALL, "")
    return locale.format_string("R$ %.2f", value, grouping=True)


def format_large_currency_summary(value: float) -> str:
    if value < 1_000_000:
        return f"R$ {value/1_000:.1f} MIL"
    else:
        return f"R$ {value/1_000_000:.1f} MILHÕES"


def build_pdf_canvas(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(COLOR_MSL_DARK_BLUE)
    canvas.rect(0, 0, A4[0], A4[1], fill=1)
    canvas.restoreState()


def generate_pricing_pdf(
    municipal_name: str,
    state_uf: str,
    product_results: List[Tuple[str, Optional[float]]],
    output_filename: str = "Precificacao_MSL.pdf",
):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        rightMargin=2 * cm,
        leftmargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    style_h1_white = ParagraphStyle(
        name="H1White",
        parent=styles["h1"],
        textColor=COLOR_MSL_TEXT,
        alignment=TA_CENTER,
        fontSize=18,
        spaceAfter=6,
    )

    style_h2_white = ParagraphStyle(
        name="H2White",
        parent=styles["h2"],
        textColor=COLOR_MSL_ACCENT,
        alignment=TA_CENTER,
        fontSize=14,
        spaceAfter=4,
    )

    style_h1_highlight = ParagraphStyle(
        name="H1Highlight",
        parent=styles["h1"],
        textColor=COLOR_MSL_HIGHLIGHT,
        alignment=TA_CENTER,
        fontSize=28,
        spaceAfter=16,
        fontName="Helvetica-Bold",
    )

    style_table_title = ParagraphStyle(
        name="TableTitle",
        parent=styles["Normal"],
        textColor=COLOR_MSL_ACCENT,
        alignment=TA_CENTER,
        fontSize=10,
        spaceAfter=10,
    )

    style_normal_white = ParagraphStyle(
        name="NormalWhite",
        parent=styles["Normal"],
        textColor=COLOR_MSL_TEXT,
    )

    style_normal_white_right = ParagraphStyle(
        name="NormalWhiteRight",
        parent=style_normal_white,
        alignment=TA_RIGHT,
    )

    style_not_applicable = ParagraphStyle(
        name="NotApplicable",
        parent=style_normal_white_right,
        textColor=colors.HexColor("#999999"),
    )

    style_bold_total = ParagraphStyle(
        name="BoldTotal",
        parent=style_normal_white,
        fontName="Helvetica-Bold",
    )

    style_bold_total_right = ParagraphStyle(
        name="BoldTotalRight",
        parent=style_bold_total,
        alignment=TA_RIGHT,
    )

    flowables = []

    flowables.append(Paragraph("OPORTUNIDADES MSL", style_h1_white))
    flowables.append(Paragraph("NO TOTAL PODEMOS RECUPERAR APROXIMADAMENTE", style_h2_white))

    total_sum = sum(val for _, val in product_results if val is not None)

    total_summary_text = f"{format_large_currency_summary(total_sum)} DE REAIS"
    flowables.append(Paragraph(total_summary_text, style_h1_highlight))

    table_title_text = f"Estimativas de Potenciais de Recuperação - {municipal_name}/{state_uf}"
    flowables.append(Paragraph(table_title_text, style_table_title))

    table_data = []

    for product_name, value in product_results:
        if value is not None:
            table_data.append(
                [
                    Paragraph(product_name, style_normal_white),
                    Paragraph(format_currency(value), style_normal_white_right),
                ]
            )
        else:
            table_data.append(
                [
                    Paragraph(product_name, style_normal_white),
                    Paragraph("Não aplicável", style_not_applicable),
                ]
            )

    table_data.append(
        [
            Paragraph("TOTAL", style_bold_total),
            Paragraph(format_currency(total_sum), style_bold_total_right),
        ]
    )

    table = Table(table_data, colWidths=[11 * cm, 6 * cm])

    style = TableStyle(
        [
            # ("GRID", (0, 0), (-1, -2), 0.5, COLOR_MSL_ACCENT),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, COLOR_MSL_ACCENT),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LINEABOVE", (0, -1), (-1, -1), 1, COLOR_MSL_TEXT),
            ("TOPPADDING", (0, -1), (-1, -1), 10),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ]
    )

    table.setStyle(style)
    flowables.append(table)

    flowables.append(PageBreak())
    flowables.append(Paragraph("Custo para o município", style_h2_white))
    flowables.append(Paragraph("R$ 0", style_h1_highlight))
    flowables.append(
        Paragraph("A atuação é com base no resultado: só haverá pagamento se houver êxito.", style_table_title)
    )

    flowables.append(PageBreak())
    flowables.append(Paragraph("Contato", style_h1_white))
    flowables.append(Paragraph("+55 (31) 2511-2500", style_normal_white_right))
    flowables.append(Paragraph("msladvocacia.com.br", style_normal_white_right))
    flowables.append(Paragraph("contato@msladvocacia.com.br", style_normal_white_right))

    try:
        doc.build(flowables, onFirstPage=build_pdf_canvas, onLaterPages=build_pdf_canvas)
        print(f"PDF log: '{output_filename}' generated successfully (v2 Presentation Style).")
    except Exception as e:
        print(f"PDF log: Error generating PDF: {e}")
