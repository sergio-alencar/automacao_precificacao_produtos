// apps_script\services\emailService.ts

class EmailService {
  static sendEmailWithAttachment(
    recipientEmail: string,
    emailCC: string | null | undefined,
    cityName: string,
    state: string,
    pdfFile: GoogleAppsScript.Drive.File,
  ): void {
    const subject = `MSL - Apresentação de Precificação - ${cityName}/${state}`;
    const htmlBody = getEmailHtml(cityName, state);

    const to = this.normalizeEmails(recipientEmail);

    const ccList: string[] = [];
    ccList.push(AppConstants.CONFIG.FIXED_CC_EMAIL);

    if (emailCC) {
      const cleanCC = this.normalizeEmails(emailCC);
      if (cleanCC) {
        ccList.push(cleanCC);
      }
    }

    const cc = ccList.join(",");

    try {
      MailApp.sendEmail({
        to: to,
        cc: cc,
        subject: subject,
        htmlBody: htmlBody,
        attachments: [pdfFile.getAs(MimeType.PDF)],
      });

      console.log(
        `Email successfully sent to ${to} (CC: ${cc}) for ${cityName}/${state}`,
      );
    } catch (error) {
      const errorMsg = Utils.getErrorMessage(error);
      console.error(`Failed to send email to ${to}:`, errorMsg);
      throw new Error(`Falha ao enviar e-mail: ${errorMsg}`);
    }
  }

  private static normalizeEmails(rawEmails: string): string {
    if (!rawEmails) {
      return "";
    }

    return rawEmails
      .replace(/;/g, ",")
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .join(",");
  }
}
