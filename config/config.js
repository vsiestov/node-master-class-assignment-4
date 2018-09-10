const env = {
};

env.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    hashingSecret: 'staging_secret',
    environment: 'staging',
    tokenExpiration: 1000 * 60 * 60,
    stripeSecret: 'sk_test_sAMpLoYf6IPbdxyTXxv5QVrd',
    mailgunDomain: 'sandbox1a68510a4a424c44b43ea7b55ff520c0.mailgun.org',
    mailgunApi: '212df22f023a6ecef335c8e10e7aa0e9-7bbbcb78-ad47b1c6',
    mailgunFrom: 'postmaster@sandbox1a68510a4a424c44b43ea7b55ff520c0.mailgun.org'
};

env.production = {
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'production_secret',
    environment: 'production',
    tokenExpiration: 1000 * 60 * 60,
    stripeSecret: 'sk_test_sAMpLoYf6IPbdxyTXxv5QVrd',
    mailgunDomain: 'sandbox1a68510a4a424c44b43ea7b55ff520c0.mailgun.org',
    mailgunApi: '212df22f023a6ecef335c8e10e7aa0e9-7bbbcb78-ad47b1c6',
    mailgunFrom: 'postmaster@sandbox1a68510a4a424c44b43ea7b55ff520c0.mailgun.org'
};

module.exports = env[(process.env.NODE_ENV || '').toLowerCase()] || env.staging;
