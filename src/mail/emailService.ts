// src\mail\emailService.ts

class EmailService {
  static sendEmailWithAttachment(
    recipientEmail: string,
    emailCC: string | null | undefined,
    municipio: string,
    uf: string,
    pdfFile: GoogleAppsScript.Drive.File,
  ): void {
    const subject = `MSL - Apresentação de Precificação - ${municipio}/${uf}`;
    const htmlBody = getEmailHtml(municipio, uf);
    const to = recipientEmail.replace(/;/g, ",").trim();
    const ccList: string[] = [];

    ccList.push(CONFIG.FIXED_CC_EMAIL);

    if (emailCC && emailCC.trim() !== "") {
      ccList.push(emailCC.replace(/;/g, ",").trim());
    }

    const cc = ccList.join(",");

    MailApp.sendEmail({
      to: to,
      cc: cc,
      subject: subject,
      htmlBody: htmlBody,
      attachments: [pdfFile.getAs(MimeType.PDF)],
    });
  }
}
