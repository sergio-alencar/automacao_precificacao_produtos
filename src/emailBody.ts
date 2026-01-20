// src/emailBody.ts

const SENDER = {
  NAME: "Gabriela Leão",
  POSITION: "Assistente Comercial",
  EMAIL: "gabriela.leao@msladvocacia.com.br",
  PHONE_DISPLAY: "(31) 99840-6545",
  PHONE_WHATSAPP: "5531998406545",
  SITE_DISPLAY: "www.msladvocacia.com.br",
  URL_SITE: "https://www.msladvocacia.com.br/",
  URL_LINKEDIN: "https://www.linkedin.com/company/msladv",
  URL_INSTAGRAM: "https://www.instagram.com/msl_adv/",
  URL_TWITTER: "https://twitter.com/msl_adv",
} as const;

function getEmailHtml(municipio: string, uf: string): string {
  return `
    Olá,
    <br>
    Segue em anexo apresentação comercial para a Prefeitura Municipal de ${municipio}/${uf}.
    <br>
    Atenciosamente,
    <br><br>
    <table cellpadding="0" cellspacing="0" class="ws-tpl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.25; padding-bottom: 5px; color: #000;">
        <tbody>
            <tr>
                <td style="vertical-align: middle; padding: 0.01px 14px 0.01px 0.01px;">
                    <table cellpadding="0" cellspacing="0" class="ws-tpl-photo" style="width:170px">
                        <tbody>
                            <tr>
                                <td>
                                    <a href="http://www.msladvocacia.com.br" style="display: block" target="_blank">
                                        <img src="https://lh3.googleusercontent.com/d/1SJwwxZrxqHMZcihM-ZgVab_lWjNq-M2S=s220" width="100%" style="width: 100 border-radius: 0; display: block;">
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                <td class="ws-tpl-separator" height="1" width="0" style="width: 0px; padding: 0.01px; border-right: 1px solid #bdbdbd; height: 1px; font-size: 1pt;">
                    &nbsp;
                </td>
            </td>

            <td class="contact" valign="top" style="vertical-align: center; padding: 0.01px 0.01px 0.01px 14px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="min-width: 300px; font-family: Arial, Helvetica, sans-serif;">
                    <tbody>
                        <tr>
                            <td style="line-height: 1.4; white-space: nowrap;">
                                <span class="ws-tpl-name" data-asc="name" style="color-scheme: light only; color: #141a19; font-size: 16px; font-family: Arial, Helvetica, sans-serif; font-weight: 700;" data-acs="name">
                                    ${SENDER.NAME}
                                </span>
                                <br />
                                <span class="ws-tpl-title" data-acs="title" style="color-scheme: light only; font-size: 13px; letter-spacing: 0.1px; color: #4e4b4c; font-family: Arial, Helvetica, sans-serif; text-transform: initial; color: #212121;">
                                    ${SENDER.POSITION}
                                    <br />
                                    Montalvão & Souza Lima | Advocacia de Negócios
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td style="line-height: 0; padding: 8px 0.1px 8px 0.1px;">
                                <table cellspacing="0" cellpadding="0" style="width: 100%;">
                                    <tbody>
                                        <tr>
                                            <td class="ws-tpl-separator" style="line-height: 0; font-size: 1pt; border-bottom: 1px solid #d3d3d3;"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="line-height: 0;">
                                <table cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                            <td style="line-height: 0.1px; padding-bottom: 8px; white-space: nowrap;">
                                                <table class="ws-tpl-telefone" cellpadding="0" cellspacing="0" style="line-height: 14px; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-weight: 700; padding: 0.01px 2px; font-size: 12px; color: #141a19;">
                                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                                <img src="https://cdn.gifo.wisestamp.com/s/rich-field-phone-1/141a19/26/trans.png" style="vertical-align: -2px; line-height: 1.2; width: 13px;" width="13">
                                                            </td>

                                                            <td style="width: 5px; font-size: 1pt; line-height: 0;" width="5">
                                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                                &nbsp;
                                                            </td>

                                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
                                                                <a href="https://wa.me/${SENDER.PHONE_WHATSAPP}" target="_blank" style="text-decoration: none;">
                                                                    <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                                    <span data-acs="telefone" style="line-height: 1.2; color-scheme: light only; color: #212121; font-family: Arial, Helvetica, sans-serif; white-space: nowrap; font-size: 12px;">
                                                                        ${SENDER.PHONE_DISPLAY}
                                                                    </span>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="line-height: 0.1px; padding-bottom: 8px; white-space: nowrap;">
                                                <table class="ws-tpl-site" cellpadding="0" cellspacing="0" style="line-height: 14px; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-weight: 700; padding: 0.01px 2px; font-size: 12px; color: #141a19;">
                                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                                <img src="https://cdn.gifo.wisestamp.com/s/rich-field-website-1/141a19/26/trans.png" style="vertical-align: -2px; line-height: 1.2; width: 13px;" width="13">
                                            </td>

                                            <td style="width: 5px; font-size: 1pt; line-height: 0;" width="5">
                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                &nbsp;
                                            </td>

                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                <a href="${SENDER.URL_SITE}" target="_blank" style="color-scheme: light only; font-size: 12px; font-family: Arial, Helvetica, sans-serif; text-decoration: none;">
                                                    <span data-acs="site" style="line-height: 1.2; color-scheme: light only; color: #212121; font-family: Arial, Helvetica, sans-serif; white-space: nowrap; font-size: 12px; ">
                                                        ${SENDER.SITE_DISPLAY}
                                                    </span>
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="line-height: 1px; padding-bottom: 8px; white-space: nowrap;">
                                <table class="ws-tpl-e-mail" cellpadding="0" cellspacing="0" style="line-height: 14px; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                                    <tbody>
                                        <tr>
                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-weight: 700; padding: 0.01px 2px; font-size: 12px; color: #141a19;">
                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                <img src="https://cdn.gifo.wisestamp.com/s/rich-field-email-1/141a19/26/trans.png" style="vertical-align: -2px; line-height: 1.2; width: 13px;" width="13">
                                            </td>

                                            <td style="width: 5px; font-size: 1pt; line-height: 0" width="5">
                                                <!-- [if mso]><p style="margin: 0.1px; line-height: 14px"><![endif] -->
                                                &nbsp;
                                            </td>

                                            <td style="color-scheme: light only; font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
                                                <!--[if mso]><p style="margin: 0.1px; line-height: 14px"><![endif]-->
                                                <a href="mailto:${SENDER.EMAIL}" target="_blank" style="color-scheme: light only; font-size: 12px; font-family: Arial, Helvetica, sans-serif; text-decoration: none;">
                                                    <span data-acs="e-mail" style="line-height: 1.2; color-scheme: light only; color: #212121; font-family: Arial, Helvetica, sans-serif; white-space: nowrap; font-size: 12px;">
                                                        ${SENDER.EMAIL}
                                                    </span>
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>

        <tr>
            <td style="padding-top: 4px;">
                <table class="ws-tpl-social" cellpadding="0" cellspacing="0" style="width: 100%; font-family: Arial, Helvetica, sans-serif;">
                    <tbody>
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                            <td align="left" style="padding-right: 10px; text-align: center; padding-top: 0;">
                                                <a href="${SENDER.URL_LINKEDIN}" target="_blank">
                                                    <img width="23" height="23" src="https://cdn.gifo.wisestamp.com/s/linkedin/141a19/46/4/background.png" style="float: left; border: none;" border="0">
                                                </a>
                                            </td>

                                            <td align="left" style="padding-right: 10px; text-align: center; padding-top: 0;">
                                                <a href="${SENDER.URL_INSTAGRAM}" target="_blank">
                                                    <img width="23" height="23" src="https://cdn.gifo.wisestamp.com/s/instagram/141a19/46/4/background.png" style="float: left; border: none;" border="0">
                                                </a>
                                            </td>

                                            <td align="left" style="padding-right: 10px; text-align: center; padding-top: 0;">
                                                <a href="${SENDER.URL_TWITTER}" target="_blank">
                                                    <img width="23" height="23" src="https://cdn.gifo.wisestamp.com/s/twitter/141a19/46/4/background.png" style="float: left; border: none;" border="0">
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>

    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tbody>
            <tr>
                <td height="8px" style="line-height: 0; height: 8px;"></td>
            </tr>
        </tbody>
    </table>

    <table cellpadding="0" cellspacing="0" border="0" style="max-width: 493px; width: 100%">
        <tbody>
            <tr>
                <td style="line-height: 0;">
                    <table class="wisestamp_app disclaimer" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; padding-right: 8px; color: gray; border-top: 1px solid gray; font-size: 13px; line-height: none;">
                        <tbody>
                            <tr>
                                <td>
                                    <p style="color: gray; text-align: left; font-size: 10px; margin: 0; line-height: 120%; padding-top: 10px; font-family: Arial, Helvetica, sans-serif;">
                                        IMPORTANTE: O conteúdo deste e-mail e quaisquer anexos são confidenciais. Eles são destinados apenas ao(s) destinatário(s). Se você recebeu este e-mail por engano, notifique o remetente imediatamente e não divulgue o conteúdo a ninguém ou faça cópias do mesmo.
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tbody>
                            <tr>
                                <td style="line-height: 0; height: 16px; max-width: 600px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    </td>
`;
}
