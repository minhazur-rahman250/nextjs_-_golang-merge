import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:8080',
    );
  }

  async send(recipientEmail: string, type: string, message: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/notifications`, {
          recipientEmail,
          type,
          message,
        }),
      );
      this.logger.log(`Notification পাঠানো হয়েছে: ${recipientEmail} (${type})`);
    } catch (error) {
      // গুরুত্বপূর্ণ: Go service down থাকলেও যেন মূল operation (enroll) ব্যর্থ না হয়
      const err = error as AxiosError;
      this.logger.error(
        `Notification পাঠাতে ব্যর্থ (${recipientEmail}): ${err.message}`,
      );
    }
  }
}