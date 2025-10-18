-- Step 8: Seed Data (Optional - for testing)
-- Execute this after step7

-- Insert default notification templates (ES)
INSERT INTO notification_templates (name, notification_type, subject, email_body, push_body) VALUES
('booking_confirmed', 'booking_confirmed', 
 'Reserva confirmada - {{bookingNumber}}',
 'Hola {{user_name}},

Tu reserva fue confirmada.

Detalles de la reserva:
- Cancha: {{courtName}} ({{venueName}})
- Inicio: {{startDatetime}}
- Fin: {{endDatetime}}
- Total: {{totalAmount}}

¡Gracias por elegir Courtify!',
 'Reserva confirmada: {{courtName}} - {{startDatetime}}'),

('booking_reminder', 'booking_reminder',
 'Recordatorio de reserva - {{bookingNumber}}',
 'Hola {{user_name}},

Recordatorio: tenés una reserva próximamente.

- Cancha: {{courtName}}
- Inicio: {{startDatetime}}

¡Te esperamos!',
 'Recordatorio: reserva en {{courtName}} a las {{startDatetime}}'),

('payment_received', 'payment_received',
 'Pago recibido - {{paymentNumber}}',
 'Hola {{user_name}},

Recibimos tu pago de {{amount}} {{currency}}.

N° de pago: {{paymentNumber}}
N° de reserva: {{bookingNumber}}

Gracias por tu compra.',
 'Pago recibido: {{amount}} {{currency}} por reserva {{bookingNumber}}');
