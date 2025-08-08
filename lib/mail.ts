import nodemailer from "nodemailer";

const emailTemplate = (link: string, type: "VERIFY" | "RESET") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password / Verify Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007BFF;
            color: #555555;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .btn:hover {
            background-color: #3399FF;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello,</h1>
        <p>We received a request to ${
          type == "RESET" ? "reset your password" : "verify your email address"
        }. If you made this request, please click the link below:</p>
        <a href="${link}" class="btn">${
    type == "RESET" ? "Reset Password" : "Verify Email"
  }</a>
        <p>If you didn't request this, you can ignore this email.</p>
        <div class="footer">
            <p>Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
    </div>
</body>
</html>
`;
};

const warningEmailTemplate = (
  binCapacity: number,
  material: string,
  location: string | null
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bin Capacity Warning</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello,</h1>
        <p>Please be informed that the <b>${material}</b> bin at <b>${location}</b> is currently <b>${binCapacity.toFixed(
    2
  )}%</b> full.</p>
        <p>You may head to the specified location for the clearing of bins.</p>
        <div class="footer">
            <p>Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
    </div>
</body>
</html>
`;
};
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.BASE_URL}/new-verification?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });
  try {
    await transporter.verify();
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Temasek Polytechnic CEN" <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Account Verification",
      text: `Verify your email here: ${confirmLink}`,
      html: emailTemplate(confirmLink, "VERIFY"),
    });
  } catch (error) {
    console.log(error);
    return;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.BASE_URL}/new-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });
  try {
    await transporter.verify();
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Reset password",
      // html: emailTemplate(resetLink, "RESET"),
      text: "Reset your password here: " + resetLink,
    });
  } catch (error) {
    console.log(error);
    return;
  }
};

export const sendBinWarningEmail = async (
  email: string[],
  binCapacity: number,
  material: string,
  location: string | null
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });
  try {
    await transporter.verify();
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Bin Capacity Information",
      html: warningEmailTemplate(binCapacity, material, location),
    });
  } catch (error) {
    console.log(error);
    return;
  }
};