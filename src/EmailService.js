// src/EmailService.gs

const EmailService = {
  /**
   * @param {string} recipientEmail
   * @param {string} municipio
   * @param {string} uf
   * @param {GoogleAppsScript.Drive.File} pdfFile
   */
  sendEmailWithAttachment: function (recipientEmail, municipio, uf, pdfFile) {
    const subject = `MSL - Apresentação de Precificação - ${municipio}/${uf}`;
    const body = `
    Olá,
    <br><br>
    Segue em anexo a apresentação de estimativa de precificação para ${municipio} - ${uf}.
    <br><br>
    Este é um email automático.
    <br><br>
    Atenciosamente,
    <br>
    Equipe MSL
    `;

    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: body,
      attachments: [pdfFile.getAs(MimeType.PDF)],
    });
  },
};
