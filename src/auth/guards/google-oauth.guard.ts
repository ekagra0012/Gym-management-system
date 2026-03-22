import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID === 'your_google_client_id' ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret'
    ) {
      return true;
    }
    return super.canActivate(context);
  }
}
