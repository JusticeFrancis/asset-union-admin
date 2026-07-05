import { Admin, Notification, User } from "@/models";
import { sendMail, escapeHtml } from "@/lib/server/mailer";

function roleFromAudience(audience: string) {
  const map: Record<string, string> = {
    "Super Admin": "super_admin",
    "Property Managers": "property_manager",
    "User Manager": "user_manager",
    "Rent Managers": "rent_manager",
  };
  return map[audience];
}

export async function deliverNotification(notification: any) {
  const channels: string[] = notification.channels || [];
  let emailRecipients: string[] = [];
  if (channels.includes("email")) {
    if (notification.audience === "Investors") {
      const users = await User.find({ accountType: "investor", status: "active" }).select("email").lean();
      emailRecipients = users.map((item: any) => item.email);
    } else if (notification.audience === "All") {
      const [users, admins] = await Promise.all([
        User.find({ status: "active" }).select("email").lean(),
        Admin.find({ status: "active" }).select("email").lean(),
      ]);
      emailRecipients = [...users, ...admins].map((item: any) => item.email);
    } else {
      const role = roleFromAudience(notification.audience);
      const adminFilter = role
        ? { status: "active", role }
        : { status: "active", role: "custom", customRoleName: notification.audience };
      const admins = await Admin.find(adminFilter).select("email").lean();
      emailRecipients = admins.map((item: any) => item.email);
    }
    emailRecipients = [...new Set(emailRecipients.filter(Boolean))];
    if (emailRecipients.length) {
      const senderMailbox = process.env.GMAIL_USER || emailRecipients[0];
      await sendMail({
        to: senderMailbox,
        bcc: emailRecipients.filter((email) => email !== senderMailbox),
        subject: notification.title,
        text: notification.message,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h2>${escapeHtml(notification.title)}</h2><p>${escapeHtml(notification.message).replace(/\n/g, "<br>")}</p></div>`,
      });
    }
  }
  notification.status = "sent";
  notification.sentAt = new Date();
  notification.recipientsCount = emailRecipients.length;
  notification.emailSentCount = emailRecipients.length;
  notification.error = "";
  await notification.save();
  return notification;
}

export async function dispatchDueNotifications() {
  const due = await Notification.find({
    status: "scheduled",
    scheduledFor: { $lte: new Date() },
  });
  const results = [];
  for (const item of due) {
    try {
      results.push(await deliverNotification(item));
    } catch (error) {
      item.status = "failed";
      item.error = error instanceof Error ? error.message : "Delivery failed";
      await item.save();
    }
  }
  return results;
}
