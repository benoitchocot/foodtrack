import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        // Configure email transporter
        // Support for SMTP or Gmail
        const emailConfig = {
            host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
            port: parseInt(this.configService.get('SMTP_PORT') || '587'),
            secure: this.configService.get('SMTP_SECURE') === 'true', // true for 465, false for other ports
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        };

        if (emailConfig.auth.user && emailConfig.auth.pass) {
            this.transporter = nodemailer.createTransport(emailConfig);
        }
    }

    async sendApprovalEmail(
        to: string,
        submissionId: string,
        recipeTitle: string,
        submitterEmail: string,
        approvalUrl: string,
    ) {
        if (!this.transporter) {
            console.warn('Email not configured. Approval email not sent.');
            console.log(`Approval URL for submission ${submissionId}: ${approvalUrl}`);
            return;
        }

        const mailOptions = {
            from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
            to,
            subject: `[FoodTrack] Nouvelle recette à approuver: ${recipeTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍳 Nouvelle recette à approuver</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour,</p>
                            <p>Une nouvelle recette a été soumise sur FoodTrack et nécessite votre approbation.</p>
                            
                            <h2>Détails de la recette</h2>
                            <ul>
                                <li><strong>Titre:</strong> ${recipeTitle}</li>
                                <li><strong>Soumis par:</strong> ${submitterEmail}</li>
                                <li><strong>ID de soumission:</strong> ${submissionId}</li>
                            </ul>
                            
                            <p>
                                <a href="${approvalUrl}" class="button">Voir et approuver la recette</a>
                            </p>
                            
                            <p>Ou copiez ce lien dans votre navigateur:</p>
                            <p style="word-break: break-all; color: #6b7280;">${approvalUrl}</p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement par FoodTrack.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Approval email sent to ${to} for submission ${submissionId}`);
        } catch (error) {
            console.error('Failed to send approval email:', error);
            throw error;
        }
    }

    async sendReviewEmail(
        to: string,
        recipeTitle: string,
        recipeId: string,
        reviewerEmail: string,
        rating: number,
        comment?: string,
    ) {
        if (!this.transporter) {
            console.warn('Email not configured. Review email not sent.');
            console.log(`New review for recipe ${recipeId} by ${reviewerEmail}: ${rating} stars`);
            return;
        }

        const stars = '⭐'.repeat(rating);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
        const recipeUrl = `${frontendUrl}/recipes/${recipeId}`;

        const mailOptions = {
            from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
            to,
            subject: `[FoodTrack] Nouvel avis sur la recette: ${recipeTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                        .rating { font-size: 24px; margin: 10px 0; }
                        .comment { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #f59e0b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⭐ Nouvel avis sur une recette</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour,</p>
                            <p>Un nouvel avis a été laissé sur une recette de FoodTrack.</p>
                            
                            <h2>Détails de l'avis</h2>
                            <ul>
                                <li><strong>Recette:</strong> ${recipeTitle}</li>
                                <li><strong>Note:</strong> <span class="rating">${stars}</span> (${rating}/5)</li>
                                <li><strong>Par:</strong> ${reviewerEmail}</li>
                            </ul>
                            
                            ${comment ? `
                            <div class="comment">
                                <strong>Commentaire:</strong>
                                <p>${comment.replace(/\n/g, '<br>')}</p>
                            </div>
                            ` : ''}
                            
                            <p>
                                <a href="${recipeUrl}" class="button">Voir la recette</a>
                            </p>
                            
                            <p>Ou copiez ce lien dans votre navigateur:</p>
                            <p style="word-break: break-all; color: #6b7280;">${recipeUrl}</p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement par FoodTrack.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Review email sent to ${to} for recipe ${recipeId}`);
        } catch (error) {
            console.error('Failed to send review email:', error);
            throw error;
        }
    }

    async sendReviewReportEmail(
        to: string,
        recipeTitle: string,
        recipeId: string,
        reviewId: string,
        reporterEmail: string,
        reviewRating: number,
        reviewComment: string | undefined,
        deletionToken: string,
    ) {
        if (!this.transporter) {
            console.warn('Email not configured. Review report email not sent.');
            console.log(`Review ${reviewId} on recipe ${recipeId} reported by ${reporterEmail}`);
            return;
        }

        const stars = '⭐'.repeat(reviewRating);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
        const recipeUrl = `${frontendUrl}/recipes/${recipeId}`;
        const deleteUrl = `${frontendUrl}/reviews/delete/${deletionToken}`;

        const mailOptions = {
            from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
            to,
            subject: `[FoodTrack] Signalement d'un avis sur: ${recipeTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                        .rating { font-size: 24px; margin: 10px 0; }
                        .comment { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ef4444; }
                        .warning { background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ef4444; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚨 Signalement d'un avis</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour,</p>
                            <p>Un avis a été signalé sur FoodTrack.</p>
                            
                            <div class="warning">
                                <strong>⚠️ Signalé par:</strong> ${reporterEmail}
                            </div>
                            
                            <h2>Avis signalé</h2>
                            <ul>
                                <li><strong>Recette:</strong> ${recipeTitle}</li>
                                <li><strong>Note:</strong> <span class="rating">${stars}</span> (${reviewRating}/5)</li>
                                <li><strong>ID de l'avis:</strong> ${reviewId}</li>
                            </ul>
                            
                            ${reviewComment ? `
                            <div class="comment">
                                <strong>Commentaire de l'avis:</strong>
                                <p>${reviewComment.replace(/\n/g, '<br>')}</p>
                            </div>
                            ` : ''}
                            
                            <div style="margin: 20px 0;">
                                <a href="${recipeUrl}" class="button" style="background-color: #10b981; margin-right: 10px;">Voir la recette</a>
                                <a href="${deleteUrl}" class="button" style="background-color: #ef4444;">Supprimer l'avis</a>
                            </div>
                            
                            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                                <strong>Liens:</strong><br>
                                Voir la recette: <span style="word-break: break-all;">${recipeUrl}</span><br>
                                Supprimer l'avis: <span style="word-break: break-all;">${deleteUrl}</span>
                            </p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement par FoodTrack.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Review report email sent to ${to} for review ${reviewId}`);
        } catch (error) {
            console.error('Failed to send review report email:', error);
            throw error;
        }
    }
}

