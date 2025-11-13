import { Resend } from "resend"

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
// NOTE: You must verify this domain/email in your Resend account.
const fromEmail = process.env.EMAIL_FROM || "noreply@yourdomain.com"

export async function sendReturnConfirmationEmail(email: string, returnNumber: string, orderNumber: string) {
  const subject = `Return Request Received - #${returnNumber}`
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
          .info-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Return Request Received</h1>
          </div>
          <div class="content">
            <p>Thank you for submitting your return request.</p>
            <div class="info-box">
              <strong>Return Number:</strong> ${returnNumber}<br>
              <strong>Order Number:</strong> ${orderNumber}
            </div>
            <p>We have received your return request and will review it shortly. You will receive updates via email as your return progresses.</p>
            <p>You can track your return status at any time using your return number.</p>
          </div>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `

  if (!resend) {
    console.log("[v0] RESEND_API_KEY not set. Skipping actual email sending.")
    console.log(`[v0] To: ${email}`)
    console.log(`[v0] Subject: ${subject}`)
    return true
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    })
    console.log("[v0] Confirmation email sent successfully via Resend.")
    return true
  } catch (error) {
    console.error("[v0] Failed to send confirmation email:", error)
    return false
  }
}

export async function sendStatusUpdateEmail(email: string, returnNumber: string, status: string, notes?: string) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    SUBMITTED: {
      title: "Return Submitted",
      message: "Your return request has been submitted and is awaiting review.",
    },
    PENDING_APPROVAL: {
      title: "Pending Approval",
      message: "Your return is currently being reviewed by our team.",
    },
    APPROVED: {
      title: "Return Approved",
      message: "Great news! Your return has been approved. Please ship the items back to us.",
    },
    REJECTED: {
      title: "Return Not Approved",
      message: "Unfortunately, your return request could not be approved at this time.",
    },
    ITEMS_RECEIVED: {
      title: "Items Received",
      message: "We have received your returned items and will begin inspection shortly.",
    },
    INSPECTING: {
      title: "Items Being Inspected",
      message: "Our team is currently inspecting your returned items.",
    },
    REFUND_ISSUED: {
      title: "Refund Issued",
      message: "Your refund has been processed and should appear in your account within 5-7 business days.",
    },
    COMPLETED: {
      title: "Return Completed",
      message: "Your return has been completed successfully.",
    },
  }

  const statusInfo = statusMessages[status] || {
    title: "Status Update",
    message: "Your return status has been updated.",
  }

  const subject = `Update on your return #${returnNumber}: ${statusInfo.title}`
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .info-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
          .status { font-size: 18px; font-weight: bold; color: #000; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.title}</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <strong>Return Number:</strong> ${returnNumber}<br>
              <strong>Status:</strong> <span class="status">${status.replace(/_/g, " ")}</span>
            </div>
            <p>${statusInfo.message}</p>
            ${notes ? `<div class="info-box"><strong>Additional Notes:</strong><br>${notes}</div>` : ""}
          </div>
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `

  if (!resend) {
    console.log("[v0] RESEND_API_KEY not set. Skipping actual email sending.")
    console.log(`[v0] To: ${email}`)
    console.log(`[v0] Subject: ${subject}`)
    return true
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    })
    console.log("[v0] Status update email sent successfully via Resend.")
    return true
  } catch (error) {
    console.error("[v0] Failed to send status update email:", error)
    return false
  }
}

export async function sendNewReturnNotificationEmail(
  returnNumber: string,
  customerName: string,
  customerEmail: string,
  orderNumber: string,
  returnId: string
) {
  const adminEmails = ["office@gato-international.com", "it@gatosports.com"]
  const subject = `New Return Request Submitted: #${returnNumber}`
  const adminReturnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://v0-return-management-system.vercel.app"}/admin/returns/${returnId}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
          .info-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Return Request</h1>
          </div>
          <div class="content">
            <p>A new return request has been submitted.</p>
            <div class="info-box">
              <strong>Return Number:</strong> ${returnNumber}<br>
              <strong>Customer:</strong> ${customerName} (${customerEmail})<br>
              <strong>Order Number:</strong> ${orderNumber}
            </div>
            <p>Please review the request in the admin dashboard.</p>
            <a href="${adminReturnUrl}" class="button">View Return</a>
          </div>
          <div class="footer">
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
    </html>
  `

  if (!resend) {
    console.log("[v0] RESEND_API_KEY not set. Skipping actual email sending for admin notification.")
    console.log(`[v0] To: ${adminEmails.join(", ")}`)
    console.log(`[v0] Subject: ${subject}`)
    return true
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject: subject,
      html: htmlContent,
    })
    console.log("[v0] New return notification email sent successfully via Resend.")
    return true
  } catch (error) {
    console.error("[v0] Failed to send new return notification email:", error)
    return false
  }
}