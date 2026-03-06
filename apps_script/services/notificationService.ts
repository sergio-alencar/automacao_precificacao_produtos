// apps_script\services\notificationService.ts

class NotificationService {
  static sendAdminError(
    cityName: string,
    row: number,
    errorMessage: string,
  ): void {
    try {
      MailApp.sendEmail({
        to: AppConstants.CONFIG.ADMIN_EMAIL,
        subject: `[AUTOMAÇÃO] Erro crítico: ${cityName}`,
        htmlBody: NotificationTemplates.getAdminErrorHtml(
          cityName,
          row,
          errorMessage,
        ),
      });

      console.log(`Admin error email sent for ${cityName} (Row ${row}).`);
    } catch (error) {
      console.error(
        `Failed to send admin error email for ${cityName}:`,
        Utils.getErrorMessage(error),
      );
    }
  }

  static sendMissingProductsAlert(
    cityName: string,
    row: number,
    missingProducts: Array<{ name: string }>,
  ): void {
    try {
      if (!missingProducts || missingProducts.length === 0) {
        return;
      }

      MailApp.sendEmail({
        to: AppConstants.CONFIG.ADMIN_EMAIL,
        subject: `[AUTOMAÇÃO] Alerta: Produtos não calculados para ${cityName}`,
        htmlBody: NotificationTemplates.getMissingProductsHtml(
          cityName,
          row,
          missingProducts,
        ),
      });

      console.log(`Missing products alert sent for ${cityName} (Row ${row}).`);
    } catch (error) {
      console.error(
        `Failed to send missing products alert for ${cityName}:`,
        Utils.getErrorMessage(error),
      );
    }
  }
}
