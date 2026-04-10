import nodemailer from "npm:nodemailer";

Deno.serve(async (req) => {
  const { to, subject, message } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASS"),
    },
  });

  try {
    await transporter.sendMail({
      from: `"Spirit-Line" <${Deno.env.get("SMTP_USER")}>`,
      to,
      subject,
      html: message,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});