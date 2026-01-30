// src/services/NotificationService.ts

class NotificationService {
  static sendAdminError(municipio: string, row: number, errorMessage: string) {
    try {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: `[AUTOMAÇÃO] Erro crítico: ${municipio}`,
        htmlBody: `
          <h3>Erro ao processar apresentação</h3>
          <p><strong>Município:</strong> ${municipio}</p>
          <p><strong>Linha:</strong> ${row}</p>
          <p><strong>Erro:</strong> ${errorMessage}</p>
          <br>
          <i>Mensagem automática do sistema. 🤖</i>
        `,
      });
    } catch (e) {
      console.error("Failed to send admin error email.");
    }
  }

  static sendMissingProductsAlert(
    municipio: string,
    row: number,
    missingProducts: Array<{ name: string }>,
  ) {
    try {
      let listHtml = "<ul>";
      missingProducts.forEach((p) => (listHtml += `<li>${p.name}</li>`));
      listHtml += "</ul>";

      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: `[AUTOMAÇÃO] Alerta: Produtos não calculados para ${municipio}`,
        htmlBody: `
        <h3>Atenção</h3>
        <p>A apresentação para <strong>${municipio}</strong> (linha ${row}) foi gerada, mas os seguintes produtos solicitados não retornaram valor (ficaram zerados ou erro de cálculo):</p>
        ${listHtml}
        <br>
        <i>Verifique se os dados de entrada (receita, população, conta de luz) estão preenchidos corretamente.</i>
        `,
      });
    } catch (e) {
      console.error("Failed to send missing products alert.");
    }
  }
}
