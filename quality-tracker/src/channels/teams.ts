/**
 * Microsoft Teams عبر Workflow Webhook (Power Automate: "When a Teams webhook request is received")
 * يُرسل بطاقة Adaptive Card تحتوي على عنوان الرسالة ونصها.
 */
export function adaptiveCard(subject: string, body: string) {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: { width: 'Full' },
          body: [
            { type: 'TextBlock', text: subject, weight: 'Bolder', size: 'Medium', wrap: true, horizontalAlignment: 'Right' },
            { type: 'TextBlock', text: body.replace(/\n/g, '\n\n'), wrap: true, horizontalAlignment: 'Right' },
          ],
        },
      },
    ],
  };
}

export async function sendTeamsWebhook(webhookUrl: string, subject: string, body: string): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adaptiveCard(subject, body)),
  });
  if (!res.ok) throw new Error(`Teams webhook HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** رابط فتح محادثة Teams مباشرة مع الشخص والنص جاهز (للإرسال اليدوي بضغطة واحدة) */
export function teamsDeepLink(userEmail: string, subject: string, body: string): string {
  const msg = `${subject}\n\n${body}`;
  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(userEmail)}&message=${encodeURIComponent(msg)}`;
}
