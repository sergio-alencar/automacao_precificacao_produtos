// src/EmailService.gs

const EmailService = {
  /**
   * @param {string} recipientEmail
   * @param {string} emailCC
   * @param {string} municipio
   * @param {string} uf
   * @param {GoogleAppsScript.Drive.File} pdfFile
   */
  sendEmailWithAttachment(recipientEmail, emailCC, municipio, uf, pdfFile) {
    const subject = `MSL - Apresentação de Precificação - ${municipio}/${uf}`;
    const body = EMAIL_BODY.replace("{{MUNICIPIO}}", municipio).replace("{{UF}}", uf);
    const to = recipientEmail.replace(/;/g, ",");
    const cc = emailCC ? emailCC.replace(/;/g, ",") : null;

    MailApp.sendEmail({
      to: to,
      cc: cc,
      subject: subject,
      htmlBody: body,
      attachments: [pdfFile.getAs(MimeType.PDF)],
    });
  },
};
