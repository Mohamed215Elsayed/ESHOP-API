import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1️⃣Create transporter(service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT, // 587 if secure: false, 465 if secure: true
      // secure: process.env.EMAIL_PORT == 465, // auto-detect secure mode
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2️⃣Define email options (like from, to, subject, email content)
    const mailOptions = {
      from: 'E-Shop App <moeid2152000@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3️⃣ Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Email error:', err.message);
    throw new ApiError('Error sending email. Please try again later.', 500);
  }
};
export default sendEmail;
