const Ad = require('../models/Ad');
const LandingPage = require('../models/LandingPage');
const { openai } = require('../config/ai');

class TruthfulMarketingService {
  async generateTruthfulAd(tier, platform) {
    const prompt = `Create a professional, truthful advertisement for a ${tier} tier CV service. Platform: ${platform}. Use only factual statements. No urgency words (today only, limited time). No false guarantees. No countdown timers. No special offers. No direct calls to action like "call now" or "DM me". Just pure informational ad. Include the exact price. Output JSON: { "headline": "...", "description": "..." }`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      });

      const { headline, description } = JSON.parse(completion.choices[0].message.content);
      const cta = tier === 'free' ? 'Learn More' : 'Upgrade Now';
      const targetUrl = `/landing/${tier}`;

      const existingAd = await Ad.findOne({ platform, offerTier: tier, status: 'active' });
      if (existingAd) {
        existingAd.headline = headline;
        existingAd.description = description;
        existingAd.cta = cta;
        existingAd.updatedAt = new Date();
        await existingAd.save();
        return existingAd;
      }

      const ad = new Ad({
        platform,
        offerTier: tier,
        headline,
        description,
        cta,
        targetUrl,
        status: 'active',
        schedule: { bestTimeToPost: new Date() }
      });
      await ad.save();
      return ad;
    } catch (error) {
      console.error('Error generating truthful ad:', error);
      const fallbackAd = new Ad({
        platform,
        offerTier: tier,
        headline: `${tier.charAt(0).toUpperCase() + tier.slice(1)} CV Service – Professional ATS Optimization`,
        description: this.getTruthfulDescription(tier),
        cta: tier === 'free' ? 'Learn More' : 'Upgrade Now',
        targetUrl: `/landing/${tier}`,
        status: 'active'
      });
      await fallbackAd.save();
      return fallbackAd;
    }
  }

  async createTruthfulLandingPage(tier) {
    const slug = `${tier}-truthful`;
    const existing = await LandingPage.findOne({ slug });
    if (existing && existing.status === 'published') {
      return existing;
    }

    const body = `
      <div class="container">
        <h1>${tier === 'free' ? 'Free CV Review' : tier.charAt(0).toUpperCase() + tier.slice(1) + ' Plan'}</h1>
        <p>${this.getTruthfulDescription(tier)}</p>
        <div class="pricing">${this.getPriceText(tier)}</div>
        <a href="/signup" class="cta-button">${tier === 'free' ? 'Sign Up Free' : 'Upgrade Now'}</a>
        <div class="disclaimer">Professional development tool. Results may vary. Not a job placement service.</div>
        <footer>
          <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
        </footer>
      </div>
    `;

    const landing = new LandingPage({
      name: `${tier} truthful landing`,
      slug,
      offerTier: tier,
      headline: `${tier === 'free' ? 'Free CV ATS Check' : `Professional ${tier} CV Service`}`,
      body,
      ctaText: tier === 'free' ? 'Sign Up Free' : 'Upgrade Now',
      complianceFlags: {
        hasDisclaimer: true,
        noFalseClaims: true,
        hasPrivacyLink: true,
        hasTermsLink: true
      },
      status: 'published'
    });

    await landing.save();
    return landing;
  }

  getTruthfulDescription(tier) {
    const descriptions = {
      free: 'Upload your CV and receive an ATS compatibility score. No payment required. Results may vary.',
      starter: 'AI-powered CV rewrite optimized for ATS systems. Includes keyword analysis, formatting fixes, and up to 5 rewrites per month. R149/month or R250 one-time.',
      professional: 'Everything in Starter, plus unlimited rewrites, interview question generator, and AI tutor. R349/month.',
      enterprise: 'Team collaboration, custom branding, dedicated account manager, and priority support. R699/month.'
    };
    return descriptions[tier] || 'Professional CV enhancement service.';
  }

  getPriceText(tier) {
    if (tier === 'free') return 'Free';
    if (tier === 'starter') return 'R149/month or R250 once-off';
    if (tier === 'professional') return 'R349/month';
    return 'R699/month';
  }
}

module.exports = new TruthfulMarketingService();
