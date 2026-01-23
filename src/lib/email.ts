import nodemailer from 'nodemailer';

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 발신자 정보
const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@koscom.co.kr';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'KOSCOM 금융영업부 Hub';

// 서비스 URL
const SERVICE_URL = process.env.NEXTAUTH_URL || 'https://securities-intelligence-hub.vercel.app';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// 이메일 발송 함수
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  // 이메일 설정이 없으면 스킵 (개발 환경)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('[Email] SMTP not configured, skipping email to:', to);
    console.log('[Email] Subject:', subject);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // HTML에서 태그 제거
      html,
    });

    console.log('[Email] Sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

// 회원가입 승인 이메일
export async function sendApprovalEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 회원가입이 승인되었습니다';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #1d4ed8; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    .info-box { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KOSCOM 금융영업부 Hub</h1>
    </div>
    <div class="content">
      <h2>안녕하세요, ${userName}님!</h2>
      <p>회원가입 신청이 <strong>승인</strong>되었습니다.</p>
      <p>이제 서비스에 로그인하여 증권사 동향 정보를 확인하실 수 있습니다.</p>

      <div class="info-box">
        <strong>📧 로그인 이메일:</strong> ${userEmail}
      </div>

      <div style="text-align: center;">
        <a href="${SERVICE_URL}/login" class="button">로그인하기</a>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하여 접속해주세요:<br>
        <a href="${SERVICE_URL}/login">${SERVICE_URL}/login</a>
      </p>
    </div>
    <div class="footer">
      <p>본 메일은 발신전용입니다.</p>
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// 회원가입 거절 이메일
export async function sendRejectionEmail(
  userEmail: string,
  userName: string,
  reason?: string
): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 회원가입 신청 결과 안내';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #64748b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 15px 0; color: #991b1b; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KOSCOM 금융영업부 Hub</h1>
    </div>
    <div class="content">
      <h2>안녕하세요, ${userName}님.</h2>
      <p>회원가입 신청이 승인되지 않았습니다.</p>

      ${reason ? `
      <div class="reason-box">
        <strong>📋 사유:</strong><br>
        ${reason}
      </div>
      ` : ''}

      <p>문의사항이 있으시면 관리자에게 연락해 주세요.</p>
    </div>
    <div class="footer">
      <p>본 메일은 발신전용입니다.</p>
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// 계정 정지 이메일
export async function sendSuspensionEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 계정 정지 안내';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KOSCOM 금융영업부 Hub</h1>
    </div>
    <div class="content">
      <h2>안녕하세요, ${userName}님.</h2>
      <p>귀하의 계정이 <strong>정지</strong>되었습니다.</p>
      <p>자세한 내용은 관리자에게 문의해 주세요.</p>
    </div>
    <div class="footer">
      <p>본 메일은 발신전용입니다.</p>
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// 계정 재활성화 이메일
export async function sendReactivationEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 계정이 재활성화되었습니다';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KOSCOM 금융영업부 Hub</h1>
    </div>
    <div class="content">
      <h2>안녕하세요, ${userName}님!</h2>
      <p>계정이 <strong>재활성화</strong>되었습니다.</p>
      <p>다시 서비스를 이용하실 수 있습니다.</p>

      <div style="text-align: center;">
        <a href="${SERVICE_URL}/login" class="button">로그인하기</a>
      </div>
    </div>
    <div class="footer">
      <p>본 메일은 발신전용입니다.</p>
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// 비밀번호 초기화 이메일
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  temporaryPassword: string
): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 비밀번호가 초기화되었습니다';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .password-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center; }
    .password-box .password { font-size: 24px; font-weight: bold; color: #92400e; letter-spacing: 2px; font-family: monospace; }
    .warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 15px 0; color: #991b1b; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KOSCOM 금융영업부 Hub</h1>
    </div>
    <div class="content">
      <h2>안녕하세요, ${userName}님!</h2>
      <p>관리자에 의해 비밀번호가 초기화되었습니다.</p>
      <p>아래 임시 비밀번호로 로그인한 후 반드시 비밀번호를 변경해 주세요.</p>

      <div class="password-box">
        <p style="margin: 0 0 10px 0; color: #92400e;">임시 비밀번호</p>
        <div class="password">${temporaryPassword}</div>
      </div>

      <div class="warning">
        <strong>⚠️ 보안 안내</strong><br>
        임시 비밀번호는 최초 로그인 시 반드시 변경해 주세요.<br>
        본인이 요청하지 않은 경우 관리자에게 문의해 주세요.
      </div>

      <div style="text-align: center;">
        <a href="${SERVICE_URL}/login" class="button">로그인하기</a>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하여 접속해주세요:<br>
        <a href="${SERVICE_URL}/login">${SERVICE_URL}/login</a>
      </p>
    </div>
    <div class="footer">
      <p>본 메일은 발신전용입니다.</p>
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// 신규 가입 신청 알림 (관리자에게)
export async function sendNewRegistrationAlert(
  adminEmail: string,
  newUserName: string,
  newUserEmail: string,
  department?: string
): Promise<boolean> {
  const subject = '[KOSCOM 금융영업부 Hub] 새로운 회원가입 신청';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .info-box { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>새로운 회원가입 신청</h1>
    </div>
    <div class="content">
      <p>새로운 사용자가 회원가입을 신청했습니다.</p>

      <div class="info-box">
        <p><strong>👤 이름:</strong> ${newUserName}</p>
        <p><strong>📧 이메일:</strong> ${newUserEmail}</p>
        ${department ? `<p><strong>🏢 부서:</strong> ${department}</p>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${SERVICE_URL}/admin/users?status=PENDING" class="button">승인 대기 목록 보기</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KOSCOM 금융영업부. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}
