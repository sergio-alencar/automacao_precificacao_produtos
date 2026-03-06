// apps_script\mail\notificationTemplates.ts

class NotificationTemplates {
  static getAdminErrorHtml(
    cityName: string,
    row: number,
    errorMessage: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3 style="color: #d9534f;">Erro ao processar apresentação</h3>
        <p><strong>Município:</strong> ${cityName}</p>
        <p><strong>Linha:</strong> ${row}</p>
        <p><strong>Erro:</strong> <span style="color: #d9534f;">${errorMessage}</span></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <i style="color: #777; font-size: 12px;">Mensagem automática do sistema de precificação MSL. 🤖</i>
      </div>
    `;
  }

  static getMissingProductsHtml(
    cityName: string,
    row: number,
    missingProducts: Array<{ name: string }>,
  ): string {
    const listHtml = missingProducts.map((p) => `<li>${p.name}</li>`).join("");

    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3 style="color: #f0ad4e;">Atenção: Produtos não calculados</h3>
        <p>A apresentação para <strong>${cityName}</strong> (linha ${row}) foi gerada, mas os seguintes produtos solicitados não retornaram valor (ficaram zerados ou deram erro de cálculo):</p>
        <ul style="background-color: #f9f9f9; padding: 15px 30px; border-radius: 5px;">
          ${listHtml}
        </ul>
        <p><i>Verifique se os dados de entrada (receita, população, conta de luz) estão preenchidos corretamente na planilha.</i></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <i style="color: #777; font-size: 12px;">Mensagem automática do sistema de precificação MSL. 🤖</i>
      </div>
    `;
  }
}
