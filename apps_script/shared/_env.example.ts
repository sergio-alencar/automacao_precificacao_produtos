// apps_script\shared\_env.example.ts

interface EnvironmentConfig {
  ESTBAN_FILE_ID: string;
  ESTBAN_SHEET_NAME: string;
  CONFIG: {
    TEMPLATE_ID_DEFAULT: string;
    TEMPLATE_ID_AJF: string;
    OUTPUT_FOLDER_ID: string;
    SHEET_NAME: string;
    ADMIN_EMAIL: string;
    FIXED_CC_EMAIL: string;
  };
  SENDER: {
    NAME: string;
    POSITION: string;
    EMAIL: string;
    PHONE_DISPLAY: string;
    PHONE_WHATSAPP: string;
    SITE_DISPLAY: string;
    URL_SITE: string;
    URL_LINKEDIN: string;
    URL_INSTAGRAM: string;
    URL_TWITTER: string;
  };
}

const ENV_EXAMPLE: EnvironmentConfig = {
  ESTBAN_FILE_ID: "id_here",
  ESTBAN_SHEET_NAME: "Sheet Name",

  CONFIG: {
    TEMPLATE_ID_DEFAULT: "google_slides_template_id",
    TEMPLATE_ID_AJF: "ajf_template_id",
    OUTPUT_FOLDER_ID: "drive_folder_id",
    SHEET_NAME: "respostas_sheet_name",
    ADMIN_EMAIL: "admin_email@domain.com",
    FIXED_CC_EMAIL: "cc_email@domain.com",
  },

  SENDER: {
    NAME: "Sender Name",
    POSITION: "Position",
    EMAIL: "email@domain.com",
    PHONE_DISPLAY: "(XX) XXXXX-XXXX",
    PHONE_WHATSAPP: "55XXXXXXXXXXX",
    SITE_DISPLAY: "www.domain.com",
    URL_SITE: "https://www.domain.com/",
    URL_LINKEDIN: "linkedin_url",
    URL_INSTAGRAM: "instagram_url",
    URL_TWITTER: "twitter_url",
  },
} as const;
