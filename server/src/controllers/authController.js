import storageService from '../services/storageService.js';

export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let customer = storageService.findCustomer(normalizedEmail);

    if (!customer) {
      // Auto-register demo account or first-time customer
      customer = storageService.registerCustomer(
        normalizedEmail,
        normalizedEmail.split('@')[0],
        password || 'default_sec_pass'
      );
    }

    const token = `pg_tok_${Buffer.from(normalizedEmail + ':' + Date.now()).toString('base64')}`;

    return res.status(200).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerCustomer(req, res, next) {
  try {
    const { email, name, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const customer = storageService.registerCustomer(
      normalizedEmail,
      name || normalizedEmail.split('@')[0],
      password || 'default_sec_pass'
    );

    const token = `pg_tok_${Buffer.from(normalizedEmail + ':' + Date.now()).toString('base64')}`;

    return res.status(201).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentCustomer(req, res, next) {
  try {
    const customerId = req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const customer = storageService.findCustomer(customerId);

    if (!customer) {
      return res.status(200).json({
        customer: {
          id: customerId,
          email: customerId,
          name: customerId.split('@')[0],
        },
      });
    }

    return res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

