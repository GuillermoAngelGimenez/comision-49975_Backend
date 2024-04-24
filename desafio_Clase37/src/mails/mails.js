import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport(
    {
        service: 'gmail',   
        port: 587,
        auth: {
            user: 'guille.gimenez42.211281@gmail.com',
            pass: 'ceeltqsgtyugcedb'
        },
        tls: {
            rejectUnauthorized: false
        }
    }
)

export const enviarEmail = (to, subject, message) => {
    return transport.sendMail(
        {
            to, 
            subject, 
            html: message
        }
    )

}