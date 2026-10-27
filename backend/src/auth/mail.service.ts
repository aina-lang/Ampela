import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    if (!host) {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST non défini : les codes de connexion seront écrits dans les logs.',
      );
      return;
    }
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: config.get<string>('SMTP_USER'),
        pass: config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtp(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[DEV] Code de connexion pour ${email} : ${code}`);
      return;
    }
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'Ampela <no-reply@ampela.mg>',
      to: email,
      subject: `${code} est votre code Ampela`,
      text:
        `Votre code de connexion Ampela est : ${code}\n\n` +
        `Il expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette ` +
        `demande, ignorez simplement ce message.`,
      html:
        `<div style="font-family:sans-serif;max-width:420px;margin:auto">` +
        `<h2 style="color:#FF7575">Ampela</h2>` +
        `<p>Votre code de connexion :</p>` +
        `<p style="font-size:34px;font-weight:bold;letter-spacing:8px;` +
        `color:#433C47">${code}</p>` +
        `<p style="color:#7A737F">Il expire dans 10 minutes. Si vous n'êtes ` +
        `pas à l'origine de cette demande, ignorez ce message.</p></div>`,
    });
  }
}
